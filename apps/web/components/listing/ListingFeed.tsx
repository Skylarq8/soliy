import { createClient } from '@supabase/supabase-js'
import type { Database } from '@soliy/db'
import type { Listing } from '@soliy/types'
import { ListingCard } from './ListingCard'

function serverSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function getListings(params: Record<string, string>): Promise<Listing[]> {
  const sb = serverSupabase()
  const limit = 20
  const page = parseInt(params.page ?? '1')
  const offset = (page - 1) * limit

  let query = sb
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('status', 'active')
    .order('boost_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (params.category)           query = query.eq('category', params.category)
  if (params.swap_only === 'true') query = query.eq('swap_enabled', true)
  if (params.min_price)          query = query.gte('price', parseInt(params.min_price))
  if (params.max_price)          query = query.lte('price', parseInt(params.max_price))
  if (params.q)                  query = query.textSearch('title', params.q)

  const { data } = await query
  return (data as Listing[]) ?? []
}

export async function ListingFeed({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const listings = await getListings(params)

  if (listings.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Зар олдсонгүй
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
