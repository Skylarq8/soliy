import Link from 'next/link'
import Image from 'next/image'
import {
  Users, Package, CheckCircle2, Clock,
  ShieldCheck, ArrowRight, Plus, ArrowLeftRight,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { fetchStats } from '@/lib/api'
import { StatsCard } from '@/components/StatsCard'
import { DashboardChart } from '@/components/DashboardChart'
import { StatusBadge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { format, subDays, eachDayOfInterval, parseISO, startOfDay } from 'date-fns'

async function getChartData() {
  const supabase = createAdminClient()
  const end   = new Date()
  const start = subDays(end, 13)

  const days = eachDayOfInterval({ start, end })

  const [{ data: listings }, { data: users }] = await Promise.all([
    supabase
      .from('listings')
      .select('created_at')
      .gte('created_at', start.toISOString()),
    supabase
      .from('users')
      .select('created_at')
      .gte('created_at', start.toISOString()),
  ])

  return days.map(day => {
    const key = format(day, 'MMM d')
    const dayStart = startOfDay(day).getTime()
    const dayEnd   = dayStart + 86_400_000
    return {
      date: key,
      listings: (listings ?? []).filter(l => {
        const t = new Date(l.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }).length,
      users: (users ?? []).filter(u => {
        const t = new Date(u.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }).length,
    }
  })
}

async function getRecentData() {
  const supabase = createAdminClient()
  const [{ data: listings }, { data: users }, { data: verifications }] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, category, status, price, photos, created_at, users!listings_user_id_fkey(nickname)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('users')
      .select('id, nickname, avatar_url, swap_count, safe_score, is_admin, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('verifications')
      .select('id, listing_id, tier, status, created_at, listings!verifications_listing_id_fkey(title, category)')
      .eq('status', 'pending')
      .order('created_at')
      .limit(4),
  ])
  return {
    listings: listings ?? [],
    users: users ?? [],
    verifications: verifications ?? [],
  }
}

export default async function AdminDashboard() {
  const [stats, chartData, recent] = await Promise.all([
    fetchStats(),
    getChartData(),
    getRecentData(),
  ])

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider mb-0.5">
            {today}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Link
          href="/listings/create"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-glow-sm"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-slide-up">
          <StatsCard label="Total Users"        value={stats.total_users}           icon={Users}         color="cyan"    />
        </div>
        <div className="animate-slide-up delay-75">
          <StatsCard label="Active Listings"    value={stats.active_listings}       icon={Package}       color="violet"  />
        </div>
        <div className="animate-slide-up delay-150">
          <StatsCard label="Completed Swaps"    value={stats.completed_swaps}       icon={CheckCircle2}  color="emerald" />
        </div>
        <div className="animate-slide-up delay-225">
          <StatsCard label="Pending Reviews"    value={stats.pending_verifications} icon={Clock}         color="amber"   />
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Activity — Last 14 Days</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">New listings &amp; users per day</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />Listings</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" />Users</span>
            </div>
          </div>
          <DashboardChart data={chartData} />
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-1">
              {[
                { href: '/verifications', icon: ShieldCheck, label: 'Review Verifications', count: stats.pending_verifications, color: 'text-amber-400' },
                { href: '/listings',      icon: Package,     label: 'Manage Listings',       count: stats.active_listings,       color: 'text-violet-400' },
                { href: '/swaps',         icon: ArrowLeftRight, label: 'Swap Requests',      count: null,                        color: 'text-cyan-400' },
                { href: '/reports',       icon: ShieldCheck, label: 'Reports',               count: null,                        color: 'text-red-400' },
              ].map(({ href, icon: Icon, label, count, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(var(--surface))] transition-colors group"
                >
                  <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.75} />
                  <span className="text-sm text-[hsl(var(--foreground))] flex-1">{label}</span>
                  {count != null && count > 0 && (
                    <span className="text-xs font-semibold bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {recent.verifications.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Pending Verifications</span>
              </div>
              <div className="space-y-1.5">
                {recent.verifications.map((v: any) => (
                  <Link
                    key={v.id}
                    href="/verifications"
                    className="flex items-center gap-2 text-xs hover:text-violet-400 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="truncate text-[hsl(var(--foreground))]">{v.listings?.title ?? v.listing_id}</span>
                    <span className="text-[hsl(var(--muted-foreground))] flex-shrink-0 capitalize">{v.listings?.category}</span>
                  </Link>
                ))}
              </div>
              <Link href="/verifications" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2.5 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Listings + Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Listings */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
            <h2 className="text-sm font-semibold">Recent Listings</h2>
            <Link href="/listings" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {recent.listings.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--surface))] transition-colors">
                {l.photos?.[0] ? (
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[hsl(var(--surface))] flex-shrink-0">
                    <Image src={l.photos[0]} alt={l.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface))] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    @{(l.users as any)?.nickname} · {l.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatCurrency(l.price)}
                  </span>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
            <h2 className="text-sm font-semibold">Recent Users</h2>
            <Link href="/users" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {recent.users.map((u: any) => (
              <Link
                key={u.id}
                href={`/users/${u.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--surface))] transition-colors"
              >
                {u.avatar_url ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={u.avatar_url} alt={u.nickname} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    {u.nickname?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">@{u.nickname}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {u.swap_count} swaps · {formatDate(u.created_at)}
                  </p>
                </div>
                {u.is_admin && (
                  <span className="text-xs font-semibold bg-violet-500/12 text-violet-400 border border-violet-500/25 px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
