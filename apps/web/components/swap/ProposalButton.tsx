'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Listing } from '@swaply/types'
import { api } from '@/lib/api'
import { SwapProposalModal } from './SwapProposalModal'

interface Props {
  listing: Listing
}

export function ProposalButton({ listing }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [buyLoading, setBuyLoading] = useState(false)

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {listing.swap_enabled && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Солихыг санал болгох
          </button>
        )}
        {listing.price && (
          <button
            type="button"
            disabled={buyLoading}
            className="rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Худалдаж авах
          </button>
        )}
      </div>

      {showModal && (
        <SwapProposalModal listing={listing} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
