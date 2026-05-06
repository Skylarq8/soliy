'use client'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
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

const steps = [
  { title: 'Зураг оруулах', caption: '1/3 · Зургаа сонгох' },
  { title: 'Мэдээлэл бөглөх', caption: '2/3 · Дэлгэрэнгүй мэдээлэл' },
  { title: 'Үнэ & нийтлэх', caption: '3/3 · Үнэ, солилцоо' },
] as const

const categories: { value: Category; label: string }[] = [
  { value: 'clothing', label: 'Хувцас' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'accessories', label: 'Accessories' },
]

const conditionOptions = [
  { value: 5, label: 'Шинэ' },
  { value: 4, label: 'Маш сайн' },
  { value: 3, label: 'Сайн' },
  { value: 2, label: 'Дундаж' },
  { value: 1, label: 'Элэгдсэн' },
]

const inputClass =
  'w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'

export function ListingForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      swap_enabled: true,
      condition: 4,
      photos: [],
      category_meta: {},
    },
  })

  const category = watch('category')
  const condition = watch('condition')
  const photos = watch('photos') ?? []
  const price = watch('price')
  const swapEnabled = watch('swap_enabled')
  const title = watch('title')

  const marketHint = useMemo(() => {
    if (!price || !Number.isFinite(price)) return 'Үнэ оруулсны дараа санал харуулна'
    const low = Math.max(0, Math.round(price * 0.88))
    const high = Math.round(price * 1.12)
    return `Зах зээлийн ойролцоо: ${low.toLocaleString()}₮ - ${high.toLocaleString()}₮`
  }, [price])

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

  async function goNext() {
    setError('')

    if (step === 0) {
      if (photos.length < 1) {
        setError('Хамгийн багадаа 1 зураг оруулна уу')
        return
      }
      setStep(1)
      return
    }

    if (step === 1) {
      const ok = await trigger(['title', 'category', 'condition'])
      if (!ok) {
        setError('Гарчиг, категори, нөхцөлөө бүрэн бөглөнө үү')
        return
      }
      setStep(2)
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    try {
      if ((data.photos ?? []).length < 1) {
        throw new Error('Хамгийн багадаа 1 зураг оруулна уу')
      }

      const body = {
        ...data,
        price: Number.isFinite(data.price) && data.price ? data.price : undefined,
        description: data.description?.trim() || undefined,
        category_meta: {
          ...data.category_meta,
          cash_balance_enabled: Boolean(data.category_meta?.cash_balance_enabled),
        },
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
        Нэвтрэлтийг шалгаж байна...
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-3xl border border-border bg-card p-5">
        <div className="space-y-4">
          {steps.map((item, index) => {
            const active = index === step
            const done = index < step
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (index < step) setStep(index)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active ? 'bg-primary-light text-primary' : done ? 'bg-muted/70 text-foreground' : 'text-muted-foreground'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  active ? 'bg-primary text-primary-foreground' : done ? 'bg-primary/15 text-primary' : 'bg-muted'
                }`}>
                  {done ? <Check size={17} /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs opacity-75">{item.caption}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={17} className="text-primary" />
            Зөвлөмж
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Цэвэр гэрэлтэй, олон өнцгөөс авсан зураг болон тодорхой тайлбар нь хурдан солилцогдоход тусална.
          </p>
        </div>
      </aside>

      <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
        <div className="mb-5 border-b border-border pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{steps[step].title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{steps[step].caption}</p>
            </div>
            <div className="hidden h-2 w-28 overflow-hidden rounded-full bg-muted sm:block">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <label className={`block rounded-3xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors ${
              uploading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'
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
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-primary">
                {uploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
              </div>
              <p className="text-sm font-semibold">
                {uploading ? 'Зураг upload хийж байна...' : 'Зураг сонгох'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Доод тал 1 зураг, дээд тал 8 зураг</p>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((url, i) => (
                  <div key={url} className={`group relative overflow-hidden rounded-2xl border bg-muted ${
                    i === 0 ? 'col-span-2 row-span-2 aspect-square border-primary/40' : 'aspect-square border-border'
                  }`}>
                    <img src={url} alt={`Зарын зураг ${i + 1}`} className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium shadow-sm">
                        Гол зураг
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setValue('photos', photos.filter((_, j) => j !== i), { shouldValidate: true })}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground opacity-100 shadow-sm transition sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Зураг устгах"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Нэр / Тайлбар *</label>
                <input
                  {...register('title', { required: true, minLength: 3 })}
                  placeholder="Zara Camel Wool Coat"
                  className={inputClass}
                />
                {errors.title && <p className="text-xs text-accent">3-аас дээш тэмдэгт оруулна уу.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Категори *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue('category', item.value, { shouldValidate: true })}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        category === item.value ? 'border-primary bg-primary-light text-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('category', { required: true })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Нөхцөл *</label>
                <div className="flex flex-wrap gap-2">
                  {conditionOptions.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue('condition', item.value, { shouldValidate: true })}
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                        condition === item.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('condition', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Дэлгэрэнгүй тайлбар</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Материал, хэрэглэсэн хугацаа, онцлог, жижиг сэв байвал бичээрэй..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {category && (
              <div className="rounded-2xl border border-border bg-background p-4">
                <h3 className="mb-4 text-sm font-semibold">
                  {category === 'clothing' ? 'Хувцасны мэдээлэл' :
                   category === 'skincare' ? 'Skincare мэдээлэл' :
                   category === 'makeup' ? 'Makeup мэдээлэл' : 'Accessories мэдээлэл'}
                </h3>
                <CategoryFields category={category} register={register} watch={watch} />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="text-sm font-medium">Үнэ (₮)</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="120000"
                className="mt-2 w-full border-0 bg-transparent p-0 text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
              />
              <p className="mt-2 text-xs text-muted-foreground">{marketHint}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <h3 className="text-sm font-semibold">Солилцооны тохиргоо</h3>
              <div className="mt-4 space-y-3">
                <ToggleRow
                  title="Солих зөвшөөрнө"
                  caption="Ижил үнэтэй зүйлтэй солих"
                  checked={swapEnabled}
                  onChange={checked => setValue('swap_enabled', checked)}
                />
                <ToggleRow
                  title="Мөнгө нэмэх зөвшөөрнө"
                  caption="Үнийн зөрүүг нөхөх"
                  checked={Boolean(watch('category_meta.cash_balance_enabled'))}
                  onChange={checked => setValue('category_meta.cash_balance_enabled', checked)}
                />
                <ToggleRow
                  title="Зөвхөн худалдах"
                  caption="Солилцоо авахгүй"
                  checked={!swapEnabled}
                  onChange={checked => setValue('swap_enabled', !checked)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-primary/25 bg-primary-light p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold">Баталгаажуулалт хүсэх</p>
                  <p className="text-xs text-muted-foreground">Зарааны итгэл нэмэгдэж, илүү сайн харагдана.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Нийтлэхэд бэлэн эсэх</p>
              <div className="mt-3 space-y-2 text-sm">
                <CheckLine ok={photos.length >= 1} text={`${photos.length}/8 зураг`} />
                <CheckLine ok={Boolean(title?.trim())} text={title?.trim() || 'Гарчиг оруулаагүй'} />
                <CheckLine ok={Boolean(category)} text={category ? categories.find(item => item.value === category)?.label ?? category : 'Категори сонгоогүй'} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0 || loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            Буцах
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={uploading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Үргэлжлүүлэх
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={loading || uploading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : null}
              {loading ? 'Нийтэлж байна...' : 'Нийтлэх'}
              {!loading ? <ArrowRight size={17} /> : null}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function ToggleRow({
  title,
  caption,
  checked,
  onChange,
}: {
  title: string
  caption: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-primary' : 'bg-muted'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}

function CheckLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${ok ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        <Check size={13} />
      </span>
      <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
    </div>
  )
}
