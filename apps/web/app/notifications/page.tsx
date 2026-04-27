'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Notification } from '@swaply/types'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  new_proposal:     'Шинэ proposal ирлээ',
  proposal_accepted:'Proposal зөвшөөрлөө',
  new_message:      'Шинэ мессеж',
  verified:         'Зар баталгаажлаа',
  boost_expiring:   'Boost дуусах гэж байна',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.users.notifications()
      .then(({ notifications }: { notifications: Notification[] }) => {
        setNotifications(notifications)
        setLoading(false)
        api.users.markAllRead()
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Уншиж байна…</div>

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
              className={`block rounded-2xl border p-4 transition-colors hover:bg-muted/50 ${!n.read ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30' : 'border-border'}`}
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
