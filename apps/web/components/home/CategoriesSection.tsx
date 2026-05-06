import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import { CategoryFilter } from './CategoryFilter'

async function getListings(): Promise<Listing[]> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await sb
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(16)
  if (error) {
    console.error('Home listings query failed:', error.message)
  }
  return (data as Listing[]) ?? []
}

export async function CategoriesSection() {
  const listings = await getListings()
  return <CategoryFilter listings={listings} />
}
