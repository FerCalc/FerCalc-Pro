// mi-app-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ✅ darkMode: 'class' activa el modo oscuro con la clase 'dark' en <html>
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};