'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',               icon: '📊', label: 'Dashboard' },
  { href: '/verifications',  icon: '🔍', label: 'Баталгаажуулалт' },
  { href: '/users',          icon: '👥', label: 'Хэрэглэгчид' },
  { href: '/listings',       icon: '📦', label: 'Зарууд' },
  { href: '/categories',     icon: '🗂️',  label: 'Категориуд' },
  { href: '/reports',        icon: '🚩', label: 'Мэдээлсэн' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <span className="font-bold text-violet-400 text-lg">Swaply</span>
        <span className="text-xs text-muted-foreground ml-1">admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
