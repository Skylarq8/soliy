'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'

const API_URL = process.env.API_URL ?? ''
const AUTH    = process.env.ADMIN_SERVICE_KEY ?? ''

export async function archiveListing(id: string) {
  const res = await fetch(`${API_URL}/api/admin/listings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AUTH}` },
  })
  if (!res.ok) throw new Error(`Archive failed: ${res.status}`)
  revalidatePath('/listings')
}

export async function deleteListing(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/listings')
}
