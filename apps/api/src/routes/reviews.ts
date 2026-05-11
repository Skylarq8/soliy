import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@soliy/db'
import { recalcSafeScore } from '../lib/safeScore'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const reviewSchema = z.object({
  proposal_id: z.string().uuid(),
  rating:      z.number().int().min(1).max(5),
  comment:     z.string().max(500).optional(),
})

app.post('/', zValidator('json', reviewSchema), async (c) => {
  const reviewerId = c.get('userId')
  const { proposal_id, rating, comment } = c.req.valid('json')

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select('sender_id, receiver_id, status')
    .eq('id', proposal_id)
    .single()

  if (!proposal) return c.json({ error: 'Proposal not found' }, 404)
  if (proposal.status !== 'completed')
    return c.json({ error: 'Can only review completed proposals' }, 400)
  if (proposal.sender_id !== reviewerId && proposal.receiver_id !== reviewerId)
    return c.json({ error: 'Not a participant' }, 403)

  const revieweeId = proposal.sender_id === reviewerId
    ? proposal.receiver_id
    : proposal.sender_id

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({ proposal_id, reviewer_id: reviewerId, reviewee_id: revieweeId, rating, comment })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return c.json({ error: 'Already reviewed' }, 409)
    return c.json({ error }, 500)
  }

  await recalcSafeScore(revieweeId)

  return c.json({ review: data }, 201)
})

app.get('/user/:userId', async (c) => {
  const { userId } = c.req.param()
  const { data } = await supabaseAdmin
    .from('reviews')
    .select('*, reviewer:reviewer_id(nickname, avatar_url)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return c.json({ reviews: data })
})

export default app
