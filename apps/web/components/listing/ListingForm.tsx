'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { CategoryFields } from './CategoryFields'
import type { Category } from '@swaply/types'

interface FormData {
  title: string
  description: string
  category: Category
  condition: number
  price: number | null
  swap_enabled: boolean
  photos: string[]
  category_meta: Record<string, unknown>
}

const STEPS = ['기본정보', '카테고리', '사진', '확인'] as const

export function ListingForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      swap_enabled: true,
      condition: 3,
      category_meta: {},
    },
  })

  const category = watch('category')

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    try {
      const { listing } = await api.listings.create(data) as { listing: { id: string } }
      router.push(`/listing/${listing.id}`)
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Гарчиг *</label>
          <input
            {...register('title', { required: true, minLength: 3 })}
            placeholder="Nike Air Max 90, хэмжээ 42"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Тайлбар</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Дэлгэрэнгүй мэдээлэл…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Категори *</label>
          <select
            {...register('category', { required: true })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Сонгох…</option>
            <option value="clothing">Хувцас</option>
            <option value="skincare">Skincare</option>
            <option value="makeup">Makeup</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Байдал: {watch('condition')}/5</label>
          <input
            type="range"
            min={1}
            max={5}
            {...register('condition', { valueAsNumber: true })}
            className="w-full accent-violet-600"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Муу</span><span>Дунд</span><span>Маш сайн</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Үнэ (₮) — хоосон бол swap only</label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="25000"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('swap_enabled')} className="accent-violet-600 w-4 h-4" />
          <span className="text-sm font-medium">Swap зөвшөөрөх</span>
        </label>

        {/* Photos — Supabase Storage upload placeholder */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Фото URLs (хамгийн багадаа 2) *</label>
          <p className="text-xs text-muted-foreground">Supabase Storage URL оруулах — дараа нь upload UI нэмнэ</p>
          <input
            placeholder="https://…"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) {
                  const curr = watch('photos') ?? []
                  setValue('photos', [...curr, val]);
                  (e.target as HTMLInputElement).value = ''
                }
              }
            }}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex flex-wrap gap-2">
            {(watch('photos') ?? []).map((url, i) => (
              <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg">
                <span className="truncate max-w-32">{url}</span>
                <button
                  type="button"
                  onClick={() => {
                    const curr = watch('photos') ?? []
                    setValue('photos', curr.filter((_, j) => j !== i))
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category-specific fields */}
      {category && (
        <div className="space-y-4">
          <h2 className="font-medium text-sm border-t border-border pt-4">
            {category === 'clothing' ? 'Хувцасны мэдээлэл' :
             category === 'skincare' ? 'Skincare мэдээлэл' :
             category === 'makeup' ? 'Makeup мэдээлэл' : 'Accessories мэдээлэл'}
          </h2>
          <CategoryFields category={category} register={register} watch={watch} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Нийтэлж байна…' : 'Нийтлэх'}
      </button>
    </form>
  )
}
