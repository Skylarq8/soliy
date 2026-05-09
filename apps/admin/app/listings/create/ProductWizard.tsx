'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  ChevronRight, ChevronLeft, ArrowLeft, Check,
  Shirt, Sparkles, Palette, Gem, Flower2, Music,
  Eye, Save,
} from 'lucide-react'
import { ImageUploader } from '@/components/product-form/ImageUploader'
import { UsagePercentage } from '@/components/product-form/UsagePercentage'
import { PerfumeBottle } from '@/components/product-form/PerfumeBottle'
import { ConditionPicker } from '@/components/product-form/ConditionPicker'
import { SizeSelector } from '@/components/product-form/SizeSelector'
import { ColorSwatch } from '@/components/product-form/ColorSwatch'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'clothing',    label: 'Clothing',            icon: Shirt,    description: 'Tops, bottoms, outerwear, etc.',    color: 'from-violet-500 to-violet-700' },
  { id: 'skincare',    label: 'Skin Care',           icon: Sparkles, description: 'Serums, moisturizers, treatments', color: 'from-pink-500 to-rose-600' },
  { id: 'makeup',      label: 'Make Up',             icon: Palette,  description: 'Lipstick, foundation, eyeshadow',  color: 'from-fuchsia-500 to-purple-600' },
  { id: 'accessories', label: 'Accessories',         icon: Gem,      description: 'Jewelry, bags, belts, hats',      color: 'from-amber-500 to-orange-600' },
  { id: 'perfume',     label: 'Perfume',             icon: Flower2,  description: 'Fragrances and colognes',         color: 'from-indigo-500 to-blue-600' },
  { id: 'instruments', label: 'Musical Instruments', icon: Music,    description: 'Guitars, keyboards, drums, etc.', color: 'from-emerald-500 to-teal-600' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

const baseSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  photos:      z.array(z.string()).min(1, 'At least 1 photo required'),
  category:    z.string().min(1, 'Please select a category'),
  price:       z.number().nullable().optional(),
  swap_enabled:z.boolean(),
  // Category meta fields
  brand:       z.string().optional(),
  condition:   z.string().optional(),
  size:        z.string().optional(),
  color:       z.string().optional(),
  gender:      z.string().optional(),
  material:    z.string().optional(),
  usage_pct:   z.number().min(0).max(100).optional(),
  expiry_date: z.string().optional(),
  skin_type:   z.string().optional(),
  shade:       z.string().optional(),
  finish_type: z.string().optional(),
  accessory_type: z.string().optional(),
  fragrance_type: z.string().optional(),
  instrument_type:z.string().optional(),
  year:        z.number().optional(),
  tags:        z.array(z.string()).optional(),
})

type FormData = z.infer<typeof baseSchema>

const STEPS = ['Category', 'Photos', 'Details', 'Pricing', 'Preview'] as const
type Step = 0 | 1 | 2 | 3 | 4

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, steps }: { current: Step; steps: readonly string[] }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
              i < current  ? 'bg-violet-600 text-white'
              : i === current ? 'bg-violet-500 text-white ring-4 ring-violet-500/25'
              : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]'
            )}>
              {i < current ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block',
              i === current ? 'text-violet-400' : 'text-[hsl(var(--muted-foreground))]'
            )}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'w-12 sm:w-16 h-0.5 mx-1 mb-4 rounded-full transition-colors',
              i < current ? 'bg-violet-600' : 'bg-[hsl(var(--border))]'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Category ─────────────────────────────────────────────────────────
function StepCategory({ value, onChange }: { value: string; onChange: (v: CategoryId) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">What are you listing?</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose the category that best describes your item</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => {
          const isSelected = value === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                'group relative flex flex-col items-center gap-3 p-5 rounded-2xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-violet-500/40 bg-violet-500/8'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))/50] hover:bg-[hsl(var(--surface))]'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
                cat.color
              )}>
                <cat.icon className="w-6 h-6 text-white" strokeWidth={1.75} />
              </div>
              <div className="text-center">
                <p className={cn('text-sm font-semibold', isSelected ? 'text-violet-300' : 'text-[hsl(var(--foreground))]')}>
                  {cat.label}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 leading-tight">
                  {cat.description}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Category-specific details ───────────────────────────────────────
