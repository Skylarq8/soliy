'use client'

import { useEffect } from 'react'

let lockCount = 0
let scrollY = 0
let previousBodyStyles: Partial<CSSStyleDeclaration> = {}

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof window === 'undefined') return

    lockCount += 1

    if (lockCount === 1) {
      scrollY = window.scrollY
      previousBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      }

      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)

      if (lockCount === 0) {
        document.body.style.overflow = previousBodyStyles.overflow ?? ''
        document.body.style.position = previousBodyStyles.position ?? ''
        document.body.style.top = previousBodyStyles.top ?? ''
        document.body.style.width = previousBodyStyles.width ?? ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [locked])
}
