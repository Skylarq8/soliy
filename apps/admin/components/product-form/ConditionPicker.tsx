'use client'
import { Sparkles, Star, ThumbsUp, AlertCircle } from 'lucide-react'

const CONDITIONS = [
  {
    value: 'new',
    label: 'New',
    description: 'Never used, tags on',
    icon: Sparkles,
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-500/12 border-emerald-500/40',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  },
  {
    value: 'like_new',
    label: 'Like New',
    description: 'Used once or twice',
    icon: Star,
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/12 border-cyan-500/40',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.2)]',
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Normal wear, good shape',
    icon: ThumbsUp,
    color: 'text-violet-400',
    activeBg: 'bg-violet-500/12 border-violet-500/40',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.2)]',
  },
  {
    value: 'used',
    label: 'Used',
    description: 'Visible wear, still works',
    icon: AlertCircle,
    color: 'text-amber-400',
    activeBg: 'bg-amber-500/12 border-amber-500/40',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  },
] as const

type Condition = typeof CONDITIONS[number]['value']

interface Props {
  value: Condition | ''
  onChange: (v: Condition) => void
}

export function ConditionPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Condition</label>
      <div className="grid grid-cols-2 gap-2">
        {CONDITIONS.map(c => {
          const isActive = value === c.value
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange(c.value)}
              className={[
                'flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all duration-150',
                isActive
                  ? `${c.activeBg} ${c.glow}`
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))] hover:border-[hsl(var(--muted-foreground))/40]',
              ].join(' ')}
            >
              <c.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? c.color : 'text-[hsl(var(--muted-foreground))]'}`} strokeWidth={isActive ? 2 : 1.5} />
              <div>
                <p className={`text-sm font-semibold leading-none mb-0.5 ${isActive ? c.color : 'text-[hsl(var(--foreground))]'}`}>
                  {c.label}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">{c.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
