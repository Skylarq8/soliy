import { Hono } from 'hono'
import { supabaseAdmin } from '@soliy/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

function savedError(error: unknown) {
  const err = error as { message?: string; code?: string; details?: string }
  const message = err.message ?? 'Wishlist үйлдэл амжилтгүй боллоо'

  if (
    err.code === '42P01' ||
    err.code === 'PGRST205' ||
    message.toLowerCase().includes('saved_listings')
  ) {
    return {
      error: 'Wishlist table олдсонгүй. Supabase дээр supabase/migrations/0003_saved_listings.sql migration ажиллуулна уу.',
      code: err.code,
    }
  }

  return { error: message, code: err.code, details: err.details }
}

app.get('/', async (c) => {
  const userId = c.get('userId')

  const { data, error } = await supabaseAdmin
    .from('saved_listings')
    .select('created_at, listings!saved_listings_listing_id_fkey(*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return c.json(savedError(error), 500)

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

  if (error) return c.json(savedError(error), 500)
  return c.json({ saved: Boolean(data) })
})

app.post('/:listingId', async (c) => {
  const userId = c.get('userId')
  const { listingId } = c.req.param()

  const { error } = await supabaseAdmin
    .from('saved_listings')
    .upsert({ user_id: userId, listing_id: listingId }, { onConflict: 'user_id,listing_id' })

  if (error) return c.json(savedError(error), 500)
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

  if (error) return c.json(savedError(error), 500)
  return c.json({ saved: false })
})

export default app
