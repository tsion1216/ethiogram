/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ethio-blue': '#1E40AF',
        'ethio-green': '#059669',
        'ethio-yellow': '#D97706',
        'ethio-red': '#DC2626',
      },
    },
  },
  plugins: [],
}