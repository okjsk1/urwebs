/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#374151', // 다크모드용 중간 회색
        }
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  safelist: [
    'backdrop-blur',
    'bg-white/70',
    'rounded-2xl',
    'shadow-soft',
    'shadow-soft-lg',
  ],
  plugins: [],
}

