'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

interface Props {
  userId: string
  initialFollowing?: boolean
}

export function FollowButton({ userId, initialFollowing = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      if (following) {
        await api.users.unfollow(userId)
      } else {
        await api.users.follow(userId)
      }
      setFollowing(f => !f)
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        following
          ? 'bg-muted text-foreground hover:bg-muted/80'
          : 'bg-violet-600 text-white hover:bg-violet-700'
      }`}
    >
      {following ? 'Дагаж байна' : 'Дагах'}
    </button>
  )
}
