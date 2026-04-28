'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SetupProfilePage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login')
      } else {
        setUserId(session.user.id)
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError('')

    try {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('nickname', nickname)

      if ((count ?? 0) > 0) {
        throw new Error('Энэ nickname аль хэдийн ашиглагдаж байна')
      }

      const { error: dbErr } = await supabase
        .from('users')
        .upsert({ id: userId, nickname }, { onConflict: 'id' })

      if (dbErr) throw new Error(dbErr.message)

      router.replace('/')
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold">Swaply</h1>
          <p className="text-muted-foreground mt-1">И-мэйл баталгаажлаа! Нэрээ сонгоно уу.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nickname</label>
            <p className="text-xs text-muted-foreground">Бодит нэр оруулах шаардлагагүй</p>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[\w._-]+"
              placeholder="coolswapper_99"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Хадгалж байна…' : 'Эхлэх →'}
          </button>
        </form>
      </div>
    </div>
  )
}
