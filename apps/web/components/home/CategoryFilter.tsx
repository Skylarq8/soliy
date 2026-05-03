'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Listing } from '@swaply/types'
import { ListingCard } from '@/components/listing/ListingCard'

const TABS = [
  { key: 'all',         label: 'Бүгд',    icon: '✨' },
  { key: 'clothing',    label: 'Хувцас',  icon: '👗' },
  { key: 'electronics', label: 'Электрон',icon: '📱' },
  { key: 'home',        label: 'Гэр ахуй',icon: '🏠' },
  { key: 'books',       label: 'Ном',     icon: '📚' },
  { key: 'sports',      label: 'Спорт',   icon: '⚽' },
  { key: 'kids',        label: 'Хүүхэд',  icon: '🧸' },
]

export function CategoryFilter({ listings }: { listings: Listing[] }) {
  const [active, setActive] = useState('all')

  const filtered = active === 'all'
    ? listings
    : listings.filter(l => l.category === active)

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-foreground">Ангилал</h2>
          <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
            Бүгд →
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                active === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/60'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Одоогоор бараа байхгүй байна.{' '}
            <Link href="/listing/new" className="text-primary font-medium hover:underline">
              Нэмэх →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.slice(0, 8).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
