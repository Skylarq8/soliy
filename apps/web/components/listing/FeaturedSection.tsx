import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import { ListingCard } from './ListingCard'
import Link from 'next/link'

async function getFeatured(): Promise<Listing[]> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('listings')
    .select('*, users(nickname, avatar_url, safe_score, swap_count)')
    .eq('status', 'active')
    .not('boost_until', 'is', null)
    .gt('boost_until', new Date().toISOString())
    .order('boost_until', { ascending: false })
    .limit(8)

  // Fall back to most recent if no boosted listings
  if (!data || data.length === 0) {
    const { data: recent } = await sb
      .from('listings')
      .select('*, users(nickname, avatar_url, safe_score, swap_count)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8)
    return (recent as Listing[]) ?? []
  }

  return (data as Listing[]) ?? []
}

export async function FeaturedSection() {
  const listings = await getFeatured()
  if (listings.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Онцлох зүйлс</h2>
        <Link href="/explore" className="text-xs text-primary font-medium hover:underline">
          Бүгдийг харах
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} size="featured" />
        ))}
      </div>
    </div>
  )
}
