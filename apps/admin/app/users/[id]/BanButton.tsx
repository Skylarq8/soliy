'use client'
import { useState, useTransition } from 'react'
import { UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { banUser, unbanUser } from '../actions'

export function BanButton({ userId }: { userId: string }) {
  const [banned, setBanned] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleBan() {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    startTransition(async () => {
      try {
        await banUser(userId)
        setBanned(true)
        toast.success('User has been banned')
      } catch {
        toast.error('Failed to ban user')
      }
      setConfirm(false)
    })
  }

  function handleUnban() {
    startTransition(async () => {
      try {
        await unbanUser(userId)
        setBanned(false)
        toast.success('User has been unbanned')
      } catch {
        toast.error('Failed to unban user')
      }
    })
  }

  if (banned) {
    return (
      <button
        onClick={handleUnban}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
      >
        <UserCheck className="w-4 h-4" />
        Unban User
      </button>
    )
  }

  return (
    <button
      onClick={handleBan}
      disabled={isPending}
      className={[
        'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
        confirm
          ? 'border border-red-500/40 bg-red-600 text-white hover:bg-red-700'
          : 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
      ].join(' ')}
    >
      <UserX className="w-4 h-4" />
      {confirm ? 'Confirm Ban?' : 'Ban User'}
    </button>
  )
}