function StepDetails({ category, control, watch, setValue }: {
  category: CategoryId
  control: any
  watch: any
  setValue: any
}) {
  const brand    = watch('brand') ?? ''
  const color    = watch('color') ?? ''
  const size     = watch('size') ?? ''
  const condition = watch('condition') ?? ''
  const usagePct  = watch('usage_pct') ?? 90
  const shade     = watch('shade') ?? ''

  function Field({ name, label, placeholder, required }: { name: keyof FormData; label: string; placeholder?: string; required?: boolean }) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              value={field.value ?? ''}
              placeholder={placeholder}
              className="input-base"
            />
          )}
        />
      </div>
    )
  }

  function SelectField({ name, label, options, required }: { name: keyof FormData; label: string; options: string[]; required?: boolean }) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <select {...field} value={field.value ?? ''} className="input-base cursor-pointer">
              <option value="">Select {label}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        />
      </div>
    )
  }

  const descField = (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Description</label>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            value={field.value ?? ''}
            rows={3}
            placeholder="Describe the item, any details worth mentioning…"
            className="input-base resize-none"
          />
        )}
      />
    </div>
  )

  // ── CLOTHING ──────────────────────────────────────────────────────────────
  if (category === 'clothing') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Clothing Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Fill in the details about this clothing item</p>
      </div>
      <Field name="brand" label="Brand" placeholder="e.g. Nike, Zara, H&M" required />
      <SizeSelector value={size} onChange={v => setValue('size', v)} />
      <ConditionPicker value={condition as any} onChange={v => setValue('condition', v)} />
      <ColorSwatch value={color} onChange={v => setValue('color', v)} />
      <SelectField name="gender" label="Gender" options={['Women', 'Men', 'Unisex', 'Kids']} required />
      <Field name="material" label="Material" placeholder="Cotton, Polyester, Wool…" />
      {descField}
    </div>
  )

  // ── SKINCARE ─────────────────────────────────────────────────────────────
  if (category === 'skincare') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Skin Care Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Describe your skin care product accurately</p>
      </div>
      <Field name="brand" label="Brand" placeholder="e.g. The Ordinary, CeraVe" required />
      <SelectField name="skin_type" label="Skin Type" options={['All', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']} required />
      <UsagePercentage
        value={usagePct}
        onChange={v => setValue('usage_pct', v)}
        label="Product Remaining"
      />
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Expiry Date<span className="text-red-400 ml-0.5">*</span>
        </label>
        <Controller
          name="expiry_date"
          control={control}
          render={({ field }) => (
            <input type="date" {...field} value={field.value ?? ''} className="input-base" />
          )}
        />
      </div>
      {descField}
    </div>
  )

  // ── MAKEUP ───────────────────────────────────────────────────────────────
  if (category === 'makeup') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Make Up Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Describe your makeup product</p>
      </div>
      <Field name="brand" label="Brand" placeholder="e.g. MAC, Charlotte Tilbury" required />
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Shade / Color<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="flex items-center gap-3">
          <Controller
            name="shade"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                value={field.value ?? ''}
                placeholder="Shade name or number"
                className="input-base flex-1"
              />
            )}
          />
          {shade && (
            <div
              className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] flex-shrink-0 flex items-center justify-center"
              title={shade}
            >
              <Palette className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </div>
          )}
        </div>
      </div>
      <SelectField name="finish_type" label="Finish Type" options={['Matte', 'Glossy', 'Satin', 'Shimmer', 'Metallic', 'Natural']} />
      <UsagePercentage
        value={usagePct}
        onChange={v => setValue('usage_pct', v)}
        label="Product Remaining"
      />
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Expiry Date<span className="text-red-400 ml-0.5">*</span>
        </label>
        <Controller
          name="expiry_date"
          control={control}
          render={({ field }) => (
            <input type="date" {...field} value={field.value ?? ''} className="input-base" />
          )}
        />
      </div>
      {descField}
    </div>
  )

  // ── ACCESSORIES ──────────────────────────────────────────────────────────
  if (category === 'accessories') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Accessory Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Tell us about this accessory</p>
      </div>
      <SelectField name="accessory_type" label="Type" options={['Ring','Necklace','Bracelet','Earrings','Watch','Bag','Belt','Hat','Sunglasses','Scarf','Wallet','Other']} required />
      <Field name="brand" label="Brand" placeholder="e.g. Gucci, Zara" />
      <ConditionPicker value={condition as any} onChange={v => setValue('condition', v)} />
      <ColorSwatch value={color} onChange={v => setValue('color', v)} />
      <Field name="material" label="Material" placeholder="Gold, Silver, Leather…" />
      {descField}
    </div>
  )

  // ── PERFUME ──────────────────────────────────────────────────────────────
  if (category === 'perfume') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Perfume Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Tell us about this fragrance</p>
      </div>
      <Field name="brand" label="Brand" placeholder="e.g. Chanel, Dior, YSL" required />
      <SelectField name="fragrance_type" label="Fragrance Family" options={['Floral','Woody','Oriental','Fresh','Citrus','Aquatic','Gourmand','Fougere','Chypre','Aldehyde']} required />
      <PerfumeBottle value={usagePct} onChange={v => setValue('usage_pct', v)} />
      {descField}
    </div>
  )

  // ── INSTRUMENTS ──────────────────────────────────────────────────────────
  if (category === 'instruments') return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Instrument Details</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Tell us about this instrument</p>
      </div>
      <SelectField name="instrument_type" label="Type" options={['Guitar','Bass','Keyboard','Piano','Drums','Violin','Cello','Trumpet','Saxophone','Flute','Ukulele','Synthesizer','Other']} required />
      <Field name="brand" label="Brand" placeholder="e.g. Fender, Yamaha" required />
      <ConditionPicker value={condition as any} onChange={v => setValue('condition', v)} />
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Year</label>
        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              {...field}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={String(new Date().getFullYear())}
              className="input-base"
            />
          )}
        />
      </div>
      {descField}
    </div>
  )

  return null
}

