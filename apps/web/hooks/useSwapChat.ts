import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Message } from '@swaply/types'

export function useSwapChat(proposalId: string) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    supabase
      .from('messages')
      .select('*, users:sender_id(nickname, avatar_url)')
      .eq('proposal_id', proposalId)
      .order('created_at')
      .then(({ data }) => setMessages((data as Message[]) ?? []))

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
        payload => setMessages(prev => [...prev, payload.new as Message])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [proposalId])

  return { messages }
}
