'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const OTP_LENGTH = 8

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback((i: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = value.split('')
    next[i] = digit
    const updated = next.join('').padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH)
    onChange(updated.trimEnd())
    if (digit && i < OTP_LENGTH - 1) inputs.current[i + 1]?.focus()
  }, [value, onChange])

  const handleKeyDown = useCallback((i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const next = value.split('')
        next[i] = ''
        onChange(next.join(''))
      } else if (i > 0) {
        inputs.current[i - 1]?.focus()
        const next = value.split('')
        next[i - 1] = ''
        onChange(next.join(''))
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      inputs.current[i + 1]?.focus()
    }
  }, [value, onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(digits)
    const nextIdx = Math.min(digits.length, OTP_LENGTH - 1)
    inputs.current[nextIdx]?.focus()
  }, [onChange])

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <Fragment key={i}>
          {i === 4 && (
            <span className="self-center text-border text-xl font-light select-none">—</span>
          )}
          <input
            ref={el => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={e => e.target.select()}
            autoFocus={i === 0}
            className="w-12 h-14 rounded-xl border border-border bg-background text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </Fragment>
      ))}
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: pwErr } = await supabase.auth.signInWithPassword({ email, password })
    if (pwErr) {
      setError('И-мэйл эсвэл нууц үг буруу байна.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (otpErr) {
      setError(otpErr.message)
    } else {
      setStep('otp')
      startCooldown()
    }
    setLoading(false)
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })

    if (error) {
      setError('Код буруу байна эсвэл хугацаа дууссан байна.')
    } else if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', data.user.id)
        .maybeSingle()

      router.replace(profile?.nickname ? '/' : '/auth/setup-profile')
    }
    setLoading(false)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) setError(error.message)
    else startCooldown()
  }

  function startCooldown() {
    setResendCooldown(60)
    const id = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(id); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Swaply</h1>
          <p className="text-muted-foreground mt-1">
            {step === 'credentials' ? 'Нэвтрэх' : 'Нэвтрэх код'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">И-мэйл</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
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
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Шалгаж байна…' : 'Нэвтрэх'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              <span className="font-medium text-foreground">{email}</span> хаяг руу<br />
              нэвтрэх код илгээлээ.
            </p>
            <form onSubmit={handleOtp} className="space-y-6">
              <OtpInput value={otp} onChange={setOtp} />
              <button
                type="submit"
                disabled={loading || otp.replace(/\s/g, '').length < OTP_LENGTH}
                className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Шалгаж байна…' : 'Нэвтрэх'}
              </button>
            </form>
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Буцах
              </button>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                {resendCooldown > 0 ? `Дахин илгээх (${resendCooldown}с)` : 'Дахин илгээх'}
              </button>
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <p className="text-center text-sm text-muted-foreground">
            Бүртгэл байхгүй?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Бүртгүүлэх
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
