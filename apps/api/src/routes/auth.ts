import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { supabaseAdmin } from '@swaply/db'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const phoneSchema = z.string()
  .min(6)
  .max(20)
  .regex(/^\+?[\d\s().-]+$/, 'Invalid phone number')

const registerSchema = z.object({
  name:     z.string().min(2).max(80),
  nickname: z.string().min(3).max(30).regex(/^[\w._-]+$/),
  phone:    phoneSchema,
  email:    z.string().email(),
  password: z.string().min(8).max(72),
})

const resolveSchema = z.object({
  identifier: z.string().min(3).max(120),
})

const missingProfileColumnsMessage =
  'Database migration is required: add name and phone columns to the users table.'

function missingSupabaseAdminEnv(c: { env: AppEnv['Bindings'] }) {
  return !c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY
}

function normalizePhone(phone: string) {
  const compact = phone.trim().replace(/[\s().-]/g, '')
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

app.post('/register', zValidator('json', registerSchema), async (c) => {
  if (missingSupabaseAdminEnv(c)) {
    return c.json({ error: 'API Supabase admin env дутуу байна: SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY тохируулна уу.' }, 500)
  }

  const body = c.req.valid('json')
  const name = body.name.trim()
  const nickname = body.nickname.trim()
  const phone = normalizePhone(body.phone)
  const email = normalizeEmail(body.email)

  const [{ count: nicknameCount }, { count: phoneCount }] = await Promise.all([
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('phone', phone),
  ])

  if ((nicknameCount ?? 0) > 0) return c.json({ error: 'Энэ хэрэглэгчийн нэр аль хэдийн ашиглагдаж байна' }, 409)
  if ((phoneCount ?? 0) > 0) return c.json({ error: 'Энэ дугаар аль хэдийн бүртгэлтэй байна' }, 409)

  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: { name, nickname, phone },
  })

  if (authError || !created.user) {
    if (authError?.message.toLowerCase().includes('already been registered')) {
      return c.json({
        error: 'Энэ и-мэйл Supabase Authentication дээр үлдсэн байна. Authentication > Users хэсгээс устгаад дахин бүртгүүлнэ үү.',
      }, 409)
    }
    return c.json({ error: authError?.message ?? 'Бүртгэл үүсгэж чадсангүй' }, 400)
  }

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({ id: created.user.id, name, nickname, phone })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id)
    if (profileError.message.includes('schema cache')) {
      return c.json({ error: missingProfileColumnsMessage }, 500)
    }
    return c.json({ error: profileError.message }, 400)
  }

  return c.json({
    user: {
      id: created.user.id,
      email,
      name,
      nickname,
      phone,
    },
  }, 201)
})

app.post('/resolve-login', zValidator('json', resolveSchema), async (c) => {
  const { identifier } = c.req.valid('json')
  const value = identifier.trim()

  if (value.includes('@')) {
    return c.json({ email: normalizeEmail(value) })
  }

  const phone = normalizePhone(value)
  if (missingSupabaseAdminEnv(c)) {
    return c.json({ error: 'API Supabase admin env дутуу байна: SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY тохируулна уу.' }, 500)
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  if (error) {
    if (error.message.includes('schema cache')) {
      return c.json({ error: missingProfileColumnsMessage }, 500)
    }
    return c.json({ error: error.message }, 500)
  }
  if (!data) return c.json({ error: 'Ийм дугаартай бүртгэл олдсонгүй' }, 404)

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(data.id)
  const email = userData.user?.email

  if (userError || !email) {
    return c.json({ error: 'Бүртгэлийн и-мэйл олдсонгүй' }, 404)
  }

  return c.json({ email })
})

export default app
