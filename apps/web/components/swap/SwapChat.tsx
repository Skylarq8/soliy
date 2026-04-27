'use client'
import { useState, useRef, useEffect } from 'react'
import { useSwapChat } from '@/hooks/useSwapChat'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Message } from '@swaply/types'

interface Props {
  proposalId: string
}

export function SwapChat({ proposalId }: Props) {
  const { messages } = useSwapChat(proposalId)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [myId, setMyId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      await api.messages.send(proposalId, text)
    } catch {}
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: Message) => {
          const isMe = msg.sender_id === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.blocked
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 italic'
                    : isMe
                    ? 'bg-violet-600 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Мессеж бичих…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          Илгээх
        </button>
      </div>
    </div>
  )
}
