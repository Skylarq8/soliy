import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@soliy/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const submitSchema = z.object({
  listing_id: z.string().uuid(),
  tier:       z.number().int().min(1).max(2),
  photos:     z.array(z.string().url()).min(1).max(5),
})

app.post('/', zValidator('json', submitSchema), async (c) => {
  const userId = c.get('userId')
  const { listing_id, tier, photos } = c.req.valid('json')

  // Must own the listing
  const { data: listing } = await supabaseAdmin
    .from('listings')
    .select('user_id')
    .eq('id', listing_id)
    .single()

  if (!listing || listing.user_id !== userId)
    return c.json({ error: 'Listing not found' }, 404)

  // Upsert verification request
  const { data, error } = await supabaseAdmin
    .from('verifications')
    .upsert({ listing_id, tier, photos, status: 'pending' }, { onConflict: 'listing_id' })
    .select()
    .single()

  if (error) return c.json({ error }, 500)
  return c.json({ verification: data }, 201)
})

app.get('/status/:listingId', async (c) => {
  const { listingId } = c.req.param()
  const { data } = await supabaseAdmin
    .from('verifications')
    .select('*')
    .eq('listing_id', listingId)
    .single()

  return c.json({ verification: data })
})

export default app
