import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@swaply/db'
import { containsContactInfo } from '../lib/moderation'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

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
