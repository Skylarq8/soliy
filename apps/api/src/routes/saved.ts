import { Hono } from 'hono'
import { supabaseAdmin } from '@swaply/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

app.get('/', async (c) => {
  const userId = c.get('userId')

  const { data, error } = await supabaseAdmin
    .from('saved_listings')
    .select('created_at, listings(*, users(nickname, avatar_url, safe_score, swap_count))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error }, 500)

  return c.json({
    listings: (data ?? [])
      .map(item => item.listings)
      .filter(Boolean),
  })
})

app.get('/:listingId', async (c) => {
  const userId = c.get('userId')
  const { listingId } = c.req.param()

  const { data, error } = await supabaseAdmin
    .from('saved_listings')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (error) return c.json({ error }, 500)
  return c.json({ saved: Boolean(data) })
})

app.post('/:listingId', async (c) => {
  const userId = c.get('userId')
  const { listingId } = c.req.param()

  const { error } = await supabaseAdmin
    .from('saved_listings')
    .upsert({ user_id: userId, listing_id: listingId }, { onConflict: 'user_id,listing_id' })

  if (error) return c.json({ error }, 500)
  return c.json({ saved: true })
})

app.delete('/:listingId', async (c) => {
  const userId = c.get('userId')
  const { listingId } = c.req.param()

  const { error } = await supabaseAdmin
    .from('saved_listings')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId)

  if (error) return c.json({ error }, 500)
  return c.json({ saved: false })
})

export default app
