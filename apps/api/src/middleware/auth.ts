import { createMiddleware } from 'hono/factory'
import { supabaseAdmin } from '@soliy/db'

export const authMiddleware = createMiddleware<{ Variables: { userId: string } }>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return c.json({ error: 'Invalid token' }, 401)

  c.set('userId', user.id)
  await next()
})

export const adminMiddleware = createMiddleware<{ Variables: { userId: string } }>(async (c, next) => {
  const userId = c.get('userId')
  const { data } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (!data?.is_admin) return c.json({ error: 'Forbidden' }, 403)
  await next()
})
