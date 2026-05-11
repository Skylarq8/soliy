import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@soliy/db'
import Stripe from 'stripe'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const proposalSchema = z.object({
  receiver_id:     z.string().uuid(),
  offered_items:   z.array(z.string().uuid()).min(1),
  requested_items: z.array(z.string().uuid()).min(1),
  money_offer:     z.number().int().default(0),
})

type ProposalRow = {
  id: string
  sender_id: string
  receiver_id: string
  offered_items: string[] | null
  requested_items: string[] | null
}

async function enrichProposals<T extends ProposalRow>(proposals: T[]) {
  if (proposals.length === 0) return []

  const userIds = [...new Set(proposals.flatMap(p => [p.sender_id, p.receiver_id]))]
  const listingIds = [
    ...new Set(
      proposals.flatMap(p => [
        ...((p.offered_items ?? []) as string[]),
        ...((p.requested_items ?? []) as string[]),
      ])
    ),
  ]
  const proposalIds = proposals.map(p => p.id)

  const [usersRes, listingsRes, messagesRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, name, nickname, avatar_url, safe_score, swap_count')
      .in('id', userIds),
    listingIds.length
      ? supabaseAdmin
          .from('listings')
          .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
          .in('id', listingIds)
      : Promise.resolve({ data: [] }),
    supabaseAdmin
      .from('messages')
      .select('*, users!messages_sender_id_fkey(nickname, avatar_url)')
      .in('proposal_id', proposalIds)
      .order('created_at', { ascending: false })
      .limit(Math.max(proposalIds.length * 4, 12)),
  ])

  const usersById = new Map((usersRes.data ?? []).map(user => [user.id, user]))
  const listingsById = new Map((listingsRes.data ?? []).map(listing => [listing.id, listing]))
  const latestMessageByProposal = new Map<string, unknown>()

  for (const message of messagesRes.data ?? []) {
    if (!latestMessageByProposal.has(message.proposal_id)) {
      latestMessageByProposal.set(message.proposal_id, message)
    }
  }

  return proposals.map(proposal => ({
    ...proposal,
    sender: usersById.get(proposal.sender_id) ?? null,
    receiver: usersById.get(proposal.receiver_id) ?? null,
    offered_listings: (proposal.offered_items ?? []).map(id => listingsById.get(id)).filter(Boolean),
    requested_listings: (proposal.requested_items ?? []).map(id => listingsById.get(id)).filter(Boolean),
    latest_message: latestMessageByProposal.get(proposal.id) ?? null,
  }))
}

app.get('/', async (c) => {
  const userId = c.get('userId')
  const { status } = c.req.query()

  let query = supabaseAdmin
    .from('proposals')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('updated_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return c.json({ error }, 500)
  const proposals = await enrichProposals(data ?? [])
  return c.json({ proposals })
})

app.get('/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return c.json({ error: 'Not found' }, 404)
  if (data.sender_id !== userId && data.receiver_id !== userId)
    return c.json({ error: 'Forbidden' }, 403)

  const [proposal] = await enrichProposals([data])
  return c.json({ proposal })
})

app.post('/', zValidator('json', proposalSchema), async (c) => {
  const senderId = c.get('userId')
  const body = c.req.valid('json')

  // One active proposal per listing
  const { count } = await supabaseAdmin
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'countered'])
    .or(
      body.offered_items.map(id => `offered_items.cs.{${id}}`).join(',')
    )

  if ((count ?? 0) > 0)
    return c.json({ error: 'One of your items already has an active proposal' }, 409)

  let escrowId: string | undefined

  if (body.money_offer > 0 && c.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
    const intent = await stripe.paymentIntents.create({
      amount: body.money_offer,
      currency: 'mnt',
      capture_method: 'manual',
      metadata: { type: 'swap_escrow', sender_id: senderId },
    })
    escrowId = intent.id
  }

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .insert({ ...body, sender_id: senderId, escrow_id: escrowId ?? null })
    .select()
    .single()

  if (error) return c.json({ error }, 500)

  await supabaseAdmin.from('notifications').insert({
    user_id: body.receiver_id,
    type: 'new_proposal',
    payload: { proposal_id: data.id, sender_id: senderId },
  })

  return c.json({ proposal: data }, 201)
})