// ─── Step 4: Pricing ──────────────────────────────────────────────────────────
function StepPricing({ control }: { control: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Pricing &amp; Settings</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Set your asking price and swap preferences</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Asking Price (₮)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] font-medium">₮</span>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                min={0}
                {...field}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                placeholder="Leave empty for swap-only"
                className="input-base pl-7"
              />
            )}
          />
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">Leave blank to list as swap-only</p>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] p-4">
        <Controller
          name="swap_enabled"
          control={control}
          render={({ field }) => (
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold">Accept Swaps</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  Allow other users to propose item trades
                </p>
              </div>
              <div
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors cursor-pointer',
                  field.value ? 'bg-violet-600' : 'bg-[hsl(var(--muted))]'
                )}
              >
                <div className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                  field.value ? 'left-[26px]' : 'left-0.5'
                )} />
              </div>
            </label>
          )}
        />
      </div>
    </div>
  )
}

// ─── Step 5: Preview ─────────────────────────────────────────────────────────
function StepPreview({ data }: { data: FormData }) {
  const cat = CATEGORIES.find(c => c.id === data.category)

  const rawMeta = [
    ['Brand', data.brand] as [string, unknown],
    ['Condition', data.condition] as [string, unknown],
    ['Size', data.size] as [string, unknown],
    ['Color', data.color] as [string, unknown],
    ['Gender', data.gender] as [string, unknown],
    ['Usage %', data.usage_pct != null ? `${data.usage_pct}%` : null] as [string, unknown],
    ['Expiry', data.expiry_date] as [string, unknown],
    ['Shade', data.shade] as [string, unknown],
    ['Finish', data.finish_type] as [string, unknown],
    ['Fragrance', data.fragrance_type] as [string, unknown],
    ['Instrument', data.instrument_type] as [string, unknown],
    ['Year', data.year] as [string, unknown],
  ]
  const meta = rawMeta.filter(([, v]) => v != null && v !== '') as [string, string][]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold mb-1">Review &amp; Publish</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Everything looks right? Hit publish to go live.</p>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-hidden">
        {data.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-0.5 bg-[hsl(var(--border))]">
            {data.photos.slice(0, 4).map((url, i) => (
              <div key={i} className="relative aspect-square bg-[hsl(var(--surface))]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">{data.title || 'Untitled Listing'}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{cat?.label}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {data.price ? (
                <p className="text-lg font-bold">{data.price.toLocaleString()}₮</p>
              ) : (
                <p className="text-sm font-medium text-violet-400">Swap Only</p>
              )}
              {data.swap_enabled && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Swaps accepted</p>
              )}
            </div>
          </div>

          {data.description && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{data.description}</p>
          )}

          {meta.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {meta.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] px-3 py-2">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-semibold">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export function ProductWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      photos: [],
      swap_enabled: true,
      usage_pct: 90,
      brand: '',
      condition: '',
      size: '',
      color: '',
      gender: '',
      material: '',
      shade: '',
      finish_type: '',
      skin_type: '',
      accessory_type: '',
      fragrance_type: '',
      instrument_type: '',
      expiry_date: '',
    },
  })

  const watchAll     = watch()
  const category     = watch('category') as CategoryId | ''
  const photos       = watch('photos')

  function canNext(): boolean {
    if (step === 0) return !!category
    if (step === 1) return photos.length > 0
    return true
  }

  const onSubmit = handleSubmit(async (data) => {
    toast.loading('Creating listing…', { id: 'create' })
    try {
      await new Promise(r => setTimeout(r, 1000))
      toast.success('Listing created!', { id: 'create' })
      router.push('/listings')
    } catch {
      toast.error('Failed to create listing', { id: 'create' })
    }
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/listings" className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <StepIndicator current={step} steps={STEPS} />
        <div className="w-16" />
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 mb-6">
        <form onSubmit={onSubmit}>
          {step === 0 && (
            <StepCategory value={category} onChange={v => { setValue('category', v); setStep(1) }} />
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Add Photos</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Photos are the most important part — add clear, well-lit shots</p>
              </div>
              <Controller
                name="photos"
                control={control}
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} />
                )}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                  Title<span className="text-red-400 ml-0.5">*</span>
                </label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Give your listing a clear, descriptive title"
                      className="input-base text-base font-medium"
                    />
                  )}
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && category && (
            <StepDetails
              category={category}
              control={control}
              watch={watch}
              setValue={setValue}
            />
          )}

          {step === 3 && (
            <StepPricing control={control} />
          )}

          {step === 4 && (
            <StepPreview data={watchAll} />
          )}
        </form>
      </div>

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(s => (s - 1) as Step)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--surface))] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => (s + 1) as Step)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSubmit()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              Publish Listing
            </button>
          )}
        </div>
      )}
    </div>
  )
}
