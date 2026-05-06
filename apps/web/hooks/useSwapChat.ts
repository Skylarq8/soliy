import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { Message } from '@swaply/types'

export function useSwapChat(proposalId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  function appendMessage(message: Message) {
    setMessages(prev => {
      if (prev.some(item => item.id === message.id)) return prev
      return [...prev, message]
    })
  }

  useEffect(() => {
    let mounted = true

    api.messages
      .list(proposalId)
      .then(data => {
        if (!mounted) return
        setMessages(((data as { messages?: Message[] }).messages ?? []) as Message[])
      })
      .catch(() => {
        if (mounted) setMessages([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const channel = supabase
      .channel(`proposal:${proposalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `proposal_id=eq.${proposalId}`,
        },
        payload => appendMessage(payload.new as Message)
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [proposalId])

  return { messages, loading, appendMessage }
}
