import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

const variantClasses: Record<Variant, string> = {
  default: 'bg-zinc-500/12 text-zinc-300 border-zinc-500/25',
  success: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/12 text-amber-400 border-amber-500/25',
  danger:  'bg-red-500/12 text-red-400 border-red-500/25',
  info:    'bg-cyan-500/12 text-cyan-400 border-cyan-500/25',
  purple:  'bg-violet-500/12 text-violet-400 border-violet-500/25',
  muted:   'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
}

interface BadgeProps {
  variant?: Variant
  className?: string
  children: React.ReactNode
  dot?: boolean
}

export function Badge({ variant = 'default', className, children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            {
              success: 'bg-emerald-400',
              warning: 'bg-amber-400',
              danger:  'bg-red-400',
              info:    'bg-cyan-400',
              purple:  'bg-violet-400',
              default: 'bg-zinc-400',
              muted:   'bg-zinc-500',
            }[variant]
          )}
        />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: Variant; label: string }> = {
    active:    { variant: 'success', label: 'Active' },
    approved:  { variant: 'success', label: 'Approved' },
    completed: { variant: 'success', label: 'Completed' },
    pending:   { variant: 'warning', label: 'Pending' },
    countered: { variant: 'warning', label: 'Countered' },
    swapped:   { variant: 'info',    label: 'Swapped' },
    accepted:  { variant: 'info',    label: 'Accepted' },
    sold:      { variant: 'purple',  label: 'Sold' },
    rejected:  { variant: 'danger',  label: 'Rejected' },
    declined:  { variant: 'danger',  label: 'Declined' },
    archived:  { variant: 'muted',   label: 'Archived' },
  }
  const { variant, label } = map[status] ?? { variant: 'default' as Variant, label: status }
  return <Badge variant={variant} dot>{label}</Badge>
}
