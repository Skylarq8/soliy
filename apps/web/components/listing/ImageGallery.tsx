'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  photos: string[]
  title: string
  verified?: boolean
}

export function ImageGallery({ photos, title, verified }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex w-full flex-col-reverse gap-3 md:w-auto md:flex-row md:flex-shrink-0">
      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex w-full gap-2 overflow-x-auto pb-1 md:w-16 md:flex-col md:overflow-visible md:pb-0">
          {photos.slice(0, 5).map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                active === i ? 'border-primary' : 'border-transparent'
              }`}
              type="button"
              aria-label={`Зураг ${i + 1}`}
            >
              <Image src={url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-muted aspect-[4/5] sm:aspect-[3/4] md:w-96 md:flex-shrink-0">
        {photos[active] ? (
          <Image src={photos[active]} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {verified && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/85 backdrop-blur-sm text-xs font-medium text-primary border border-primary/20 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Платформын баталгаа
            </span>
          </div>
        )}

        {/* Dot indicators (mobile-style) */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {photos.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? 'bg-card' : 'bg-card/50'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
