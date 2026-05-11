'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  FolderTree,
  ShieldCheck,
  Flag,
  ArrowLeftRight,
  Settings,
  Zap,
} from 'lucide-react'

const NAV = [
  { href: '/',              icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { href: '/listings',      icon: Package,         label: 'Listings'              },
  { href: '/users',         icon: Users,           label: 'Users'                 },
  { href: '/swaps',         icon: ArrowLeftRight,  label: 'Swap Requests'         },
  { href: '/categories',    icon: FolderTree,      label: 'Categories'            },
  { href: '/verifications', icon: ShieldCheck,     label: 'Verifications'         },
  { href: '/reports',       icon: Flag,            label: 'Reports'               },
]

export function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string, end?: boolean) {
    if (end) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(228_20%_6.5%)]">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_0_16px_hsl(262_80%_60%_/_0.4)]">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-[hsl(var(--foreground))]">Soliy</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, end }) => {
          const active = isActive(href, end)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'nav-active'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]',
              ].join(' ')}
            >
              <Icon
                className={[
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  active
                    ? 'text-violet-400'
                    : 'text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]',
                ].join(' ')}
                strokeWidth={active ? 2 : 1.75}
              />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-[hsl(var(--border))]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))] transition-all"
        >
          <Settings className="w-4 h-4" strokeWidth={1.75} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
