/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 10px 25px -15px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};