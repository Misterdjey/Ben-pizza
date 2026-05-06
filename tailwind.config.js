/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'bebas': ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        'pizza-orange': '#FF6B35',
        'pizza-red': '#D72638',
        'charcoal': '#1a1a1a',
      },
    },
  },
  plugins: [],
}