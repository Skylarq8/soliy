'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Listing } from '@swaply/types'

type Tab = 'active' | 'sold' | 'reviews'

function ScoreRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(score, 100) / 100)
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-rose-100 dark:text-rose-950" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className="text-rose-400" />
      </svg>
      <span className="text-base font-bold text-rose-500 relative z-10">{score}</span>
    </div>
  )
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-amber-400' : 'text-muted-foreground/30'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-sm font-semibold ml-0.5">{value.toFixed(1)}</span>
    </div>
  )
}

export default function MyProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [tab, setTab] = useState<Tab>('active')
  const [listings, setListings] = useState<Listing[]>([])
  const [soldCount, setSoldCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [reviewAvg, setReviewAvg] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // edit state
  const [editing, setEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const uid = session.user.id
      setEmail(session.user.email ?? '')

      const [
        { data: profile },
        { data: activeListings },
        { count: soldCnt },
        { count: followers },
        { data: reviews },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', uid).single(),
        supabase.from('listings').select('*').eq('user_id', uid).eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', uid).in('status', ['swapped', 'sold']),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', uid),
        supabase.from('reviews').select('rating').eq('reviewee_id', uid),
      ])

      setUser(profile)
      setListings(activeListings ?? [])
      setSoldCount(soldCnt ?? 0)
      setFollowerCount(followers ?? 0)
      if (reviews && reviews.length > 0) {
        setReviewAvg(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
        setReviewCount(reviews.length)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!user) return
    async function loadTab() {
      if (tab === 'active') {
        const { data } = await supabase.from('listings').select('*').eq('user_id', user!.id).eq('status', 'active').order('created_at', { ascending: false })
        setListings(data ?? [])
      } else if (tab === 'sold') {
        const { data } = await supabase.from('listings').select('*').eq('user_id', user!.id).in('status', ['swapped', 'sold']).order('created_at', { ascending: false })
        setListings(data ?? [])
      }
    }
    loadTab()
  }, [tab, user])

  function openEdit() {
    if (!user) return
    setEditNickname(user.nickname)
    setEditBio(user.bio ?? '')
    setEditEmail(email)
    setAvatarPreview(null)
    setAvatarFile(null)
    setSaveMsg('')
    setEditing(true)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveMsg('')

    try {
      let avatarUrl = user.avatar_url

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      }

      const { data: updated, error: profileErr } = await supabase
        .from('users')
        .update({ nickname: editNickname.trim(), bio: editBio.trim() || null, avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single()

      if (profileErr) throw profileErr

      if (editEmail.trim() && editEmail.trim() !== email) {
        await supabase.auth.updateUser({ email: editEmail.trim() })
        setSaveMsg('Профайл хадгалагдлаа. Шинэ имэйл рүү баталгаажуулах линк илгээлээ.')
      } else {
        setSaveMsg('Профайл амжилттай хадгалагдлаа.')
      }

      setUser(updated)
      setEmail(editEmail.trim() || email)
      setEditing(false)
    } catch {
      setSaveMsg('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="text-4xl">👤</div>
        <h2 className="text-xl font-bold">Нэвтрэх шаардлагатай</h2>
        <p className="text-sm text-muted-foreground text-center">Профайлаа харахын тулд нэвтэрнэ үү</p>
        <Link href="/auth/login" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Нэвтрэх
        </Link>
      </div>
    )
  }

  const initial = user.nickname[0].toUpperCase()
  const isTopSeller = user.swap_count >= 20
  const trustLabel = user.safe_score >= 80 ? 'Итгэлтэй хэрэглэгч' : user.safe_score >= 50 ? 'Хэвийн хэрэглэгч' : 'Шинэ хэрэглэгч'
  const avatarSrc = avatarPreview ?? user.avatar_url

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 pt-6">

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-lg">Профайл засах</h2>
                <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => fileRef.current?.click()} className="relative group">
                    {avatarSrc ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
                        <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center ring-4 ring-primary/20">
                        <span className="text-3xl font-bold text-white">{initial}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground">Зургаа дарж солих</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Nickname */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Нэрхэн</label>
                  <input
                    value={editNickname}
                    onChange={e => setEditNickname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    placeholder="nickname"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Танилцуулга</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
                    placeholder="Өөрийгөө товч танилцуул..."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Имэйл хаяг</label>
                  <input
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    type="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    placeholder="email@example.com"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Имэйл солиход баталгаажуулах линк илгээнэ</p>
                </div>

                {saveMsg && (
                  <p className={`text-xs px-3 py-2 rounded-lg ${saveMsg.includes('Алдаа') ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-green-50 text-green-700 dark:bg-green-950/30'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">
                  Болих
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editNickname.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: 2-column, Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 xl:grid-cols-[340px_1fr]">

          {/* LEFT SIDEBAR */}
          <div className="space-y-4">
            {/* Avatar + name */}
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center gap-3 text-center">
              <div className="relative">
                {avatarSrc ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-background shadow-md">
                    <Image src={avatarSrc} alt={user.nickname} width={96} height={96} className="object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center ring-4 ring-background shadow-md">
                    <span className="text-3xl font-bold text-white">{initial}</span>
                  </div>
                )}
                {user.is_admin && (
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                    <svg className="w-3.5 h-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold">{user.nickname}</h2>
                {user.bio && <p className="text-sm text-muted-foreground mt-0.5">{user.bio}</p>}
                <p className="text-xs text-muted-foreground/70 mt-1">{email}</p>
              </div>

              <button
                onClick={openEdit}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Профайл засах
              </button>
            </div>

            {/* Score + rating */}
            <div className="bg-card rounded-2xl border border-border px-5 py-4 flex items-center gap-4">
              <ScoreRing score={user.safe_score} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{user.safe_score} оноо</p>
                <p className="text-xs text-rose-400 font-medium">{trustLabel}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col items-end gap-1">
                <StarRating value={reviewAvg || 0} />
                <p className="text-xs text-muted-foreground">{reviewCount} үнэлгээ</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl border border-border px-4 py-4 grid grid-cols-3 divide-x divide-border">
              <div className="text-center">
                <p className="text-2xl font-bold">{user.swap_count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Гүйлгээ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Идэвхтэй</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{followerCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Дагагч</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 text-sm text-primary font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
                </svg>
                Баталгаатай
              </span>
              {isTopSeller && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/60 text-sm text-amber-500 font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                  </svg>
                  Top Seller
                </span>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Зар нэмэх', href: '/listing/new', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )},
                { label: 'Солилцоо', href: '/swap', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                )},
                { label: 'Дуртай', href: '/profile/me/liked', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )},
              ].map(({ label, href, icon }) => (
                <Link key={label} href={href} className="bg-card rounded-2xl border border-border p-3 flex flex-col items-center gap-2 hover:bg-muted/40 active:scale-95 transition-all">
                  <span className="text-primary">{icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>

            {/* Sign out — desktop only */}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}
              className="hidden lg:block w-full py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Гарах
            </button>
          </div>

          {/* RIGHT — Tabs + listings */}
          <div className="mt-4 lg:mt-0 space-y-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex border-b border-border">
                {([
                  ['active', `Идэвхтэй (${listings.length})`],
                  ['sold', `Зарагдсан (${soldCount})`],
                  ['reviews', `Үнэлгээ (${reviewCount})`],
                ] as [Tab, string][]).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                      tab === t ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {tab === 'reviews' ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Одоогоор үнэлгээ байхгүй байна</p>
                ) : listings.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-muted-foreground text-sm">Зар байхгүй байна</p>
                    {tab === 'active' && (
                      <Link href="/listing/new" className="inline-block text-xs text-primary hover:underline">
                        + Зар нэмэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {listings.map(l => (
                      <Link key={l.id} href={`/listing/${l.id}`} className="group rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-colors">
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {l.photos?.[0] ? (
                            <Image src={l.photos[0]} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {l.price ? `${l.price.toLocaleString()}₮` : 'Swap only'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sign out — mobile only */}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}
              className="lg:hidden w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Гарах
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
