'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LockKeyhole, Phone, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const trimmedIdentifier = identifier.trim()
      const email = trimmedIdentifier.includes('@')
        ? trimmedIdentifier.toLowerCase()
        : (await api.auth.resolveLogin(trimmedIdentifier)).email

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw new Error('Утас/и-мэйл эсвэл нууц үг буруу байна')

      router.replace('/')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ShieldCheck size={26} strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Нэвтрэх</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Утас эсвэл и-мэйл, нууц үгээрээ шууд орно.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-muted p-1 text-sm font-semibold text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/auth/login" className="rounded-lg bg-primary px-3 py-2.5 text-center text-primary-foreground shadow-sm">
                Нэвтрэх
              </Link>
              <Link href="/auth/register" className="rounded-lg px-3 py-2.5 text-center transition hover:bg-background hover:text-foreground">
                Бүртгүүлэх
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Утас / и-мэйл</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder="+976 эсвэл mail@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Нууц үг</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
