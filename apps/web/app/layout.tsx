import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/shared/Navbar'
import { BottomNav } from '@/components/shared/BottomNav'
import { Footer } from '@/components/shared/Footer'
import { ThemeProvider } from '@/components/shared/ThemeProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Swaply — Солилц, тохиролц, үнэ цэн бүтээ',
  description: 'Хувцас, арьс арчилгаа, будалт, аксессуарыг солих, зарах, мөнгөн нэмэлттэй тохиролцох платформ.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var s = localStorage.getItem('theme');
            var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', (s ?? sys) === 'dark');
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
