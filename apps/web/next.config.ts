import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@swaply/ui', '@swaply/db', '@swaply/types'],
}

export default nextConfig
