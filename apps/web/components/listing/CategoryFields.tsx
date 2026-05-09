'use client'
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import type { Category } from '@swaply/types'

interface Props {
  category: Category
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

const cls =
  'w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-muted-foreground/60'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-foreground mb-1.5">{children}</label>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ChipPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string; emoji?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={[
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
              value === o.value
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-foreground hover:border-primary/50',
            ].join(' ')}
          >
            {o.emoji && <span>{o.emoji}</span>}
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

function SizeGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Хэмжээ">
      <div className="grid grid-cols-4 gap-2">
        {SIZES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(value === s ? '' : s)}
            className={[
              'rounded-xl border py-2.5 text-sm font-semibold transition',
              value === s
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card hover:border-primary/50',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
    </Field>
  )
}

const PRESET_COLORS = [
  { value: 'black',  label: 'Хар',        hex: '#1c1c1e' },
  { value: 'white',  label: 'Цагаан',     hex: '#e8e8e0' },
  { value: 'gray',   label: 'Саарал',     hex: '#8e8e93' },
  { value: 'beige',  label: 'Бэйж',       hex: '#d4b896' },
  { value: 'brown',  label: 'Бор',        hex: '#8b5e3c' },
  { value: 'navy',   label: 'Хар цэнхэр', hex: '#1d3461' },
  { value: 'blue',   label: 'Цэнхэр',    hex: '#3b82f6' },
  { value: 'green',  label: 'Ногоон',     hex: '#22c55e' },
  { value: 'red',    label: 'Улаан',      hex: '#ef4444' },
  { value: 'pink',   label: 'Ягаан',      hex: '#ec4899' },
  { value: 'yellow', label: 'Шар',        hex: '#eab308' },
  { value: 'purple', label: 'Нил ягаан',  hex: '#a855f7' },
]

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const preset = PRESET_COLORS.find(c => c.value === value)
  return (
    <Field label="Өнгө">
      <div className="flex flex-wrap gap-2.5">
        {PRESET_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(value === c.value ? '' : c.value)}
            className={[
              'relative w-8 h-8 rounded-full border-2 transition-all',
              value === c.value
                ? 'border-primary scale-110 shadow-md'
                : 'border-transparent hover:scale-105 hover:border-border',
            ].join(' ')}
            style={{ background: c.hex }}
          >
            {value === c.value && (
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: c.hex === '#e8e8e0' ? '#333' : '#fff', textShadow: '0 0 3px rgba(0,0,0,0.4)' }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
      {preset && (
        <p className="mt-2 text-xs text-muted-foreground">
          Сонгосон: <span className="font-medium text-foreground">{preset.label}</span>
        </p>
      )}
    </Field>
  )
}

function UsageRing({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const RADIUS = 44
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const clamped = Math.max(0, Math.min(100, value ?? 90))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)
  const color =
    clamped >= 70 ? '#4ade80' : clamped >= 40 ? '#fb923c' : clamped >= 20 ? '#f97316' : '#ef4444'
  const label =
    clamped >= 80 ? 'Бараг шинэ' : clamped >= 50 ? 'Дундаас дээш' : clamped >= 20 ? 'Хагас дуусcан' : 'Их хэрэглэсэн'

  return (
    <Field label="Үлдсэн хэмжээ">
      <div className="flex items-center gap-5 p-4 rounded-2xl border border-border bg-background">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none" stroke="currentColor" strokeWidth="9"
              className="text-muted"
            />
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none" style={{ color }}>{clamped}</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-2" style={{ color }}>{label}</p>
          <input
            type="range" min={0} max={100} value={clamped}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: color }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </Field>
  )
}

