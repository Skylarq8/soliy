import { ArrowLeftRight, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

const STATUSES = ['pending', 'accepted', 'countered', 'completed', 'declined'] as const
type Status = typeof STATUSES[number]

async function getProposals(status: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('proposals')
    .select(`
      id, status, money_offer, created_at, updated_at,
      sender:sender_id(id, nickname),
      receiver:receiver_id(id, nickname)
    `)
    .eq('status', status)
    .order('updated_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export default async function SwapsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const proposals = await getProposals(status)

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Swap Requests"
        description="Monitor all swap proposals between users"
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] mb-5 w-fit">
        {STATUSES.map(s => (
          <Link
            key={s}
            href={`?status=${s}`}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
              status === s
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            ].join(' ')}
          >
            {s}
          </Link>
        ))}
      </div>

      {proposals.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={`No ${status} swaps`}
          description={`There are no ${status} swap requests at this time.`}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Sender</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">→</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Receiver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Money Offer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {proposals.map((p: any) => (
                <tr key={p.id} className="hover:bg-[hsl(var(--surface))] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/users?q=${p.sender?.nickname}`}
                      className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.sender?.nickname?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium">@{p.sender?.nickname}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ArrowLeftRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/users?q=${p.receiver?.nickname}`}
                      className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.receiver?.nickname?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium">@{p.receiver?.nickname}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {p.money_offer > 0 ? `+${p.money_offer.toLocaleString()}₮` : (
                      <span className="text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] text-xs">
                    {formatDateTime(p.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
