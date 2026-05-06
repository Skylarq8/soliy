'use client'

import { type CSSProperties, type ElementType, type ReactNode, useEffect, useRef, useState } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

type ScrollRevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
  once?: boolean
  style?: CSSProperties
}

const hiddenTransforms: Record<Direction, string> = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: '-translate-x-8',
  right: 'translate-x-8',
  none: '',
}

export function ScrollReveal({
  children,
  as,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 650,
  once = true,
  style,
}: ScrollRevealProps) {
  const Comp = as ?? 'div'
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    if (prefersReducedMotion) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShown(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setShown(false)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  const motionClass = shown
    ? 'translate-x-0 translate-y-0 opacity-100'
    : `opacity-0 ${hiddenTransforms[direction]}`

  return (
    <Comp
      ref={ref}
      className={`transform-gpu transition-all ease-out will-change-transform ${motionClass} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms`, transitionDuration: `${duration}ms` }}
    >
      {children}
    </Comp>
  )
}
