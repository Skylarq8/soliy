import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken()
  const isFormData = init?.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

export const api = {
  auth: {
    register: (body: unknown) =>
      apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    resolveLogin: (identifier: string) =>
      apiFetch<{ email: string }>('/auth/resolve-login', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      }),
  },

  // Listings
  listings: {
    list: (params?: Record<string, string>) =>
      apiFetch(`/api/listings?${new URLSearchParams(params)}`),
    get: (id: string) => apiFetch(`/api/listings/${id}`),
    create: (body: unknown) =>
      apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: unknown) =>
      apiFetch(`/api/listings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) =>
      apiFetch(`/api/listings/${id}`, { method: 'DELETE' }),
  },

  // Uploads
  uploads: {
    image: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return apiFetch('/api/uploads/image', { method: 'POST', body })
    },
  },

  // Proposals
  proposals: {
    list: (params?: Record<string, string>) =>
      apiFetch(`/api/proposals?${new URLSearchParams(params)}`),
    get: (id: string) => apiFetch(`/api/proposals/${id}`),
    create: (body: unknown) =>
      apiFetch('/api/proposals', { method: 'POST', body: JSON.stringify(body) }),
    accept: (id: string) =>
      apiFetch(`/api/proposals/${id}/accept`, { method: 'PATCH' }),
    decline: (id: string) =>
      apiFetch(`/api/proposals/${id}/decline`, { method: 'PATCH' }),
    counter: (id: string, money_offer: number) =>
      apiFetch(`/api/proposals/${id}/counter`, { method: 'PATCH', body: JSON.stringify({ money_offer }) }),
    confirmReceipt: (id: string) =>
      apiFetch(`/api/proposals/${id}/confirm-receipt`, { method: 'PATCH' }),
  },

  // Messages
  messages: {
    list: (proposalId: string, params?: Record<string, string>) =>
      apiFetch(`/api/messages/${proposalId}?${new URLSearchParams(params)}`),
    send: (proposal_id: string, content: string) =>
      apiFetch('/api/messages', { method: 'POST', body: JSON.stringify({ proposal_id, content }) }),
  },

  // Users
  users: {
    me: () => apiFetch('/api/users/me'),
    updateMe: (body: unknown) =>
      apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
    getByNickname: (nickname: string) => apiFetch(`/api/users/${nickname}`),
    follow: (id: string) => apiFetch(`/api/users/${id}/follow`, { method: 'POST' }),
    unfollow: (id: string) => apiFetch(`/api/users/${id}/follow`, { method: 'DELETE' }),
    notifications: (unread?: boolean) =>
      apiFetch(`/api/users/me/notifications${unread ? '?unread_only=true' : ''}`),
    markAllRead: () =>
      apiFetch('/api/users/me/notifications/read-all', { method: 'PATCH' }),
  },

  // Reviews
  reviews: {
    create: (body: unknown) =>
      apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),
    forUser: (userId: string) => apiFetch(`/api/reviews/user/${userId}`),
  },

  // Boosts
  boosts: {
    pricing: () => apiFetch('/api/boosts/pricing'),
    start: (listing_id: string, days: number) =>
      apiFetch('/api/boosts', { method: 'POST', body: JSON.stringify({ listing_id, days }) }),
  },

  // Verify
  verify: {
    submit: (body: unknown) =>
      apiFetch('/api/verify', { method: 'POST', body: JSON.stringify(body) }),
    status: (listingId: string) => apiFetch(`/api/verify/status/${listingId}`),
  },
}
