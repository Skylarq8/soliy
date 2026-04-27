import Link from 'next/link'

const FEED = [
  { user: 'alex_styles', avatar: 'А', color: 'bg-blue-500', action: 'Өвлийн куртка болон гутлыг солилцлоо', type: 'Солилцоо', typeCls: 'bg-primary/10 text-primary', ago: '2м' },
  { user: 'beauty.mira', avatar: 'Б', color: 'bg-teal-500', action: 'Шинэ арьс засалын багц нэмлээ', type: 'Шинэ', typeCls: 'bg-green-100 text-green-700', ago: '5м' },
  { user: 'sneakerhead.jo', avatar: 'С', color: 'bg-orange-500', action: 'Air Max гуталыг 120,000₮-д зарлаа', type: 'Зарлаа', typeCls: 'bg-amber-100 text-amber-700', ago: '8м' },
  { user: 'luxe.maria', avatar: 'Л', color: 'bg-purple-500', action: 'Цүнх + 20,000₮-г пальто-д солилцлоо', type: 'Солилцоо', typeCls: 'bg-primary/10 text-primary', ago: '12м' },
  { user: 'denim.kai', avatar: 'Д', color: 'bg-slate-500', action: 'Винтаж жинс куртка нэмлээ', type: 'Шинэ', typeCls: 'bg-green-100 text-green-700', ago: '15м' },
  { user: 'parfum.bella', avatar: 'П', color: 'bg-pink-500', action: 'Chanel No.5 үнэртэнг 95,000₮-д зарлаа', type: 'Зарлаа', typeCls: 'bg-amber-100 text-amber-700', ago: '20м' },
  { user: 'vintage.gems', avatar: 'В', color: 'bg-yellow-600', action: 'Алтан гинжийг цаг болгон солилцлоо', type: 'Солилцоо', typeCls: 'bg-primary/10 text-primary', ago: '25м' },
  { user: 'style.nova', avatar: 'Н', color: 'bg-rose-500', action: 'Нарны шилний коллекц нэмлээ', type: 'Шинэ', typeCls: 'bg-green-100 text-green-700', ago: '30м' },
]

const STATS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    bg: 'bg-primary/10 text-primary',
    value: '1,247',
    label: 'Өнөөдрийн солилцоо',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    bg: 'bg-teal-500/10 text-teal-600',
    value: '3,892',
    label: 'Идэвхтэй жагсаалт',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    bg: 'bg-amber-500/10 text-amber-600',
    value: '892',
    label: 'Өнөөдөр шинэ',
  },
]

export function LiveActivitySection() {
  return (
    <section className="py-14 md:py-20 bg-card">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold tracking-widest text-green-600 uppercase">
                Шууд үйл ажиллагаагаа
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
              Жинхэнэ хүмүүс,{' '}
              <span className="text-accent">жинхэнэ солилцоо.</span>
            </h2>

            <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
              Swaply дээр одоо болж байгаа зүйлийг харах. Өдөр бүр мянга мянган солилцоо, жагсаалт, хэлцэл явагддаг.
            </p>

            <div className="flex flex-col gap-3">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Live Feed */}
          <div className="flex-1 w-full bg-background rounded-2xl border border-border overflow-hidden shadow-card">
            {/* Feed header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold text-sm text-foreground">Шууд мэдээлэл</span>
              </div>
              <span className="text-xs text-muted-foreground">Сая шинэчлэгдлээ</span>
            </div>

            {/* Feed items */}
            <div className="divide-y divide-border">
              {FEED.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">@{item.user}</span>{' '}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.typeCls}`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.ago}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* View all */}
            <div className="px-5 py-4 border-t border-border">
              <Link
                href="/explore"
                className="block text-center text-sm font-semibold text-primary hover:underline"
              >
                Бүх идэвхжилийг харах →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