function PerfumeBottle({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const clamped = Math.max(0, Math.min(100, value ?? 80))
  const fillHeight = (clamped / 100) * 64
  const fillY = 94 - fillHeight
  const color = clamped >= 60 ? '#a855f7' : clamped >= 30 ? '#ec4899' : '#f43f5e'
  const label =
    clamped >= 80 ? 'Бараг дүүрэн' : clamped >= 50 ? 'Хагасаас дээш' : clamped >= 20 ? 'Бага үлдсэн' : 'Бараг дуусcан'

  return (
    <Field label="Үлдсэн хэмжээ (Volume %)">
      <div className="flex items-center gap-5 p-4 rounded-2xl border border-border bg-background">
        <div className="flex-shrink-0">
          <svg viewBox="0 0 60 120" width="56" height="112">
            <defs>
              <linearGradient id="pf-grad-form" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
              <clipPath id="pf-clip-form">
                <rect x="10" y="30" width="40" height="66" rx="6" />
              </clipPath>
            </defs>
            <rect x="18" y="6" width="24" height="10" rx="3" fill="#9ca3af" />
            <rect x="22" y="15" width="16" height="16" rx="2" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
            <rect x="10" y="30" width="40" height="66" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
            <rect
              x="10" y={fillY} width="40" height={fillHeight} rx="6"
              fill="url(#pf-grad-form)"
              clipPath="url(#pf-clip-form)"
              style={{ transition: 'y 0.45s cubic-bezier(0.34,1.56,0.64,1), height 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
            <rect x="15" y="35" width="5" height="20" rx="2.5" fill="white" opacity="0.18" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-2" style={{ color }}>{clamped}% · {label}</p>
          <input
            type="range" min={0} max={100} value={clamped}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: color }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Хоосон</span>
            <span>Дүүрэн</span>
          </div>
        </div>
      </div>
    </Field>
  )
}

const ACCESSORY_TYPES = [
  { value: 'ring',       label: 'Бөгж',       emoji: '💍' },
  { value: 'necklace',   label: 'Зүүлт',      emoji: '📿' },
  { value: 'bracelet',   label: 'Браслет',    emoji: '🔗' },
  { value: 'earrings',   label: 'Ээмэг',      emoji: '✨' },
  { value: 'watch',      label: 'Цаг',        emoji: '⌚' },
  { value: 'bag',        label: 'Цүнх',       emoji: '👜' },
  { value: 'belt',       label: 'Бүс',        emoji: '🪢' },
  { value: 'hat',        label: 'Малгай',     emoji: '🧢' },
  { value: 'sunglasses', label: 'Нарны шил',  emoji: '🕶️' },
  { value: 'wallet',     label: 'Түрийвч',    emoji: '👛' },
  { value: 'scarf',      label: 'Дурдгар',    emoji: '🧣' },
  { value: 'other',      label: 'Бусад',      emoji: '🛍️' },
]

function AccessoryTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Хэрэгслийн төрөл">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {ACCESSORY_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(value === t.value ? '' : t.value)}
            className={[
              'flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 transition',
              value === t.value
                ? 'border-primary bg-primary-light text-primary font-semibold'
                : 'border-border bg-card text-foreground hover:border-primary/40',
            ].join(' ')}
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-xs leading-tight text-center">{t.label}</span>
          </button>
        ))}
      </div>
    </Field>
  )
}

const FRAGRANCE_TYPES = [
  { value: 'floral',    label: 'Цэцэгт',   emoji: '🌸' },
  { value: 'woody',     label: 'Модон',    emoji: '🌲' },
  { value: 'oriental',  label: 'Дорнод',   emoji: '🏮' },
  { value: 'fresh',     label: 'Свеж',     emoji: '🍃' },
  { value: 'citrus',    label: 'Жүрж',     emoji: '🍋' },
  { value: 'aquatic',   label: 'Усан',     emoji: '💧' },
  { value: 'gourmand',  label: 'Солодтой', emoji: '🍫' },
  { value: 'chypre',    label: 'Шипр',     emoji: '🪨' },
]

const LONGEVITY_OPTIONS = [
  { value: '1-3h', label: '1–3 цаг' },
  { value: '3-6h', label: '3–6 цаг' },
  { value: '6-8h', label: '6–8 цаг' },
  { value: '8h+',  label: '8+ цаг' },
]

const INSTRUMENT_TYPES = [
  { value: 'guitar',      label: 'Гитар',         emoji: '🎸' },
  { value: 'bass',        label: 'Басс',           emoji: '🎸' },
  { value: 'keyboard',    label: 'Клавиш',        emoji: '🎹' },
  { value: 'piano',       label: 'Хуур',          emoji: '🎹' },
  { value: 'drums',       label: 'Бөмбөр',        emoji: '🥁' },
  { value: 'violin',      label: 'Хийл',          emoji: '🎻' },
  { value: 'cello',       label: 'Чело',           emoji: '🎻' },
  { value: 'trumpet',     label: 'Бүрээ',         emoji: '🎺' },
  { value: 'saxophone',   label: 'Саксофон',      emoji: '🎷' },
  { value: 'flute',       label: 'Лимбэ',         emoji: '🪈' },
  { value: 'ukulele',     label: 'Укулеле',       emoji: '🪗' },
  { value: 'synthesizer', label: 'Синтезатор',    emoji: '🎛️' },
  { value: 'other',       label: 'Бусад',         emoji: '🎵' },
]

function InstrumentTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Хөгжмийн зэмсгийн төрөл">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {INSTRUMENT_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(value === t.value ? '' : t.value)}
            className={[
              'flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 transition',
              value === t.value
                ? 'border-primary bg-primary-light text-primary font-semibold'
                : 'border-border bg-card text-foreground hover:border-primary/40',
            ].join(' ')}
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-xs leading-tight text-center">{t.label}</span>
          </button>
        ))}
      </div>
    </Field>
  )
}

const SKIN_TYPES = [
  { value: 'all',         label: 'Бүх',          emoji: '✨' },
  { value: 'dry',         label: 'Хуурай',       emoji: '🌵' },
  { value: 'oily',        label: 'Тослог',        emoji: '💧' },
  { value: 'combination', label: 'Холимог',       emoji: '🌗' },
  { value: 'sensitive',   label: 'Мэдрэмтгий',   emoji: '🌸' },
  { value: 'normal',      label: 'Энгийн',        emoji: '☀️' },
]

const FINISH_TYPES = [
  { value: 'matte',    label: 'Матт' },
  { value: 'glossy',   label: 'Гялалзсан' },
  { value: 'satin',    label: 'Сатин' },
  { value: 'shimmer',  label: 'Гялбаатай' },
  { value: 'metallic', label: 'Металл' },
  { value: 'natural',  label: 'Байгалийн' },
]

const GENDER_OPTIONS = [
  { value: 'women', label: 'Эмэгтэй', emoji: '👩' },
  { value: 'men',   label: 'Эрэгтэй', emoji: '👨' },
  { value: 'unisex',label: 'Хоёулаа', emoji: '🧑' },
  { value: 'kids',  label: 'Хүүхэд',  emoji: '🧒' },
]

const MATERIAL_OPTIONS = [
  { value: 'cotton',    label: 'Хөвөн' },
  { value: 'polyester', label: 'Полиэстер' },
  { value: 'wool',      label: 'Ноос' },
  { value: 'silk',      label: 'Торго' },
  { value: 'denim',     label: 'Деним' },
  { value: 'linen',     label: 'Зэгс' },
  { value: 'leather',   label: 'Арьс' },
  { value: 'synthetic', label: 'Синтетик' },
  { value: 'mixed',     label: 'Холимог' },
]

