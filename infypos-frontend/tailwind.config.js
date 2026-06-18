/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        sidebar: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          border: '#1e293b',
          active: '#2563eb',
        },
        success: { light: '#d1fae5', DEFAULT: '#10b981', dark: '#065f46' },
        danger: { light: '#fee2e2', DEFAULT: '#ef4444', dark: '#991b1b' },
        warning: { light: '#fef3c7', DEFAULT: '#f59e0b', dark: '#78350f' },
        info: { light: '#dbeafe', DEFAULT: '#3b82f6', dark: '#1e3a8a' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.04)',
        'card-md': '0 4px 16px 0 rgba(0,0,0,0.07)',
        'card-lg': '0 8px 32px 0 rgba(0,0,0,0.1)',
        modal: '0 24px 64px -12px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        fadeIn: 'fadeIn .3s ease forwards',
        slideInLeft: 'slideInLeft .3s ease forwards',
        scaleIn: 'scaleIn .2s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
