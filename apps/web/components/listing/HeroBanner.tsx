import Link from 'next/link'

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8"
      style={{ background: 'linear-gradient(135deg, hsl(345 40% 95%) 0%, hsl(30 40% 96%) 100%)' }}
    >
      <div className="px-7 py-8">
        <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
          Шинэ онцлог
        </p>
        <h2 className="text-2xl font-bold text-foreground mb-1 leading-snug">
          Намрын шинэ коллекц
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          200+ шинэ зүйл нэмэгдлэж
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Харах
        </Link>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'hsl(345 40% 80%)' }} />
      <div className="absolute -right-2 bottom-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'hsl(345 40% 70%)' }} />
    </div>
  )
}
