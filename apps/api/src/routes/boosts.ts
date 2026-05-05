import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@swaply/db'
import Stripe from 'stripe'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const BOOST_PRICE_PER_DAY = 3000 // MNT

app.get('/pricing', (c) => c.json({
  price_per_day: BOOST_PRICE_PER_DAY,
  options: [1, 2, 3, 5, 7].map(d => ({ days: d, total: d * BOOST_PRICE_PER_DAY })),
}))

app.post('/', zValidator('json', z.object({
  listing_id: z.string().uuid(),
  days:       z.number().int().min(1).max(7),
})), async (c) => {
  const userId = c.get('userId')
  const { listing_id, days } = c.req.valid('json')
  const amount = days * BOOST_PRICE_PER_DAY

  // Verify ownership
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('user_id, status')
    .eq('id', listing_id)
    .single()

  if (!listing || listing.user_id !== userId)
    return c.json({ error: 'Listing not found' }, 404)
  if (listing.status !== 'active')
    return c.json({ error: 'Can only boost active listings' }, 400)

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'mnt',
    metadata: { type: 'boost', listing_id, days: String(days), user_id: userId },
  })

  return c.json({ client_secret: intent.client_secret, amount })
})

export async function activateBoost(
  listingId: string,
  days: number,
  stripeId: string,
  userId: string
): Promise<void> {
  const endsAt = new Date(Date.now() + days * 86_400_000)
  await Promise.all([
    supabaseAdmin
      .from('listings')
      .update({ boost_until: endsAt.toISOString() })
      .eq('id', listingId),
    supabaseAdmin
      .from('boosts')
      .insert({
        listing_id: listingId,
        user_id: userId,
        days,
        amount: days * BOOST_PRICE_PER_DAY,
        stripe_id: stripeId,
        ends_at: endsAt.toISOString(),
      }),
  ])
}

export default app
