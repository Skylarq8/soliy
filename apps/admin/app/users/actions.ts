'use server'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.API_URL ?? ''
const AUTH    = process.env.ADMIN_SERVICE_KEY ?? ''

async function adminPatch(path: string, body?: object) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AUTH}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Failed: ${res.status}`)
}

export async function banUser(id: string) {
  await adminPatch(`/users/${id}/ban`)
  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}

export async function unbanUser(id: string) {
  await adminPatch(`/users/${id}/unban`)
  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
}
