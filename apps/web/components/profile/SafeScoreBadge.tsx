interface Props {
  score: number
  className?: string
}

export function SafeScoreBadge({ score, className = '' }: Props) {
  const color = score >= 80
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
    : score >= 50
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    : 'bg-muted text-muted-foreground'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      ★ {score.toFixed(0)}
    </span>
  )
}
