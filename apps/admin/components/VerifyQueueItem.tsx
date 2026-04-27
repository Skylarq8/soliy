'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Verification } from '@swaply/types'

interface Props {
  verification: Verification & { listings?: any }
  onAction: () => void
}

export function VerifyQueueItem({ verification: v, onAction }: Props) {
  const [expiry, setExpiry] = useState('30')
  const [tier, setTier] = useState(String(v.tier ?? 1))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    await fetch(`/api/proxy/admin/verifications/${v.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: parseInt(tier), expires_days: parseInt(expiry) }),
    })
    setLoading(false)
    onAction()
  }

  async function reject() {
    if (!note.trim()) return
    setLoading(true)
    await fetch(`/api/proxy/admin/verifications/${v.id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    setLoading(false)
    onAction()
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex gap-4">
        {/* Photos */}
        <div className="flex gap-2">
          {v.photos?.slice(0, 3).map((url: string, i: number) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-medium">{(v as any).listings?.title ?? v.listing_id}</p>
          <p className="text-xs text-muted-foreground capitalize">{(v as any).listings?.category}</p>
          <p className="text-xs text-muted-foreground mt-1">@{(v as any).listings?.users?.nickname}</p>
        </div>
      </div>

      {v.status === 'pending' && (
        <div className="mt-4 flex flex-wrap gap-3 items-end border-t border-border pt-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tier</label>
            <select
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value="1">1 — Фото</option>
              <option value="2">2 — Биеэр</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Хугацаа (хоног)</label>
            <input
              type="number"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              min={7}
              max={365}
              className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={approve}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Зөвшөөрөх
          </button>

          <div className="flex gap-2 ml-auto">
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Татгалзах шалтгаан…"
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none w-40"
            />
            <button
              onClick={reject}
              disabled={loading || !note.trim()}
              className="rounded-xl bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Татгалзах
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
