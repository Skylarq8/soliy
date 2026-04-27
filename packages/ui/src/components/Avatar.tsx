import React from 'react'

interface AvatarProps {
  src?: string | null
  nickname: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }

export function Avatar({ src, nickname, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={nickname}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center font-semibold text-violet-700 dark:text-violet-300 ${className}`}>
      {nickname[0].toUpperCase()}
    </div>
  )
}
