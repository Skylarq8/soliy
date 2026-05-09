import { Flag, MessageSquareWarning, ShieldAlert } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

async function getActiveListings() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('listings')
    .select('id, title, category, photos, status, created_at, users!listings_user_id_fkey(id, nickname)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

async function getBlockedMessages() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('messages')
    .select('id, content, created_at, sender_id')
    .eq('blocked', true)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export default async function ReportsPage() {
  const [listings, messages] = await Promise.all([
    getActiveListings(),
    getBlockedMessages(),
  ])

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Review reported content and blocked messages"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Active Listings</span>
          </div>
          <p className="text-2xl font-bold">{listings.length}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Currently visible</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Blocked Messages</span>
          </div>
          <p className="text-2xl font-bold">{messages.length}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Auto-moderated</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-400">System Status</span>
          </div>
          <p className="text-sm font-medium text-emerald-400">All systems operational</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Moderation running</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Listings */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[hsl(var(--border))]">
            <Flag className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold">Recent Active Listings</h2>
          </div>
          {listings.length === 0 ? (
            <EmptyState icon={Flag} title="No active listings" />
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {listings.slice(0, 8).map((l: any) => (
                <Link
                  key={l.id}
                  href={`/listings`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--surface))] transition-colors"
                >
                  {l.photos?.[0] ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={l.photos[0]} alt={l.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--surface))] flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      @{l.users?.nickname} · {l.category}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Blocked messages */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[hsl(var(--border))]">
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Blocked Messages</h2>
          </div>
          {messages.length === 0 ? (
            <EmptyState icon={MessageSquareWarning} title="No blocked messages" description="No messages have been auto-moderated" />
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {messages.slice(0, 8).map((m: any) => (
                <div key={m.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="danger" dot>Blocked</Badge>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDateTime(m.created_at)}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] rounded-lg px-3 py-2 border border-[hsl(var(--border))] line-clamp-2">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
