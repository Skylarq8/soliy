import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  category: string
  excludeId: string
}

export async function SimilarListings({ category, excludeId }: Props) {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('listings')
    .select('id, title, photos, price, category_meta')
    .eq('status', 'active')
    .eq('category', category)
    .neq('id', excludeId)
    .limit(4)

  if (!data || data.length === 0) return null

  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-3">Тэстэй зүйлс</p>
      <div className="space-y-3">
        {(data as Listing[]).map(item => (
          <Link key={item.id} href={`/listing/${item.id}`} className="flex gap-2.5 hover:opacity-80 transition-opacity">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {item.photos[0] && <Image src={item.photos[0]} alt={item.title} fill className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                {item.title}
              </p>
              {item.price && (
                <p className="text-xs font-bold text-price mt-1">{item.price.toLocaleString()}₮</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
