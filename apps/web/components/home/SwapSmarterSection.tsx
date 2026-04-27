import Link from 'next/link'

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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">

          {/* Card 1 */}
          <div className="w-full sm:w-60 bg-card rounded-2xl shadow-card overflow-hidden border border-border">
            <div className="relative h-48 bg-gradient-to-br from-amber-800 to-stone-900 flex items-center justify-center">
              <span className="text-6xl select-none">👜</span>
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Солих
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/90 text-white text-[10px] font-medium">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Баталгаажсан
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-muted-foreground mb-0.5">Винтаж дизайнер</p>
              <p className="font-bold text-foreground mb-2">Арьсан цүнх</p>
              <p className="text-lg font-extrabold text-primary mb-1">180,000₮</p>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">A</div>
                <p className="text-[11px] text-muted-foreground">@anujin</p>
                <span className="text-yellow-400 text-[11px] ml-auto">⭐ 5.0</span>
              </div>
              <Link
                href="/explore"
                className="block w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Солилцоо санал болгох
              </Link>
            </div>
          </div>

          {/* Swap center */}
          <div className="flex sm:flex-col items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-bold">
                + 20,000₮ нэмэлт
              </span>
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Хоёул зөвшөөрсөн
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-full sm:w-60 bg-card rounded-2xl shadow-card overflow-hidden border border-border">
            <div className="relative h-48 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <span className="text-6xl select-none">🧥</span>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Солих
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[11px] text-muted-foreground mb-0.5">90-ийн үеийн загвар</p>
              <p className="font-bold text-foreground mb-2">Винтаж жинс хүрэм</p>
              <p className="text-lg font-extrabold text-primary mb-1">160,000₮</p>
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">N</div>
                <p className="text-[11px] text-muted-foreground">@nomio</p>
                <span className="text-yellow-400 text-[11px] ml-auto">⭐ 5.0</span>
              </div>
              <Link
                href="/explore"
                className="block w-full py-2 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-semibold text-center hover:bg-accent/10 transition-colors"
              >
                Бараа харах
              </Link>
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
