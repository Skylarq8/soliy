import { Suspense } from 'react'
import { SwapRoom } from '@/components/swap/SwapRoom'

export default async function SwapPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = await params
  return (
    <div className="mx-auto min-h-[calc(100dvh-4rem)] pb-16 md:pb-0">
      <Suspense fallback={<div className="p-6 text-muted-foreground">Уншиж байна…</div>}>
        <SwapRoom proposalId={proposalId} />
      </Suspense>
    </div>
  )
}
