'use server'
import { createAdminClient } from '@/lib/supabase'
import { CategoryManager } from './CategoryManager'

export type CategoryField = {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'tags'
  required: boolean
  placeholder?: string
  options?: string[]
}

export type Category = {
  id: string
  name: string
  parent_id: string | null
  icon: string
  fields: CategoryField[]
  sort_order: number
  is_active: boolean
}

export default async function CategoriesPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  return <CategoryManager initialCategories={(categories ?? []) as Category[]} />
}
