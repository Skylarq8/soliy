import { Suspense } from 'react'
import { SwapRoom } from '@/components/swap/SwapRoom'

export default async function SwapPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params
  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-6 text-muted-foreground">Уншиж байна…</div>}>
        <SwapRoom proposalId={proposalId} />
      </Suspense>
    </div>
  )
}
