/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './index.tsx',
    './App.tsx',
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fbf3ef',
          100: '#f5e3db',
          200: '#eac4b5',
          300: '#dda28a',
          400: '#cf795d',
          500: '#bd5b3f',
          600: '#a44731',
          700: '#843727',
          800: '#682d24',
          900: '#55271f',
          950: '#2f140f',
        },
        ink: '#11100f',
        porcelain: '#f8f5f1',
        neon: {
          green: '#147c60',
          dark: '#0f5a47',
        },
        dark: {
          bg: '#050505',
          surface: '#0a0a0a',
          card: '#121212',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.neon.green"), 0 0 20px theme("colors.neon.green")',
        'neon-hover': '0 0 10px theme("colors.neon.green"), 0 0 40px theme("colors.neon.green")',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
