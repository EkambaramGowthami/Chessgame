/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'nature': "url('/bg/nature.jpg')",
        'classic': "linear-gradient(to right, #e0e0e0, #ffffff)",
        'neon': "linear-gradient(135deg, #0ff, #f0f)"
      }
    },
  },
  plugins: [
    require("tailwind-scrollbar-hide")
  ],
}