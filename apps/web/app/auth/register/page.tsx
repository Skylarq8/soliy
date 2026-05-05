'use client'
export const dynamic = 'force-dynamic'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AtSign, Check, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background pl-11 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'

function passwordRules(password: string, repeatPassword: string) {
  return [
    { label: '8-аас дээш тэмдэгт', passed: password.length >= 8 },
    { label: 'Том үсэг', passed: /[A-Z]/.test(password) },
    { label: 'Жижиг үсэг', passed: /[a-z]/.test(password) },
    { label: 'Тоо', passed: /\d/.test(password) },
    { label: 'Тусгай тэмдэгт', passed: /[^A-Za-z0-9]/.test(password) },
    { label: 'Давтсан нууц үг таарсан', passed: password.length > 0 && password === repeatPassword },
  ]
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const rules = useMemo(() => passwordRules(password, repeatPassword), [password, repeatPassword])
  const formReady = rules.every(rule => rule.passed)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formReady) throw new Error('Нууц үгийн шаардлагуудаа бүрэн хангана уу')

      await api.auth.register({
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      })

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (loginError) throw new Error(loginError.message)
      router.replace('/')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ShieldCheck size={26} strokeWidth={2.3} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Бүртгэл үүсгэх</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Мэдээллээ бөглөөд шууд бүртгүүлнэ.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-muted p-1 text-sm font-semibold text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/auth/login" className="rounded-lg px-3 py-2.5 text-center transition hover:bg-background hover:text-foreground">
                Нэвтрэх
              </Link>
              <Link href="/auth/register" className="rounded-lg bg-primary px-3 py-2.5 text-center text-primary-foreground shadow-sm">
                Бүртгүүлэх
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Таны нэр"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nickname</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[\w._-]+"
                    placeholder="swaply_user"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+976"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="mail@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Repeat password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={19} />
                <input
                  type={showRepeatPassword ? 'text' : 'password'}
                  value={repeatPassword}
                  onChange={e => setRepeatPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showRepeatPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                >
                  {showRepeatPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="grid gap-2 text-xs font-medium text-muted-foreground sm:grid-cols-2">
                {rules.map(rule => (
                  <div key={rule.label} className={rule.passed ? 'flex items-center gap-2 text-foreground' : 'flex items-center gap-2'}>
                    <Check size={16} className={rule.passed ? 'text-primary' : 'text-muted-foreground/50'} />
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
