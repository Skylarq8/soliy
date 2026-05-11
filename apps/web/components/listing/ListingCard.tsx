'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Repeat2, ShieldCheck, Zap } from 'lucide-react'
import type { Listing } from '@soliy/types'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface Props {
  listing: Listing
  size?: 'default' | 'featured'
}

export function ListingCard({ listing, size = 'default' }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [authed, setAuthed] = useState(false)

  const meta = listing.category_meta as Record<string, string> | null
  const brand = meta?.brand as string | undefined
  const conditionLabel = listing.condition ? CONDITION_LABELS[listing.condition] : null
  const location = formatLocation(meta?.location_city, meta?.location_district) || 'Байршилгүй'

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const hasSession = Boolean(data.session)
      setAuthed(hasSession)
      if (!hasSession) return

      try {
        const result = await api.saved.status(listing.id)
        if (mounted) setSaved(result.saved)
      } catch {
        // Keep the card usable even if saved status cannot be fetched.
      }
    })

    return () => {
      mounted = false
    }
  }, [listing.id])

  async function toggleSaved(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (!authed) {
      router.push('/auth/login')
      return
    }

    const next = !saved
    setSaved(next)
    setSaving(true)
    try {
      if (next) {
        await api.saved.add(listing.id)
      } else {
        await api.saved.remove(listing.id)
      }
    } catch {
      setSaved(!next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`group block overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_10px_26px_rgba(20,16,12,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,16,12,0.11)] dark:shadow-card dark:hover:shadow-card-hover ${
        size === 'featured' ? 'w-40 flex-shrink-0' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-muted ${size === 'featured' ? 'aspect-[3/4]' : 'aspect-[4/3] sm:aspect-square'}`}>
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {listing.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-card/92 px-2 py-0.5 text-[10px] font-bold text-primary shadow-sm backdrop-blur-sm">
              <ShieldCheck size={12} />
              Баталгаа
            </span>
          )}
          {listing.boost_until && new Date(listing.boost_until) > new Date() && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Zap size={11} />
              Онцлох
            </span>
          )}
        </div>

        {/* Save heart */}
        <button
          onClick={toggleSaved}
          disabled={saving}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-card disabled:opacity-60"
          aria-label={saved ? 'Хадгалснаас хасах' : 'Хадгалах'}
          aria-pressed={saved}
        >
          <Heart size={16} className={saved ? 'fill-price text-price' : 'fill-none text-muted-foreground'} />
        </button>

        {/* Swap badge */}
        {listing.swap_enabled && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="inline-flex h-7 items-center gap-1 rounded-full border border-white/35 bg-primary/95 px-2 text-[10px] font-bold text-primary-foreground shadow-[0_6px_16px_rgba(0,0,0,0.28)] ring-1 ring-black/10 backdrop-blur-sm">
              <Repeat2 size={11} strokeWidth={2.3} />
              <span className="leading-none">Солих</span>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={size === 'featured' ? 'p-2.5 sm:p-3' : 'p-2.5 sm:p-3.5'}>
        {brand && size !== 'featured' && (
          <p className="mb-1 hidden text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:block">
            {brand}
          </p>
        )}
        <p className={`line-clamp-1 font-semibold leading-snug text-foreground sm:line-clamp-2 ${size === 'featured' ? 'text-sm' : 'text-sm sm:text-[15px]'}`}>
          {listing.title}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2.5">
          {listing.price ? (
            <span className={`font-bold text-price ${size === 'featured' ? 'text-base' : 'text-base sm:text-lg'}`}>
              {listing.price.toLocaleString()}₮
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Зөвхөн солилцоо</span>
          )}
          {conditionLabel && (
            <span className={`rounded-full bg-primary-light font-semibold text-primary ${size === 'featured' ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px] sm:px-2.5 sm:text-[11px]'}`}>
              {conditionLabel}
            </span>
          )}
        </div>
        <p className={`flex items-center gap-1.5 truncate font-medium text-muted-foreground ${size === 'featured' ? 'mt-1.5 text-xs' : 'mt-2 text-xs sm:text-[13px]'}`}>
          <MapPin size={size === 'featured' ? 13 : 14} className="flex-shrink-0 text-primary" />
          {location}
        </p>
      </div>
    </Link>
  )
}

function formatLocation(city?: string | null, district?: string | null) {
  const parts = [city, district]
    .map(part => part?.trim())
    .filter(Boolean)

  return parts.join(', ')
}

const CONDITION_LABELS: Record<number, string> = {
  1: 'Элэгдсэн',
  2: 'Дундаж',
  3: 'Сайн',
  4: 'Маш сайн',
  5: 'Шинэ',
}
