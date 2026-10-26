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
        sankofa: {
          bg: '#0A0B10',
          surface: '#12141D',
          elevated: '#1B1E2B',
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          goldDark: '#996515',
          danger: '#E63946',
          teal: '#2A9D8F'
        }
      }
    },
  },
  plugins: [],
}
