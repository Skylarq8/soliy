import { Suspense } from 'react'
import { ListingFeed } from '@/components/listing/ListingFeed'
import { FeedFilters } from '@/components/listing/FeedFilters'

export const metadata = { title: 'Хайх — Swaply' }

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-xl font-semibold mb-4">Хайх</h1>
      <Suspense>
        <FeedFilters showSearch />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground mt-8 text-center">Уншиж байна…</p>}>
        <ListingFeed searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
