import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

type Color = 'default' | 'violet' | 'emerald' | 'amber' | 'cyan' | 'red'

const colorMap: Record<Color, { bg: string; icon: string; glow: string; border: string }> = {
  default: {
    bg:    'bg-[hsl(var(--surface))]',
    icon:  'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--surface-raised))]',
    glow:  '',
    border:'border-[hsl(var(--border))]',
  },
  violet: {
    bg:    'bg-violet-500/5',
    icon:  'text-violet-400 bg-violet-500/10',
    glow:  'shadow-[0_0_20px_hsl(262_80%_60%_/_0.12)]',
    border:'border-violet-500/20',
  },
  emerald: {
    bg:    'bg-emerald-500/5',
    icon:  'text-emerald-400 bg-emerald-500/10',
    glow:  'shadow-[0_0_20px_hsl(158_60%_48%_/_0.12)]',
    border:'border-emerald-500/20',
  },
  amber: {
    bg:    'bg-amber-500/5',
    icon:  'text-amber-400 bg-amber-500/10',
    glow:  'shadow-[0_0_20px_hsl(38_90%_52%_/_0.12)]',
    border:'border-amber-500/20',
  },
  cyan: {
    bg:    'bg-cyan-500/5',
    icon:  'text-cyan-400 bg-cyan-500/10',
    glow:  'shadow-[0_0_20px_hsl(201_90%_52%_/_0.12)]',
    border:'border-cyan-500/20',
  },
  red: {
    bg:    'bg-red-500/5',
    icon:  'text-red-400 bg-red-500/10',
    glow:  '',
    border:'border-red-500/20',
  },
}

interface StatsCardProps {
  label: string
  value: number | null | undefined
  icon: LucideIcon
  color?: Color
  trend?: number
  sublabel?: string
}

export function StatsCard({ label, value, icon: Icon, color = 'default', trend, sublabel }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className={`rounded-2xl border p-5 transition-all ${c.bg} ${c.border} ${c.glow} hover:scale-[1.01] duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={1.75} style={{ width: '18px', height: '18px' }} />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
        {formatNumber(value)}
      </p>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
      {sublabel && (
        <p className="text-xs text-[hsl(var(--foreground-subtle,var(--muted-foreground)))] mt-0.5 opacity-60">
          {sublabel}
        </p>
      )}
    </div>
  )
}
