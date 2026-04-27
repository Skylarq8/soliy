'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Listing } from '@swaply/types'
import { api } from '@/lib/api'

interface Props {
  listing: Listing   // the listing being requested
  onClose: () => void
}

export function SwapProposalModal({ listing, onClose }: Props) {
  const router = useRouter()
  const [moneyOffer, setMoneyOffer] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const priceDiff = (listing.price ?? 0) - moneyOffer
  const needsExtra = priceDiff > 0

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const { proposal } = await api.proposals.create({
        receiver_id: listing.user_id,
        offered_items: [],        // full item picker to be added
        requested_items: [listing.id],
        money_offer: moneyOffer,
      }) as { proposal: { id: string } }
      if (message.trim()) {
        await api.messages.send(proposal.id, message.trim())
      }
      onClose()
      router.push(`/swap/${proposal.id}`)
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-sm bg-card rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-foreground">Үнэ тохируулах</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-border transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Comparison */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
              Солилцооны харьцуулалт
            </p>
            <div className="flex items-center gap-3">
              {/* Their item */}
              <div className="flex-1 rounded-2xl bg-muted overflow-hidden">
                <div className="relative aspect-square">
                  {listing.photos[0] && (
                    <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-muted-foreground truncate">{listing.title}</p>
                  {listing.price && (
                    <p className="text-sm font-bold text-price">{listing.price.toLocaleString()}₮</p>
                  )}
                </div>
              </div>

              {/* Swap icon + diff */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                {moneyOffer > 0 && (
                  <span className="text-[10px] font-bold text-price bg-price/10 px-1.5 py-0.5 rounded-full">
                    -{moneyOffer.toLocaleString()}₮
                  </span>
                )}
              </div>

              {/* Your item (placeholder) */}
              <div className="flex-1 rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center aspect-square p-3 text-center">
                <svg className="w-8 h-8 text-muted-foreground/40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <p className="text-[10px] text-muted-foreground">Зараа сонгох</p>
              </div>
            </div>
          </div>

          {/* Price difference notice */}
          {needsExtra && listing.price && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-3">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  +{priceDiff.toLocaleString()}₮ нэмэх шаардлагатай
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Зүйлсийн үнийн зөрүүг нөхөхийн тулд
                </p>
              </div>
            </div>
          )}

          {/* Money slider */}
          {listing.price && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Нэмэлт мөнгө</label>
                <span className="text-sm font-bold text-price">
                  {moneyOffer > 0 ? `${moneyOffer.toLocaleString()}₮` : '0₮'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={listing.price}
                step={1000}
                value={moneyOffer}
                onChange={e => setMoneyOffer(parseInt(e.target.value))}
                className="w-full accent-price"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>0₮</span>
                <span>{listing.price.toLocaleString()}₮</span>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Мессеж (заавал биш)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              placeholder="Сайн бүтэн байна, цэвэрхэн..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Илгээж байна…' : 'Санал илгээх'}
          </button>
        </div>
      </div>
    </div>
  )
}
