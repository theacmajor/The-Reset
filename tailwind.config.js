/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ivory: {
          50: '#FDFCFA',
          100: '#F6F4F1',
          200: '#EDE9E3',
          300: '#E0D9D0',
        },
        ink: {
          900: '#1A1814',
          800: '#2C2A26',
          700: '#3D3A34',
          500: '#6B6760',
          400: '#8C8880',
          300: '#B0ACA5',
        },
        accent: {
          red: '#C0392B',
          'red-muted': '#D4574A',
          'red-light': '#F4E5E3',
          blue: '#2C5F8A',
          'blue-muted': '#4A7BA8',
          'blue-light': '#E3EBF4',
        },
      },
      letterSpacing: {
        widest: '0.2em',
        'ultra-wide': '0.3em',
      },
    },
  },
  plugins: [],
}
