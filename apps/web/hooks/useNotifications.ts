import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@swaply/types'

export function useNotifications(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => setUnreadCount(c => c + 1)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { unreadCount }
}
