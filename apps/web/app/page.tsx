import { Suspense } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { SwapSmarterSection } from '@/components/home/SwapSmarterSection'
import { LiveActivitySection } from '@/components/home/LiveActivitySection'
import { TrustSection } from '@/components/home/TrustSection'
import { CtaBanner } from '@/components/home/CtaBanner'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <HowItWorksSection />
      <SwapSmarterSection />
      {/* <LiveActivitySection /> */}
      <TrustSection />
      <CtaBanner />
    </>
  )
}

function CategoriesSkeleton() {
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="h-7 w-32 bg-muted rounded animate-pulse mb-5" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-muted rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  )
}
