'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import type { Proposal } from '@swaply/types'

interface Props {
  proposal: Proposal
  userId: string
  onUpdate: () => void
}

export function ProposalActions({ proposal, userId, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const [showCounter, setShowCounter] = useState(false)

  const isReceiver = proposal.receiver_id === userId
  const isParticipant = proposal.sender_id === userId || proposal.receiver_id === userId
  const meta = (proposal.category_meta as Record<string, unknown> | null) ?? {}
  const counterBy = typeof meta.counter_by === 'string' ? meta.counter_by : null
  const canAccept =
    proposal.status === 'pending'
      ? isReceiver
      : proposal.status === 'countered'
        ? isParticipant && counterBy !== userId
        : false
  const canDecline = isParticipant && ['pending', 'countered'].includes(proposal.status)
  const canCounter =
    proposal.status === 'pending'
      ? isReceiver
      : proposal.status === 'countered'
        ? isParticipant && counterBy !== userId
        : false
  const canConfirm = proposal.status === 'accepted'
  const moneyText =
    proposal.money_offer > 0
      ? isReceiver
        ? `Та ${proposal.money_offer.toLocaleString()}₮ авна`
        : `Та ${proposal.money_offer.toLocaleString()}₮ өгнө`
      : proposal.money_offer < 0
        ? isReceiver
          ? `Та ${Math.abs(proposal.money_offer).toLocaleString()}₮ өгнө`
          : `Та ${Math.abs(proposal.money_offer).toLocaleString()}₮ авна`
        : ''

  async function act(action: () => Promise<unknown>) {
    setLoading(true)
    try { await action() } catch {}
    setLoading(false)
    onUpdate()
  }

  if (proposal.status === 'completed') {
    return (
      <div className="border-t border-border bg-card px-3 py-3 text-center text-sm font-medium text-emerald-600">
        ✓ Swap дууссан
      </div>
    )
  }

  if (proposal.status === 'declined') {
    return <div className="border-t border-border bg-card px-3 py-3 text-center text-sm text-muted-foreground">Proposal татгалзсан</div>
  }

  return (
    <div className="space-y-3 border-t border-border bg-card p-3 sm:p-4">
      {/* Status badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
          proposal.status === 'countered' ? 'bg-amber-100 text-amber-700' :
          'bg-muted text-muted-foreground'
        }`}>
          {proposal.status}
        </span>
        {proposal.money_offer !== 0 && (
          <span className="text-sm font-semibold">
            {moneyText}
          </span>
        )}
      </div>

      {(canAccept || canDecline || canCounter) && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {canAccept && (
              <button
                onClick={() => act(() => api.proposals.accept(proposal.id))}
                disabled={loading}
                className="min-h-11 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                Зөвшөөрөх
              </button>
            )}
            {canDecline && (
              <button
                onClick={() => act(() => api.proposals.decline(proposal.id))}
                disabled={loading}
                className="min-h-11 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                Татгалзах
              </button>
            )}
          </div>

          {canCounter && (
            <button
              onClick={() => setShowCounter(v => !v)}
              className="min-h-11 w-full rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Counter санал илгээх
            </button>
          )}

          {canCounter && showCounter && (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                type="number"
                value={counterAmount}
                onChange={e => setCounterAmount(e.target.value)}
                placeholder="+ бол санал илгээгч өгнө, - бол авна"
                className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => act(() => api.proposals.counter(proposal.id, parseInt(counterAmount, 10)))}
                disabled={loading || !counterAmount || Number.isNaN(parseInt(counterAmount, 10))}
                className="min-h-11 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Илгээх
              </button>
            </div>
          )}
        </>
      )}

      {canConfirm && (
        <button
          onClick={() => act(() => api.proposals.confirmReceipt(proposal.id))}
        disabled={loading}
        className="min-h-11 w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
          Хүлээн авсан баталгаажуулах
        </button>
      )}
    </div>
  )
}
