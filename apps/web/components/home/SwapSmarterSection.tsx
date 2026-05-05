const FEATURES = [
  {
    label: 'Үнэ тэнцүүлэх',
    desc: 'Барааны үнэ зөрвөл мөнгөн нэмэлтээ ил тод бичнэ.',
  },
  {
    label: 'Counter хийх',
    desc: 'Санал таарахгүй бол дүн эсвэл бараагаа өөрчлөөд буцаана.',
  },
  {
    label: 'Шийдвэр хадгалах',
    desc: 'Зөвшөөрсөн, татгалзсан, counter хийсэн мөр бүр үлдэнэ.',
  },
]

const TIMELINE = [
  { label: 'Санал ирсэн', value: 'Кашмер пальто ⇄ Nike пүүз' },
  { label: 'Үнийн зөрүү', value: '+35,000₮ нэмэлт' },
  { label: 'Төлөв', value: 'Хүлээгдэж байна' },
]

export function SwapSmarterSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-start">

          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">
              SWAPLY АРГА
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Саналаа чат биш,{' '}
              <span className="text-accent">тохиролцооны самбар</span> дээр шийд.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              Хоёр тал ямар бараа солих, хэн хэдэн төгрөг нэмэх, counter хийх эсэхээ нэг дэлгэц дээр тодорхой харна.
            </p>

            <div className="grid gap-3">
              {FEATURES.map(item => (
                <div key={item.label} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-card shadow-[0_24px_70px_rgb(15_23_42/0.12)] overflow-hidden">
            <div className="bg-primary text-primary-foreground px-5 md:px-7 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase opacity-70">Live offer board</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold mt-1">Саналын дэлгэрэнгүй</h3>
                </div>
                <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-bold">
                  Хариу хүлээж байна
                </span>
              </div>
            </div>

            <div className="p-4 md:p-7">
              <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-5 items-stretch">
                <DealItem
                  owner="Солонго санал болгож байна"
                  image="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80"
                  title="Кашмер пальто"
                  price="220,000₮"
                  meta="Цэвэрхэн · M size"
                />

                <div className="flex md:flex-col items-center justify-center gap-2">
                  <div className="h-px md:h-16 w-12 md:w-px bg-border" />
                  <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-primary font-black shadow-sm">
                    ⇄
                  </div>
                  <div className="h-px md:h-16 w-12 md:w-px bg-border" />
                </div>

                <DealItem
                  owner="Тэмкагийн бараа"
                  image="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"
                  title="Nike пүүз"
                  price="185,000₮"
                  meta="Original · 39 размер"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-accent uppercase">Balance</p>
                    <p className="text-lg md:text-xl font-extrabold text-foreground mt-1">
                      Солонго үнийн зөрүүг тэнцүүлэхээр <span className="text-accent">+35,000₮</span> нэмлээ
                    </p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border px-4 py-3 text-right">
                    <p className="text-xs text-muted-foreground">Нийт санал</p>
                    <p className="text-xl font-extrabold text-foreground">220,000₮</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-[1fr_0.8fr] gap-4 mt-5">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-bold text-foreground mb-3">Тохиролцооны түүх</p>
                  <div className="space-y-3">
                    {TIMELINE.map((item, index) => (
                      <div key={item.label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          {index < TIMELINE.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="pb-2">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 flex flex-col">
                  <p className="text-sm font-bold text-foreground mb-3">Шийдвэр</p>
                  <div className="grid gap-2 mt-auto">
                    <button className="h-11 rounded-xl bg-primary text-primary-foreground font-bold">
                      Зөвшөөрөх
                    </button>
                    <button className="h-11 rounded-xl bg-card border border-border text-foreground font-bold">
                      Counter санал
                    </button>
                    <button className="h-11 rounded-xl bg-accent/10 text-accent font-bold">
                      Татгалзах
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DealItem({
  owner,
  image,
  title,
  price,
  meta,
}: {
  owner: string
  image: string
  title: string
  price: string
  meta: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <div className="aspect-[4/3] relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold text-primary">
          Солих боломжтой
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-muted-foreground">{owner}</p>
        <h3 className="text-lg font-extrabold text-foreground mt-1">{title}</h3>
        <div className="flex items-end justify-between gap-3 mt-2">
          <p className="text-xl font-extrabold text-price">{price}</p>
          <p className="text-xs text-muted-foreground text-right">{meta}</p>
        </div>
      </div>
    </div>
  )
}
