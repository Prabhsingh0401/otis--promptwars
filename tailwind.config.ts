import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700', letterSpacing: '-0.5px' }],
        'title-1':     ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.3px' }],
        'title-2':     ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'title-3':     ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'headline':    ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body':        ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'callout':     ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subhead':     ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote':    ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1':   ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2':   ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      colors: {
        label: {
          primary:   'var(--color-label-primary)',
          secondary: 'var(--color-label-secondary)',
          tertiary:  'var(--color-label-tertiary)',
        },
        bg: {
          primary:   'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary:  'var(--color-bg-tertiary)',
          elevated:  'var(--color-bg-elevated)',
        },
        fill: {
          primary:   'var(--color-fill-primary)',
          secondary: 'var(--color-fill-secondary)',
          tertiary:  'var(--color-fill-tertiary)',
        },
        separator:    'var(--color-separator)',
        accent:       'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        success:      'var(--color-success)',
        warning:      'var(--color-warning)',
        destructive:  'var(--color-destructive)',
        neutral:      'var(--color-neutral)',
      },
      borderRadius: {
        card:     '12px',
        sheet:    '16px',
        button:   '12px',
        category: '8px',
      },
      boxShadow: {
        card:   '0 2px 8px rgba(0,0,0,0.08)',
        nav:    '0 0.5px 0 var(--color-separator)',
        sheet:  '0 -4px 24px rgba(0,0,0,0.08)',
      },
      spacing: {
        touch:       '44px',
        'tab-height': '49px',
        'nav-height': '44px',
      },
      keyframes: {
        'card-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'card-in':   'card-in 250ms cubic-bezier(0.0, 0.0, 0.2, 1) both',
        shimmer:     'shimmer 1.2s linear infinite',
        'sheet-in':  'sheet-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in':   'fade-in 200ms ease-out both',
        'scale-in':  'scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
