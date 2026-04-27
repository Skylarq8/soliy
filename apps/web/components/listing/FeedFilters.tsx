'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

const CATEGORIES = [
  { value: '',            label: 'Бүгд' },
  { value: 'clothing',    label: 'Хувцас' },
  { value: 'accessories', label: 'Цүнх' },
  { value: 'skincare',    label: 'Арьс засал' },
  { value: 'makeup',      label: 'Будалт' },
]

interface Props {
  showSearch?: boolean
  initialParams?: Record<string, string>
}

export function FeedFilters({ showSearch, initialParams }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    startTransition(() => router.push(`?${next.toString()}`))
  }

  const currentCategory = params.get('category') ?? ''
  const swapOnly = params.get('swap_only') === 'true'

  return (
    <div className={`${isPending ? 'opacity-60' : ''}`}>
      {showSearch && (
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            placeholder="Хайх…"
            defaultValue={params.get('q') ?? ''}
            onChange={e => setParam('q', e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setParam('category', cat.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setParam('swap_only', swapOnly ? '' : 'true')}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            swapOnly
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          ⇄ Солих
        </button>
      </div>
    </div>
  )
}
