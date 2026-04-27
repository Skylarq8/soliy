import Link from 'next/link'

export function CtaBanner() {
  return (
    <section className="py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-screen-xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-14 md:py-20 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(247 74% 63%) 0%, hsl(180 100% 41%) 100%)' }}
        >
          {/* Background decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Өнөөдөр 50,000+ солилцогчдтой нэгдэх
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Өнөөдөр эхний солилцоогоо эхлэх
            </h2>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed max-w-lg mx-auto">
              2 минутад анхны зараа нэмэх. Жагсаалтын хураамжгүй, бүрэн аюулгүй, мянга мянган боломжит солилцооны хамтрагчид хүлээж байна.
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
              <span>✅ Бүртгэл үнэгүй</span>
              <span>🔒 Аюулгүй</span>
              <span>⭐ 4.9/5 үнэлгээ</span>
              <span>🚀 50К+ хэрэглэгч</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
