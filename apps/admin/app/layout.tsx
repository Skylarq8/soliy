import type { Metadata } from 'next'
import './globals.css'
import { AdminSidebar } from '@/components/AdminSidebar'

export const metadata: Metadata = {
  title: 'Swaply Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
