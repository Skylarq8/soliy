'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { SwapChat } from './SwapChat'
import { ProposalActions } from './ProposalActions'
import type { Proposal } from '@swaply/types'

export function SwapRoom({ proposalId }: { proposalId: string }) {
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [myId, setMyId] = useState<string | null>(null)

  async function load() {
    const { proposal } = await api.proposals.get(proposalId) as { proposal: Proposal }
    setProposal(proposal)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
    load()
  }, [proposalId])

  if (!proposal) return <div className="p-6 text-muted-foreground text-sm">Уншиж байна…</div>

  return (
    <div className="flex flex-col h-full border-x border-border">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <div>
          <p className="text-sm font-medium">Swap #{proposal.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground capitalize">{proposal.status}</p>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <SwapChat proposalId={proposalId} />
      </div>

      {/* Actions */}
      {myId && (
        <ProposalActions proposal={proposal} userId={myId} onUpdate={load} />
      )}
    </div>
  )
}
