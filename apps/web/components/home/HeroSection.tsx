import Link from 'next/link'

const DEAL_POINTS = [
  { value: '0₮', label: 'Зар оруулах' },
  { value: '2 тал', label: 'Хүлээн авснаа батална' },
  { value: 'Үнэ + бараа', label: 'Уян санал' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,hsl(var(--primary-light))_0%,hsl(var(--background))_48%,hsl(var(--accent)/0.12)_100%)] py-12 md:py-20">
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-16 items-center">

        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-card/70 text-primary text-sm font-semibold mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Баталгаажсан хэрэглэгчидтэй хамгаалалттай солилцоо
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[58px] font-extrabold leading-[1.06] tracking-tight mb-5">
            <span className="text-foreground">Бараагаа мөнгөтэй хавсарган</span>
            <br />
            <span className="text-accent">солилцоорой.</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Хувцас, гоо сайхан, үнэртэн, аксессуараа зарах эсвэл өөр бараа дээр мөнгө нэмж санал болгох боломжтой. Тохиролцоо бүр профайл, чат, хүлээлцсэн баталгаагаар илүү найдвартай.
          </p>

          <div className="flex gap-3 flex-wrap justify-center lg:justify-start mb-9">
            <Link
              href="/listing/new"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              Зар нэмэх <span aria-hidden>→</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center px-7 py-3 rounded-full border-2 border-border bg-card/50 text-foreground font-semibold text-sm hover:bg-card transition-colors"
            >
              Солих бараа хайх
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0">
            {DEAL_POINTS.map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/70 px-3 py-3 shadow-sm">
                <p className="text-lg md:text-xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <div className="rounded-[2rem] border border-border bg-card/75 p-3 md:p-4 shadow-card">
            <div className="rounded-[1.5rem] overflow-hidden bg-background border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <p className="text-xs font-bold tracking-widest text-primary uppercase">Солилцооны санал</p>
                  <p className="text-sm font-semibold text-foreground">Хоёр талын санал</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Хүлээгдэж байна
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 p-3 sm:p-5 items-stretch">
                <ProductPreview
                  image="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80"
                  title="Кашмер пальто"
                  price="220,000₮"
                  user="@solongo"
                  verified
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md ring-4 ring-primary/15">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold whitespace-nowrap">
                    +35,000₮
                  </span>
                </div>

                <ProductPreview
                  image="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"
                  title="Nike пүүз"
                  price="185,000₮"
                  user="@temka"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-2 px-3 sm:px-5 pb-4">
                {['Чатаар тохирох', 'Баталгаатай профайл', 'Хүлээлцээд дуусгах'].map(item => (
                  <div key={item} className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 border border-border">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-xs font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductPreview({
  image,
  title,
  price,
  user,
  verified = false,
}: {
  image: string
  title: string
  price: string
  user: string
  verified?: boolean
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-card border border-border overflow-hidden shadow-card">
      <div className="relative h-36 sm:h-56">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <span className="absolute left-2 top-2 px-2 py-0.5 rounded-full bg-card/90 text-primary text-[10px] font-bold">
          Солих
        </span>
        {verified && (
          <span className="absolute right-2 top-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-foreground truncate">{title}</p>
        <p className="text-base font-extrabold text-price mt-0.5">{price}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{user}</p>
      </div>
    </div>
  )
}
