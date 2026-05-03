import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="py-14 md:py-20 overflow-hidden bg-gradient-to-br from-violet-100/80 via-white to-teal-50/80 dark:from-[#0a1628] dark:via-[#0d2438] dark:to-[#091e18]">
      {/* Glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-400/30 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-teal-400/30 rounded-full blur-[120px] opacity-40 pointer-events-none" />

      {/* Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.15),transparent_40%)] pointer-events-none" />
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
              { value: '50К+',  label: 'Идэвхтэй хэрэглэгч' },
              { value: '200К+', label: 'Нийтлэгдсэн бараа' },
              { value: '4.9★',  label: 'Дундаж үнэлгээ' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — decorative mock UI */}
        <div className="flex-1 flex flex-col items-center gap-4 pt-2 lg:pt-6">

          {/* Swap Protected badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm text-xs font-medium text-foreground whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Swap Protected
          </div>

          {/* Cards + swap center row */}
          <div className="w-full max-w-lg flex gap-3 items-stretch">

            {/* Card 1 */}
            <div className="group flex-1 min-w-0 flex flex-col bg-card rounded-2xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <div className="relative overflow-hidden flex-shrink-0 h-32 sm:h-52">
                <img
                  src="https://i.pinimg.com/1200x/dd/a4/b8/dda4b8d9db65a71b788fb130e402b87e.jpg"
                  alt="Oversized Hoodie"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-0.5 sm:gap-1">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    СОЛИХ
                  </span>
                </div>
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">Oversized Hoodie</p>
                <p className="text-base font-extrabold text-primary mt-1">85,000₮</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">Б</div>
                    <span className="text-xs text-muted-foreground truncate">@bold</span>
                    <svg className="w-3 h-3 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs text-yellow-500 font-medium flex-shrink-0">⭐ 4.9</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">2 цаг өмнө</p>
              </div>
            </div>

            {/* Swap center */}
            <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-extrabold whitespace-nowrap">
                + 40,000₮
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex-1 min-w-0 flex flex-col bg-card rounded-2xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <div className="relative overflow-hidden flex-shrink-0 h-32 sm:h-52">
                <img
                  src="https://i.pinimg.com/736x/29/56/dc/2956dc4256ab83324d95c0fbf92883cd.jpg"
                  alt="Air Max Sneakers"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">Air Max Sneakers</p>
                <p className="text-base font-extrabold text-primary mt-1">125,000₮</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">Б</div>
                    <span className="text-xs text-muted-foreground truncate">@bataa</span>
                  </div>
                  <span className="text-xs text-yellow-500 font-medium flex-shrink-0">⭐ 5.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">5 цаг өмнө</p>
              </div>
            </div>
          </div>

          {/* Notification */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-card rounded-xl shadow-sm border border-border">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              Б
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Санал зөвшөөрөгдлөө! 🎉</p>
              <p className="text-[10px] text-muted-foreground">Төлбөр хадгалагдаж байна</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
