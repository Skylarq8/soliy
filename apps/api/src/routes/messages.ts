import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@soliy/db'
import { containsContactInfo } from '../lib/moderation'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

app.get('/unread', async (c) => {
  const userId = c.get('userId')

  const { data: proposals, error: proposalError } = await supabaseAdmin
    .from('proposals')
    .select('id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

  if (proposalError) return c.json({ error: proposalError }, 500)

  const proposalIds = (proposals ?? []).map(item => item.id)
  if (proposalIds.length === 0) {
    return c.json({ total: 0, by_proposal: {} })
  }

  const [readsRes, messagesRes, proposalNotificationsRes] = await Promise.all([
    supabaseAdmin
      .from('message_reads')
      .select('proposal_id, last_read_at')
      .eq('user_id', userId)
      .in('proposal_id', proposalIds),
    supabaseAdmin
      .from('messages')
      .select('proposal_id, sender_id, created_at')
      .in('proposal_id', proposalIds)
      .neq('sender_id', userId),
    supabaseAdmin
      .from('notifications')
      .select('payload, created_at')
      .eq('user_id', userId)
      .eq('read', false)
      .in('type', ['new_proposal']),
  ])

  if (readsRes.error) return c.json({ error: readsRes.error }, 500)
  if (messagesRes.error) return c.json({ error: messagesRes.error }, 500)
  if (proposalNotificationsRes.error) return c.json({ error: proposalNotificationsRes.error }, 500)

  const readAtByProposal = new Map(
    (readsRes.data ?? []).map(item => [item.proposal_id, new Date(item.last_read_at).getTime()])
  )
  const byProposal: Record<string, number> = {}

  for (const message of messagesRes.data ?? []) {
    const lastReadAt = readAtByProposal.get(message.proposal_id) ?? 0
    if (new Date(message.created_at).getTime() > lastReadAt) {
      byProposal[message.proposal_id] = (byProposal[message.proposal_id] ?? 0) + 1
    }
  }

  for (const notification of proposalNotificationsRes.data ?? []) {
    const payload = notification.payload as { proposal_id?: string } | null
    const proposalId = payload?.proposal_id
    if (!proposalId || !proposalIds.includes(proposalId)) continue
    byProposal[proposalId] = Math.max(byProposal[proposalId] ?? 0, 1)
  }

  const total = Object.values(byProposal).reduce((sum, count) => sum + count, 0)
  return c.json({ total, by_proposal: byProposal })
})

// Returns the OTHER participant's last_read_at so the sender can show seen ticks
app.get('/:proposalId/peer-read', async (c) => {
  const userId = c.get('userId')
  const { proposalId } = c.req.param()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id')
    .eq('id', proposalId)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Forbidden' }, 403)

  const peerId = proposal.sender_id === userId ? proposal.receiver_id : proposal.sender_id

  const { data } = await supabaseAdmin
    .from('message_reads')
    .select('last_read_at')
    .eq('proposal_id', proposalId)
    .eq('user_id', peerId)
    .maybeSingle()

  return c.json({ last_read_at: data?.last_read_at ?? null })
})

app.post('/:proposalId/read', async (c) => {
  const userId = c.get('userId')
  const { proposalId } = c.req.param()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id')
    .eq('id', proposalId)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId)) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const { error } = await supabaseAdmin
    .from('message_reads')
    .upsert({
      proposal_id: proposalId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    }, { onConflict: 'proposal_id,user_id' })

  if (error) return c.json({ error }, 500)
  return c.json({ ok: true })
})

app.post('/', zValidator('json', z.object({
  proposal_id: z.string().uuid(),
  content:     z.string().min(1).max(2000),
})), async (c) => {
  const senderId = c.get('userId')
  const { proposal_id, content } = c.req.valid('json')

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id, status')
    .eq('id', proposal_id)
    .single()

  if (!proposal || (proposal.sender_id !== senderId && proposal.receiver_id !== senderId))
    return c.json({ error: 'Not a participant' }, 403)

  if (proposal.status === 'completed' || proposal.status === 'declined')
    return c.json({ error: 'Proposal is closed' }, 400)

  const blocked = containsContactInfo(content)

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      proposal_id,
      sender_id: senderId,
      content: blocked ? '[Message blocked: contact info detected]' : content,
      blocked,
    })
    .select()
    .single()

  if (error) return c.json({ error }, 500)

  if (blocked) {
    await supabaseAdmin.rpc('increment_violation', { user_id: senderId })
  }

  const otherUserId = proposal.sender_id === senderId ? proposal.receiver_id : proposal.sender_id
  await supabaseAdmin.from('notifications').insert({
    user_id: otherUserId,
    type: 'new_message',
    payload: { proposal_id, sender_id: senderId },
  })

  return c.json({ message: data, blocked }, blocked ? 200 : 201)
})

app.get('/:proposalId', async (c) => {
  const userId = c.get('userId')
  const { proposalId } = c.req.param()
  const { before, limit = '50' } = c.req.query()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id')
    .eq('id', proposalId)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Forbidden' }, 403)

  let query = supabaseAdmin
    .from('messages')
    .select('*, users!messages_sender_id_fkey(nickname, avatar_url)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit))

  if (before) query = query.lt('created_at', before)

  const { data } = await query
  return c.json({ messages: data?.reverse() ?? [] })
})

export default app
