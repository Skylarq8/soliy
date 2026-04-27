'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Listing } from '@swaply/types'

interface Props {
  listing: Listing
  size?: 'default' | 'featured'
}

export function ListingCard({ listing, size = 'default' }: Props) {
  const [saved, setSaved] = useState(false)

  const meta = listing.category_meta as Record<string, string> | null
  const brand = meta?.brand as string | undefined

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow ${
        size === 'featured' ? 'w-44 flex-shrink-0' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative bg-muted ${size === 'featured' ? 'aspect-[3/4]' : 'aspect-square'}`}>
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={size === 'featured' ? '176px' : '(max-width: 768px) 50vw, 25vw'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {listing.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/80 text-card text-[10px] font-medium backdrop-blur-sm">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Баталгаа
            </span>
          )}
          {listing.boost_until && new Date(listing.boost_until) > new Date() && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-medium">
              Онцлох
            </span>
          )}
        </div>

        {/* Save heart */}
        <button
          onClick={e => { e.preventDefault(); setSaved(s => !s) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors"
        >
          <svg className={`w-4 h-4 transition-colors ${saved ? 'fill-price text-price' : 'fill-none text-muted-foreground'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Swap badge */}
        {listing.swap_enabled && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm text-primary text-[10px] font-medium border border-primary/20">
              ⇄ Солих
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {brand && (
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">
            {brand}
          </p>
        )}
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 mb-1.5">
          {listing.title}
        </p>
        <div className="flex items-center justify-between">
          {listing.price ? (
            <span className="text-sm font-bold text-price">
              {listing.price.toLocaleString()}₮
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Зөвхөн солилцоо</span>
          )}
        </div>
        {listing.users?.nickname && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            @{listing.users.nickname}
          </p>
        )}
      </div>
    </Link>
  )
}
