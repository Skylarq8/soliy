'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Check, CheckCheck, Image as ImageIcon, Loader2, SendHorizonal, Smile } from 'lucide-react'
import { useSwapChat } from '@/hooks/useSwapChat'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Message, User } from '@swaply/types'

interface Props {
  proposalId: string
  otherUser?: Pick<User, 'name' | 'nickname' | 'avatar_url'> | null
}

export function SwapChat({ proposalId, otherUser }: Props) {
  const { messages, loading, appendMessage } = useSwapChat(proposalId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    if (!myId) return
    api.messages.markRead(proposalId)
      .then(() => window.dispatchEvent(new Event('swaply:messages-read')))
      .catch(() => {})
  }, [messages.length, myId, proposalId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setError('')
    setInput('')
    try {
      const data = await api.messages.send(proposalId, text) as { message: Message }
      appendMessage(data.message)
    } catch (err) {
      setError((err as Error).message)
      setInput(text)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  // Group consecutive messages by sender for avatar display
  const groupedMessages = messages.map((msg, idx) => {
    const next = messages[idx + 1]
    const isLastInGroup = !next || next.sender_id !== msg.sender_id
    return { msg, isLastInGroup }
  })

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <Loader2 size={18} className="mr-2 animate-spin" />
            Мессеж уншиж байна...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SendHorizonal size={22} />
              </div>
              <p className="text-sm font-semibold text-foreground">Чат эхлээгүй байна</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Саналын нөхцөлөө тодорхой бичээд тохиролцоогоо энд үргэлжлүүлээрэй.
              </p>
            </div>
          </div>
        )}

        {groupedMessages.map(({ msg, isLastInGroup }) => {
          const isMe = msg.sender_id === myId
          const time = new Date(msg.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* Avatar placeholder for spacing on my side */}
              {isMe && <div className="w-7 flex-shrink-0" />}

              {/* Other person avatar */}
              {!isMe && (
                <div className="mb-0.5 w-7 flex-shrink-0">
                  {isLastInGroup ? (
                    <OtherAvatar user={otherUser} />
                  ) : (
                    <div className="h-7 w-7" />
                  )}
                </div>
              )}

              <div className={`max-w-[78%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.blocked
                      ? 'bg-red-100 text-red-600 italic dark:bg-red-950 dark:text-red-300'
                      : isMe
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[11px] text-muted-foreground">{time}</span>
                  {isMe && (
                    <span className="text-muted-foreground/70">
                      <CheckCheck size={13} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
        {error && (
          <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="mb-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Зураг"
          >
            <ImageIcon size={18} />
          </button>

          <div className="relative min-w-0 flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Мессеж бичих…"
              rows={1}
              className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2.5 text-muted-foreground transition hover:text-foreground"
              aria-label="Emoji"
            >
              <Smile size={17} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
            aria-label="Илгээх"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function OtherAvatar({ user }: { user?: Pick<User, 'name' | 'nickname' | 'avatar_url'> | null }) {
  const initial = (user?.name || user?.nickname || 'S').slice(0, 1).toUpperCase()
  return (
    <div className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-black text-primary-foreground">
      {user?.avatar_url ? (
        <Image src={user.avatar_url} alt={user.nickname ?? initial} fill className="object-cover" />
      ) : (
        initial
      )}
    </div>
  )
}
