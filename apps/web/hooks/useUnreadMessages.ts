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
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null
      setUserId(id)
      void refresh(id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null
      setUserId(id)
      void refresh(id)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`unread-messages:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const row = payload.new as { sender_id?: string } | null
        if (row?.sender_id && row.sender_id !== userId) void refresh(userId)
      })
      .subscribe()

    const interval = window.setInterval(() => void refresh(userId), 30000)
    const onFocus = () => void refresh(userId)
    const onRead = () => void refresh(userId)
    window.addEventListener('focus', onFocus)
    window.addEventListener('swaply:messages-read', onRead)

    return () => {
      supabase.removeChannel(channel)
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('swaply:messages-read', onRead)
    }
  }, [userId])

  return { count, refresh }
}
