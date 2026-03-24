import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface, #060e20)',
          dim: 'var(--color-surface-dim, #060e20)',
          bright: 'var(--color-surface-bright, #1f2b49)',
          tint: '#caff6f',
          variant: '#192540',
          container: {
            DEFAULT: 'var(--color-surface-container, #0f1930)',
            low: 'var(--color-surface-container-low, #091328)',
            high: 'var(--color-surface-container-high, #141f38)',
            highest: 'var(--color-surface-container-highest, #192540)',
            lowest: 'var(--color-surface-container-lowest, #000000)',
          },
        },
        primary: {
          DEFAULT: 'var(--color-primary, #caff6f)',
          dim: 'var(--color-primary-dim, #bcf063)',
          container: 'var(--color-primary-container, #80af27)',
          fixed: '#c7fc6d',
          'fixed-dim': '#baed60',
        },
        secondary: {
          DEFAULT: '#00e3fd',
          dim: '#00d4ec',
          container: '#006875',
          fixed: '#26e6ff',
          'fixed-dim': '#00d7f0',
        },
        tertiary: {
          DEFAULT: '#a68cff',
          dim: '#7e51ff',
          container: '#7c4dff',
          fixed: '#b8a3ff',
          'fixed-dim': '#ab93ff',
        },
        error: {
          DEFAULT: 'var(--color-error, #ff7351)',
          dim: '#d53d18',
          container: '#b92902',
        },
        outline: {
          DEFAULT: 'var(--color-outline, #6d758c)',
          variant: 'var(--color-outline-variant, #40485d)',
        },
        background: 'var(--color-background, #060e20)',
        'on-surface': {
          DEFAULT: 'var(--color-on-surface, #dee5ff)',
          variant: 'var(--color-on-surface-variant, #a3aac4)',
        },
        'on-primary': {
          DEFAULT: '#436200',
          container: '#182700',
          fixed: '#334c00',
          'fixed-variant': '#496b00',
        },
        'on-secondary': {
          DEFAULT: '#004d57',
          container: '#e8fbff',
          fixed: '#003a42',
          'fixed-variant': '#005964',
        },
        'on-tertiary': {
          DEFAULT: '#25006b',
          container: '#ffffff',
          fixed: '#1c0055',
          'fixed-variant': '#4000ad',
        },
        'on-error': {
          DEFAULT: '#450900',
          container: '#ffd2c8',
        },
        'on-background': 'var(--color-on-background, #dee5ff)',
        'inverse-surface': '#faf8ff',
        'inverse-on-surface': '#4d556b',
        'inverse-primary': '#486900',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config
