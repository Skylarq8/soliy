'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Inbox, Loader2, MessageCircle, Repeat2 } from 'lucide-react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { EnrichedProposal, Listing, User } from '@swaply/types'

const filters = [
  { key: 'all', label: 'Бүгд' },
  { key: 'received', label: 'Ирсэн' },
  { key: 'sent', label: 'Илгээсэн' },
] as const

const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж байна',
  accepted: 'Зөвшөөрсөн',
  declined: 'Татгалзсан',
  countered: 'Counter',
  completed: 'Дууссан',
}

export default function MessagesPage() {
  const router = useRouter()
  const [myId, setMyId] = useState<string | null>(null)
  const [proposals, setProposals] = useState<EnrichedProposal[]>([])
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]['key']>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      setMyId(session.user.id)
      setLoading(true)
      setError('')
      try {
        const data = await api.proposals.list() as { proposals: EnrichedProposal[] }
        setProposals(data.proposals ?? [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [router])

  const filtered = useMemo(() => {
    if (!myId) return proposals
    if (activeFilter === 'received') return proposals.filter(item => item.receiver_id === myId)
    if (activeFilter === 'sent') return proposals.filter(item => item.sender_id === myId)
    return proposals
  }, [activeFilter, myId, proposals])

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background px-3 pb-24 pt-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-screen-lg">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Swap chat</p>
            <h1 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl md:text-3xl">Чат ба солилцооны хүсэлт</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Илгээсэн болон хүлээн авсан swap request-үүдээ нэг дор удирдана.
            </p>
          </div>

          <div className="grid grid-cols-3 rounded-full border border-border bg-card p-1 sm:flex">
            {filters.map(filter => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[42vh] items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
            <Loader2 size={18} className="mr-2 animate-spin" />
            Чатууд уншиж байна...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {filtered.map(proposal => (
              <ConversationCard key={proposal.id} proposal={proposal} myId={myId} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ConversationCard({ proposal, myId }: { proposal: EnrichedProposal; myId: string | null }) {
  const otherUser = myId && proposal.sender_id === myId ? proposal.receiver : proposal.sender
  const offered = proposal.offered_listings?.[0] ?? null
  const requested = proposal.requested_listings?.[0] ?? null
  const latest = proposal.latest_message
  const isReceived = myId === proposal.receiver_id

  return (
    <Link
      href={`/swap/${proposal.id}`}
      className="group grid gap-3 rounded-3xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card sm:p-4 md:grid-cols-[1fr_auto]"
    >
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-3">
          <Avatar user={otherUser} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-foreground">
                {otherUser?.name || otherUser?.nickname || 'Swap хэрэглэгч'}
              </p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                {isReceived ? 'Ирсэн хүсэлт' : 'Илгээсэн хүсэлт'}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {statusLabels[proposal.status] ?? proposal.status}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              @{otherUser?.nickname ?? 'user'} · {new Date(proposal.updated_at).toLocaleDateString('mn-MN')}
            </p>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-border bg-background p-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <ListingLine listing={offered} label={proposal.sender_id === myId ? 'Таны бараа' : 'Тэдний бараа'} />
          <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-2 py-1.5 text-primary sm:flex-col sm:bg-transparent sm:px-1 sm:py-0">
            <Repeat2 size={18} />
            <span className="whitespace-nowrap rounded-full text-[10px] font-bold sm:bg-primary/10 sm:px-2 sm:py-0.5">
              {moneyText(proposal, myId)}
            </span>
          </div>
          <ListingLine listing={requested} label={proposal.sender_id === myId ? 'Тэдний бараа' : 'Таны бараа'} />
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle size={15} />
          <p className="truncate">
            {latest?.content ?? 'Одоогоор мессеж байхгүй. Swap room руу орж нөхцөлөө бичээрэй.'}
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-end md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition group-hover:border-primary group-hover:text-primary">
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  )
}

function ListingLine({ listing, label }: { listing: Listing | null; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-card/60 p-1.5 sm:bg-transparent sm:p-0">
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-12 sm:w-12">
        {listing?.photos?.[0] && <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-bold text-foreground sm:text-sm">{listing?.title ?? 'Бараа'}</p>
        <p className="text-[11px] font-bold text-price">{listing?.price ? `${listing.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[42vh] items-center justify-center rounded-3xl border border-border bg-card px-6 text-center shadow-sm">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox size={26} />
        </div>
        <h2 className="text-lg font-extrabold text-foreground">Одоогоор chat алга</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Солих боломжтой бараан дээрээс “Солих санал” илгээвэл энд swap room үүснэ.
        </p>
        <Link href="/explore" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
          Бараа хайх
        </Link>
      </div>
    </div>
  )
}

function Avatar({ user }: { user: Pick<User, 'name' | 'nickname' | 'avatar_url'> | null | undefined }) {
  const initial = (user?.name || user?.nickname || 'S').slice(0, 1).toUpperCase()

  return (
    <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-black text-primary-foreground">
      {user?.avatar_url ? <Image src={user.avatar_url} alt={user.nickname} fill className="object-cover" /> : initial}
    </div>
  )
}

function moneyText(proposal: EnrichedProposal, myId: string | null) {
  if (proposal.money_offer === 0 || !myId) return 'Тэнцүү'
  const amount = Math.abs(proposal.money_offer).toLocaleString()
  const senderPays = proposal.money_offer > 0
  const iAmSender = proposal.sender_id === myId
  const iPay = senderPays ? iAmSender : !iAmSender
  return iPay ? `${amount}₮ өгнө` : `${amount}₮ авна`
}
