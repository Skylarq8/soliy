import type { UseFormRegister, UseFormWatch } from 'react-hook-form'
import type { Category } from '@swaply/types'

interface Props {
  category: Category
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
}

export function CategoryFields({ category, register, watch }: Props) {
  if (category === 'skincare') return (
    <div className="space-y-4">
      <Field label="Брэнд" {...register('category_meta.brand')} />
      <SelectField label="Арьсны төрөл" options={['oily', 'dry', 'combination', 'sensitive', 'normal']} {...register('category_meta.skin_type')} />
      <div className="space-y-1">
        <label className="text-sm font-medium">Ашигласан %: {watch('category_meta.percent_used') ?? 0}%</label>
        <input type="range" min={0} max={100} {...register('category_meta.percent_used', { valueAsNumber: true })} className="w-full accent-primary" />
      </div>
      <Field label="Дуусах огноо" type="date" {...register('category_meta.expiry_date')} />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" {...register('category_meta.is_opened')} className="accent-primary w-4 h-4" />
        Нээгдсэн?
      </label>
    </div>
  )

  if (category === 'clothing') return (
    <div className="space-y-4">
      <Field label="Брэнд" {...register('category_meta.brand')} />
      <Field label="Хэмжээ (дотоодын)" placeholder="M / 38 / XL" {...register('category_meta.size_local')} />
      <Field label="Хэмжээ (олон улсын)" placeholder="EU 38 / US 8" {...register('category_meta.size_intl')} />
      <SelectField label="Материал" options={['cotton', 'polyester', 'wool', 'silk', 'denim', 'linen', 'synthetic', 'mixed']} {...register('category_meta.material')} />
    </div>
  )

  if (category === 'makeup') return (
    <div className="space-y-4">
      <Field label="Брэнд" {...register('category_meta.brand')} />
      <Field label="Өнгө / Shade" {...register('category_meta.shade')} />
      <Field label="Формула" placeholder="Matte / Gloss / Serum" {...register('category_meta.formula_type')} />
      <div className="space-y-1">
        <label className="text-sm font-medium">Ашигласан %</label>
        <input type="range" min={0} max={100} {...register('category_meta.percent_used', { valueAsNumber: true })} className="w-full accent-primary" />
      </div>
      <TextareaField label="Ариун цэврийн тэмдэглэл" placeholder="Спиртэлсэн, давхар хөнгөхгүй…" {...register('category_meta.hygiene_note')} />
    </div>
  )

  if (category === 'accessories') return (
    <div className="space-y-4">
      <Field label="Брэнд" {...register('category_meta.brand')} />
      <Field label="Материал" {...register('category_meta.material')} />
      <Field label="Хэмжээ" placeholder="30cm x 20cm x 10cm" {...register('category_meta.dimensions')} />
      <SelectField label="Фурнитурын байдал" options={['mint', 'good', 'fair', 'worn']} {...register('category_meta.hardware_condition')} />
    </div>
  )

  return null
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  )
}

function SelectField({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        {...props}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        <option value="">Сонгох…</option>
        {options.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  )
}

function TextareaField({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
      />
    </div>
  )
}
