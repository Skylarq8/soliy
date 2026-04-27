import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'clothing',
    name: 'Хувцас',
    sub: 'Дээд, доод, гадуур хувцас',
    count: '12,400+',
    icon: '👗',
    gradient: 'from-gray-800 via-gray-700 to-gray-900',
    href: '/explore?category=clothing',
  },
  {
    id: 'skincare',
    name: 'Арьс засал',
    sub: 'Сэрүүм, чийгшүүлэгч, SPF',
    count: '5,800+',
    icon: '✨',
    gradient: 'from-amber-800 via-stone-700 to-amber-900',
    href: '/explore?category=skincare',
  },
  {
    id: 'fragrance',
    name: 'Үнэртэн',
    sub: 'Нич, дизайнер, винтаж',
    count: '3,200+',
    icon: '🌸',
    gradient: 'from-blue-800 via-indigo-700 to-blue-900',
    href: '/explore?category=fragrance',
  },
  {
    id: 'accessories',
    name: 'Аксессуар',
    sub: 'Гоёл, цүнх, нарны шил',
    count: '8,900+',
    icon: '💎',
    gradient: 'from-stone-500 via-neutral-600 to-stone-700',
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative rounded-2xl overflow-hidden h-72 lg:h-96 bg-gradient-to-br hover:shadow-card-hover transition-shadow"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />

              {/* Shine overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity" />

              {/* Icon box */}
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-lg">
                {cat.icon}
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-xl md:text-2xl font-extrabold leading-tight">
                  {cat.name}
                </h3>
                <p className="text-white/70 text-xs mt-0.5 mb-3">{cat.sub}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/90 text-xs font-medium">
                  {cat.count} бараа
                </span>
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
