import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@swaply/db'
import type { Json } from '@swaply/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const createSchema = z.object({
  title:         z.string().min(3).max(100),
  description:   z.string().max(1000).optional(),
  category:      z.enum(['clothing', 'skincare', 'makeup', 'accessories']),
  photos:        z.array(z.string().url()).min(1).max(8),
  condition:     z.number().int().min(1).max(5),
  price:         z.number().int().positive().optional(),
  city:          z.string().trim().min(2).max(80),
  district:      z.string().trim().max(80).optional(),
  swap_enabled:  z.boolean().default(true),
  category_meta: z.record(z.unknown()).optional(),
})

app.get('/', async (c) => {
  const { category, swap_only, min_price, max_price, q, page = '1' } = c.req.query()
  const limit = 20
  const offset = (parseInt(page) - 1) * limit

  let query = supabaseAdmin
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('status', 'active')
    .order('boost_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category)            query = query.eq('category', category)
  if (swap_only === 'true') query = query.eq('swap_enabled', true)
  if (min_price)            query = query.gte('price', parseInt(min_price))
  if (max_price)            query = query.lte('price', parseInt(max_price))
  if (q)                    query = query.textSearch('title', q)

  const { data, error } = await query
  if (error) return c.json({ error }, 500)
  return c.json({ listings: data })
})

app.get('/:id', async (c) => {
  const { id } = c.req.param()
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('id', id)
    .single()

  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json({ listing: data })
})

app.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')
  const { city, district, category_meta, ...listingFields } = body
  const insertBody = {
    ...listingFields,
    category_meta: listingCategoryMeta(category_meta, city, district),
    user_id: userId,
  }

  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert(insertBody)
    .select()
    .single()

  if (error) return c.json({ error }, 500)
  return c.json({ listing: data }, 201)
})

app.patch('/:id', zValidator('json', createSchema.partial()), async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()
  const body = c.req.valid('json')
  const { city, district, category_meta, ...listingFields } = body
  const nextMeta = listingCategoryMeta(category_meta, city, district)
  const updateBody = {
    ...listingFields,
    ...(nextMeta ? { category_meta: nextMeta } : {}),
  }

  const { data, error } = await supabaseAdmin
    .from('listings')
    .update(updateBody)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return c.json({ error }, 500)
  return c.json({ listing: data })
})

app.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  await supabaseAdmin
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', userId)

  return c.json({ ok: true })
})

export default app

function listingCategoryMeta(
  meta?: Record<string, unknown>,
  city?: string,
  district?: string,
): Json | undefined {
  if (!meta && !city && !district) return undefined

  return {
    ...(meta ?? {}),
    ...(city ? { location_city: city } : {}),
    ...(district ? { location_district: district } : {}),
  } as Json
}
