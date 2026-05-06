'use client'
import { useState, useRef, useEffect } from 'react'
import { Loader2, SendHorizonal } from 'lucide-react'
import { useSwapChat } from '@/hooks/useSwapChat'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Message } from '@swaply/types'

interface Props {
  proposalId: string
}

export function SwapChat({ proposalId }: Props) {
  const { messages, loading, appendMessage } = useSwapChat(proposalId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

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
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
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

        {messages.map((msg: Message) => {
          const isMe = msg.sender_id === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.blocked
                      ? 'bg-red-100 text-red-600 italic dark:bg-red-950 dark:text-red-300'
                      : isMe
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-muted text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="px-1 text-[11px] text-muted-foreground">
                  {new Date(msg.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 sm:p-4">
        {error && (
          <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Мессеж бичих…"
          className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          aria-label="Илгээх"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
        </button>
        </div>
      </div>
    </div>
  )
}
