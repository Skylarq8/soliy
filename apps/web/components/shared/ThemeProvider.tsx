'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  function applyTheme(next: Theme) {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {}
    setTheme(next)
  }

  useEffect(() => {
    let saved: Theme | null = null
    try {
      const stored = localStorage.getItem('theme')
      saved = stored === 'dark' || stored === 'light' ? stored : null
    } catch {}
    const sys = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const current: Theme = document.documentElement.classList.contains('dark') ? 'dark' : sys
    const t = saved ?? current
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])

  function toggle() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    applyTheme(current === 'dark' ? 'light' : 'dark')
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
