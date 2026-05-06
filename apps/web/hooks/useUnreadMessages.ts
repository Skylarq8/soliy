'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export function useUnreadMessages() {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  async function refresh(nextUserId: string | null) {
    if (!nextUserId) {
      setCount(0)
      return
    }

    try {
      const data = await api.messages.unread()
      setCount(data.total ?? 0)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    try {
      supabase.auth
        .getUser()
        .then(({ data }) => {
          const id = data.user?.id ?? null
          setUserId(id)
          void refresh(id)
        })
        .catch(() => {
          setUserId(null)
          setCount(0)
        })

      const result = supabase.auth.onAuthStateChange((_event, session) => {
        const id = session?.user?.id ?? null
        setUserId(id)
        void refresh(id)
      })
      subscription = result.data.subscription
    } catch {
      setUserId(null)
      setCount(0)
    }

    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return

    let channel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel(`unread-messages:${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const row = payload.new as { sender_id?: string } | null
          if (row?.sender_id && row.sender_id !== userId) void refresh(userId)
        })
        .subscribe()
    } catch {}

    const interval = window.setInterval(() => void refresh(userId), 30000)
    const onFocus = () => void refresh(userId)
    const onRead = () => void refresh(userId)
    window.addEventListener('focus', onFocus)
    window.addEventListener('swaply:messages-read', onRead)

    return () => {
      if (channel) void supabase.removeChannel(channel)
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('swaply:messages-read', onRead)
    }
  }, [userId])

  return { count, refresh }
}
