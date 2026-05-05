import { Hono } from 'hono'
import type { AppEnv } from '../types'

const app = new Hono<AppEnv>()

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function env(c: { env?: Partial<AppEnv['Bindings']> }, key: keyof AppEnv['Bindings']) {
  return c.env?.[key]
}

async function sha1(input: string) {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function cloudinarySignature(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  return sha1(`${payload}${apiSecret}`)
}

app.post('/image', async (c) => {
  const cloudName = env(c, 'CLOUDINARY_CLOUD_NAME')
  const apiKey = env(c, 'CLOUDINARY_API_KEY')
  const apiSecret = env(c, 'CLOUDINARY_API_SECRET')

  if (!cloudName || !apiKey || !apiSecret) {
    return c.json({ error: 'Cloudinary env is not configured' }, 500)
  }

  const form = await c.req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return c.json({ error: 'Image file is required' }, 400)
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return c.json({ error: 'Only JPG, PNG, and WEBP images are supported' }, 400)
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return c.json({ error: 'Image must be 8MB or smaller' }, 400)
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const params = {
    folder: 'swaply/listings',
    timestamp,
  }
  const signature = await cloudinarySignature(params, apiSecret)

  const upload = new FormData()
  upload.set('file', file)
  upload.set('api_key', apiKey)
  upload.set('folder', params.folder)
  upload.set('timestamp', timestamp)
  upload.set('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: upload,
  })
  const data = await res.json() as {
    secure_url?: string
    public_id?: string
    width?: number
    height?: number
    format?: string
    bytes?: number
    error?: { message?: string }
  }

  if (!res.ok || !data.secure_url) {
    return c.json({ error: data.error?.message ?? 'Cloudinary upload failed' }, 502)
  }

  return c.json({
    image: {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    },
  }, 201)
})

export default app
