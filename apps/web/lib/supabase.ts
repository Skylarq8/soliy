import { createClient } from '@supabase/supabase-js'
import type { Database } from '@soliy/db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

function isInvalidRefreshTokenError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error && typeof error.message === 'string' ? error.message : ''
  return message.toLowerCase().includes('invalid refresh token')
}

function clearStoredAuthSession() {
  if (typeof window === 'undefined') return

  const shouldRemove = (key: string) => {
    const normalized = key.toLowerCase()
    return (
      normalized === 'supabase.auth.token' ||
      (normalized.startsWith('sb-') && normalized.includes('auth-token')) ||
      normalized.includes('supabase') && normalized.includes('auth')
    )
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i)
      if (key && shouldRemove(key)) storage.removeItem(key)
    }
  }
}

const originalGetSession = supabase.auth.getSession.bind(supabase.auth)
const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
const emptyUserResponse = { data: { user: null }, error: null } as unknown as Awaited<
  ReturnType<typeof originalGetUser>
>

supabase.auth.getSession = async () => {
  const result = await originalGetSession()
  if (isInvalidRefreshTokenError(result.error)) {
    clearStoredAuthSession()
    return { data: { session: null }, error: null }
  }
  return result
}

supabase.auth.getUser = async jwt => {
  try {
    const result = await originalGetUser(jwt)
    if (isInvalidRefreshTokenError(result.error)) {
      clearStoredAuthSession()
      return emptyUserResponse
    }
    return result
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      clearStoredAuthSession()
      return emptyUserResponse
    }
    throw error
  }
}
