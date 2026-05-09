'use server'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.API_URL ?? ''
const AUTH    = process.env.ADMIN_SERVICE_KEY ?? ''

async function adminPatch(path: string, body: object) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}

export async function approveVerification(id: string, tier: number, expiresDays: number) {
  await adminPatch(`/verifications/${id}/approve`, { tier, expires_days: expiresDays })
  revalidatePath('/verifications')
}

export async function rejectVerification(id: string, note: string) {
  await adminPatch(`/verifications/${id}/reject`, { note })
  revalidatePath('/verifications')
}
