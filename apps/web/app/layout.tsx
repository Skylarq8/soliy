import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/shared/Navbar'
import { BottomNav } from '@/components/shared/BottomNav'
import { Footer } from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: 'DeerSwaply — Солилцоё, Худалдаалъя',
  description: 'Хувцас, арьс засал, будалт, аксессуарыг second-hand аргаар солих, зарах платформ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body>
        <Navbar />
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  )
}
