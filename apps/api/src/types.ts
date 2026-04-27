export type AppEnv = {
  Variables: {
    userId: string
  }
  Bindings: {
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    WEB_URL: string
    ADMIN_URL: string
  }
}
