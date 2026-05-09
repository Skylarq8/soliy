'use client'
import { Check } from 'lucide-react'

const PALETTE = [
  { label: 'Black',       hex: '#111111' },
  { label: 'White',       hex: '#F5F5F5' },
  { label: 'Gray',        hex: '#9CA3AF' },
  { label: 'Cream',       hex: '#FFF8E7' },
  { label: 'Beige',       hex: '#D4B896' },
  { label: 'Brown',       hex: '#7C4F2A' },
  { label: 'Red',         hex: '#EF4444' },
  { label: 'Pink',        hex: '#F472B6' },
  { label: 'Orange',      hex: '#F97316' },
  { label: 'Yellow',      hex: '#FCD34D' },
  { label: 'Lime',        hex: '#84CC16' },
  { label: 'Green',       hex: '#10B981' },
  { label: 'Teal',        hex: '#14B8A6' },
  { label: 'Cyan',        hex: '#22D3EE' },
  { label: 'Blue',        hex: '#3B82F6' },
  { label: 'Indigo',      hex: '#6366F1' },
  { label: 'Violet',      hex: '#8B5CF6' },
  { label: 'Purple',      hex: '#A855F7' },
  { label: 'Rose',        hex: '#FB7185' },
  { label: 'Gold',        hex: '#D97706' },
  { label: 'Navy',        hex: '#1E3A5F' },
  { label: 'Olive',       hex: '#6B7C31' },
  { label: 'Maroon',      hex: '#800020' },
  { label: 'Multi',       hex: 'linear-gradient(135deg,#EF4444,#3B82F6,#10B981,#FCD34D)' },
]

function isLight(hex: string): boolean {
  if (hex.startsWith('linear')) return false
  const h = hex.replace('#','')
  const r = parseInt(h.substr(0,2),16)
  const g = parseInt(h.substr(2,2),16)
  const b = parseInt(h.substr(4,2),16)
  return (r*299 + g*587 + b*114) / 1000 > 128
}

interface Props {
  value: string
  onChange: (v: string) => void
}

export function ColorSwatch({ value, onChange }: Props) {
  const selected = PALETTE.find(c => c.label === value)

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Color</label>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map(c => {
          const active = value === c.label
          const light  = isLight(c.hex)
          const isGrad = c.hex.startsWith('linear')

          return (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => onChange(c.label)}
              className={[
                'w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center',
                active
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--background))] scale-110'
                  : 'hover:scale-110 hover:ring-1 hover:ring-white/40',
                c.hex === '#F5F5F5' || c.hex === '#FFF8E7' ? 'border border-[hsl(var(--border))]' : '',
              ].join(' ')}
              style={{ background: isGrad ? c.hex : c.hex }}
            >
              {active && (
                <Check
                  className="w-3.5 h-3.5"
                  strokeWidth={3}
                  style={{ color: light ? '#000' : '#fff' }}
                />
              )}
            </button>
          )
        })}
      </div>
      {value && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Selected: <span className="font-semibold text-[hsl(var(--foreground))]">{value}</span>
        </p>
      )}
    </div>
  )
}
