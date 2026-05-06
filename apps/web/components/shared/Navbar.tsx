'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/shared/ThemeProvider'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { theme, toggle } = useTheme()
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (search.trim()) router.push(`/explore?q=${encodeURIComponent(search.trim())}`)
  }

  const navLink = (href: string, label: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href)
    return (
      <Link
        key={href}
        href={href}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          active ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-muted'
        }`}
      >
        {label}
      </Link>
    )
  }

  const iconBtn    = 'w-9 h-9 flex     items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0'
  const iconBtnMd = 'w-9 h-9 hidden md:flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0'

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary flex-shrink-0 tracking-tight">
          Swaply
        </Link>

        {/* Center nav — desktop only, flex-1 to push icons right */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-0.5">
          {navLink('/', 'Нүүр', true)}
          {navLink('/explore', 'Бараа')}
        </div>

        {/* Mobile search */}
        {/* <form onSubmit={handleSearch} className="flex md:hidden flex-1 min-w-0">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Бараа хайх"
              className="w-full min-w-0 pl-9 pr-3 py-1.5 text-sm bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
            />
          </div>
        </form> */}

        {/* Search — flex-1 on mobile, fixed width on desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex md:flex-none md:w-72">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
            />
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="hidden md:block w-px h-5 bg-border mx-1" />

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggle}
            className={iconBtn}
            aria-label={theme === 'dark' ? 'Гэрлийн горим руу солих' : 'Харанхуй горим руу солих'}
            suppressHydrationWarning
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {user && (
            <>
              {/* Notifications */}
              <Link href="/notifications" className={iconBtn} aria-label="Мэдэгдэл">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </Link>

              {/* Wishlist */}
              <Link href="/saved" className={iconBtnMd} aria-label="Хадгалсан">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </Link>

              {/* Chat */}
              <Link href="/messages" className={iconBtnMd} aria-label="Чат">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </Link>

              {/* Profile */}
              <Link
                href="/profile/me"
                className="flex w-9 h-9 rounded-full border border-border bg-primary/10 items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
                aria-label="Профайл"
              >
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" />
                </svg>
              </Link>

              {/* Add listing */}
              <Link
                href="/listing/new"
                className="h-9 w-9 sm:w-auto sm:px-3 flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                aria-label="Зар нэмэх"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                </svg>
                <span className="hidden sm:inline">Нэмэх</span>
              </Link>

            </>
          )}

          {!user && (
            <Link
              href="/auth/login"
              className="hidden md:flex items-center px-4 py-1.5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors flex-shrink-0"
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
