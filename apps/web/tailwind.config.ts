import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background:          'hsl(var(--background))',
        foreground:          'hsl(var(--foreground))',
        card:                'hsl(var(--card))',
        'card-foreground':   'hsl(var(--card-foreground))',
        border:              'hsl(var(--border))',
        muted:               'hsl(var(--muted))',
        'muted-foreground':  'hsl(var(--muted-foreground))',
        primary:             'hsl(var(--primary))',
        'primary-foreground':'hsl(var(--primary-foreground))',
        'primary-light':     'hsl(var(--primary-light))',
        accent:              'hsl(var(--accent))',
        price:               'hsl(var(--price))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
}

export default config
