'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, Loader2, Repeat2, X } from 'lucide-react'
import type { Listing } from '@swaply/types'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

interface Props {
  listing: Listing
  onClose: () => void
}

const steps = [
  'Солих зүйлээ сонгох',
  'Үнэ тааруулах',
  'Санал баталгаажуулах',
] as const

export function SwapProposalModal({ listing, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [selected, setSelected] = useState<Listing | null>(null)
  const [moneyOffer, setMoneyOffer] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const targetPrice = listing.price ?? 0
  const selectedPrice = selected?.price ?? 0
  const suggestedCash = Math.max(0, targetPrice - selectedPrice)
  const remainingDiff = Math.max(0, targetPrice - selectedPrice - moneyOffer)
  const maxCash = Math.max(targetPrice, suggestedCash, 10000)

  useEffect(() => {
    let mounted = true

    async function loadListings() {
      setFetching(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data, error: listError } = await supabase
        .from('listings')
        .select('*, users(nickname, avatar_url, safe_score, swap_count)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .neq('id', listing.id)
        .order('created_at', { ascending: false })

      if (!mounted) return
      if (listError) {
        setError(listError.message)
      } else {
        const rows = (data ?? []) as Listing[]
        setMyListings(rows)
        setSelected(rows[0] ?? null)
      }
      setFetching(false)
    }

    void loadListings()
    return () => {
      mounted = false
    }
  }, [listing.id, router])

  useEffect(() => {
    setMoneyOffer(suggestedCash)
  }, [suggestedCash])

  const stepReady = useMemo(() => {
    if (step === 0) return Boolean(selected)
    if (step === 1) return true
    return Boolean(selected)
  }, [selected, step])

  function goNext() {
    setError('')
    if (!stepReady) {
      setError('Эхлээд солих зүйлээ сонгоно уу.')
      return
    }
    setStep(prev => Math.min(2, prev + 1))
  }

  async function submit() {
    if (!selected) {
      setError('Солих зүйл сонгоно уу.')
      setStep(0)
      return
    }

    setLoading(true)
    setError('')
    try {
      const { proposal } = await api.proposals.create({
        receiver_id: listing.user_id,
        offered_items: [selected.id],
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Хаах"
      />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === 0 ? onClose : () => setStep(prev => prev - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-border"
              aria-label={step === 0 ? 'Хаах' : 'Буцах'}
            >
              {step === 0 ? <X size={18} /> : <ArrowLeft size={18} />}
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-xs font-semibold text-primary">{step + 1}/3</p>
              <h2 className="truncate text-base font-bold">{steps[step]}</h2>
            </div>
            <div className="h-9 w-9" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index < step ? <Check size={14} /> : index + 1}
                </span>
                <span className={`hidden text-xs font-medium md:block ${index <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <TargetListingCard listing={listing} />

              <div>
                <p className="mb-3 text-sm font-semibold">Миний зүйлс ({myListings.length})</p>
                {fetching ? (
                  <div className="flex items-center justify-center rounded-2xl border border-border py-10 text-muted-foreground">
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Уншиж байна...
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                    Солих боломжтой идэвхтэй зар алга байна. Эхлээд өөрийн бараагаа нэмээд дахин санал илгээнэ үү.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {myListings.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelected(item)}
                        className={`overflow-hidden rounded-2xl border bg-background text-left transition ${
                          selected?.id === item.id ? 'border-primary ring-2 ring-primary/15' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="relative aspect-square bg-muted">
                          {item.photos?.[0] && (
                            <Image src={item.photos[0]} alt={item.title} fill className="object-cover" />
                          )}
                          {selected?.id === item.id && (
                            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                              <Check size={15} />
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                          <p className="mt-1 text-xs font-bold text-price">{item.price ? `${item.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && selected && (
            <div className="space-y-4">
              <ComparisonCard listing={listing} selected={selected} moneyOffer={moneyOffer} />

              {remainingDiff > 0 && (
                <div className="rounded-2xl border border-primary/25 bg-primary-light px-4 py-3">
                  <p className="text-sm font-semibold text-primary">+{remainingDiff.toLocaleString()}₮ нэмэх шаардлагатай</p>
                  <p className="mt-1 text-xs text-muted-foreground">Үнийн зөрүүг нөхөхийн тулд нэмэлт мөнгөө тохируулна.</p>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Нэмэлт мөнгө</label>
                  <span className="text-sm font-bold text-price">{moneyOffer.toLocaleString()}₮</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxCash}
                  step={1000}
                  value={moneyOffer}
                  onChange={e => setMoneyOffer(parseInt(e.target.value, 10))}
                  className="mt-4 w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>0₮</span>
                  <span>{maxCash.toLocaleString()}₮</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Мессеж (заавал биш)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Сайн байна уу, солилцох санал илгээж байна..."
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
          )}

          {step === 2 && selected && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Repeat2 size={30} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Санал бэлэн боллоо</h3>
                <p className="mt-1 text-sm text-muted-foreground">Илгээсний дараа нөгөө тал хариу өгөх хүртэл swap өрөөнд хүлээнэ.</p>
              </div>
              <ComparisonCard listing={listing} selected={selected} moneyOffer={moneyOffer} compact />
              {message.trim() && (
                <div className="rounded-2xl border border-border bg-background p-4 text-left">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Мессеж</p>
                  <p className="mt-1 text-sm">{message.trim()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-4 py-4 sm:px-5">
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!stepReady || fetching}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Дараагийн алхам
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 size={17} className="animate-spin" />}
              {loading ? 'Илгээж байна...' : 'Санал илгээх'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TargetListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {listing.photos?.[0] && <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Солих зорилт</p>
        <p className="truncate text-sm font-bold">{listing.title}</p>
        <p className="text-sm font-bold text-price">{listing.price ? `${listing.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}</p>
      </div>
      <Repeat2 className="text-primary" size={22} />
    </div>
  )
}

function ComparisonCard({
  listing,
  selected,
  moneyOffer,
  compact = false,
}: {
  listing: Listing
  selected: Listing
  moneyOffer: number
  compact?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-border bg-background ${compact ? 'p-3' : 'p-4'}`}>
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">Солилцооны харьцуулалт</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <MiniItem listing={selected} />
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
            <Repeat2 size={20} />
          </div>
          {moneyOffer > 0 && (
            <span className="whitespace-nowrap rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-bold text-primary">
              +{moneyOffer.toLocaleString()}₮
            </span>
          )}
        </div>
        <MiniItem listing={listing} />
      </div>
    </div>
  )
}

function MiniItem({ listing }: { listing: Listing }) {
  return (
    <div className="min-w-0 text-center">
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
        {listing.photos?.[0] && <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />}
      </div>
      <p className="mt-2 truncate text-xs font-semibold sm:text-sm">{listing.title}</p>
      <p className="text-xs font-bold text-price sm:text-sm">{listing.price ? `${listing.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}</p>
    </div>
  )
}
