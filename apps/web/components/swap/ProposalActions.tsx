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
  const canAct = isReceiver && proposal.status === 'pending'
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
      <div className="text-center py-4 text-emerald-600 font-medium text-sm">
        ✓ Swap дууссан
      </div>
    )
  }

  if (proposal.status === 'declined') {
    return <div className="text-center py-4 text-muted-foreground text-sm">Proposal татгалзсан</div>
  }

  return (
    <div className="border-t border-border p-4 space-y-3">
      {/* Status badge */}
      <div className="flex items-center justify-between">
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

      {canAct && (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => act(() => api.proposals.accept(proposal.id))}
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Зөвшөөрөх
            </button>
            <button
              onClick={() => act(() => api.proposals.decline(proposal.id))}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Татгалзах
            </button>
          </div>

          <button
            onClick={() => setShowCounter(v => !v)}
            className="w-full rounded-xl border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Counter offer
          </button>

          {showCounter && (
            <div className="flex gap-2">
              <input
                type="number"
                value={counterAmount}
                onChange={e => setCounterAmount(e.target.value)}
                placeholder="+ бол санал илгээгч өгнө, - бол авна"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => act(() => api.proposals.counter(proposal.id, parseInt(counterAmount)))}
                disabled={loading || !counterAmount}
                className="rounded-xl bg-primary px-4 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
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
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Хүлээн авсан баталгаажуулах
        </button>
      )}
    </div>
  )
}
