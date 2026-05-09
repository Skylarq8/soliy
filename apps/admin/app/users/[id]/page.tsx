import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Star, Package, RefreshCcw, Shield } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/badge'
import { BanButton } from './BanButton'
import { formatDate, formatCurrency } from '@/lib/utils'

async function getUser(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

async function getUserListings(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('listings')
    .select('id, title, category, status, price, photos, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, listings] = await Promise.all([getUser(id), getUserListings(id)])
  if (!user) notFound()

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      {/* Back nav */}
      <Link
        href="/users"
        className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center">
            {user.avatar_url ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <Image src={user.avatar_url} alt={user.nickname} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white shadow-glow-violet">
                {user.nickname?.[0]?.toUpperCase()}
              </div>
            )}

            <h1 className="text-lg font-bold">@{user.nickname}</h1>
            {user.name && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{user.name}</p>}

            <div className="flex items-center justify-center gap-2 mt-3">
              {user.is_admin && <Badge variant="purple">Admin</Badge>}
              <Badge variant="muted">Member</Badge>
            </div>

            {user.bio && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4 border-t border-[hsl(var(--border))] pt-4">
                {user.bio}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5 border-t border-[hsl(var(--border))] pt-5">
              <div className="text-center">
                <p className="text-xl font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4" strokeWidth={2} />
                  {user.safe_score?.toFixed(1) ?? '0.0'}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Safe Score</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{user.swap_count ?? 0}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Swaps</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-3">
              Admin Actions
            </p>
            <BanButton userId={user.id} />
          </div>
        </div>

        {/* Details + Listings */}
        <div className="lg:col-span-2 space-y-4">
          {/* User details */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              Account Details
            </h2>
            <div className="space-y-3">
              {[
                { label: 'User ID',    value: user.id,                              mono: true },
                { label: 'Phone',      value: user.phone ?? 'Not provided',         mono: false },
                { label: 'Joined',     value: formatDate(user.created_at),          mono: false },
                { label: 'Admin',      value: user.is_admin ? 'Yes' : 'No',         mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
                  <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''} truncate max-w-[220px]`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listings */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
            <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center gap-2">
              <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-sm font-semibold">Listings ({listings.length})</h2>
            </div>
            {listings.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">No listings yet</p>
            ) : (
              <div className="divide-y divide-[hsl(var(--border))]">
                {listings.map((l: any) => (
                  <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                    {l.photos?.[0] ? (
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={l.photos[0]} alt={l.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface))] flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{l.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatCurrency(l.price)}</span>
                      <StatusBadge status={l.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
