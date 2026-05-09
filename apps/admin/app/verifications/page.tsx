import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { VerifyCard } from './VerifyCard'

async function getVerifications(status: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('verifications')
    .select('*, listings!verifications_listing_id_fkey(title, photos, category, users!listings_user_id_fkey(nickname))')
    .eq('status', status)
    .order('created_at')
  return data ?? []
}

type Filter = 'pending' | 'approved' | 'rejected'
const FILTERS: Filter[] = ['pending', 'approved', 'rejected']

const FILTER_LABELS: Record<Filter, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default async function VerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const filter = (FILTERS.includes(status as Filter) ? status : 'pending') as Filter
  const verifications = await getVerifications(filter)

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Verifications"
        description="Review and approve listing verification requests"
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] mb-5 w-fit">
        {FILTERS.map(f => (
          <Link
            key={f}
            href={`?status=${f}`}
            className={[
              'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors',
              filter === f
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            ].join(' ')}
          >
            {FILTER_LABELS[f]}
            {f === 'pending' && verifications.length > 0 && filter !== 'pending' && null}
          </Link>
        ))}
      </div>

      {verifications.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={`No ${filter} verifications`}
          description={`There are no ${filter} verification requests at this time.`}
        />
      ) : (
        <div className="space-y-4">
          {verifications.map((v: any) => (
            <VerifyCard key={v.id} verification={v} />
          ))}
        </div>
      )}
    </div>
  )
}
