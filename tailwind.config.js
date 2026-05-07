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
        'pizza-orange': 'var(--pizza-orange)',
        'pizza-red': 'var(--pizza-red)',
        'charcoal': 'var(--charcoal)',
      },
    },
  },
  plugins: [],
}