'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase'
import type { Category } from './page'

export async function upsertCategory(cat: Omit<Category, 'is_active'> & { is_active: boolean }) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  revalidatePath('/categories')
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()
  // Move children to top level before deleting parent
  await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/categories')
}
