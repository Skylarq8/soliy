import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import { ProposalButton } from '@/components/swap/ProposalButton'
import { ImageGallery } from '@/components/listing/ImageGallery'
import { SimilarListings } from '@/components/listing/SimilarListings'
import { BackButton } from '@/components/shared/BackButton'

async function getListing(id: string): Promise<Listing | null> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('listings')
    .select('*, users(nickname, avatar_url, safe_score, swap_count)')
    .eq('id', id)
    .single()
  return data as Listing | null
}

const CONDITION_LABELS: Record<number, string> = {
  1: 'Муу', 2: 'Дунд', 3: 'Сайн', 4: 'Маш сайн', 5: 'Шинэ'
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const meta = listing.category_meta as Record<string, string | number | boolean> | null
  const brand = meta?.brand as string | undefined
  const percentUsed = meta?.percent_used as number | undefined
  const size = (meta?.size_local ?? meta?.size_intl) as string | undefined

  const tags: string[] = []
  if (size)                                tags.push(`Хэмжээ: ${size}`)
  if (listing.condition && CONDITION_LABELS[listing.condition]) tags.push(CONDITION_LABELS[listing.condition])
  if (percentUsed != null)                 tags.push(`Ноос ${percentUsed}%`)
  if (meta?.is_opened === false)           tags.push('Нээгдээгүй')

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-4 md:px-6 md:py-6">
      <div className="mb-4">
        <BackButton fallbackHref="/explore" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,384px)_minmax(0,1fr)_208px] lg:gap-8">
        {/* Left: image gallery */}
        <ImageGallery photos={listing.photos} title={listing.title} verified={listing.verified} />

        {/* Center: details */}
        <div className="min-w-0">
          {brand && (
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
              {brand}
            </p>
          )}
          <h1 className="text-2xl font-bold text-foreground mb-2 leading-snug md:text-3xl">
            {listing.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {listing.price && (
              <span className="text-2xl font-bold text-price">
                {listing.price.toLocaleString()}₮
              </span>
            )}
            {listing.swap_enabled && (
              <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
                Солих боломжтой
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* Seller */}
          {listing.users && (
            <Link
              href={`/profile/${listing.users.nickname}`}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="w-11 h-11 rounded-full bg-primary-light border border-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {listing.users.nickname[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{listing.users.nickname}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3 h-3 ${s <= Math.round(listing.users!.safe_score ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-muted fill-muted'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(listing.users.safe_score ?? 0).toFixed(1)} · {listing.users.swap_count} гүйлгээ
                  </span>
                </div>
              </div>
              {listing.verified && (
                <span className="hidden items-center gap-1 rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-xs font-medium text-primary sm:flex">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Итгэлтэй
                </span>
              )}
            </Link>
          )}

          {/* Action buttons */}
          <ProposalButton listing={listing} />
        </div>

        {/* Right: similar items — desktop only */}
        <div className="hidden lg:block">
          <SimilarListings category={listing.category} excludeId={listing.id} />
        </div>
      </div>
    </div>
  )
}
