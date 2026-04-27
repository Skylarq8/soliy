'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const EXPLORE_ITEMS = [
  { href: '/explore',                         label: 'Бүх бараа' },
  { href: '/explore?category=clothing',       label: 'Хувцас' },
  { href: '/explore?category=skincare',       label: 'Арьс засал' },
  { href: '/explore?category=fragrance',      label: 'Үнэртэн' },
  { href: '/explore?category=accessories',    label: 'Аксессуар' },
  { href: '/explore?category=shoes',          label: 'Гутал' },
  { href: '/explore?category=makeup',         label: 'Будалт' },
  { href: '/explore?category=jewelry',        label: 'Гоёл' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [exploreOpen, setExploreOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) router.push(`/explore?q=${encodeURIComponent(search.trim())}`)
  }

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExploreOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const exploreActive = pathname.startsWith('/explore')

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3 md:gap-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary flex-shrink-0 tracking-tight">
          Swaply
        </Link>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Explore dropdown — desktop only */}
          <div ref={dropdownRef} className="relative hidden md:block">
            <button
              onClick={() => setExploreOpen(o => !o)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                exploreOpen || exploreActive
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Хайх
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-150 ${exploreOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {exploreOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-card-hover py-1.5 z-50">
                {EXPLORE_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setExploreOpen(false)}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* +Нэмэх — desktop only */}
          <Link
            href="/listing/new"
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Нэмэх
          </Link>

          {/* Separator — desktop */}
          <div className="hidden md:block w-px h-5 bg-border mx-1" />

          {/* Heart / saved — desktop only */}
          <Link
            href="/saved"
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Хадгалсан"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </Link>

          {/* Bell — desktop. Mobile is in BottomNav */}
          <Link
            href="/notifications"
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Мэдэгдэл"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </Link>

          {/* Messages — desktop only */}
          <Link
            href="/messages"
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Чат"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </Link>

          {/* Profile avatar — desktop only (mobile: BottomNav-д байгаа) */}
          <Link
            href="/profile/me"
            className="hidden md:flex w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label="Профайл"
          >
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" />
            </svg>
          </Link>

          {/* Mobile: notifications bell (Profile/Search/Home/Chat in BottomNav) */}
          <Link
            href="/notifications"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Мэдэгдэл"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
