import { Hono } from 'hono'
import { adminMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '@swaply/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()
app.use('*', adminMiddleware)

app.get('/stats', async (c) => {
  const [users, listings, proposals, verifications] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabaseAdmin.from('verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return c.json({
    total_users:           users.count,
    active_listings:       listings.count,
    completed_swaps:       proposals.count,
    pending_verifications: verifications.count,
  })
})

app.get('/verifications', async (c) => {
  const { status = 'pending' } = c.req.query()
  const { data } = await supabaseAdmin
    .from('verifications')
    .select('*, listings(title, photos, category, users(nickname))')
    .eq('status', status)
    .order('created_at')
  return c.json({ verifications: data })
})

app.patch('/verifications/:id/approve', async (c) => {
  const { id } = c.req.param()
  const { tier, expires_days } = await c.req.json<{ tier: number; expires_days: number }>()
  const expiresAt = new Date(Date.now() + expires_days * 86_400_000)

  const { data: ver, error } = await supabaseAdmin
    .from('verifications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !ver) return c.json({ error: 'Not found' }, 404)

  await supabaseAdmin
    .from('listings')
    .update({ verified: true, verify_tier: tier, verify_expiry: expiresAt.toISOString() })
    .eq('id', ver.listing_id)

  return c.json({ ok: true })
})

app.patch('/verifications/:id/reject', async (c) => {
  const { id } = c.req.param()
  const { note } = await c.req.json<{ note: string }>()

  await supabaseAdmin
    .from('verifications')
    .update({ status: 'rejected', admin_note: note, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  return c.json({ ok: true })
})

app.get('/users', async (c) => {
  const { q, page = '1' } = c.req.query()
  let query = supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('nickname', `%${q}%`)

  const { data } = await query.range((+page - 1) * 20, +page * 20 - 1)
  return c.json({ users: data })
})

app.patch('/users/:id/ban', async (c) => {
  const { id } = c.req.param()
  await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876600h' })
  return c.json({ ok: true })
})

app.patch('/users/:id/unban', async (c) => {
  const { id } = c.req.param()
  await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' })
  return c.json({ ok: true })
})

app.get('/listings', async (c) => {
  const { status = 'active', page = '1' } = c.req.query()
  const { data } = await supabaseAdmin
    .from('listings')
    .select('*, users(nickname)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((+page - 1) * 20, +page * 20 - 1)

  return c.json({ listings: data })
})

app.delete('/listings/:id', async (c) => {
  const { id } = c.req.param()
  await supabaseAdmin.from('listings').update({ status: 'archived' }).eq('id', id)
  return c.json({ ok: true })
})

export default app
