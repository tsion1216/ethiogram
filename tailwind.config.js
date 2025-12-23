/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Official Ethiopian Flag Colors
        "ethio-green": "#078C49", // Green from flag
        "ethio-yellow": "#FCDD09", // Yellow from flag
        "ethio-red": "#DA121A", // Red from flag
        "ethio-blue": "#0F47AF", // Blue for accents
        // Telegram-like colors
        "telegram-primary": "#0088CC",
        "telegram-secondary": "#5AC8D8",
        "telegram-bg": "#F0F2F5",
        // Chat bubbles
        "bubble-sent": "#0088CC",
        "bubble-received": "#FFFFFF",
      },
      fontFamily: {
        amharic: ["Noto Sans Ethiopic", "system-ui", "sans-serif"],
      },
      boxShadow: {
        message: "0 1px 0.5px rgba(0,0,0,0.13)",
        chat: "0 2px 10px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
