'use client'

const CLOTHING_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const SHOE_SIZES     = ['35','36','37','38','39','40','41','42','43','44','45','46']

interface Props {
  value: string
  onChange: (v: string) => void
  type?: 'clothing' | 'shoe'
}

export function SizeSelector({ value, onChange, type = 'clothing' }: Props) {
  const sizes = type === 'shoe' ? SHOE_SIZES : CLOTHING_SIZES

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={[
              'w-12 h-10 rounded-xl text-sm font-semibold border transition-all duration-150',
              value === s
                ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_hsl(262_80%_60%_/_0.4)]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-violet-500/40 hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface))]',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Selected: <span className="font-semibold text-violet-400">{value}</span>
        </p>
      )}
    </div>
  )
}
