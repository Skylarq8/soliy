'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { CheckCircle2, XCircle, Shield, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { approveVerification, rejectVerification } from './actions'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props {
  verification: any
}

export function VerifyCard({ verification: v }: Props) {
  const router = useRouter()
  const [expiry, setExpiry] = useState('30')
  const [tier, setTier] = useState(String(v.tier ?? 1))
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function approve() {
    startTransition(async () => {
      try {
        await approveVerification(v.id, parseInt(tier), parseInt(expiry))
        toast.success('Verification approved')
        router.refresh()
      } catch {
        toast.error('Failed to approve')
      }
    })
  }

  function reject() {
    if (!note.trim()) { toast.warning('Please provide a rejection reason'); return }
    startTransition(async () => {
      try {
        await rejectVerification(v.id, note)
        toast.success('Verification rejected')
        router.refresh()
      } catch {
        toast.error('Failed to reject')
      }
    })
  }

  const listing = v.listings
  const tierLabel = v.tier === 2 ? 'Tier 2 — In Person' : 'Tier 1 — Photo'

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
        <Shield className="w-4 h-4 text-violet-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{listing?.title ?? v.listing_id}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
            {listing?.category} · @{listing?.users?.nickname}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={v.tier === 2 ? 'purple' : 'info'}>{tierLabel}</Badge>
          {v.status !== 'pending' && (
            <Badge variant={v.status === 'approved' ? 'success' : 'danger'}>
              {v.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
          <Clock className="w-3 h-3" />
          {formatDate(v.created_at)}
        </div>
      </div>

      {/* Photos */}
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="flex gap-2.5 flex-wrap">
          {(v.photos ?? []).slice(0, 5).map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:border-violet-500/40 transition-colors cursor-zoom-in">
                <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
              </div>
            </a>
          ))}
          {(v.photos ?? []).length === 0 && (
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <AlertCircle className="w-4 h-4" />
              No photos submitted
            </div>
          )}
        </div>

        {v.admin_note && (
          <div className="flex-1 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] p-3">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Admin Note</p>
            <p className="text-sm">{v.admin_note}</p>
          </div>
        )}
      </div>

      {/* Actions (pending only) */}
      {v.status === 'pending' && (
        <div className="flex flex-wrap items-end gap-3 px-5 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))/0.5]">
          {/* Tier */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Tier</label>
            <select
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="input-base py-1.5 pr-8 w-40 text-xs"
              style={{ backgroundImage: 'none' }}
            >
              <option value="1">1 — Photo Verify</option>
              <option value="2">2 — In-Person Verify</option>
            </select>
          </div>

          {/* Expiry */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Valid (days)</label>
            <input
              type="number"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              min={7}
              max={365}
              className="input-base py-1.5 w-24 text-xs"
            />
          </div>

          {/* Approve */}
          <button
            onClick={approve}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>

          {/* Reject section */}
          <div className="flex items-end gap-2 ml-auto">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Rejection reason</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Reason for rejection…"
                className="input-base py-1.5 w-52 text-xs"
              />
            </div>
            <button
              onClick={reject}
              disabled={isPending || !note.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {v.status !== 'pending' && v.reviewed_at && (
        <div className="px-5 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Reviewed {formatDate(v.reviewed_at)}
            {v.expires_at && ` · Expires ${formatDate(v.expires_at)}`}
          </p>
        </div>
      )}
    </div>
  )
}
