'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import type { Listing } from '@swaply/types'
import { ListingCard } from '@/components/listing/ListingCard'
import { BackButton } from '@/components/shared/BackButton'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export default function SavedPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/auth/login')
        return
      }

      try {
        const data = await api.saved.list() as { listings: Listing[] }
        setListings(data.listings ?? [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [router])

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <BackButton fallbackHref="/explore" />
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Хадгалсан</h1>
          <p className="mt-1 text-sm text-muted-foreground">Дараа үзэхээр хадгалсан бараанууд.</p>
        </div>
        <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary sm:flex">
          <Heart size={20} />
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Уншиж байна...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Heart size={22} />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Одоогоор хадгалсан бараа алга</h2>
          <p className="mt-1 text-sm text-muted-foreground">Таалагдсан бараан дээрээ heart дарж энд хадгална.</p>
          <Link href="/explore" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Бараа үзэх
          </Link>
        </div>
      )}

      {listings.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  )
}
