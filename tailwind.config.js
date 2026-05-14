/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'dm': ['DM Sans', 'sans-serif'],
      },
      colors: {
        'stone': '#EDEAE5',
        'stone-mid': '#D4CFC8',
        'stone-deep': '#A39E97',
        'slate': '#4A6272',
        'slate-light': '#7A9AAF',
        'slate-pale': '#C8D8E4',
        'slate-dark': '#2C3E4D',
        'ink': '#1C1C1A',
        'cream': '#F8F6F3',
      },
    },
  },
  plugins: [],
}
