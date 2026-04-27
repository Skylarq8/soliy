interface Props {
  label: string
  value: number | null
  icon: string
  color?: 'default' | 'amber' | 'violet' | 'emerald'
}

const colors = {
  default: 'border-border',
  amber:   'border-amber-500/50 bg-amber-500/5',
  violet:  'border-violet-500/50 bg-violet-500/5',
  emerald: 'border-emerald-500/50 bg-emerald-500/5',
}

export function StatsCard({ label, value, icon, color = 'default' }: Props) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
