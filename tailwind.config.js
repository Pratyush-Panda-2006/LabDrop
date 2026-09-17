/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        display: ['"Special Elite"', 'serif'],
      },
      colors: {
        vault: {
          dark: '#0a0a0a',
          text: '#1a1a1a',
          muted: '#767676',
          accent: '#905831',
        },
      },
    },
  },
  plugins: [],
}
