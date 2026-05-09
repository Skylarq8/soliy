'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, GripVertical, ImageIcon } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function ImageUploader({ value, onChange, maxFiles = 8 }: Props) {
  const [dragging, setDragging]   = useState(false)
  const [dragOver, setDragOver]   = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef                   = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)

    const newUrls: string[] = []
    for (const file of Array.from(files).slice(0, maxFiles - value.length)) {
      if (!file.type.startsWith('image/')) continue
      const url = URL.createObjectURL(file)
      newUrls.push(url)
    }

    onChange([...value, ...newUrls])
    setUploading(false)
  }, [value, onChange, maxFiles])

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  function moveLeft(i: number) {
    if (i === 0) return
    const arr = [...value]
    ;[arr[i-1], arr[i]] = [arr[i], arr[i-1]]
    onChange(arr)
  }

  function moveRight(i: number) {
    if (i === value.length - 1) return
    const arr = [...value]
    ;[arr[i], arr[i+1]] = [arr[i+1], arr[i]]
    onChange(arr)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Product Photos
        </label>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {value.length}/{maxFiles}
        </span>
      </div>

      {/* Upload zone */}
      {value.length < maxFiles && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
          className={[
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            dragging
              ? 'border-violet-500 bg-violet-500/8'
              : 'border-[hsl(var(--border))] hover:border-violet-500/50 hover:bg-[hsl(var(--surface))]',
          ].join(' ')}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={[
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              dragging ? 'bg-violet-500/15' : 'bg-[hsl(var(--surface))]',
            ].join(' ')}>
              <Upload className={`w-5 h-5 ${dragging ? 'text-violet-400' : 'text-[hsl(var(--muted-foreground))]'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {dragging ? 'Drop photos here' : 'Upload photos'}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Drag &amp; drop or click · JPG, PNG, WEBP · Max 8 photos
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={url + i} className="relative group rounded-xl overflow-hidden bg-[hsl(var(--surface))] border border-[hsl(var(--border))] aspect-square">
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveLeft(i)}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors text-xs"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-white" strokeWidth={3} />
                </button>
                {i < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveRight(i)}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors text-xs"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Cover badge */}
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-violet-600/90 text-[10px] font-semibold text-white">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
