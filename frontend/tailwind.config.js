/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate 900
        surface: '#1e293b', // Slate 800
        primary: '#A7A868', // Sage Green
        primaryHover: '#909156', // Sage Green Darker
        textMain: '#f8fafc', // Slate 50
        textMuted: '#94a3b8', // Slate 400
      }
    },
  },
  plugins: [],
}
