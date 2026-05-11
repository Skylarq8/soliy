import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@soliy/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const updateSchema = z.object({
  nickname:   z.string().min(3).max(30).regex(/^[\w._-]+$/).optional(),
  avatar_url: z.string().url().optional(),
  bio:        z.string().max(300).optional(),
})

app.get('/me', async (c) => {
  const userId = c.get('userId')
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json({ user: data })
})

app.patch('/me', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId')
  const body = c.req.valid('json')

  // Check nickname uniqueness
  if (body.nickname) {
    const { count } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('nickname', body.nickname)
      .neq('id', userId)

    if ((count ?? 0) > 0)
      return c.json({ error: 'Nickname already taken' }, 409)
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(body)
    .eq('id', userId)
    .select()
    .single()

  if (error) return c.json({ error }, 500)
  return c.json({ user: data })
})

app.get('/:nickname', async (c) => {
  const { nickname } = c.req.param()
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, nickname, avatar_url, bio, safe_score, swap_count, created_at')
    .eq('nickname', nickname)
    .single()

  if (error || !data) return c.json({ error: 'Not found' }, 404)
  return c.json({ user: data })
})

// Follow / Unfollow
app.post('/:id/follow', async (c) => {
  const followerId = c.get('userId')
  const { id: followingId } = c.req.param()

  if (followerId === followingId) return c.json({ error: 'Cannot follow yourself' }, 400)

  const { error } = await supabaseAdmin
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })

  if (error) return c.json({ error }, 500)
  return c.json({ ok: true })
})

app.delete('/:id/follow', async (c) => {
  const followerId = c.get('userId')
  const { id: followingId } = c.req.param()

  await supabaseAdmin
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  return c.json({ ok: true })
})

// Notifications
app.get('/me/notifications', async (c) => {
  const userId = c.get('userId')
  const { unread_only } = c.req.query()

  let query = supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unread_only === 'true') query = query.eq('read', false)

  const { data } = await query
  return c.json({ notifications: data })
})

app.patch('/me/notifications/read-all', async (c) => {
  const userId = c.get('userId')
  await supabaseAdmin
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  return c.json({ ok: true })
})

export default app
