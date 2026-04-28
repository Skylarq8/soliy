'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@swaply/types'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  new_proposal:      'Шинэ proposal ирлээ',
  proposal_accepted: 'Proposal зөвшөөрлөө',
  new_message:       'Шинэ мессеж',
  verified:          'Зар баталгаажлаа',
  boost_expiring:    'Boost дуусах гэж байна',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications((data ?? []) as Notification[])
      setLoading(false)

      // Mark all as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Мэдэгдлүүд</h1>

      {notifications.length === 0 && (
        <p className="text-muted-foreground text-center py-12">Мэдэгдэл байхгүй</p>
      )}

      <div className="space-y-2">
        {notifications.map(n => {
          const payload = n.payload as Record<string, string> | null
          const href = payload?.proposal_id ? `/swap/${payload.proposal_id}` : '#'
          return (
            <Link
              key={n.id}
              href={href}
              className={`block rounded-2xl border p-4 transition-colors hover:bg-muted/50 ${
                !n.read
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border'
              }`}
            >
              <p className="text-sm font-medium">{TYPE_LABELS[n.type] ?? n.type}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(n.created_at).toLocaleString('mn-MN')}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
