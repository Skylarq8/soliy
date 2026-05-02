import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'clothing',
    name: 'Хувцас',
    sub: 'Дээд, доод, гадуур хувцас',
    count: '12,400+',
    icon: '👗',
    accent: 'bg-violet-500',
    hoverTint: 'bg-violet-500/10',
    href: '/explore?category=clothing',
  },
  {
    id: 'skincare',
    name: 'Гоо сайхан',
    sub: 'Сэрүүм, чийгшүүлэгч, SPF',
    count: '5,800+',
    icon: '✨',
    accent: 'bg-violet-500',
    hoverTint: 'bg-violet-500/10',
    href: '/explore?category=skincare',
  },
  {
    id: 'fragrance',
    name: 'Үнэртэн',
    sub: 'Нич, дизайнер, винтаж',
    count: '3,200+',
    icon: '🌸',
    accent: 'bg-violet-500',
    hoverTint: 'bg-violet-500/10',
    href: '/explore?category=fragrance',
  },
  {
    id: 'accessories',
    name: 'Аксессуар',
    sub: 'Гоёл, цүнх, нарны шил',
    count: '8,900+',
    icon: '💎',
    accent: 'bg-violet-500',
    hoverTint: 'bg-violet-500/10',
    href: '/explore?category=accessories',
  },
]

export function CategoriesSection() {
  return (
    <section className="py-14 md:py-20 bg-card">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">
              АНГИЛАЛ СУДЛАХ
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Таны хүссэн зүйлийг олоорой
            </h2>
          </div>
          <Link
            href="/explore"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0 ml-4"
          >
            Бүх ангилал харах <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-2 p-5"
            >
              {/* Colored accent bar — top */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${cat.accent}`} />

              {/* Hover tint overlay */}
              <div className={`absolute inset-0 ${cat.hoverTint} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Icon */}
              <span className="relative z-10 text-4xl md:text-5xl select-none">
                {cat.icon}
              </span>

              {/* Name */}
              <h3 className="relative z-10 text-foreground text-base md:text-base lg:text-lg font-bold text-center leading-tight">
                {cat.name}
              </h3>

              {/* Sub */}
              <p className="relative z-10 text-muted-foreground text-xs md:text-xs text-center leading-snug px-1">
                {cat.sub}
              </p>

              {/* Count + arrow */}
              <div className="relative z-10 flex items-center gap-1 text-muted-foreground text-xs md:text-xs font-semibold mt-1">
                <span>{cat.count} бараа</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile see all link */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/explore" className="text-sm font-semibold text-primary">
            Бүх ангилал харах →
          </Link>
        </div>
      </div>
    </section>
  )
}
