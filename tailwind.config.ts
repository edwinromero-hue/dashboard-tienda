import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Verde "Negocio en Línea" — extraído del logo
        accent: {
          50: '#f3faec',
          100: '#e3f4d2',
          200: '#c8e89a',
          300: '#a8d863',
          400: '#8cc63f', // verde lima de la hoja
          500: '#7ab83c',
          600: '#5fa128',
          700: '#3f7e1f',
          800: '#2d6b3a', // verde oscuro del texto
          900: '#1e5b2a',
        },
        leaf: {
          DEFAULT: '#8cc63f',
          dark: '#7ab83c',
        },
        forest: {
          DEFAULT: '#2d6b3a',
          dark: '#1e5b2a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 1.8s infinite linear',
        'marquee-x': 'marqueeX 28s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marqueeX: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
