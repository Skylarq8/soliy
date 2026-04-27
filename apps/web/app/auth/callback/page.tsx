'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    async function handleCallback() {
      // Supabase inserts the session from the URL hash automatically.
      // We wait briefly for it to be processed, then check auth state.
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

      if (sessionErr || !session) {
        setError('Баталгаажуулалт амжилтгүй боллоо. Дахин оролдоно уу.')
        return
      }

      // Check if user already has a nickname
      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile?.nickname) {
        router.replace('/')
      } else {
        router.replace('/auth/setup-profile')
      }
    }

    // Small delay to let Supabase parse the URL hash and store session
    const timer = setTimeout(handleCallback, 300)
    return () => clearTimeout(timer)
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-sm">{error}</p>
          <a href="/auth/login" className="text-primary hover:underline text-sm">
            Нэвтрэх хуудас руу буцах
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Баталгаажуулж байна…</p>
      </div>
    </div>
  )
}
