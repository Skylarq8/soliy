'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Repeat2, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { SwapChat } from './SwapChat'
import { ProposalActions } from './ProposalActions'
import type { EnrichedProposal, Listing, User } from '@swaply/types'

const statusLabels: Record<string, string> = {
  pending: 'Хариу хүлээж байна',
  accepted: 'Зөвшөөрсөн',
  declined: 'Татгалзсан',
  countered: 'Counter санал',
  completed: 'Дууссан',
}

export function SwapRoom({ proposalId }: { proposalId: string }) {
  const [proposal, setProposal] = useState<EnrichedProposal | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await api.proposals.get(proposalId) as { proposal: EnrichedProposal }
      setProposal(data.proposal)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
    void load()
  }, [proposalId])

  const otherUser = useMemo(() => {
    if (!proposal || !myId) return null
    return proposal.sender_id === myId ? proposal.receiver : proposal.sender
  }, [myId, proposal])

  if (error) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
          <p className="font-semibold text-foreground">Swap өрөө нээгдсэнгүй</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/messages" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            Чат руу буцах
          </Link>
        </div>
      </div>
    )
  }

  if (!proposal || !myId) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Уншиж байна...
      </div>
    )
  }

  return (
    <div className="mx-auto grid h-[calc(100dvh-8.25rem)] max-w-screen-2xl grid-cols-1 overflow-hidden border-x border-border bg-background md:h-[calc(100dvh-4.25rem)] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
      <aside className="hidden overflow-y-auto border-r border-border bg-card/50 p-4 lg:block xl:p-5">
        <RoomSummary proposal={proposal} myId={myId} otherUser={otherUser} />
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex min-h-[65px] items-center gap-3 border-b border-border bg-card px-3 py-3 sm:px-5">
          <Link
            href="/messages"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted"
            aria-label="Чат руу буцах"
          >
            <ArrowLeft size={18} />
          </Link>

          <Avatar user={otherUser} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {otherUser?.name || otherUser?.nickname || 'Swap хэрэглэгч'}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{otherUser?.nickname ?? 'user'} · {statusLabels[proposal.status] ?? proposal.status}</p>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary sm:inline-flex">
            {moneyText(proposal, myId)}
          </span>
        </div>

        <div className="border-b border-border bg-card/70 px-3 py-2.5 lg:hidden">
          <MobileSummary proposal={proposal} myId={myId} />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SwapChat proposalId={proposal.id} />
        </div>

        <ProposalActions proposal={proposal} userId={myId} onUpdate={load} />
      </section>
    </div>
  )
}

function RoomSummary({
  proposal,
  myId,
  otherUser,
}: {
  proposal: EnrichedProposal
  myId: string
  otherUser: Pick<User, 'name' | 'nickname' | 'avatar_url' | 'safe_score' | 'swap_count'> | null | undefined
}) {
  const offered = proposal.offered_listings?.[0] ?? null
  const requested = proposal.requested_listings?.[0] ?? null

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Avatar user={otherUser} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{otherUser?.name || otherUser?.nickname || 'Swap хэрэглэгч'}</p>
            <p className="text-sm text-muted-foreground">@{otherUser?.nickname ?? 'user'}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-muted/60 px-3 py-2">
            <p className="font-bold text-foreground">{otherUser?.safe_score ?? 0}</p>
            <p className="text-muted-foreground">оноо</p>
          </div>
          <div className="rounded-2xl bg-muted/60 px-3 py-2">
            <p className="font-bold text-foreground">{otherUser?.swap_count ?? 0}</p>
            <p className="text-muted-foreground">swap</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Swap request</p>
            <h2 className="text-lg font-extrabold text-foreground">Саналын нөхцөл</h2>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {statusLabels[proposal.status] ?? proposal.status}
          </span>
        </div>

        <div className="space-y-3">
          <ListingMini label={proposal.sender_id === myId ? 'Таны санал болгосон' : 'Тэд санал болгосон'} listing={offered} />
          <div className="flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Repeat2 size={20} />
            </div>
          </div>
          <ListingMini label={proposal.sender_id === myId ? 'Таны авах бараа' : 'Тэд авах бараа'} listing={requested} />
        </div>

        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
          <p className="text-xs font-semibold text-primary">Мөнгөний нөхцөл</p>
          <p className="mt-1 text-lg font-extrabold text-foreground">{moneyText(proposal, myId)}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-card">
        <div className="mb-2 flex items-center gap-2 font-bold text-foreground">
          <ShieldCheck size={18} className="text-primary" />
          Санамж
        </div>
        Хаяг, утас, төлбөрийн мэдээлэл зэрэг хувийн мэдээллээ чатаар илгээхгүй байх нь аюулгүй.
      </div>
    </div>
  )
}

function MobileSummary({ proposal, myId }: { proposal: EnrichedProposal; myId: string }) {
  const offered = proposal.offered_listings?.[0] ?? null
  const requested = proposal.requested_listings?.[0] ?? null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2">
      <MobileItem listing={offered} />
      <div className="text-center">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Repeat2 size={17} />
        </div>
        <p className="mx-auto mt-1 max-w-[76px] truncate text-[10px] font-bold text-primary">{moneyText(proposal, myId)}</p>
      </div>
      <MobileItem listing={requested} />
    </div>
  )
}

function ListingMini({ label, listing }: { label: string; listing: Listing | null }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background p-3">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-muted">
        {listing?.photos?.[0] && <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-foreground">{listing?.title ?? 'Бараа олдсонгүй'}</p>
        <p className="mt-1 text-sm font-extrabold text-price">
          {listing?.price ? `${listing.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}
        </p>
      </div>
    </div>
  )
}

function MobileItem({ listing }: { listing: Listing | null }) {
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-2xl bg-background/70 p-1.5">
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {listing?.photos?.[0] && <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-foreground">{listing?.title ?? 'Бараа'}</p>
        <p className="text-[11px] font-bold text-price">{listing?.price ? `${listing.price.toLocaleString()}₮` : 'Үнэ тохироогүй'}</p>
      </div>
    </div>
  )
}

function Avatar({
  user,
  size = 'md',
}: {
  user: Pick<User, 'name' | 'nickname' | 'avatar_url'> | null | undefined
  size?: 'md' | 'lg'
}) {
  const className = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
  const initial = (user?.name || user?.nickname || 'S').slice(0, 1).toUpperCase()

  return (
    <div className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground font-black ${className}`}>
      {user?.avatar_url ? <Image src={user.avatar_url} alt={user.nickname} fill className="object-cover" /> : initial}
    </div>
  )
}

function moneyText(proposal: EnrichedProposal, myId: string) {
  if (proposal.money_offer === 0) return 'Тэнцүү swap'
  const amount = Math.abs(proposal.money_offer).toLocaleString()
  const senderPays = proposal.money_offer > 0
  const iAmSender = proposal.sender_id === myId
  const iPay = senderPays ? iAmSender : !iAmSender
  return iPay ? `Та ${amount}₮ өгнө` : `Та ${amount}₮ авна`
}
