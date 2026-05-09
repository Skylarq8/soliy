'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Check, CheckCheck, ImagePlus, Loader2, SendHorizonal } from 'lucide-react'
import { useSwapChat } from '@/hooks/useSwapChat'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Message, User } from '@swaply/types'

interface Props {
  proposalId: string
  otherUser?: Pick<User, 'name' | 'nickname' | 'avatar_url'> | null
}

function isImageMessage(content: string) {
  try {
    const url = new URL(content)
    return (
      url.protocol === 'https:' &&
      (url.hostname.includes('cloudinary.com') ||
        /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url.pathname))
    )
  } catch {
    return false
  }
}

export function SwapChat({ proposalId, otherUser }: Props) {
  const { messages, loading, appendMessage } = useSwapChat(proposalId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  // Timestamp of the last time the OTHER user read messages — drives single vs double tick
  const [peerReadAt, setPeerReadAt] = useState<Date | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, [])

  // Fetch (and poll) peer's last_read_at so we can show correct tick status
  useEffect(() => {
    let active = true
    async function fetchPeerRead() {
      try {
        const data = await api.messages.peerRead(proposalId)
        if (active && data.last_read_at) setPeerReadAt(new Date(data.last_read_at))
      } catch { /* non-critical */ }
    }
    void fetchPeerRead()
    const interval = window.setInterval(fetchPeerRead, 5_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [proposalId])

  useEffect(() => {
    if (!myId) return
    api.messages.markRead(proposalId)
      .then(() => window.dispatchEvent(new Event('swaply:messages-read')))
      .catch(() => {})
  }, [messages.length, myId, proposalId])

  // Scroll to bottom only when message count changes (not on typing or re-renders)
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  async function send(content?: string) {
    const text = (content ?? input).trim()
    if (!text || sending) return
    setSending(true)
    setError('')
    if (!content) {
      setInput('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
    try {
      const data = await api.messages.send(proposalId, text) as { message: Message }
      appendMessage(data.message)
    } catch (err) {
      setError((err as Error).message)
      if (!content) setInput(text)
    }
    setSending(false)
    textareaRef.current?.focus()
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setError('')
    try {
      const data = await api.uploads.image(file) as { image: { url: string } }
      await send(data.image.url)
    } catch (err) {
      setError((err as Error).message)
    }
    setUploading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  // Group consecutive messages by sender
  const groupedMessages = messages.map((msg, idx) => {
    const next = messages[idx + 1]
    const isLastInGroup = !next || next.sender_id !== msg.sender_id
    return { msg, isLastInGroup }
  })

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Messages — overflow-anchor:none prevents browser from auto-scrolling when input grows */}
      <div
        ref={messagesRef}
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5"
        style={{ overflowAnchor: 'none' }}
      >
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
          const isImage = !msg.blocked && isImageMessage(msg.content)

          return (
            <div key={msg.id} className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* Spacer on my side */}
              {isMe && <div className="w-6 flex-shrink-0" />}

              {/* Other person avatar */}
              {!isMe && (
                <div className="mb-0.5 w-6 flex-shrink-0">
                  {isLastInGroup ? (
                    <OtherAvatar user={otherUser} />
                  ) : (
                    <div className="h-6 w-6" />
                  )}
                </div>
              )}

              <div className={`max-w-[76%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                {isImage ? (
                  <div className={`overflow-hidden rounded-2xl ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                    <div className="relative h-48 w-64 max-w-[260px] bg-muted sm:h-56 sm:w-72">
                      <Image
                        src={msg.content}
                        alt="зураг"
                        fill
                        className="object-cover"
                        sizes="260px"
                      />
                    </div>
                  </div>
                ) : (
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
                )}

                <div className={`flex items-center gap-1 px-0.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[11px] text-muted-foreground">{time}</span>
                  {isMe && (
                    peerReadAt && new Date(msg.created_at) <= peerReadAt
                      ? <CheckCheck size={12} className="text-primary/80" />
                      : <Check size={12} className="text-muted-foreground/50" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {/* Anchor element at the bottom */}
        <div style={{ height: 1, overflowAnchor: 'auto' }} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
        {error && (
          <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          {/* Image upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            aria-label="Зураг илгээх"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              resizeTextarea()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Мессеж бичих…"
            rows={1}
            className="min-w-0 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || uploading || !input.trim()}
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
    <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[10px] font-black text-primary-foreground">
      {user?.avatar_url ? (
        <Image src={user.avatar_url} alt={user.nickname ?? initial} fill className="object-cover" />
      ) : (
        initial
      )}
    </div>
  )
}
