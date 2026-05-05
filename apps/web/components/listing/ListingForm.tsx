'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
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
  const [uploading, setUploading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      swap_enabled: true,
      condition: 3,
      photos: [],
      category_meta: {},
    },
  })

  const category = watch('category')
  const photos = watch('photos') ?? []

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth/login')
        return
      }
      setCheckingAuth(false)
    })
  }, [router])

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError('')

    try {
      const selected = Array.from(files).slice(0, Math.max(0, 8 - photos.length))
      const uploaded: string[] = []

      for (const file of selected) {
        const { image } = await api.uploads.image(file) as { image: { url: string } }
        uploaded.push(image.url)
      }

      setValue('photos', [...photos, ...uploaded], { shouldValidate: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    try {
      if ((data.photos ?? []).length < 2) {
        throw new Error('Хамгийн багадаа 2 зураг оруулна уу')
      }

      const body = {
        ...data,
        price: Number.isFinite(data.price) && data.price ? data.price : undefined,
        description: data.description?.trim() || undefined,
      }

      const { listing } = await api.listings.create(body) as { listing: { id: string } }
      router.push(`/listing/${listing.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Нэвтрэлтийг шалгаж байна…
      </div>
    )
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
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Тайлбар</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Дэлгэрэнгүй мэдээлэл…"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Категори *</label>
          <select
            {...register('category', { required: true })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
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
            className="w-full accent-primary"
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
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('swap_enabled')} className="accent-primary w-4 h-4" />
          <span className="text-sm font-medium">Swap зөвшөөрөх</span>
        </label>

        {/* Photos */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Зураг (хамгийн багадаа 2) *</label>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WEBP зураг сонгоно. Нэг зураг 8MB-аас бага, нийт 8 хүртэл зураг.
            </p>
          </div>

          <label className={`block rounded-2xl border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-center transition-colors ${
            uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'
          }`}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || photos.length >= 8}
              onChange={e => {
                void uploadPhotos(e.target.files)
                e.target.value = ''
              }}
              className="sr-only"
            />
            <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3.75m0 0L7.5 8.25M12 3.75l4.5 4.5M3.75 16.5v2.25A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V16.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {uploading ? 'Зураг upload хийж байна…' : 'Зураг сонгох'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{photos.length}/8 зураг нэмэгдсэн</p>
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
                  <img src={url} alt={`Зарын зураг ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setValue('photos', photos.filter((_, j) => j !== i), { shouldValidate: true })}
                    className="absolute right-2 top-2 w-7 h-7 rounded-full bg-card/90 text-foreground shadow-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    aria-label="Зураг устгах"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length > 0 && photos.length < 2 && (
            <p className="text-xs text-accent">Нийтлэхийн тулд дахиад {2 - photos.length} зураг нэмнэ үү.</p>
          )}
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
        disabled={loading || uploading}
        className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? 'Нийтэлж байна…' : 'Нийтлэх'}
      </button>
    </form>
  )
}
