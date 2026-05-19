import { createAdminClient } from './supabase'

export interface AdminStats {
  total_users:           number
  active_listings:       number
  completed_swaps:       number
  pending_verifications: number
}

export async function fetchStats(): Promise<AdminStats> {
  const supabase = createAdminClient()
  try {
    const [users, listings, proposals, verifications] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('proposals').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    return {
      total_users:           users.count           ?? 0,
      active_listings:       listings.count        ?? 0,
      completed_swaps:       proposals.count       ?? 0,
      pending_verifications: verifications.count   ?? 0,
    }
  } catch {
    return { total_users: 0, active_listings: 0, completed_swaps: 0, pending_verifications: 0 }
  }
}
