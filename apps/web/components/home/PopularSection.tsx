import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import { ListingCard } from '@/components/listing/ListingCard'
import Link from 'next/link'

async function getPopular(): Promise<Listing[]> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('status', 'active')
    .order('boost_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(8)
  return (data as Listing[]) ?? []
}

export async function PopularSection() {
  const listings = await getPopular()

  return (
    <section className="py-14 md:py-20 bg-card">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">
              ОДОО ТРЕНД
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Энэ долоо хоногийн алдартай 🔥
            </h2>
          </div>
          <Link
            href="/explore"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0 ml-4"
          >
            Бүх бараа харах <span aria-hidden>→</span>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Одоогоор бараа байхгүй байна. Эхний зараа нэмэх уу?{' '}
            <Link href="/listing/new" className="text-primary font-medium hover:underline">
              Нэмэх →
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {listings.map(listing => (
              <div key={listing.id} className="w-52 flex-shrink-0">
                <ListingCard listing={listing} size="featured" />
              </div>
            ))}
          </div>
        )}

        {/* Mobile link */}
        {listings.length > 0 && (
          <div className="mt-6 text-center md:hidden">
            <Link href="/explore" className="text-sm font-semibold text-primary">
              Бүх бараа харах →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
