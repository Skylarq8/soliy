'use client'
import { useEffect, useState } from 'react'
import { VerifyQueueItem } from '@/components/VerifyQueueItem'
import type { Verification } from '@swaply/types'

type Filter = 'pending' | 'approved' | 'rejected'

async function fetchVerifications(status: Filter): Promise<Verification[]> {
  const res = await fetch(`/api/proxy/admin/verifications?status=${status}`)
  if (!res.ok) return []
  const { verifications } = await res.json()
  return verifications ?? []
}

export default function VerificationsPage() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [items, setItems] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setItems(await fetchVerifications(filter))
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Баталгаажуулалт</h1>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filter === s ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s === 'pending' ? 'Хүлээж байгаа' : s === 'approved' ? 'Зөвшөөрсөн' : 'Татгалзсан'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Уншиж байна…</div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">Хоосон</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <VerifyQueueItem key={item.id} verification={item} onAction={load} />
          ))}
        </div>
      )}
    </div>
  )
}
