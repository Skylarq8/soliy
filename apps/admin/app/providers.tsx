'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        richColors
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(228 16% 11%)',
            border: '1px solid hsl(228 12% 18%)',
            color: 'hsl(220 20% 94%)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
