'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
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
        <circle
          cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className="text-rose-400"
        />
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
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<Tab>('active')
  const [listings, setListings] = useState<Listing[]>([])
  const [soldCount, setSoldCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [reviewAvg, setReviewAvg] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const uid = session.user.id

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
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        setReviewAvg(avg)
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
        <Link
          href="/auth/login"
          className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Нэвтрэх
        </Link>
      </div>
    )
  }

  const initial = user.nickname[0].toUpperCase()
  const isTopSeller = user.swap_count >= 20
  const trustLabel = user.safe_score >= 80 ? 'Итгэлтэй хэрэглэгч' : user.safe_score >= 50 ? 'Хэвийн хэрэглэгч' : 'Шинэ хэрэглэгч'

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h1 className="text-xl font-bold">Профайл</h1>
        <Link
          href="/profile/me/settings"
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      <div className="px-4 space-y-4 max-w-lg mx-auto">
        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-2 pb-1 gap-2">
          <div className="relative">
            {user.avatar_url ? (
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-background shadow-md">
                <Image src={user.avatar_url} alt={user.nickname} width={96} height={96} className="object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center ring-4 ring-background shadow-md">
                <span className="text-3xl font-bold text-white">{initial}</span>
              </div>
            )}
            {user.is_admin && (
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.nickname}</h2>
            {user.bio && <p className="text-sm text-muted-foreground mt-0.5">{user.bio}</p>}
          </div>
        </div>

        {/* Score + rating card */}
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
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/40 text-sm text-primary font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
            </svg>
            Платформын баталгаа
          </span>
          {isTopSeller && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-400/60 text-sm text-amber-500 font-medium">
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
            { label: 'Зарж байгаа', href: '/listing/new', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            )},
            { label: 'Солилцоо', href: '/swap', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            )},
            { label: 'Дуртай', href: '/profile/me/liked', icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )},
          ].map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:bg-muted/40 active:scale-95 transition-all"
            >
              <span className="text-primary">{icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Tabs */}
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
                  tab === t
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'reviews' ? (
              <p className="text-sm text-muted-foreground text-center py-6">Одоогоор үнэлгээ байхгүй байна</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-muted-foreground text-sm">Зар байхгүй байна</p>
                {tab === 'active' && (
                  <Link href="/listing/new" className="inline-block text-xs text-primary hover:underline">
                    + Зар нэмэх
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
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

        {/* Sign out */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}
          className="w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          Гарах
        </button>
      </div>
    </div>
  )
}
