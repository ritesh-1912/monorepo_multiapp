/**
 * Shared Tailwind preset: design system tokens.
 * Apps set --font-sans (Geist), --font-display (Instrument Serif), and palette in globals.css.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: 'var(--destructive)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['14px', { lineHeight: '1.4' }],
        base: ['16px', { lineHeight: '1.4' }],
        lg: ['20px', { lineHeight: '1.4' }],
        xl: ['24px', { lineHeight: '1.1' }],
        '2xl': ['32px', { lineHeight: '1.1' }],
        '3xl': ['48px', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        heading: '-0.02em',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: 'var(--radius, 6px)',
        md: 'calc(var(--radius, 6px) - 2px)',
        sm: '4px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'focus-ring': '0 0 0 2px var(--focus-ring)',
      },
      maxWidth: {
        content: '1280px',
      },
      transitionDuration: {
        fast: '100ms',
        normal: '150ms',
        page: '200ms',
      },
    },
  },
  plugins: [],
};
