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
  await supabase.from('categories').update({ parent_id: null }).eq('parent_id', id)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/categories')
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    icon: '👕',
    parent_id: null,
    sort_order: 1,
    is_active: true,
    fields: [
      { key: 'brand',     label: 'Brand',     type: 'text',   required: true,  placeholder: 'Nike, Zara, H&M…' },
      { key: 'size',      label: 'Size',      type: 'select', required: true,  options: ['XXS','XS','S','M','L','XL','XXL','3XL'] },
      { key: 'condition', label: 'Condition', type: 'select', required: true,  options: ['New','Like New','Good','Used'] },
      { key: 'color',     label: 'Color',     type: 'text',   required: false, placeholder: 'Black, White…' },
      { key: 'gender',    label: 'Gender',    type: 'select', required: true,  options: ['Women','Men','Unisex','Kids'] },
      { key: 'material',  label: 'Material',  type: 'text',   required: false, placeholder: 'Cotton, Polyester…' },
    ],
  },
  {
    id: 'skincare',
    name: 'Skin Care',
    icon: '✨',
    parent_id: null,
    sort_order: 2,
    is_active: true,
    fields: [
      { key: 'brand',       label: 'Brand',         type: 'text',   required: true  },
      { key: 'skin_type',   label: 'Skin Type',     type: 'select', required: true,  options: ['All','Dry','Oily','Combination','Sensitive','Normal'] },
      { key: 'usage_pct',   label: 'Usage %',       type: 'number', required: true  },
      { key: 'expiry_date', label: 'Expiry Date',   type: 'date',   required: true  },
      { key: 'ingredients', label: 'Ingredients',   type: 'text',   required: false },
    ],
  },
  {
    id: 'makeup',
    name: 'Make Up',
    icon: '💄',
    parent_id: null,
    sort_order: 3,
    is_active: true,
    fields: [
      { key: 'brand',       label: 'Brand',       type: 'text',   required: true  },
      { key: 'shade',       label: 'Shade/Color', type: 'text',   required: true,  placeholder: 'e.g. Ruby Red #12' },
      { key: 'usage_pct',   label: 'Usage %',     type: 'number', required: true  },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date',   required: true  },
      { key: 'finish_type', label: 'Finish',      type: 'select', required: false, options: ['Matte','Glossy','Satin','Shimmer','Metallic','Natural'] },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: '💍',
    parent_id: null,
    sort_order: 4,
    is_active: true,
    fields: [
      { key: 'accessory_type', label: 'Type',      type: 'select', required: true,  options: ['Ring','Necklace','Bracelet','Earrings','Watch','Bag','Belt','Hat','Sunglasses','Scarf','Wallet','Other'] },
      { key: 'brand',          label: 'Brand',     type: 'text',   required: false },
      { key: 'condition',      label: 'Condition', type: 'select', required: true,  options: ['New','Like New','Good','Used'] },
      { key: 'material',       label: 'Material',  type: 'text',   required: false },
      { key: 'color',          label: 'Color',     type: 'text',   required: false },
    ],
  },
  {
    id: 'perfume',
    name: 'Perfume',
    icon: '🌸',
    parent_id: null,
    sort_order: 5,
    is_active: true,
    fields: [
      { key: 'brand',          label: 'Brand',           type: 'text',   required: true  },
      { key: 'fragrance_type', label: 'Fragrance Family',type: 'select', required: true,  options: ['Floral','Woody','Oriental','Fresh','Citrus','Aquatic','Gourmand','Chypre'] },
      { key: 'usage_pct',      label: 'Volume %',        type: 'number', required: true  },
      { key: 'longevity',      label: 'Longevity',       type: 'select', required: false, options: ['1-3 hrs','3-6 hrs','6-8 hrs','8+ hrs'] },
    ],
  },
  {
    id: 'instruments',
    name: 'Musical Instruments',
    icon: '🎸',
    parent_id: null,
    sort_order: 6,
    is_active: true,
    fields: [
      { key: 'instrument_type', label: 'Instrument Type', type: 'select', required: true,  options: ['Guitar','Bass','Keyboard','Piano','Drums','Violin','Cello','Trumpet','Saxophone','Flute','Ukulele','Synthesizer','Other'] },
      { key: 'brand',           label: 'Brand',           type: 'text',   required: true,  placeholder: 'Fender, Yamaha, Gibson…' },
      { key: 'condition',       label: 'Condition',       type: 'select', required: true,  options: ['New','Like New','Good','Used'] },
      { key: 'year',            label: 'Year',            type: 'number', required: false, placeholder: '2020' },
      { key: 'accessories',     label: 'Includes',        type: 'tags',   required: false, placeholder: 'Case, cables, strap…' },
      { key: 'damage_notes',    label: 'Damage Notes',    type: 'text',   required: false },
    ],
  },
]

export async function seedDefaultCategories() {
  const supabase = createAdminClient()

  // Only insert categories that don't exist yet (upsert by id)
  const { error } = await supabase
    .from('categories')
    .upsert(DEFAULT_CATEGORIES, { onConflict: 'id', ignoreDuplicates: true })

  if (error) throw new Error(error.message)
  revalidatePath('/categories')
}
