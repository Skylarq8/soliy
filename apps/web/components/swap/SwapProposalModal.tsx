'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Loader2, Minus, Repeat2, X } from 'lucide-react'
import type { Listing } from '@soliy/types'
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

const moneyTones = {
  receive: {
    box: 'border-emerald-600/35 bg-emerald-500/10',
    soft: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-600 text-white',
    pill: 'bg-emerald-600 text-white',
    slider: 'accent-emerald-600',
    buttonActive: 'border-emerald-600 bg-emerald-600 text-white',
  },
  give: {
    box: 'border-red-600/35 bg-red-500/10',
    soft: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    icon: 'bg-red-600 text-white',
    badge: 'bg-red-600 text-white',
    pill: 'bg-red-600 text-white',
    slider: 'accent-red-600',
    buttonActive: 'border-red-600 bg-red-600 text-white',
  },
  even: {
    box: 'border-border bg-muted/40',
    soft: 'bg-muted/50',
    text: 'text-muted-foreground',
    icon: 'bg-muted text-muted-foreground',
    badge: 'bg-muted text-foreground',
    pill: 'bg-muted text-foreground',
    slider: 'accent-muted-foreground',
    buttonActive: 'border-muted-foreground bg-muted text-foreground',
  },
} as const

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
  const priceBalance = selectedPrice - targetPrice
  const suggestedCash = -priceBalance
  const exactDiff = Math.abs(priceBalance)
  const roundedDiff = Math.ceil(exactDiff / 1000) * 1000
  const buffer = Math.max(10000, Math.ceil(Math.max(targetPrice, selectedPrice) * 0.2 / 1000) * 1000)
  const receiveLimit = Math.max(roundedDiff + buffer, 10000)
  const giveLimit = Math.max(roundedDiff + buffer, 10000)
  const zeroPosition = (receiveLimit / (receiveLimit + giveLimit)) * 100
  const autoCalcText =
    priceBalance > 0
      ? `Таны бараа (${selectedPrice.toLocaleString()}₮) нөгөөгөөс ${exactDiff.toLocaleString()}₮ өндөр тул ${exactDiff.toLocaleString()}₮ авах санал тавигдлаа. Та өөрчилж болно.`
      : priceBalance < 0
        ? `Сонирхож байгаа бараа (${targetPrice.toLocaleString()}₮) таныхаас ${exactDiff.toLocaleString()}₮ өндөр тул ${exactDiff.toLocaleString()}₮ өгөх санал тавигдлаа. Та өөрчилж болно.`
        : 'Хоёр барааны үнэ тэнцүү тул мөнгөний зөрүүгүй swap санал тавигдлаа. Та өөрчилж болно.'
  const moneyMode = moneyOffer < 0 ? 'receive' : moneyOffer > 0 ? 'give' : 'even'
  const moneyTone = moneyTones[moneyMode]
  const moneyLabel =
    moneyOffer > 0
      ? `${moneyOffer.toLocaleString()}₮ нэмнэ`
      : moneyOffer < 0
        ? `${Math.abs(moneyOffer).toLocaleString()}₮ авна`
        : 'Тэнцүү swap'
  const suggestionTitle =
    moneyMode === 'receive'
      ? `Та ${Math.abs(moneyOffer).toLocaleString()}₮ авах саналтай`
      : moneyMode === 'give'
        ? `Та ${moneyOffer.toLocaleString()}₮ нэмэх саналтай`
        : 'Тэнцүү swap'
  const suggestionText =
    moneyMode === 'receive'
      ? 'Таны санал болгож байгаа бараа илүү үнэтэй тул нөгөө талаас зөрүү хүсэж болно.'
      : moneyMode === 'give'
        ? 'Сонирхож байгаа бараа таныхаас үнэтэй тул зөрүүг нөхнө.'
        : 'Slider 0₮ дээр байгаа тул зөвхөн бараагаар солилцох санал илгээгдэнэ.'

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
        .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Хаах"
      />

      <div className="relative flex max-h-[calc(100dvh-0.75rem)] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl">
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

          <div className="relative mt-4 grid grid-cols-3 gap-1 sm:gap-2">
            <div className="absolute left-[16.666%] right-[16.666%] top-4 h-px bg-border sm:top-3.5" />
            <div
              className="absolute left-[16.666%] top-4 h-px bg-primary transition-all sm:top-3.5"
              style={{ width: step === 0 ? '0%' : step === 1 ? '33.333%' : '66.666%' }}
            />
            {steps.map((item, index) => (
              <div key={item} className="relative z-10 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${
                  index <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index < step ? <Check size={14} /> : index + 1}
                </span>
                <span className={`hidden text-center text-xs font-medium leading-tight sm:block ${index <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
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

              <div className={`rounded-2xl border px-4 py-3 ${moneyTone.box}`}>
                <div className="flex gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${moneyTone.icon}`}>
                    {moneyMode === 'receive' ? <ArrowUp size={17} /> : moneyMode === 'give' ? <ArrowDown size={17} /> : <Minus size={17} />}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${moneyTone.text}`}>{suggestionTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{suggestionText}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Зөрүү мөнгө</label>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${moneyTone.badge}`}>{moneyLabel}</span>
                </div>
                <input
                  type="range"
                  min={-receiveLimit}
                  max={giveLimit}
                  step={1000}
                  value={moneyOffer}
                  onChange={e => setMoneyOffer(parseInt(e.target.value, 10))}
                  className={`mt-4 w-full ${moneyTone.slider}`}
                />
                <div className="relative mt-2 h-5 text-xs text-muted-foreground">
                  <span className="absolute left-0">Max авах: {receiveLimit.toLocaleString()}₮</span>
                  <span className="absolute -translate-x-1/2 font-semibold text-foreground" style={{ left: `${zeroPosition}%` }}>
                    0₮ · тэнцүү swap
                  </span>
                  <span className="absolute right-0">Max өгөх: {giveLimit.toLocaleString()}₮</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMoneyOffer(-exactDiff)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      moneyMode === 'receive' ? moneyTones.receive.buttonActive : 'border-border hover:border-emerald-500 hover:text-emerald-600'
                    }`}
                  >
                    Зөрүү авах
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoneyOffer(0)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      moneyMode === 'even' ? moneyTones.even.buttonActive : 'border-border hover:border-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Тэнцүү
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoneyOffer(exactDiff)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      moneyMode === 'give' ? moneyTones.give.buttonActive : 'border-border hover:border-red-500 hover:text-red-600'
                    }`}
                  >
                    Зөрүү өгөх
                  </button>
                </div>
                <div className={`mt-4 rounded-2xl px-4 py-3 ${moneyTone.soft}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide ${moneyTone.text}`}>Автомат тооцоолол</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">{autoCalcText}</p>
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
              <div className={`rounded-2xl border px-4 py-3 text-left ${moneyTone.box}`}>
                <p className={`text-sm font-semibold ${moneyTone.text}`}>{moneyLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {moneyOffer < 0
                    ? 'Санал зөвшөөрөгдвөл нөгөө талаас энэ зөрүүг авах нөхцөлтэй.'
                    : moneyOffer > 0
                      ? 'Санал зөвшөөрөгдвөл та энэ зөрүүг нэмж өгөх нөхцөлтэй.'
                      : 'Хоёр тал зөвхөн бараагаа солих нөхцөлтэй.'}
                </p>
              </div>
              {message.trim() && (
                <div className="rounded-2xl border border-border bg-background p-4 text-left">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Мессеж</p>
                  <p className="mt-1 text-sm">{message.trim()}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:py-4">
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
  const mode = moneyOffer < 0 ? 'receive' : moneyOffer > 0 ? 'give' : 'even'
  const tone = moneyTones[mode]
  const pillText =
    moneyOffer < 0
      ? `-${Math.abs(moneyOffer).toLocaleString()}₮`
      : moneyOffer > 0
        ? `+${moneyOffer.toLocaleString()}₮`
        : '0₮ тэнцүү'

  return (
    <div className={`rounded-2xl border border-border bg-background ${compact ? 'p-3' : 'p-4'}`}>
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">Солилцооны харьцуулалт</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <MiniItem listing={selected} />
        <div className="flex flex-col items-center gap-1">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.icon}`}>
            <Repeat2 size={20} />
          </div>
          <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.pill}`}>
            {pillText}
          </span>
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
