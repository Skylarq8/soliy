import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'red'
  className?: string
}

const variants = {
  default: 'bg-muted text-muted-foreground',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
