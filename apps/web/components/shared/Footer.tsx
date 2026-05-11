import Link from 'next/link'

const LINKS = {
  'БҮТЭЭГДЭХҮҮН': [
    { label: 'Бараа хайх', href: '/explore' },
    { label: 'Зар нэмэх', href: '/listing/new' },
    { label: 'Хэрхэн ажилладаг', href: '/#how-it-works' },
    { label: 'Үнэлгээ', href: '/pricing' },
  ],
  'КОМПАНИ': [
    { label: 'Бидний тухай', href: '/about' },
    { label: 'Ажил хайх', href: '/careers' },
    { label: 'Хэвлэл мэдээлэл', href: '/press' },
    { label: 'Блог', href: '/blog' },
  ],
  'ТУСЛАМЖ': [
    { label: 'Тусламжийн төв', href: '/help' },
    { label: 'Бидэнтэй холбоо барих', href: '/contact' },
    { label: 'Аюулгүй байдлын зөвлөмж', href: '/safety' },
    { label: 'Асуудал мэдэгдэх', href: '/report' },
  ],
  'ХУУЛИЙН МЭДЭЭЛЭЛ': [
    { label: 'Үйлчилгээний нөхцөл', href: '/terms' },
    { label: 'Нууцлалын бодлого', href: '/privacy' },
    { label: 'Cookie бодлого', href: '/cookies' },
    { label: 'Escrow нөхцөл', href: '/escrow-terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0f0f17] text-white/70">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 pt-12 pb-6">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-10 border-b border-white/10">

          {/* Brand col */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-white">Soliy</span>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Загвар болон гоо сайхны барааг солих, зарах, мөнгөн нэмэлттэй тохиролцох ухаалаг платформ.
            </p>

            {/* Social links */}
            <div className="flex gap-3 mb-6">
              {[
                { label: 'Сайт', icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                )},
                { label: 'Instagram', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                )},
                { label: 'Discord', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                  </svg>
                )},
              ].map(s => (
                <button
                  key={s.label}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  {s.icon}
                </button>
              ))}
            </div>

            {/* Mobile App */}
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
              <svg className="w-5 h-5 text-white/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <div>
                <p className="text-[10px] text-white/40 leading-none">Удахгүй гарах</p>
                <p className="text-sm font-semibold text-white leading-tight">Мобайл апп</p>
              </div>
            </div>
          </div>

          {/* Nav cols */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">{heading}</p>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-white/30 order-2 sm:order-1">
            © 2026 Soliy, Inc. Бүх эрх хуулиар хамгаалагдсан.
          </p>

          <div className="flex items-center gap-5 order-1 sm:order-2">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Нууцлал</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Нөхцөл</Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white/70 transition-colors">Cookie</Link>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 order-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[11px] text-green-400 font-medium">Бүх системүүд ажиллаж байна</span>
          </div>
        </div>
      </div>

      {/* Mobile spacer for BottomNav */}
      <div className="h-20 md:hidden" />
    </footer>
  )
}
