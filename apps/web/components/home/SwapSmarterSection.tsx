const FEATURES = [
  {
    emoji: '🤝',
    title: 'Харилцан тохиролцоо',
    desc: 'Аль аль тал тохирохоосоо өмнө ямар ч гүйлгээ хийгддэггүй',
  },
  {
    emoji: '💰',
    title: 'Уян хатан үнэ',
    desc: 'Үнийн зөрүүг нохцлохын тулд мөнгөн нэмэлт хийх боломжтой',
  },
  {
    emoji: '🛡️',
    title: 'Escrow хамгаалалт',
    desc: 'Хүргэлт баталгаажих хүртэл хөрөнгийг аюулгүй хадгалдаг',
  },
]

export function SwapSmarterSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">
            SWAPLY АРГА
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
            Зөвхөн худалдаж авдаг биш —{' '}
            <span className="text-accent">Ухаалгаар солилцоорой</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Хэрэггүй болсон зүйлсийг хүссэн зүйлдээ солилцоорой. Үнийн зөрүүд мөнгөн нэмэлт хийгээрэй. Хоёул ялна.
          </p>
        </div>

        {/* Swap demo cards */}
        <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-6 mb-12 max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto w-full">

          {/* Card 1 — Can Swap · Verified seller */}
          <div className="group flex-1 min-w-0 flex flex-col bg-card rounded-2xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="relative overflow-hidden flex-shrink-0 h-36 sm:h-64 lg:h-80">
              <img
                src="https://i.pinimg.com/webp/736x/83/6a/e9/836ae9f91b683c50c4dea5e2a400f4f6.webp"
                alt="Арьсан цүнх"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* СОЛИХ badge — single primary badge */}
              <div className="absolute top-1.5 left-1.5">
                <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] lg:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  СОЛИХ
                </span>
              </div>
              {/* Verified — compact green circle icon only */}
              <div className="absolute top-1.5 right-1.5">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
              <p className="hidden sm:block text-[11px] lg:text-sm text-muted-foreground mb-0.5">Винтаж дизайнер</p>
              <p className="text-sm sm:text-sm lg:text-lg font-bold text-foreground line-clamp-2 leading-snug">Арьсан цүнх</p>
              <p className="text-base sm:text-lg lg:text-2xl font-extrabold text-primary mt-1 lg:mt-1">180,000₮</p>
              <div className="mt-auto pt-3 lg:pt-4">
                <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] lg:text-xs font-bold text-primary flex-shrink-0">А</div>
                  <span className="text-xs lg:text-sm text-muted-foreground truncate">@anujin</span>
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs lg:text-sm text-yellow-500 font-medium ml-auto flex-shrink-0">⭐ 5.0</span>
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">1 өдрийн өмнө</p>
              </div>
            </div>
          </div>

          {/* Swap center — stronger, glowing */}
          <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="w-11 h-11 sm:w-14 sm:h-14 lg:w-[4.5rem] lg:h-[4.5rem] rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-primary/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-1">
              <span className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs lg:text-sm font-extrabold whitespace-nowrap">
                + 20,000₮ нэмэлт
              </span>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Хоёул зөвшөөрсөн
              </div>
            </div>
            <span className="sm:hidden px-2 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-extrabold whitespace-nowrap">
              +20,000₮
            </span>
          </div>

          {/* Card 2 — Can Swap · NOT verified */}
          <div className="group flex-1 min-w-0 flex flex-col bg-card rounded-2xl shadow-card overflow-hidden border border-border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="relative overflow-hidden flex-shrink-0 h-36 sm:h-64 lg:h-80">
              <img
                src="https://i.pinimg.com/736x/4e/3a/19/4e3a196668d458ec7ac6fa7643a29607.jpg"
                alt="Винтаж жинс хүрэм"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* СОЛИХ badge */}
              <div className="absolute top-1.5 left-1.5">
                <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] lg:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  СОЛИХ
                </span>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
              <p className="hidden sm:block text-[11px] lg:text-sm text-muted-foreground mb-0.5">90-ийн үеийн загвар</p>
              <p className="text-sm sm:text-sm lg:text-lg font-bold text-foreground line-clamp-2 leading-snug">Винтаж жинс хүрэм</p>
              <p className="text-base sm:text-lg lg:text-2xl font-extrabold text-primary mt-1 lg:mt-1">160,000₮</p>
              <div className="mt-auto pt-3 lg:pt-4">
                <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                  <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-muted flex items-center justify-center text-[10px] lg:text-xs font-bold text-muted-foreground flex-shrink-0">Н</div>
                  <span className="text-xs lg:text-sm text-muted-foreground truncate">@nomio</span>
                  <span className="text-xs lg:text-sm text-yellow-500 font-medium ml-auto flex-shrink-0">⭐ 4.8</span>
                </div>
                <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">3 өдрийн өмнө</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-card border border-border rounded-2xl p-6 text-center">
              <span className="text-3xl mb-3 block">{f.emoji}</span>
              <h3 className="font-bold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
