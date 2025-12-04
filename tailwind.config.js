/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'christmas-red': '#dc2626',
        'christmas-green': '#16a34a',
        'christmas-gold': '#eab308',
      },
    },
  },
  plugins: [],
};
