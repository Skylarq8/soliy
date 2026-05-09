'use client'
import { useState, useTransition } from 'react'
import { Archive } from 'lucide-react'
import { toast } from 'sonner'
import { archiveListing } from './actions'

export function ArchiveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirmed, setConfirmed] = useState(false)

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 3000)
      return
    }
    startTransition(async () => {
      try {
        await archiveListing(id)
        toast.success('Listing archived')
      } catch {
        toast.error('Failed to archive listing')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        confirmed
          ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
          : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))] opacity-0 group-hover:opacity-100',
      ].join(' ')}
    >
      <Archive className="w-3.5 h-3.5" />
      {confirmed ? 'Confirm?' : 'Archive'}
    </button>
  )
}
