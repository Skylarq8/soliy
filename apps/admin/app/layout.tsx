import type { Metadata } from 'next'
import './globals.css'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'Swaply Admin', template: '%s · Swaply Admin' },
  description: 'Swaply marketplace admin dashboard',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-background antialiased">
        <Providers>
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
