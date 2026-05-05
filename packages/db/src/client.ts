import { createClient } from '@supabase/supabase-js'
import process from 'node:process'
import type { Database } from './database.types'

type SupabaseEnv = {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

function requiredEnv(env: SupabaseEnv, key: keyof SupabaseEnv): string {
  const value = env[key]
  if (!value) throw new Error(`${key} is required`)
  return value
}

export function createSupabaseClient(env: SupabaseEnv) {
  return createClient<Database>(
    requiredEnv(env, 'SUPABASE_URL'),
    requiredEnv(env, 'SUPABASE_ANON_KEY')
  )
}

export function createSupabaseAdminClient(env: SupabaseEnv) {
  return createClient<Database>(
    requiredEnv(env, 'SUPABASE_URL'),
    requiredEnv(env, 'SUPABASE_SERVICE_ROLE_KEY')
  )
}

let supabaseClient: ReturnType<typeof createSupabaseClient> | undefined
let supabaseAdminClient: ReturnType<typeof createSupabaseAdminClient> | undefined

function proxyClient<TClient extends object>(getClient: () => TClient): TClient {
  return new Proxy({} as TClient, {
    get(_target, prop) {
      const client = getClient()
      const value = client[prop as keyof TClient]
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}

export const supabase = proxyClient(() => {
  supabaseClient ??= createSupabaseClient(process.env as SupabaseEnv)
  return supabaseClient
})

export const supabaseAdmin = proxyClient(() => {
  supabaseAdminClient ??= createSupabaseAdminClient(process.env as SupabaseEnv)
  return supabaseAdminClient
})
