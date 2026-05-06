import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

export function CtaBanner() {
  return (
    <section className="py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-screen-xl mx-auto">
        <ScrollReveal
          direction="up"
          className="relative overflow-hidden rounded-3xl px-6 py-14 md:py-20 text-center border border-primary/20"
          duration={750}
          style={{ background: 'linear-gradient(135deg, hsl(166 55% 30%) 0%, hsl(166 45% 24%) 52%, hsl(12 82% 58%) 100%)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-black/10" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Эхний зараа үнэгүй нийтэл
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Хэрэглэхгүй байгаа зүйлээ үнэ цэнтэй санал болго
            </h2>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed max-w-lg mx-auto">
              Зураг, үнэ, солих нөхцөлөө оруулаад нийтэл. Хэрэглэгчид бараагаар, мөнгөөр эсвэл хоёуланг нь хослуулж санал тавина.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap justify-center mb-8">
              <Link
                href="/listing/new"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
              >
                Зар нэмэх <span aria-hidden>→</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center px-7 py-3 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Бараа хайх
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex gap-4 flex-wrap justify-center text-white/80 text-xs font-medium">
              <span>Бүртгэл үнэгүй</span>
              <span>Профайл шалгана</span>
              <span>Чатаар тохирно</span>
              <span>Хүлээлцээд батална</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
