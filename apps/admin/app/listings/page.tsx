import Link from 'next/link'
import Image from 'next/image'
import { Plus, Package, Search } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { ArchiveButton } from './ArchiveButton'
import { DeleteButton } from './DeleteButton'
import { formatDate, formatCurrency } from '@/lib/utils'

const STATUSES = ['active', 'swapped', 'sold', 'archived'] as const
type Status = typeof STATUSES[number]

const CATEGORY_LABELS: Record<string, string> = {
  clothing:       'Clothing',
  skincare:       'Skin Care',
  makeup:         'Make Up',
  accessories:    'Accessories',
  perfume:        'Perfume',
  instruments:    'Instruments',
}

async function getListings(status = 'active', page = 1) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('listings')
    .select('id, title, category, status, price, photos, created_at, users!listings_user_id_fkey(nickname)')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1)
  return data ?? []
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}) {
  const { status = 'active', q, page = '1' } = await searchParams
  const listings = await getListings(status, Number(page))

  const filtered = q
    ? listings.filter((l: any) =>
        l.title?.toLowerCase().includes(q.toLowerCase()) ||
        l.users?.nickname?.toLowerCase().includes(q.toLowerCase())
      )
    : listings

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Listings"
        description="Browse and manage all marketplace listings"
        action={
          <Link
            href="/listings/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))]">
          {STATUSES.map(s => (
            <Link
              key={s}
              href={`?status=${s}${q ? `&q=${q}` : ''}`}
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

        <form className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by title or user…"
              className="input-base pl-8 pr-3 py-1.5 text-xs"
            />
            <input type="hidden" name="status" value={status} />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--surface-raised))] transition-colors"
          >
            Search
          </button>
        </form>

        <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings found"
          description={`There are no ${status} listings${q ? ` matching "${q}"` : ''}.`}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Listing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((l: any) => (
                <tr key={l.id} className="group hover:bg-[hsl(var(--surface))] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {l.photos?.[0] ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[hsl(var(--surface))] flex-shrink-0">
                          <Image src={l.photos[0]} alt={l.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--surface))] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[200px]">{l.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    @{l.users?.nickname ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] capitalize">
                    {CATEGORY_LABELS[l.category] ?? l.category}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(l.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] text-xs">
                    {formatDate(l.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.status === 'archived'
                      ? <DeleteButton id={l.id} />
                      : <ArchiveButton id={l.id} />
                    }
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
