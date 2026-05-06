'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  fallbackHref?: string
  label?: string
}

export function BackButton({ fallbackHref = '/explore', label = 'Буцах' }: Props) {
  const router = useRouter()

  function goBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
      aria-label={label}
    >
      <ArrowLeft size={17} />
      <span>{label}</span>
    </button>
  )
}
