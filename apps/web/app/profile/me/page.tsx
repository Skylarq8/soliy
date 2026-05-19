'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import type { User, Listing, VerificationStatus } from '@soliy/types'

type Tab = 'active' | 'sold' | 'reviews'
type ListingActionStatus = 'sold' | 'archived'

function ScoreRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(score, 100) / 100)
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-rose-100 dark:text-rose-950" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className="text-rose-400" />
      </svg>
      <span className="text-base font-bold text-rose-500 relative z-10">{score}</span>
    </div>
  )
}

function ManagedListingCard({
  listing,
  tab,
  verificationStatus,
  onEdit,
  onVerify,
  onMarkSold,
  onArchive,
}: {
  listing: Listing
  tab: Tab
  verificationStatus?: VerificationStatus
  onEdit: () => void
  onVerify: () => void
  onMarkSold: () => void
  onArchive: () => void
}) {
  const verification = getVerificationDisplay(listing, verificationStatus)
  const canVerify = tab === 'active' && verification.key !== 'approved' && verification.key !== 'pending'

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-background hover:border-primary/30 transition-colors">
      <Link href={`/listing/${listing.id}`} className="group block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {listing.photos?.[0] ? (
            <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
          <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${verification.className}`}>
            {verification.label}
          </span>
          {listing.swap_enabled && (
            <span className="absolute right-2 top-2 rounded-full border border-primary/40 bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm backdrop-blur">
              Swap
            </span>
          )}
        </div>
      </Link>

      <div className="px-3 pt-3 pb-2.5">
        <Link href={`/listing/${listing.id}`} className="text-sm font-semibold line-clamp-1 hover:text-primary transition-colors">
          {listing.title}
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-rose-500">
            {listing.price ? `${listing.price.toLocaleString()}₮` : 'Swap only'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {listing.swap_enabled ? 'Солих боломжтой' : 'Зөвхөн зарах'}
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        {tab === 'active' ? (
          <>
            <button onClick={onEdit} className="w-full flex items-center justify-center gap-1.5 py-2.5 border-b border-border text-[11px] font-semibold hover:bg-muted/40 transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              Засах
            </button>
            <button
              onClick={onVerify}
              disabled={!canVerify}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-b border-border text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              {verification.buttonLabel}
            </button>
            <div className="grid grid-cols-2 divide-x divide-border">
              <button onClick={onMarkSold} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-emerald-500 hover:bg-emerald-500/5 transition-colors">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Зарагдсан
              </button>
              <button onClick={onArchive} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-500/5 transition-colors">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Устгах
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 divide-x divide-border">
            <button onClick={onEdit} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold hover:bg-muted/40 transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
              Засах
            </button>
            <button onClick={onArchive} className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-500/5 transition-colors">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Устгах
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ListingEditModal({
  title,
  description,
  price,
  photos,
  swapEnabled,
  cashBalanceEnabled,
  saving,
  uploading,
  message,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onPhotosChange,
  onUploadPhotos,
  onReplacePhoto,
  onSwapEnabledChange,
  onCashBalanceEnabledChange,
  onClose,
  onSave,
}: {
  title: string
  description: string
  price: string
  photos: string[]
  swapEnabled: boolean
  cashBalanceEnabled: boolean
  saving: boolean
  uploading: boolean
  message: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onPriceChange: (value: string) => void
  onPhotosChange: (photos: string[]) => void
  onUploadPhotos: (files: FileList | null) => void
  onReplacePhoto: (index: number, file: File | null) => void
  onSwapEnabledChange: (value: boolean) => void
  onCashBalanceEnabledChange: (value: boolean) => void
  onClose: () => void
  onSave: () => void
}) {
  const cleanPrice = price.replace(/[^\d]/g, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[92vh] bg-card rounded-3xl border border-border shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">Бараа засах</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Зураг</p>
                <p className="text-xs text-muted-foreground mt-0.5">{photos.length}/8 зураг. Эхний зураг card дээр харагдана.</p>
              </div>
              <label className={`rounded-xl border border-primary/35 px-3 py-2 text-xs font-semibold text-primary transition-colors ${
                uploading || photos.length >= 8 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-primary/10'
              }`}>
                {uploading ? 'Upload...' : 'Нэмэх'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading || photos.length >= 8}
                  className="sr-only"
                  onChange={e => {
                    onUploadPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <label className={`block rounded-2xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors ${
                uploading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={uploading}
                  className="sr-only"
                  onChange={e => {
                    onUploadPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
                <p className="text-sm font-semibold">{uploading ? 'Зураг upload хийж байна...' : 'Зураг сонгох'}</p>
                <p className="mt-1 text-xs text-muted-foreground">Бараанд хамгийн багадаа 1 зураг хэрэгтэй</p>
              </label>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-muted ${
                      index === 0 ? 'col-span-2 row-span-2 aspect-square border-primary/45' : 'aspect-square border-border'
                    }`}
                  >
                    <img src={photo} alt={`Барааны зураг ${index + 1}`} className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                        Гол зураг
                      </span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => onPhotosChange([photo, ...photos.filter((_, i) => i !== index)])}
                          className="rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm"
                        >
                          Гол
                        </button>
                      )}
                      <label className="cursor-pointer rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                        Солих
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploading}
                          className="sr-only"
                          onChange={e => {
                            onReplacePhoto(index, e.target.files?.[0] ?? null)
                            e.target.value = ''
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => onPhotosChange(photos.filter((_, i) => i !== index))}
                        className="rounded-full bg-red-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Нэр</label>
            <input
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              placeholder="Барааны нэр"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Үнэ</label>
            <div className="relative">
              <input
                value={cleanPrice ? Number(cleanPrice).toLocaleString() : ''}
                onChange={e => onPriceChange(e.target.value)}
                inputMode="numeric"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₮</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Тайлбар</label>
            <textarea
              value={description}
              onChange={e => onDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
              placeholder="Товч тайлбар"
            />
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <h3 className="text-sm font-semibold">Солилцооны тохиргоо</h3>
            <div className="mt-4 space-y-3">
              <ToggleRow
                title="Солих зөвшөөрнө"
                caption="Ижил үнэтэй зүйлтэй солих"
                checked={swapEnabled}
                onChange={checked => onSwapEnabledChange(checked)}
              />
              <ToggleRow
                title="Мөнгө нэмэх зөвшөөрнө"
                caption="Үнийн зөрүүг нөхөх санал авах"
                checked={cashBalanceEnabled}
                disabled={!swapEnabled}
                onChange={checked => onCashBalanceEnabledChange(checked)}
              />
              <ToggleRow
                title="Зөвхөн худалдах"
                caption="Солилцоо авахгүй"
                checked={!swapEnabled}
                onChange={checked => onSwapEnabledChange(!checked)}
              />
            </div>
          </div>

          {message && <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30">{message}</p>}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">
            Болих
          </button>
          <button
            onClick={onSave}
            disabled={saving || uploading || title.trim().length < 3 || photos.length < 1}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  caption,
  checked,
  disabled,
  onChange,
}: {
  title: string
  caption: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl px-3 py-2 text-left transition-colors ${
        disabled ? 'opacity-50' : 'hover:bg-muted/50'
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{caption}</span>
      </span>
      <span className={`relative h-7 w-12 flex-shrink-0 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}

function VerificationModal({
  listing,
  tier,
  saving,
  message,
  onTierChange,
  onClose,
  onSubmit,
}: {
  listing: Listing
  tier: 1 | 2
  saving: boolean
  message: string
  onTierChange: (tier: 1 | 2) => void
  onClose: () => void
  onSubmit: (data: { photos: string[]; serialNumber: string; receiptUrl?: string; certificateUrl?: string }) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [verifyPhotos, setVerifyPhotos] = useState<string[]>(
    () => listing.photos?.filter(Boolean).slice(0, 6) ?? []
  )
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [serialNumber, setSerialNumber] = useState('')
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<'receipt' | 'certificate' | null>(null)

  const progress = Math.round((step / 3) * 100)

  async function uploadMorePhoto(files: FileList | null) {
    if (!files?.length || verifyPhotos.length >= 6) return
    setUploadingPhoto(true)
    try {
      const toUpload = Array.from(files).slice(0, 6 - verifyPhotos.length)
      const uploaded: string[] = []
      for (const file of toUpload) {
        const { image } = await api.uploads.image(file) as { image: { url: string } }
        uploaded.push(image.url)
      }
      setVerifyPhotos(prev => [...prev, ...uploaded])
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function uploadDocFile(type: 'receipt' | 'certificate', file: File) {
    setUploadingDoc(type)
    try {
      const { image } = await api.uploads.image(file) as { image: { url: string } }
      if (type === 'receipt') setReceiptUrl(image.url)
      else setCertificateUrl(image.url)
    } finally {
      setUploadingDoc(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pb-24 sm:pb-4">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          ) : (
            <div className="w-8 shrink-0" />
          )}
          <div className="flex-1 text-center">
            <p className="font-bold text-base">
              {step === 1 ? 'Баталгаажуулалт' : step === 2 ? 'Зураг оруулах' : 'Баримт оруулах'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-muted-foreground">{step}/3 алхам</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3 space-y-4">

          {/* ── Step 1: Choose type ── */}
          {step === 1 && (
            <>
              <div>
                <p className="font-semibold text-base">Баталгаажуулалтын төрөл сонгох</p>
                <p className="text-sm text-muted-foreground mt-0.5">Барааны ангилалд тохирох баталгаа сонгоно уу</p>
              </div>
              <div className="space-y-3">
                {([
                  {
                    t: 1 as const,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    ),
                    title: 'Платформын баталгаа',
                    desc: 'Зураг, баримтаар онлайн шалгуулах',
                    time: '24–48 цаг',
                  },
                  {
                    t: 2 as const,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                      </svg>
                    ),
                    title: 'Биет баталгаа',
                    desc: 'Дусал цэгт авчрах — Premium бараа',
                    time: 'Тохиролцооноор',
                  },
                ] as const).map(({ t, icon, title, desc, time }) => (
                  <button
                    key={t}
                    onClick={() => onTierChange(t)}
                    className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                      tier === t
                        ? 'border-primary/70 bg-primary/10'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tier === t ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold">{title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="text-[11px] text-muted-foreground">{time}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        tier === t ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {tier === t && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 2: Photos ── */}
          {step === 2 && (
            <>
              <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/40 px-4 py-3">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Шаардлагатай зургууд:</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Урд, хойд, бүх өнгөөс + лейбл/тэмдгийн зураг</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {verifyPhotos.map((photo, i) => (
                  <div key={`${photo}-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400/60 bg-muted">
                    <img src={photo} alt="" className="h-full w-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => setVerifyPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {verifyPhotos.length < 6 && (
                  <label className={`aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 transition-colors ${
                    uploadingPhoto ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingPhoto}
                      className="sr-only"
                      onChange={e => { uploadMorePhoto(e.target.files); e.target.value = '' }}
                    />
                    {uploadingPhoto
                      ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      : (
                        <>
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          <span className="text-[10px] text-muted-foreground font-medium">Нэмэх</span>
                        </>
                      )
                    }
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{verifyPhotos.length}/6 зураг оруулсан</p>
            </>
          )}

          {/* ── Step 3: Documents ── */}
          {step === 3 && (
            <>
              <div>
                <p className="font-semibold text-base">Баримт болон мэдээлэл</p>
                <p className="text-xs text-muted-foreground mt-0.5">Доорх мэдээллүүд баталгаажуулалтыг хурдасгана</p>
              </div>
              <div className="space-y-3">
                {/* Receipt */}
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Худалдааны баримт / чек</p>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Заавал биш</span>
                  </div>
                  {receiptUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0">
                        <img src={receiptUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => setReceiptUrl(null)} className="text-xs text-red-500 hover:underline">Устгах</button>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 transition-colors ${
                      uploadingDoc === 'receipt' ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:bg-muted/30'
                    }`}>
                      <input type="file" accept="image/*" disabled={!!uploadingDoc} className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadDocFile('receipt', f); e.target.value = '' }} />
                      {uploadingDoc === 'receipt'
                        ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        : (
                          <>
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-xs text-muted-foreground font-medium">Файл оруулах</span>
                          </>
                        )
                      }
                    </label>
                  )}
                </div>

                {/* Serial number */}
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Серийн дугаар / barcode</p>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Заавал биш</span>
                  </div>
                  <input
                    value={serialNumber}
                    onChange={e => setSerialNumber(e.target.value)}
                    placeholder="SN-2024-XXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>

                {/* Certificate */}
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Үнэт зүйлийн гэрчилгээ</p>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Заавал биш</span>
                  </div>
                  {certificateUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0">
                        <img src={certificateUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => setCertificateUrl(null)} className="text-xs text-red-500 hover:underline">Устгах</button>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 transition-colors ${
                      uploadingDoc === 'certificate' ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:bg-muted/30'
                    }`}>
                      <input type="file" accept="image/*" disabled={!!uploadingDoc} className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadDocFile('certificate', f); e.target.value = '' }} />
                      {uploadingDoc === 'certificate'
                        ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        : (
                          <>
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-xs text-muted-foreground font-medium">Файл оруулах</span>
                          </>
                        )
                      }
                    </label>
                  )}
                </div>
              </div>
              {message && <p className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30">{message}</p>}
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 pt-3 border-t border-border">
          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
              disabled={step === 2 && verifyPhotos.length === 0}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {step === 1 ? 'Үргэлжлүүлэх' : 'Дараагийн алхам'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => onSubmit({ photos: verifyPhotos, serialNumber, receiptUrl: receiptUrl ?? undefined, certificateUrl: certificateUrl ?? undefined })}
              disabled={saving || verifyPhotos.length === 0}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? 'Илгээж байна...' : (
                <>
                  Илгээх
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  variant,
  loading,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel: string
  variant: 'danger' | 'success'
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="px-6 pt-7 pb-6 text-center">
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="py-4 text-sm font-semibold hover:bg-muted/40 transition-colors disabled:opacity-50"
          >
            Болих
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`py-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
              variant === 'danger'
                ? 'text-red-500 hover:bg-red-500/5'
                : 'text-emerald-500 hover:bg-emerald-500/5'
            }`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function getVerificationDisplay(listing: Listing, status?: VerificationStatus) {
  const key = listing.verified ? 'approved' : status

  if (key === 'approved') {
    return {
      key,
      label: 'Баталгаатай',
      buttonLabel: 'Баталгаатай',
      className: 'bg-emerald-500 text-white',
    }
  }

  if (key === 'pending') {
    return {
      key,
      label: 'Хүлээгдэж байна',
      buttonLabel: 'Хүлээгдэж',
      className: 'bg-amber-500 text-white',
    }
  }

  if (key === 'rejected') {
    return {
      key,
      label: 'Дахин илгээх',
      buttonLabel: 'Дахин',
      className: 'bg-red-500 text-white',
    }
  }

  return {
    key: undefined,
    label: 'Баталгаагүй',
    buttonLabel: 'Баталгаажуулах',
    className: 'bg-background/90 text-muted-foreground border border-border',
  }
}

function getListingMeta(listing: Listing | null): Record<string, unknown> {
  const meta = listing?.category_meta
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {}
  return meta as Record<string, unknown>
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-amber-400' : 'text-muted-foreground/30'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-sm font-semibold ml-0.5">{value.toFixed(1)}</span>
    </div>
  )
}

export default function MyProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [tab, setTab] = useState<Tab>('active')
  const [listings, setListings] = useState<Listing[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [soldCount, setSoldCount] = useState(0)
  const [swapEnabledCount, setSwapEnabledCount] = useState(0)
  const [verificationStatuses, setVerificationStatuses] = useState<Record<string, VerificationStatus | undefined>>({})
  const [reviewAvg, setReviewAvg] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // edit state
  const [editing, setEditing] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // listing management state
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [listingTitle, setListingTitle] = useState('')
  const [listingDescription, setListingDescription] = useState('')
  const [listingPrice, setListingPrice] = useState('')
  const [listingPhotos, setListingPhotos] = useState<string[]>([])
  const [listingSwapEnabled, setListingSwapEnabled] = useState(true)
  const [listingCashBalanceEnabled, setListingCashBalanceEnabled] = useState(false)
  const [listingSaving, setListingSaving] = useState(false)
  const [listingUploading, setListingUploading] = useState(false)
  const [listingMsg, setListingMsg] = useState('')
  const [verifyingListing, setVerifyingListing] = useState<Listing | null>(null)
  const [verifyTier, setVerifyTier] = useState<1 | 2>(1)
  const [verifySaving, setVerifySaving] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')
  const [confirmState, setConfirmState] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'danger' | 'success'
    loading: boolean
    onConfirm: () => Promise<void>
  } | null>(null)

  useLockBodyScroll(Boolean(editing || editingListing || verifyingListing || confirmState))

  async function fetchVerificationStatuses(rows: Listing[]) {
    if (rows.length === 0) return

    const entries = await Promise.all(rows.map(async listing => {
      try {
        const res = await api.verify.status(listing.id) as { verification?: { status?: VerificationStatus } | null }
        return [listing.id, listing.verified ? 'approved' : res.verification?.status] as const
      } catch {
        return [listing.id, listing.verified ? 'approved' : undefined] as const
      }
    }))

    setVerificationStatuses(prev => ({ ...prev, ...Object.fromEntries(entries) }))
  }

  async function loadListingsForTab(nextTab = tab) {
    if (!user || nextTab === 'reviews') return

    const query = supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const { data } = nextTab === 'active'
      ? await query.eq('status', 'active')
      : await query.in('status', ['swapped', 'sold'])

    const rows = data ?? []
    setListings(rows)
    if (nextTab === 'active') {
      setActiveCount(rows.length)
      setSwapEnabledCount(rows.filter(l => l.swap_enabled).length)
      fetchVerificationStatuses(rows)
    }
  }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const uid = session.user.id
      setEmail(session.user.email ?? '')

      const [
        { data: profile },
        { data: activeListings },
        { count: soldCnt },
        { data: reviews },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', uid).single(),
        supabase.from('listings').select('*').eq('user_id', uid).eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', uid).in('status', ['swapped', 'sold']),
        supabase.from('reviews').select('rating').eq('reviewee_id', uid),
      ])

      const activeRows = activeListings ?? []
      setUser(profile)
      setListings(activeRows)
      setActiveCount(activeRows.length)
      setSwapEnabledCount(activeRows.filter(l => l.swap_enabled).length)
      setSoldCount(soldCnt ?? 0)
      fetchVerificationStatuses(activeRows)
      if (reviews && reviews.length > 0) {
        setReviewAvg(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
        setReviewCount(reviews.length)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!user) return
    loadListingsForTab(tab)
  }, [tab, user])

  function openEdit() {
    if (!user) return
    setEditNickname(user.nickname)
    setEditBio(user.bio ?? '')
    setEditEmail(email)
    setAvatarPreview(null)
    setAvatarFile(null)
    setSaveMsg('')
    setEditing(true)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveMsg('')

    try {
      let avatarUrl = user.avatar_url

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      }

      const { data: updated, error: profileErr } = await supabase
        .from('users')
        .update({ nickname: editNickname.trim(), bio: editBio.trim() || null, avatar_url: avatarUrl })
        .eq('id', user.id)
        .select()
        .single()

      if (profileErr) throw profileErr

      if (editEmail.trim() && editEmail.trim() !== email) {
        await supabase.auth.updateUser({ email: editEmail.trim() })
        setSaveMsg('Профайл хадгалагдлаа. Шинэ имэйл рүү баталгаажуулах линк илгээлээ.')
      } else {
        setSaveMsg('Профайл амжилттай хадгалагдлаа.')
      }

      setUser(updated)
      setEmail(editEmail.trim() || email)
      setEditing(false)
    } catch {
      setSaveMsg('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setSaving(false)
    }
  }

  function openListingEdit(listing: Listing) {
    const meta = getListingMeta(listing)
    setEditingListing(listing)
    setListingTitle(listing.title)
    setListingDescription(listing.description ?? '')
    setListingPrice(listing.price ? String(listing.price) : '')
    setListingPhotos(listing.photos ?? [])
    setListingSwapEnabled(listing.swap_enabled)
    setListingCashBalanceEnabled(Boolean(meta.cash_balance_enabled))
    setListingMsg('')
  }

  async function uploadListingPhotos(files: FileList | null) {
    if (!files?.length) return
    setListingUploading(true)
    setListingMsg('')

    try {
      const selected = Array.from(files).slice(0, Math.max(0, 8 - listingPhotos.length))
      const uploaded: string[] = []

      for (const file of selected) {
        const { image } = await api.uploads.image(file) as { image: { url: string } }
        uploaded.push(image.url)
      }

      setListingPhotos(prev => [...prev, ...uploaded])
    } catch (error) {
      setListingMsg(error instanceof Error ? error.message : 'Зураг upload хийхэд алдаа гарлаа.')
    } finally {
      setListingUploading(false)
    }
  }

  async function replaceListingPhoto(index: number, file: File | null) {
    if (!file) return
    setListingUploading(true)
    setListingMsg('')

    try {
      const { image } = await api.uploads.image(file) as { image: { url: string } }
      setListingPhotos(prev => prev.map((photo, i) => i === index ? image.url : photo))
    } catch (error) {
      setListingMsg(error instanceof Error ? error.message : 'Зураг солиход алдаа гарлаа.')
    } finally {
      setListingUploading(false)
    }
  }

  async function handleListingSave() {
    if (!user || !editingListing) return

    const normalizedPrice = listingPrice.replace(/[^\d]/g, '')
    if (listingPhotos.length < 1) {
      setListingMsg('Хамгийн багадаа нэг зураг үлдээнэ үү.')
      return
    }

    setListingSaving(true)
    setListingMsg('')

    try {
      const meta = getListingMeta(editingListing)
      const updateBody = {
        title: listingTitle.trim(),
        description: listingDescription.trim() || null,
        price: normalizedPrice ? Number(normalizedPrice) : null,
        photos: listingPhotos,
        swap_enabled: listingSwapEnabled,
        category_meta: {
          ...meta,
          cash_balance_enabled: listingSwapEnabled && listingCashBalanceEnabled,
        },
      }

      const { data, error } = await supabase
        .from('listings')
        .update(updateBody)
        .eq('id', editingListing.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setListings(prev => prev.map(item => item.id === editingListing.id ? data : item))
      if (editingListing.swap_enabled !== data.swap_enabled) {
        setSwapEnabledCount(count => Math.max(0, count + (data.swap_enabled ? 1 : -1)))
      }
      setEditingListing(null)
    } catch {
      setListingMsg('Барааны мэдээлэл хадгалахад алдаа гарлаа.')
    } finally {
      setListingSaving(false)
    }
  }

  function updateListingStatus(listing: Listing, nextStatus: ListingActionStatus) {
    if (!user) return
    const isSold = nextStatus === 'sold'
    setConfirmState({
      title: isSold ? 'Зарагдсан болгох уу?' : 'Устгах уу?',
      message: isSold
        ? `"${listing.title}" барааг зарагдсан гэж тэмдэглэх үү?`
        : `"${listing.title}" зарыг бүрмөсөн устгах уу?`,
      confirmLabel: isSold ? 'Тийм, зарагдсан' : 'Устгах',
      variant: isSold ? 'success' : 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmState(s => s && { ...s, loading: true })
        const { error } = await supabase
          .from('listings')
          .update({ status: nextStatus })
          .eq('id', listing.id)
          .eq('user_id', user.id)
        if (error) {
          setConfirmState(s => s && { ...s, loading: false })
          return
        }
        setConfirmState(null)
        setListings(prev => prev.filter(item => item.id !== listing.id))
        if (tab === 'active') {
          setActiveCount(count => Math.max(0, count - 1))
          if (listing.swap_enabled) setSwapEnabledCount(count => Math.max(0, count - 1))
        }
        if (isSold) setSoldCount(count => count + 1)
      },
    })
  }

  function openVerification(listing: Listing) {
    setVerifyingListing(listing)
    setVerifyTier(1)
    setVerifyMsg('')
  }

  async function handleVerifySubmit(data: { photos: string[]; serialNumber: string; receiptUrl?: string; certificateUrl?: string }) {
    if (!verifyingListing) return

    if (data.photos.length === 0) {
      setVerifyMsg('Эхлээд бараандаа дор хаяж нэг зураг нэмээрэй.')
      return
    }

    setVerifySaving(true)
    setVerifyMsg('')

    try {
      await api.verify.submit({
        listing_id: verifyingListing.id,
        tier: verifyTier,
        photos: data.photos,
      })
      setVerificationStatuses(prev => ({ ...prev, [verifyingListing.id]: 'pending' }))
      setVerifyingListing(null)
    } catch (error) {
      setVerifyMsg(error instanceof Error ? error.message : 'Баталгаажуулах хүсэлт илгээхэд алдаа гарлаа.')
    } finally {
      setVerifySaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="text-4xl">👤</div>
        <h2 className="text-xl font-bold">Нэвтрэх шаардлагатай</h2>
        <p className="text-sm text-muted-foreground text-center">Профайлаа харахын тулд нэвтэрнэ үү</p>
        <Link href="/auth/login" className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          Нэвтрэх
        </Link>
      </div>
    )
  }

  const initial = user.nickname[0].toUpperCase()
  const displayName = user.name?.trim() || user.nickname
  const isTopSeller = user.swap_count >= 20
  const trustLabel = user.safe_score >= 80 ? 'Итгэлтэй хэрэглэгч' : user.safe_score >= 50 ? 'Хэвийн хэрэглэгч' : 'Шинэ хэрэглэгч'
  const avatarSrc = avatarPreview ?? user.avatar_url

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-[1480px] mx-auto px-4 md:px-6 pt-6">

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-bold text-lg">Профайл засах</h2>
                <button onClick={() => setEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <button onClick={() => fileRef.current?.click()} className="relative group">
                    {avatarSrc ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
                        <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center ring-4 ring-primary/20">
                        <span className="text-3xl font-bold text-white">{initial}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground">Зургаа дарж солих</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                {/* Nickname */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Нэрхэн</label>
                  <input
                    value={editNickname}
                    onChange={e => setEditNickname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    placeholder="nickname"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Танилцуулга</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none"
                    placeholder="Өөрийгөө товч танилцуул..."
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Имэйл хаяг</label>
                  <input
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    type="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    placeholder="email@example.com"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Имэйл солиход баталгаажуулах линк илгээнэ</p>
                </div>

                {saveMsg && (
                  <p className={`text-xs px-3 py-2 rounded-lg ${saveMsg.includes('Алдаа') ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-green-50 text-green-700 dark:bg-green-950/30'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted/50 transition-colors">
                  Болих
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editNickname.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingListing && (
          <ListingEditModal
            title={listingTitle}
            description={listingDescription}
            price={listingPrice}
            photos={listingPhotos}
            swapEnabled={listingSwapEnabled}
            cashBalanceEnabled={listingCashBalanceEnabled}
            saving={listingSaving}
            uploading={listingUploading}
            message={listingMsg}
            onTitleChange={setListingTitle}
            onDescriptionChange={setListingDescription}
            onPriceChange={setListingPrice}
            onPhotosChange={setListingPhotos}
            onUploadPhotos={uploadListingPhotos}
            onReplacePhoto={replaceListingPhoto}
            onSwapEnabledChange={setListingSwapEnabled}
            onCashBalanceEnabledChange={setListingCashBalanceEnabled}
            onClose={() => setEditingListing(null)}
            onSave={handleListingSave}
          />
        )}

        {verifyingListing && (
          <VerificationModal
            listing={verifyingListing}
            tier={verifyTier}
            saving={verifySaving}
            message={verifyMsg}
            onTierChange={setVerifyTier}
            onClose={() => setVerifyingListing(null)}
            onSubmit={handleVerifySubmit}
          />
        )}

        {confirmState && (
          <ConfirmModal
            title={confirmState.title}
            message={confirmState.message}
            confirmLabel={confirmState.confirmLabel}
            variant={confirmState.variant}
            loading={confirmState.loading}
            onConfirm={confirmState.onConfirm}
            onClose={() => setConfirmState(null)}
          />
        )}

        {/* Desktop: 2-column, Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8">

          {/* LEFT SIDEBAR */}
          <div className="space-y-4">
            {/* Avatar + name */}
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center gap-3 text-center">
              <div className="relative">
                {avatarSrc ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-background shadow-md">
                    <Image src={avatarSrc} alt={user.nickname} width={96} height={96} className="object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center ring-4 ring-background shadow-md">
                    <span className="text-3xl font-bold text-white">{initial}</span>
                  </div>
                )}
                {user.is_admin && (
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                    <svg className="w-3.5 h-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">@{user.nickname}</p>
                {user.bio && <p className="text-sm text-muted-foreground mt-0.5">{user.bio}</p>}
                <p className="text-xs text-muted-foreground/70 mt-1">{email}</p>
              </div>

              <button
                onClick={openEdit}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
                Профайл засах
              </button>
            </div>

            {/* Score + rating */}
            <div className="bg-card rounded-2xl border border-border px-5 py-4 flex items-center gap-4">
              <ScoreRing score={user.safe_score} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{user.safe_score} оноо</p>
                <p className="text-xs text-rose-400 font-medium">{trustLabel}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col items-end gap-1">
                <StarRating value={reviewAvg || 0} />
                <p className="text-xs text-muted-foreground">{reviewCount} үнэлгээ</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl border border-border px-4 py-4 grid grid-cols-3 divide-x divide-border">
              <div className="text-center">
                <p className="text-2xl font-bold">{user.swap_count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Гүйлгээ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Идэвхтэй</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{swapEnabledCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Swap</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 text-sm text-primary font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
                </svg>
                Баталгаатай
              </span>
              {isTopSeller && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/60 text-sm text-amber-500 font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                  </svg>
                  Top Seller
                </span>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Зар нэмэх', href: '/listing/new', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )},
                { label: 'Солилцоо', href: '/messages', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                )},
                { label: 'Дуртай', href: '/saved', icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )},
              ].map(({ label, href, icon }) => (
                <Link key={label} href={href} className="bg-card rounded-2xl border border-border p-3 flex flex-col items-center gap-2 hover:bg-muted/40 active:scale-95 transition-all">
                  <span className="text-primary">{icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>

            {/* Sign out — desktop only */}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}
              className="hidden lg:block w-full py-2.5 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Гарах
            </button>
          </div>

          {/* RIGHT — Tabs + listings */}
          <div className="mt-4 lg:mt-0 space-y-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex border-b border-border">
                {([
                  ['active', `Идэвхтэй (${activeCount})`],
                  ['sold', `Зарагдсан (${soldCount})`],
                  ['reviews', `Үнэлгээ (${reviewCount})`],
                ] as [Tab, string][]).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                      tab === t ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {tab === 'reviews' ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Одоогоор үнэлгээ байхгүй байна</p>
                ) : listings.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-muted-foreground text-sm">Зар байхгүй байна</p>
                    {tab === 'active' && (
                      <Link href="/listing/new" className="inline-block text-xs text-primary hover:underline">
                        + Зар нэмэх
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {listings.map(l => (
                      <ManagedListingCard
                        key={l.id}
                        listing={l}
                        tab={tab}
                        verificationStatus={verificationStatuses[l.id]}
                        onEdit={() => openListingEdit(l)}
                        onVerify={() => openVerification(l)}
                        onMarkSold={() => updateListingStatus(l, 'sold')}
                        onArchive={() => updateListingStatus(l, 'archived')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sign out — mobile only */}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.replace('/auth/login') }}
              className="lg:hidden w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Гарах
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
