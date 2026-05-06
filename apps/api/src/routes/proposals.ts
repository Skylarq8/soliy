import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@swaply/db'
import Stripe from 'stripe'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const proposalSchema = z.object({
  receiver_id:     z.string().uuid(),
  offered_items:   z.array(z.string().uuid()).min(1),
  requested_items: z.array(z.string().uuid()).min(1),
  money_offer:     z.number().int().default(0),
})

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
  return c.json({ proposals: data })
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

  return c.json({ proposal: data })
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

  if (body.money_offer > 0) {
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

  if (!proposal || proposal.receiver_id !== userId)
    return c.json({ error: 'Not found' }, 404)

  if (proposal.escrow_id) {
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

  if (!proposal || proposal.receiver_id !== userId)
    return c.json({ error: 'Not found' }, 404)

  if (proposal.escrow_id) {
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
    await stripe.paymentIntents.cancel(proposal.escrow_id)
  }

  await supabaseAdmin.from('proposals').update({ status: 'declined' }).eq('id', id)

  return c.json({ ok: true })
})

app.patch('/:id/counter', zValidator('json', z.object({ money_offer: z.number().int() })), async (c) => {
  const { id } = c.req.param()
  const { money_offer } = c.req.valid('json')

  await supabaseAdmin
    .from('proposals')
    .update({ status: 'countered', money_offer })
    .eq('id', id)

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
    if (proposal.escrow_id) {
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
