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
  const [unreadByProposal, setUnreadByProposal] = useState<Record<string, number>>({})
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
        const [data, unreadData] = await Promise.all([
          api.proposals.list() as Promise<{ proposals: EnrichedProposal[] }>,
          api.messages.unread().catch(() => ({ total: 0, by_proposal: {} as Record<string, number> })),
        ])
        setProposals(data.proposals ?? [])
        setUnreadByProposal(unreadData.by_proposal ?? {})
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [router])

  // Refresh unread counts when messages are marked as read from a chat room
  useEffect(() => {
    const handler = () => {
      api.messages.unread()
        .then(data => setUnreadByProposal(data.by_proposal ?? {}))
        .catch(() => {})
    }
    window.addEventListener('swaply:messages-read', handler)
    return () => window.removeEventListener('swaply:messages-read', handler)
  }, [])

  const filtered = useMemo(() => {
    if (!myId) return proposals
    if (activeFilter === 'received') return proposals.filter(item => item.receiver_id === myId)
    if (activeFilter === 'sent') return proposals.filter(item => item.sender_id === myId)
    return proposals
  }, [activeFilter, myId, proposals])

  const totalUnread = useMemo(
    () => Object.values(unreadByProposal).reduce((sum, n) => sum + n, 0),
    [unreadByProposal]
  )

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-background px-3 pb-24 pt-4 sm:px-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-screen-lg">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Swap chat</p>
            <div className="mt-1 flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-foreground sm:text-2xl md:text-3xl">Чат ба солилцоо</h1>
              {totalUnread > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
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
          <div className="grid gap-2.5">
            {filtered.map(proposal => (
              <ConversationCard
                key={proposal.id}
                proposal={proposal}
                myId={myId}
                unreadCount={unreadByProposal[proposal.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ConversationCard({
  proposal,
  myId,
  unreadCount,
}: {
  proposal: EnrichedProposal
  myId: string | null
  unreadCount: number
}) {
  const otherUser = myId && proposal.sender_id === myId ? proposal.receiver : proposal.sender
  const offered = proposal.offered_listings?.[0] ?? null
  const requested = proposal.requested_listings?.[0] ?? null
  const latest = proposal.latest_message
  const isReceived = myId === proposal.receiver_id
  const hasUnread = unreadCount > 0

  return (
    <Link
      href={`/swap/${proposal.id}`}
      className={`group grid gap-3 rounded-3xl border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card sm:p-4 md:grid-cols-[1fr_auto] ${
        hasUnread
          ? 'border-primary/30 bg-primary/[0.02] hover:border-primary/50'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="min-w-0">
        {/* User row */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar user={otherUser} />
            {hasUnread && (
              <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`truncate text-sm text-foreground ${hasUnread ? 'font-extrabold' : 'font-bold'}`}>
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

          {/* Unread badge */}
          {hasUnread && (
            <span className="ml-auto flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* Listings swap row */}
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

        {/* Latest message */}
        <div className="mt-3 flex items-center gap-2">
          <MessageCircle size={14} className={hasUnread ? 'text-primary' : 'text-muted-foreground'} />
          <p className={`truncate text-sm ${hasUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            {latest?.content ?? 'Одоогоор мессеж байхгүй. Swap room руу орж нөхцөлөө бичээрэй.'}
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-end md:flex">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full border bg-background transition ${
          hasUnread
            ? 'border-primary/40 text-primary group-hover:border-primary'
            : 'border-border text-muted-foreground group-hover:border-primary group-hover:text-primary'
        }`}>
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
          Солих боломжтой бараан дээрээс "Солих санал" илгээвэл энд swap room үүснэ.
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
