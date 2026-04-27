import { Suspense } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { PopularSection } from '@/components/home/PopularSection'
import { SwapSmarterSection } from '@/components/home/SwapSmarterSection'
import { LiveActivitySection } from '@/components/home/LiveActivitySection'
import { TrustSection } from '@/components/home/TrustSection'
import { CtaBanner } from '@/components/home/CtaBanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <Suspense fallback={<PopularSkeleton />}>
        <PopularSection />
      </Suspense>
      <SwapSmarterSection />
      <LiveActivitySection />
      <TrustSection />
      <CtaBanner />
    </>
  )
}

function PopularSkeleton() {
  return (
    <section className="py-14 md:py-20 bg-card">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-3" />
        <div className="h-8 w-72 bg-muted rounded animate-pulse mb-8" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-52 flex-shrink-0 rounded-2xl bg-muted animate-pulse h-72" />
          ))}
        </div>
      </div>
    </section>
  )
}
