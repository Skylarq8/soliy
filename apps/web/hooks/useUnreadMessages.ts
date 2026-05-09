'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export function useUnreadMessages() {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  // Keep userId in a ref so interval callbacks always have the latest value
  const userIdRef = useRef<string | null>(null)

  async function refresh(uid: string | null) {
    if (!uid) {
      setCount(0)
      return
    }
    try {
      const data = await api.messages.unread()
      setCount(data.total ?? 0)
    } catch {
      // silently keep previous count on transient errors
    }
  }

  // Auth init — runs once
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    try {
      supabase.auth
        .getUser()
        .then(({ data }) => {
          const id = data.user?.id ?? null
          userIdRef.current = id
          setUserId(id)
          void refresh(id)
        })
        .catch(() => {
          userIdRef.current = null
          setUserId(null)
          setCount(0)
        })

      const result = supabase.auth.onAuthStateChange((_event, session) => {
        const id = session?.user?.id ?? null
        userIdRef.current = id
        setUserId(id)
        void refresh(id)
      })
      subscription = result.data.subscription
    } catch {
      userIdRef.current = null
      setUserId(null)
      setCount(0)
    }

    return () => subscription?.unsubscribe()
  }, [])

  // Listeners & polling — re-runs when userId changes
  useEffect(() => {
    if (!userId) return

    // Realtime — notifications are owner-scoped and more reliable for unread refreshes than raw message rows.
    let channel: ReturnType<typeof supabase.channel> | null = null
    let notificationChannel: ReturnType<typeof supabase.channel> | null = null
    try {
      channel = supabase
        .channel(`unread-messages:${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const row = payload.new as { sender_id?: string } | null
          if (row?.sender_id && row.sender_id !== userId) void refresh(userId)
        })
        .subscribe()

      notificationChannel = supabase
        .channel(`unread-notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          payload => {
            const row = payload.new as { type?: string } | null
            if (row?.type === 'new_message') void refresh(userId)
          }
        )
        .subscribe()
    } catch {}

    // Poll every 5 s so counts stay fresh even if realtime is filtered by RLS
    const interval = window.setInterval(() => void refresh(userId), 5_000)

    const onFocus = () => void refresh(userId)
    const onRead = () => void refresh(userId)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh(userId)
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('swaply:messages-read', onRead)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (channel) void supabase.removeChannel(channel)
      if (notificationChannel) void supabase.removeChannel(notificationChannel)
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('swaply:messages-read', onRead)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [userId])

  return { count, refresh: () => void refresh(userIdRef.current) }
}
