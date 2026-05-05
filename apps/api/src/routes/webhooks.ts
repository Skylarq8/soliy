import { Hono } from 'hono'
import Stripe from 'stripe'
import { activateBoost } from './boosts'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

app.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, c.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return c.json({ error: 'Invalid signature' }, 400)
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const { type, listing_id, days, user_id } = intent.metadata

      if (type === 'boost' && listing_id && days && user_id) {
        await activateBoost(listing_id, parseInt(days), intent.id, user_id)
      }
      break
    }
    case 'payment_intent.payment_failed': {
      // Could log/notify user here
      break
    }
  }

  return c.json({ received: true })
})

export default app