export function CategoryFields({ category, register, watch, setValue }: Props) {
  if (category === 'clothing') {
    const size = (watch('category_meta.size') as string) ?? ''
    const color = (watch('category_meta.color') as string) ?? ''
    const gender = (watch('category_meta.gender') as string) ?? ''
    const material = (watch('category_meta.material') as string) ?? ''

    return (
      <div className="space-y-5">
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="Nike, Zara, H&M…" className={cls} />
        </Field>
        <SizeGrid value={size} onChange={v => setValue('category_meta.size', v)} />
        <ColorPicker value={color} onChange={v => setValue('category_meta.color', v)} />
        <ChipPicker
          label="Хүйс"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={v => setValue('category_meta.gender', v)}
        />
        <Field label="Материал">
          <div className="flex flex-wrap gap-2">
            {MATERIAL_OPTIONS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setValue('category_meta.material', material === m.value ? '' : m.value)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  material === m.value
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-foreground hover:border-primary/50',
                ].join(' ')}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
    )
  }

  if (category === 'skincare') {
    const skinType = (watch('category_meta.skin_type') as string) ?? ''
    const usagePct = (watch('category_meta.percent_used') as number) ?? 90
    const isOpened = Boolean(watch('category_meta.is_opened'))

    return (
      <div className="space-y-5">
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="Cetaphil, The Ordinary…" className={cls} />
        </Field>
        <ChipPicker
          label="Арьсны төрөл"
          options={SKIN_TYPES}
          value={skinType}
          onChange={v => setValue('category_meta.skin_type', v)}
        />
        <UsageRing value={usagePct} onChange={v => setValue('category_meta.percent_used', v)} />
        <Field label="Дуусах огноо">
          <input type="date" {...register('category_meta.expiry_date')} className={cls} />
        </Field>
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setValue('category_meta.is_opened', !isOpened)}
        >
          <div
            className={[
              'relative h-6 w-11 rounded-full transition-colors',
              isOpened ? 'bg-primary' : 'bg-muted',
            ].join(' ')}
          >
            <span
              className={[
                'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all',
                isOpened ? 'left-6' : 'left-1',
              ].join(' ')}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Нээгдсэн</p>
            <p className="text-xs text-muted-foreground">Савлагаа нь нээгдсэн эсэх</p>
          </div>
        </div>
      </div>
    )
  }

  if (category === 'makeup') {
    const usagePct = (watch('category_meta.percent_used') as number) ?? 90
    const finishType = (watch('category_meta.finish_type') as string) ?? ''

    return (
      <div className="space-y-5">
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="MAC, NYX, Charlotte Tilbury…" className={cls} />
        </Field>
        <Field label="Shade / Өнгө">
          <input {...register('category_meta.shade')} placeholder="Ruby Red #12, Nude 03…" className={cls} />
        </Field>
        <UsageRing value={usagePct} onChange={v => setValue('category_meta.percent_used', v)} />
        <ChipPicker
          label="Finish"
          options={FINISH_TYPES}
          value={finishType}
          onChange={v => setValue('category_meta.finish_type', v)}
        />
        <Field label="Дуусах огноо">
          <input type="date" {...register('category_meta.expiry_date')} className={cls} />
        </Field>
        <Field label="Ариун цэврийн тэмдэглэл">
          <textarea
            {...register('category_meta.hygiene_note')}
            rows={2}
            placeholder="Спиртэлсэн, давхар хөнгөхгүй…"
            className={`${cls} resize-none`}
          />
        </Field>
      </div>
    )
  }

  if (category === 'accessories') {
    const accessoryType = (watch('category_meta.accessory_type') as string) ?? ''

    return (
      <div className="space-y-5">
        <AccessoryTypePicker
          value={accessoryType}
          onChange={v => setValue('category_meta.accessory_type', v)}
        />
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="Gucci, Louis Vuitton…" className={cls} />
        </Field>
        <Field label="Материал">
          <input {...register('category_meta.material')} placeholder="Жинхэнэ арьс, нийлэг…" className={cls} />
        </Field>
        <Field label="Хэмжээ">
          <input {...register('category_meta.dimensions')} placeholder="30cm × 20cm × 10cm" className={cls} />
        </Field>
      </div>
    )
  }

  if (category === 'perfume') {
    const fragranceType = (watch('category_meta.fragrance_type') as string) ?? ''
    const volumePct = (watch('category_meta.percent_used') as number) ?? 80
    const longevity = (watch('category_meta.longevity') as string) ?? ''

    return (
      <div className="space-y-5">
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="Chanel, Dior, YSL…" className={cls} />
        </Field>
        <ChipPicker
          label="Үнэртний төрөл"
          options={FRAGRANCE_TYPES}
          value={fragranceType}
          onChange={v => setValue('category_meta.fragrance_type', v)}
        />
        <PerfumeBottle value={volumePct} onChange={v => setValue('category_meta.percent_used', v)} />
        <ChipPicker
          label="Тогтворжилт"
          options={LONGEVITY_OPTIONS}
          value={longevity}
          onChange={v => setValue('category_meta.longevity', v)}
        />
      </div>
    )
  }

  if (category === 'instruments') {
    const instrumentType = (watch('category_meta.instrument_type') as string) ?? ''

    return (
      <div className="space-y-5">
        <InstrumentTypePicker
          value={instrumentType}
          onChange={v => setValue('category_meta.instrument_type', v)}
        />
        <Field label="Брэнд">
          <input {...register('category_meta.brand')} placeholder="Fender, Yamaha, Gibson…" className={cls} />
        </Field>
        <Field label="Он">
          <input
            type="number"
            {...register('category_meta.year', { valueAsNumber: true })}
            placeholder="2020"
            className={cls}
          />
        </Field>
        <Field label="Хамааралтай зүйлс">
          <input
            {...register('category_meta.accessories_included')}
            placeholder="Case, cables, strap…"
            className={cls}
          />
        </Field>
        <Field label="Гэмтлийн тэмдэглэл">
          <textarea
            {...register('category_meta.damage_notes')}
            rows={2}
            placeholder="Жижиг зураас, гэмтэл байвал бичнэ үү…"
            className={`${cls} resize-none`}
          />
        </Field>
      </div>
    )
  }

  return null
}
