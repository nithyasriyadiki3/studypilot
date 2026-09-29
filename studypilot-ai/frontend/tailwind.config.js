/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef0ff', 100: '#e0e3ff', 200: '#c6ccff', 300: '#a3aaff',
          400: '#7c82ff', 500: '#6366F1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        accent: {
          cyan: '#22D3EE', violet: '#8B5CF6', amber: '#F59E0B',
          rose: '#FB7185', mint: '#34D399',
        },
        surface: {
          light: '#F7F8FC', dark: '#0B0E17', darkCard: '#12141F',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #22D3EE 100%)',
        'warm-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FB7185 100%)',
        'mesh-dark': 'radial-gradient(at 20% 0%, rgba(99,102,241,0.25) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(34,211,238,0.18) 0px, transparent 50%)',
        'mesh-light': 'radial-gradient(at 20% 0%, rgba(99,102,241,0.10) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(34,211,238,0.10) 0px, transparent 50%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.12)',
        glow: '0 0 40px rgba(99, 102, 241, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
