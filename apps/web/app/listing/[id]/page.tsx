import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { Listing } from '@swaply/types'
import { ProposalButton } from '@/components/swap/ProposalButton'
import { ImageGallery } from '@/components/listing/ImageGallery'
import { SimilarListings } from '@/components/listing/SimilarListings'
import { BackButton } from '@/components/shared/BackButton'

async function getListing(id: string): Promise<Listing | null> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('listings')
    .select('*, users!listings_user_id_fkey(nickname, avatar_url, safe_score, swap_count)')
    .eq('id', id)
    .single()
  return data as Listing | null
}

const CONDITION_LABELS: Record<number, string> = {
  1: 'Муу', 2: 'Дунд', 3: 'Сайн', 4: 'Маш сайн', 5: 'Шинэ'
}

function MetaChip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-border bg-card ${className}`}>
      {children}
    </span>
  )
}

function UsageRingSVG({ value }: { value: number }) {
  const RADIUS = 38
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const clamped = Math.max(0, Math.min(100, value))
  const offset = CIRCUMFERENCE * (1 - clamped / 100)
  const color = clamped >= 70 ? '#4ade80' : clamped >= 40 ? '#fb923c' : clamped >= 20 ? '#f97316' : '#ef4444'
  const label = clamped >= 80 ? 'Бараг шинэ' : clamped >= 50 ? 'Дундаас дээш' : clamped >= 20 ? 'Дунджаас доош' : 'Их хэрэглэсэн'

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none" style={{ color }}>{clamped}</span>
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground">Үлдсэн хэмжээ</p>
      </div>
    </div>
  )
}

function PerfumeBottleSVG({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const fillHeight = (clamped / 100) * 64
  const fillY = 94 - fillHeight
  const color = clamped >= 60 ? '#a855f7' : clamped >= 30 ? '#ec4899' : '#f43f5e'
  const label = clamped >= 80 ? 'Бараг дүүрэн' : clamped >= 50 ? 'Хагасаас дээш' : clamped >= 20 ? 'Бага үлдсэн' : 'Бараг дуусcан'

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card">
      <svg viewBox="0 0 60 120" width="52" height="104" className="flex-shrink-0">
        <defs>
          <linearGradient id="detail-pf-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <clipPath id="detail-pf-c">
            <rect x="10" y="30" width="40" height="66" rx="6" />
          </clipPath>
        </defs>
        <rect x="18" y="6" width="24" height="10" rx="3" fill="#9ca3af" />
        <rect x="22" y="15" width="16" height="16" rx="2" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        <rect x="10" y="30" width="40" height="66" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
        <rect x="10" y={fillY} width="40" height={fillHeight} rx="6"
          fill="url(#detail-pf-g)" clipPath="url(#detail-pf-c)" />
        <rect x="15" y="35" width="5" height="20" rx="2.5" fill="white" opacity="0.2" />
      </svg>
      <div>
        <p className="text-2xl font-bold leading-none mb-1" style={{ color }}>{clamped}%</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

const PRESET_COLOR_MAP: Record<string, { label: string; hex: string }> = {
  black:  { label: 'Хар',        hex: '#1c1c1e' },
  white:  { label: 'Цагаан',     hex: '#e8e8e0' },
  gray:   { label: 'Саарал',     hex: '#8e8e93' },
  beige:  { label: 'Бэйж',       hex: '#d4b896' },
  brown:  { label: 'Бор',        hex: '#8b5e3c' },
  navy:   { label: 'Хар цэнхэр', hex: '#1d3461' },
  blue:   { label: 'Цэнхэр',    hex: '#3b82f6' },
  green:  { label: 'Ногоон',     hex: '#22c55e' },
  red:    { label: 'Улаан',      hex: '#ef4444' },
  pink:   { label: 'Ягаан',      hex: '#ec4899' },
  yellow: { label: 'Шар',        hex: '#eab308' },
  purple: { label: 'Нил ягаан',  hex: '#a855f7' },
}

const ACCESSORY_TYPE_MAP: Record<string, string> = {
  ring: '💍 Бөгж', necklace: '📿 Зүүлт', bracelet: '🔗 Браслет',
  earrings: '✨ Ээмэг', watch: '⌚ Цаг', bag: '👜 Цүнх',
  belt: '🪢 Бүс', hat: '🧢 Малгай', sunglasses: '🕶️ Нарны шил',
  wallet: '👛 Түрийвч', scarf: '🧣 Дурдгар', other: '🛍️ Бусад',
}

const FRAGRANCE_MAP: Record<string, string> = {
  floral: '🌸 Цэцэгт', woody: '🌲 Модон', oriental: '🏮 Дорнод',
  fresh: '🍃 Свеж', citrus: '🍋 Жүрж', aquatic: '💧 Усан',
  gourmand: '🍫 Солодтой', chypre: '🪨 Шипр',
}

const INSTRUMENT_TYPE_MAP: Record<string, string> = {
  guitar: '🎸 Гитар', bass: '🎸 Басс', keyboard: '🎹 Клавиш',
  piano: '🎹 Хуур', drums: '🥁 Бөмбөр', violin: '🎻 Хийл',
  cello: '🎻 Чело', trumpet: '🎺 Бүрээ', saxophone: '🎷 Саксофон',
  flute: '🪈 Лимбэ', ukulele: '🪗 Укулеле', synthesizer: '🎛️ Синтезатор',
  other: '🎵 Бусад',
}

const SKIN_TYPE_MAP: Record<string, string> = {
  all: '✨ Бүх', dry: '🌵 Хуурай', oily: '💧 Тослог',
  combination: '🌗 Холимог', sensitive: '🌸 Мэдрэмтгий', normal: '☀️ Энгийн',
}

const FINISH_TYPE_MAP: Record<string, string> = {
  matte: 'Матт', glossy: 'Гялалзсан', satin: 'Сатин',
  shimmer: 'Гялбаатай', metallic: 'Металл', natural: 'Байгалийн',
}

const LONGEVITY_MAP: Record<string, string> = {
  '1-3h': '1–3 цаг', '3-6h': '3–6 цаг', '6-8h': '6–8 цаг', '8h+': '8+ цаг',
}

const GENDER_MAP: Record<string, string> = {
  women: '👩 Эмэгтэй', men: '👨 Эрэгтэй', unisex: '🧑 Хоёулаа', kids: '🧒 Хүүхэд',
}

const MATERIAL_MN: Record<string, string> = {
  cotton: 'Хөвөн', polyester: 'Полиэстер', wool: 'Ноос', silk: 'Торго',
  denim: 'Деним', linen: 'Зэгс', leather: 'Арьс', synthetic: 'Синтетик', mixed: 'Холимог',
}

function CategoryDetails({ category, meta }: { category: string; meta: Record<string, any> | null }) {
  if (!meta) return null

  if (category === 'clothing') {
    const size = meta.size ?? meta.size_local ?? meta.size_intl
    const colorEntry = meta.color ? PRESET_COLOR_MAP[meta.color as string] : null
    return (
      <div className="flex flex-wrap gap-2">
        {size && (
          <MetaChip className="border-primary/20 bg-primary-light text-primary font-bold">
            Хэмжээ: {size}
          </MetaChip>
        )}
        {colorEntry ? (
          <MetaChip>
            <span className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ background: colorEntry.hex }} />
            {colorEntry.label}
          </MetaChip>
        ) : meta.color ? (
          <MetaChip>{meta.color as string}</MetaChip>
        ) : null}
        {meta.gender && GENDER_MAP[meta.gender as string] && (
          <MetaChip>{GENDER_MAP[meta.gender as string]}</MetaChip>
        )}
        {meta.material && (
          <MetaChip>🧵 {MATERIAL_MN[meta.material as string] ?? (meta.material as string)}</MetaChip>
        )}
      </div>
    )
  }

  if (category === 'skincare' || category === 'makeup') {
    const usagePct = meta.percent_used as number | undefined
    return (
      <div className="space-y-3">
        {usagePct != null && <UsageRingSVG value={usagePct} />}
        <div className="flex flex-wrap gap-2">
          {category === 'skincare' && meta.skin_type && (
            <MetaChip>{SKIN_TYPE_MAP[meta.skin_type as string] ?? (meta.skin_type as string)}</MetaChip>
          )}
          {category === 'makeup' && meta.shade && (
            <MetaChip>🎨 {meta.shade as string}</MetaChip>
          )}
          {category === 'makeup' && meta.finish_type && (
            <MetaChip>{FINISH_TYPE_MAP[meta.finish_type as string] ?? (meta.finish_type as string)}</MetaChip>
          )}
          {meta.expiry_date && (
            <MetaChip>📅 {meta.expiry_date as string}</MetaChip>
          )}
          {meta.is_opened === false && (
            <MetaChip className="border-green-200 text-green-700 bg-green-50">✅ Нээгдээгүй</MetaChip>
          )}
          {meta.is_opened === true && (
            <MetaChip className="border-amber-200 text-amber-700 bg-amber-50">📦 Нээгдсэн</MetaChip>
          )}
        </div>
      </div>
    )
  }

  if (category === 'perfume') {
    const volumePct = meta.percent_used as number | undefined
    return (
      <div className="space-y-3">
        {volumePct != null && <PerfumeBottleSVG value={volumePct} />}
        <div className="flex flex-wrap gap-2">
          {meta.fragrance_type && (
            <MetaChip>{FRAGRANCE_MAP[meta.fragrance_type as string] ?? (meta.fragrance_type as string)}</MetaChip>
          )}
          {meta.longevity && (
            <MetaChip>⏱️ {LONGEVITY_MAP[meta.longevity as string] ?? (meta.longevity as string)}</MetaChip>
          )}
        </div>
      </div>
    )
  }

  if (category === 'accessories') {
    return (
      <div className="flex flex-wrap gap-2">
        {meta.accessory_type && (
          <MetaChip className="border-primary/20 bg-primary-light text-primary">
            {ACCESSORY_TYPE_MAP[meta.accessory_type as string] ?? (meta.accessory_type as string)}
          </MetaChip>
        )}
        {meta.material && <MetaChip>🧵 {meta.material as string}</MetaChip>}
        {meta.dimensions && <MetaChip>📐 {meta.dimensions as string}</MetaChip>}
      </div>
    )
  }

  if (category === 'instruments') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {meta.instrument_type && (
            <MetaChip className="border-primary/20 bg-primary-light text-primary font-semibold">
              {INSTRUMENT_TYPE_MAP[meta.instrument_type as string] ?? (meta.instrument_type as string)}
            </MetaChip>
          )}
          {meta.year && <MetaChip>📅 {meta.year as number}</MetaChip>}
        </div>
        {meta.accessories_included && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Хамааралтай:</span> {meta.accessories_included as string}
          </p>
        )}
        {meta.damage_notes && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Гэмтлийн тэмдэглэл:</span> {meta.damage_notes as string}
          </p>
        )}
      </div>
    )
  }

  return null
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const meta = listing.category_meta as Record<string, string | number | boolean> | null
  const brand = meta?.brand as string | undefined
  const percentUsed = meta?.percent_used as number | undefined
  const size = (meta?.size_local ?? meta?.size_intl) as string | undefined

  const tags: string[] = []
  if (size)                                tags.push(`Хэмжээ: ${size}`)
  if (listing.condition && CONDITION_LABELS[listing.condition]) tags.push(CONDITION_LABELS[listing.condition])
  if (percentUsed != null)                 tags.push(`Ноос ${percentUsed}%`)
  if (meta?.is_opened === false)           tags.push('Нээгдээгүй')

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-4 md:px-6 md:py-6">
      <div className="mb-4">
        <BackButton fallbackHref="/explore" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,464px)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,464px)_minmax(0,1fr)_208px]">
        {/* Left: image gallery */}
        <ImageGallery photos={listing.photos} title={listing.title} verified={listing.verified} />

        {/* Center: details */}
        <div className="min-w-0">
          {brand && (
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
              {brand}
            </p>
          )}
          <h1 className="text-2xl font-bold text-foreground mb-2 leading-snug md:text-3xl">
            {listing.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            {listing.price && (
              <span className="text-2xl font-bold text-price">
                {listing.price.toLocaleString()}₮
              </span>
            )}
            {listing.swap_enabled && (
              <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
                Солих боломжтой
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-muted text-sm text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* Category-specific details */}
          {meta && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Бараа дэлгэрэнгүй
              </p>
              <CategoryDetails category={listing.category} meta={meta} />
            </div>
          )}

          {/* Seller */}
          {listing.users && (
            <Link
              href={`/profile/${listing.users.nickname}`}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="w-11 h-11 rounded-full bg-primary-light border border-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {listing.users.nickname[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{listing.users.nickname}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3 h-3 ${s <= Math.round(listing.users!.safe_score ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-muted fill-muted'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(listing.users.safe_score ?? 0).toFixed(1)} · {listing.users.swap_count} гүйлгээ
                  </span>
                </div>
              </div>
              {listing.verified && (
                <span className="hidden items-center gap-1 rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-xs font-medium text-primary sm:flex">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Итгэлтэй
                </span>
              )}
            </Link>
          )}

          {/* Action buttons */}
          <ProposalButton listing={listing} />
        </div>

        {/* Right: similar items — desktop only */}
        <div className="hidden xl:block">
          <SimilarListings category={listing.category} excludeId={listing.id} />
        </div>
      </div>
    </div>
  )
}
