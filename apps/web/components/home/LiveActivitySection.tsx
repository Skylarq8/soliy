import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const FEED = [
  { user: 'aminaa', avatar: 'С', color: 'bg-primary', action: 'пальтогоо пүүз + 35,000₮ саналтай солихоор тохирч байна', type: 'Санал', typeCls: 'bg-primary/10 text-primary', state: 'Чат' },
  { user: 'mira', avatar: 'М', color: 'bg-accent', action: 'арьс арчилгааны багцаа үнэртэнтэй солих хүсэлт авлаа', type: 'Шинэ', typeCls: 'bg-green-100 text-green-700', state: 'Хүсэлт' },
  { user: 'temka', avatar: 'Т', color: 'bg-amber-500', action: 'пүүзний үнээ мөнгөн нэмэлттэй саналд нээлттэй болголоо', type: 'Үнэ', typeCls: 'bg-amber-100 text-amber-700', state: 'Нээлттэй' },
  { user: 'anujin', avatar: 'А', color: 'bg-rose-500', action: 'цүнхний зараа зөвхөн баталгаажсан профайлд харагдахаар тохирууллаа', type: 'Итгэл', typeCls: 'bg-primary/10 text-primary', state: 'Баталгаа' },
]

const STATS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    bg: 'bg-primary/10 text-primary',
    value: 'Солих',
    label: 'Бараагаар санал тавих',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    bg: 'bg-teal-500/10 text-teal-600',
    value: 'Нэмэх',
    label: 'Үнийн зөрүүг мөнгөөр тэнцүүлэх',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    bg: 'bg-amber-500/10 text-amber-600',
    value: 'Батлах',
    label: 'Хүлээн авснаа хоёр тал батлах',
  },
]

export function LiveActivitySection() {
  return (
    <section className="py-14 md:py-20 bg-card">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left */}
          <ScrollReveal direction="left" className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-bold tracking-widest text-green-600 uppercase">
                СОЛИЛЦООНЫ УРСГАЛ
              </p>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
              Зүгээр зараад дуусах биш,{' '}
              <span className="text-accent">тохиролцож арилжаална.</span>
            </h2>

            <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
              Санал бүр бараа, мөнгөн нэмэлт, чат, баталгаажуулалттайгаа нэг дор харагдана. Хэрэглэгч тохиролцооны нөхцөлийг эхнээс нь тодорхой ойлгоно.
            </p>

            <div className="flex flex-col gap-3">
              {STATS.map((s, index) => (
                <ScrollReveal
                  key={s.label}
                  direction="up"
                  delay={index * 85}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>

          {/* Right — Live Feed */}
          <ScrollReveal direction="right" delay={100} className="flex-1 w-full bg-background rounded-2xl border border-border overflow-hidden shadow-card">
            {/* Feed header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold text-sm text-foreground">Саналын урсгал</span>
              </div>
              <span className="text-xs text-muted-foreground">Шинэ санал</span>
            </div>

            {/* Feed items */}
            <div className="divide-y divide-border">
              {FEED.map((item, i) => (
                <ScrollReveal
                  key={item.user}
                  direction="up"
                  delay={160 + i * 70}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
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
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{item.state}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* View all */}
            <div className="px-5 py-4 border-t border-border">
              <Link
                href="/explore"
                className="block text-center text-sm font-semibold text-primary hover:underline"
              >
                Бараа болон саналуудыг харах →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
