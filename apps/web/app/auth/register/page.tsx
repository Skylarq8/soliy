'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [step, setStep] = useState<'credentials' | 'confirm'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('confirm')
    }
    setLoading(false)
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">📬</div>
          <h2 className="text-xl font-bold">И-мэйлээ шалгаарай</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="font-medium text-foreground">{email}</span> хаяг руу
            баталгаажуулах холбоос илгээлээ.
            <br />Холбоос дарсны дараа nickname тохируулж нэвтэрнэ.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Нэвтрэх хуудас руу очих
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Swaply</h1>
          <p className="text-muted-foreground mt-1">Бүртгүүлэх</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">И-мэйл</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Үүсгэж байна…' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Аккаунт байгаа?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  )
}
