'use client'
import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteListing } from './actions'

export function DeleteButton({ id }: { id: string }) {
  const [confirmed, setConfirmed] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true)
      setTimeout(() => setConfirmed(false), 3000)
      return
    }
    startTransition(async () => {
      try {
        await deleteListing(id)
        toast.success('Listing deleted')
      } catch {
        toast.error('Failed to delete listing')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50',
        confirmed
          ? 'bg-red-600 text-white border border-red-500 hover:bg-red-700'
          : 'bg-[hsl(var(--surface))] text-red-400 border border-red-500/30 hover:bg-red-500/10 opacity-0 group-hover:opacity-100',
      ].join(' ')}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {confirmed ? 'Confirm?' : 'Delete'}
    </button>
  )
}
