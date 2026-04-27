import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="py-14 md:py-20 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left — text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Хэрэглэхгүй зүйлсээ үнэ цэн болгож солилц
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-5">
            <span className="text-foreground">Стилээ шинэчил.</span>
            <br />
            <span className="text-accent">Мөнгөө хэмнэе.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
            Баталгаажсан хэрэглэгчидтэй хувцас, гоо сайхны бараагаа аюулгүй арилжаалаарай.
            Хувцас, гоо сайхны бүтээгдэхүүн, үнэртэн, аксессуар — солих, худалдах, зарах.
          </p>

          <div className="flex gap-3 flex-wrap justify-center lg:justify-start mb-10">
            <Link
              href="/listing/new"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              Солилцоог эхлэх <span aria-hidden>→</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center px-7 py-3 rounded-full border-2 border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
            >
              Бараа харах
            </Link>
          </div>

          <div className="flex gap-8 justify-center lg:justify-start">
            {[
              { value: '50К+', label: 'Идэвхтэй хэрэглэгч' },
              { value: '200К+', label: 'Нийтлэгдсэн бараа' },
              { value: '4.9★', label: 'Дундаж үнэлгээ' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — decorative mock UI */}
        <div className="flex-1 hidden lg:flex justify-center items-start pt-6 relative">
          <div className="relative w-full max-w-md">

            {/* Swap Protected badge */}
            <div className="absolute -top-4 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-card text-xs font-medium text-foreground">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Swap Protected
            </div>

            {/* Cards + swap button row */}
            <div className="flex gap-3 items-end">

              {/* Card 1 */}
              <div className="flex-1 bg-card rounded-2xl shadow-card-hover overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                  <span className="text-6xl select-none">🧥</span>
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">СОЛИХ</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-white text-[10px] font-medium">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      Баталгаа
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">Oversized Hoodie</p>
                  <p className="text-base font-bold text-primary mt-0.5">$45</p>
                  <p className="text-[11px] text-muted-foreground mt-1">⭐ 4.9 · @styling.alex</p>
                </div>
              </div>

              {/* Swap center */}
              <div className="flex flex-col items-center gap-2 pb-14 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <div className="px-2 py-1 rounded-full bg-card border border-accent/30 text-accent text-[11px] font-bold whitespace-nowrap">
                  + $20
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex-1 bg-card rounded-2xl shadow-card-hover overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-6xl select-none">👟</span>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">ХАЛУУН 🔥</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">Air Max Sneakers</p>
                  <p className="text-base font-bold text-primary mt-0.5">$65</p>
                  <p className="text-[11px] text-muted-foreground mt-1">⭐ 5.0 · @sneakerhead.jo</p>
                </div>
              </div>
            </div>

            {/* Offer accepted notification */}
            <div className="absolute -bottom-3 left-2 flex items-center gap-2.5 px-4 py-2.5 bg-card rounded-xl shadow-card-hover border border-border">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                М
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Санал зөвшөөрөгдлөо! 🎉</p>
                <p className="text-[10px] text-muted-foreground">Төлбөр хадгалагдаж байна</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
