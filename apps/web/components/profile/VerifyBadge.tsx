interface Props {
  tier: number
  className?: string
}

export function VerifyBadge({ tier, className = '' }: Props) {
  if (tier === 0) return null

  return (
    <span
      title={tier === 2 ? 'Биеэр баталгаажсан' : 'Фото баталгаажсан'}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        tier === 2
          ? 'bg-violet-600 text-white'
          : 'bg-emerald-500 text-white'
      } ${className}`}
    >
      {tier === 2 ? '✓✓' : '✓'} Verify
    </span>
  )
}
