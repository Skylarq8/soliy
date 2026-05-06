import { ScrollReveal } from '@/components/shared/ScrollReveal'

const LEFT_STATS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    color: 'text-primary bg-primary/10',
    value: 'Профайл',
    label: 'Хэнтэй тохирч байгаагаа харах',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-600 bg-green-100',
    value: 'Чат',
    label: 'Нөхцөлөө бичгээр тохирох',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: 'text-primary bg-primary/10',
    value: 'Батлах',
    label: 'Хүлээн авснаа хоёр тал батлах',
  },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: 'text-primary bg-primary/10',
    title: 'Баталгаажсан хэрэглэгчид',
    desc: 'Профайл дээр нэр, зураг, үнэлгээ, солилцооны түүхийг нэг дор харуулж эрсдэлийг багасгана.',
    stat: 'Алхам 1',
    statLabel: 'Хэрэглэгчээ шалгах',
    statColor: 'text-primary',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    color: 'text-green-600 bg-green-100',
    title: 'Аюулгүй төлбөр',
    desc: 'Үнийн зөрүүтэй тохиролцоонд төлбөрийг баталгаажуулалтын урсгалтай холбож, нөхцөлийг ил тод болгоно.',
    stat: 'Алхам 2',
    statLabel: 'Саналаа баталгаажуулах',
    statColor: 'text-green-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: 'text-amber-500 bg-amber-100',
    title: 'Үнэлгээ ба шүүмж',
    desc: 'Дууссан тохиролцооны дараа үнэлгээ үлдээж, дараагийн хэрэглэгчдэд итгэлийн дохио өгнө.',
    stat: 'Алхам 3',
    statLabel: 'Туршлагаа үлдээх',
    statColor: 'text-amber-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: 'text-teal-600 bg-teal-100',
    title: 'Маргаан шийдэх мэдээлэл',
    desc: 'Чат, саналын нөхцөл, баталгаажуулалтын түүх хадгалагдсанаар асуудал гарвал шалгах суурьтай.',
    stat: 'Баримт',
    statLabel: 'Тохиролцооны мөр',
    statColor: 'text-teal-600',
  },
]

export function TrustSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-14">

          {/* Left */}
          <ScrollReveal direction="left" className="flex h-full flex-col">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">
              ИТГЭЛТЭЙ СОЛИЛЦОО
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 leading-tight">
              Тохиролцоогоо эхнээс нь{' '}
              <span className="text-accent">ил тод байлга.</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
              Swaply дээр итгэл гэдэг ганц badge биш. Профайл, саналын нөхцөл, чат, хүлээн авсан баталгааг хамтад нь харуулж байж хэрэглэгч шийдвэрээ тайван гаргана.
            </p>

            <div className="mt-auto flex flex-col gap-3">
              {LEFT_STATS.map((s, index) => (
                <ScrollReveal
                  key={s.label}
                  direction="up"
                  delay={120 + index * 90}
                  className="flex min-h-[88px] items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
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

          {/* Right — 2x2 feature grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f, index) => (
              <ScrollReveal
                key={f.title}
                direction={index % 2 === 0 ? 'up' : 'right'}
                delay={index * 90}
                className="flex min-h-[250px] flex-col rounded-2xl border border-border bg-card p-6"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="mt-auto pt-5">
                  <p className={`text-xl font-extrabold ${f.statColor}`}>{f.stat}</p>
                  <p className="text-xs text-muted-foreground">{f.statLabel}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
