const API_URL = process.env.API_URL ?? ''
const AUTH    = process.env.ADMIN_SERVICE_KEY ?? ''

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH}`,
      ...init?.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Admin API ${path} failed: ${res.status}`)
  return res.json()
}

export interface AdminStats {
  total_users:           number
  active_listings:       number
  completed_swaps:       number
  pending_verifications: number
}

export async function fetchStats(): Promise<AdminStats> {
  try { return await apiFetch<AdminStats>('/stats') }
  catch { return { total_users: 0, active_listings: 0, completed_swaps: 0, pending_verifications: 0 } }
}

export async function fetchListings(status = 'active', page = 1) {
  try {
    const data = await apiFetch<{ listings: any[] }>(`/listings?status=${status}&page=${page}`)
    return data.listings ?? []
  } catch { return [] }
}

export async function fetchUsers(q?: string, page = 1) {
  try {
    const qs = new URLSearchParams({ page: String(page) })
    if (q) qs.set('q', q)
    const data = await apiFetch<{ users: any[] }>(`/users?${qs}`)
    return data.users ?? []
  } catch { return [] }
}

export async function fetchVerifications(status = 'pending') {
  try {
    const data = await apiFetch<{ verifications: any[] }>(`/verifications?status=${status}`)
    return data.verifications ?? []
  } catch { return [] }
}
