import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
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

type Env = {
  Variables: {
    userId: string
  }
}

const app = new Hono<Env>()

app.use('*', logger())
app.use('*', cors({
  origin: [process.env.WEB_URL ?? 'http://localhost:3000', process.env.ADMIN_URL ?? 'http://localhost:3001'],
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// Public routes (no auth)
app.route('/webhooks', webhooks)
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

// Protected routes
app.use('/api/*', authMiddleware)
app.route('/api/listings',  listings)
app.route('/api/proposals', proposals)
app.route('/api/messages',  messages)
app.route('/api/users',     users)
app.route('/api/verify',    verify)
app.route('/api/boosts',    boosts)
app.route('/api/reviews',   reviews)
app.route('/api/admin',     admin)

export default app