app.patch('/:id/accept', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Not found' }, 404)

  const meta = (proposal.category_meta as Record<string, unknown> | null) ?? {}
  const canAccept =
    proposal.status === 'pending'
      ? proposal.receiver_id === userId
      : proposal.status === 'countered'
        ? meta.counter_by !== userId
        : false

  if (!canAccept) return c.json({ error: 'Та энэ саналыг зөвшөөрөх боломжгүй байна' }, 403)

  if (proposal.escrow_id && c.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
    await stripe.paymentIntents.capture(proposal.escrow_id)
  }

  await supabaseAdmin.from('proposals').update({ status: 'accepted' }).eq('id', id)

  await supabaseAdmin.from('notifications').insert({
    user_id: proposal.sender_id,
    type: 'proposal_accepted',
    payload: { proposal_id: id },
  })

  return c.json({ ok: true })
})

app.patch('/:id/decline', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Not found' }, 404)

  if (!['pending', 'countered'].includes(proposal.status)) {
    return c.json({ error: 'Энэ санал хаагдсан байна' }, 400)
  }

  if (proposal.escrow_id && c.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
    await stripe.paymentIntents.cancel(proposal.escrow_id)
  }

  await supabaseAdmin.from('proposals').update({ status: 'declined' }).eq('id', id)

  return c.json({ ok: true })
})

app.patch('/:id/counter', zValidator('json', z.object({ money_offer: z.number().int() })), async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()
  const { money_offer } = c.req.valid('json')

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id, status, category_meta')
    .eq('id', id)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Not found' }, 404)

  if (!['pending', 'countered'].includes(proposal.status)) {
    return c.json({ error: 'Энэ саналд counter хийх боломжгүй байна' }, 400)
  }

  const meta = (proposal.category_meta as Record<string, unknown> | null) ?? {}

  await supabaseAdmin
    .from('proposals')
    .update({ status: 'countered', money_offer, category_meta: { ...meta, counter_by: userId } })
    .eq('id', id)

  const otherUserId = proposal.sender_id === userId ? proposal.receiver_id : proposal.sender_id
  await supabaseAdmin.from('notifications').insert({
    user_id: otherUserId,
    type: 'new_proposal',
    payload: { proposal_id: id, sender_id: userId, counter: true },
  })

  return c.json({ ok: true })
})

app.patch('/:id/confirm-receipt', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (!proposal || (proposal.sender_id !== userId && proposal.receiver_id !== userId))
    return c.json({ error: 'Not found' }, 404)

  const meta = (proposal.category_meta as Record<string, boolean> | null) ?? {}
  const confirmed = { ...meta, [`confirmed_${userId}`]: true }

  const bothConfirmed =
    !!confirmed[`confirmed_${proposal.sender_id}`] &&
    !!confirmed[`confirmed_${proposal.receiver_id}`]

  if (bothConfirmed) {
    if (proposal.escrow_id && c.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
      const intent = await stripe.paymentIntents.retrieve(proposal.escrow_id)
      const fee = Math.floor(intent.amount * 0.05)
      await stripe.paymentIntents.update(proposal.escrow_id, {
        transfer_data: { amount: intent.amount - fee },
      })
    }

    await supabaseAdmin.from('proposals').update({ status: 'completed' }).eq('id', id)
    await supabaseAdmin.rpc('increment_swap_count', { user_id: proposal.sender_id })
    await supabaseAdmin.rpc('increment_swap_count', { user_id: proposal.receiver_id })
  } else {
    await supabaseAdmin.from('proposals').update({ category_meta: confirmed }).eq('id', id)
  }

  return c.json({ ok: true, both_confirmed: bothConfirmed })
})

export default app
