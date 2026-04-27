const STEPS = [
  {
    num: '01',
    color: 'bg-primary/10 text-primary',
    numBg: 'bg-primary',
    title: 'Зараа нэмэх',
    desc: 'Зураг оруулж, үнэ эсвэл солилцооны сонголт тохируулаарай. 2 минутаас бага хугацаа шаардана.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25H12M3.75 3h16.5a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" />
      </svg>
    ),
  },
  {
    num: '02',
    color: 'bg-teal-500/10 text-teal-600',
    numBg: 'bg-teal-500',
    title: 'Санал тавих',
    desc: 'Солилцоо, мөнгөн санал, эсвэл хоёулааг хослуулан санал болгоорой — бүрэн уян хатан.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    num: '03',
    color: 'bg-amber-500/10 text-amber-600',
    numBg: 'bg-amber-500',
    title: 'Ярилцаж тохирох',
    desc: 'Суулгасан чатаараа шууд ярилцаарай. Өөрийн хурдаар гэрээгээ байгуулаарай.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    num: '04',
    color: 'bg-green-500/10 text-green-600',
    numBg: 'bg-green-500',
    title: 'Аюулгүй хүргэлт',
    desc: 'Хоёр тал хүлээн авснаа баталгаажуулах хүртэл төлбөр хадгалагдана. 100% аюулгүй.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">
            ЭНГИЙН ПРОЦЕСС
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
            Swaply хэрхэн ажилладаг вэ?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Жагсаалтаас хүргэлт хүртэл, аюулгүй, хурдан, хялбар.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-border z-0" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map(step => (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center">
                {/* Icon box with number badge */}
                <div className="relative mb-5">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center bg-card border border-border shadow-card`}>
                    {step.icon}
                  </div>
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${step.numBg} text-white text-[10px] font-bold flex items-center justify-center`}>
                    {step.num}
                  </div>
                </div>

                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
