import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card:   'hsl(var(--card))',
        border: 'hsl(var(--border))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          raised:  'hsl(var(--surface-raised))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'monospace'],
      },
      borderRadius: {
        '4xl': '1.5rem',
        '5xl': '2rem',
      },
      boxShadow: {
        'glow-violet': '0 0 24px hsl(262 80% 60% / 0.25)',
        'glow-sm':     '0 0 12px hsl(262 80% 60% / 0.15)',
        'card':        '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
        'elevated':    '0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-accent':  'linear-gradient(135deg, hsl(262 80% 60%) 0%, hsl(201 90% 52%) 100%)',
        'gradient-surface': 'linear-gradient(180deg, hsl(var(--surface-raised)) 0%, hsl(var(--surface)) 100%)',
      },
      animation: {
        'fade-in':         'fade-in 0.35s ease-out both',
        'slide-up':        'slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':        'scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both',
        'skeleton-shimmer':'skeleton-shimmer 1.6s ease-in-out infinite',
        'spin-slow':       'spin 3s linear infinite',
        'pulse-glow':      'pulse-glow 2s ease-in-out infinite',
        'liquid-fill':     'liquid-fill 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        'skeleton-shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'liquid-fill': {
          from: { clipPath: 'inset(100% 0 0 0 round 50%)' },
          to:   { clipPath: 'inset(0% 0 0 0 round 50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
