'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { value: '',             label: 'Бүгд' },
  { value: 'clothing',     label: 'Хувцас' },
  { value: 'shoes',        label: 'Гутал' },
  { value: 'accessories',  label: 'Цүнх' },
  { value: 'skincare',     label: 'Арьс засал' },
  { value: 'makeup',       label: 'Будалт' },
  { value: 'fragrance',    label: 'Үнэртэн' },
  { value: 'jewelry',      label: 'Гоёл' },
]

export function CategorySidebar() {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('category') ?? ''
  const swapOnly = params.get('swap_only') === 'true'
  const verified = params.get('verified') === 'true'

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    router.push(`/?${next.toString()}`)
  }

  function toggleBool(key: string, current: boolean) {
    const next = new URLSearchParams(params.toString())
    if (!current) next.set(key, 'true'); else next.delete(key)
    router.push(`/?${next.toString()}`)
  }

  return (
    <aside className="hidden md:block w-48 flex-shrink-0 pr-4">
      {/* Categories */}
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
        Ангилал
      </p>
      <ul className="space-y-0.5 mb-6">
        {CATEGORIES.map(cat => {
          const active = current === cat.value
          return (
            <li key={cat.value}>
              <button
                onClick={() => setParam('category', cat.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  active
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Filters */}
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
        Шүүлт
      </p>
      <ul className="space-y-0.5">
        <li>
          <button
            onClick={() => toggleBool('verified', verified)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              verified ? 'text-primary font-medium' : 'text-foreground hover:bg-muted'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Баталгаажсан
          </button>
        </li>
        <li>
          <button
            onClick={() => toggleBool('swap_only', swapOnly)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              swapOnly ? 'text-primary font-medium' : 'text-foreground hover:bg-muted'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Солих боломжтой
          </button>
        </li>
      </ul>
    </aside>
  )
}
