import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import process from 'node:process'
import type { AppEnv } from './types'
import { authMiddleware } from './middleware/auth'
import listings  from './routes/listings'
import proposals from './routes/proposals'
import messages  from './routes/messages'
import users     from './routes/users'
import verify    from './routes/verify'
import boosts    from './routes/boosts'
import reviews   from './routes/reviews'
import admin     from './routes/admin'
import webhooks  from './routes/webhooks'
import uploads   from './routes/uploads'
import auth      from './routes/auth'

const app = new Hono<AppEnv>()

function allowedCorsOrigin(origin: string, c: { env: AppEnv['Bindings'] }) {
  if (!origin) return origin

  const allowed = new Set([
    c.env.WEB_URL,
    c.env.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean))

  if (allowed.has(origin)) return origin

  try {
    const { hostname } = new URL(origin)
    if (hostname === 'localhost' || hostname.endsWith('.vercel.app')) {
      return origin
    }
  } catch {
    return null
  }

  return null
}

app.use('*', async (c, next) => {
  Object.assign(process.env, c.env)
  await next()
})
app.use('*', logger())
app.use('*', async (c, next) => {
  const middleware = cors({
    origin: (origin, corsContext) => allowedCorsOrigin(origin, corsContext),
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  return middleware(c, next)
})

// Public routes (no auth)
app.route('/webhooks', webhooks)
app.route('/auth', auth)
app.get('/', (c) => c.json({ ok: true, service: 'swaply-api', ts: new Date().toISOString() }))
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/listings',  listings)
app.route('/api/proposals', proposals)
app.route('/api/messages',  messages)
app.route('/api/users',     users)
app.route('/api/verify',    verify)
app.route('/api/uploads',   uploads)
app.route('/api/boosts',    boosts)
app.route('/api/reviews',   reviews)
app.route('/api/admin',     admin)

export default app
