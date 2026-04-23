/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Activation du mode sombre via la classe 'dark'
  theme: {
    extend: {
      colors: {
        // Couleurs de fond spécifiques au Neumorphisme
        'nm-bg': '#e0e5ec',
        'nm-dark-bg': '#1a1d23',
      },
      boxShadow: {
        // Mode Clair
        'nm-flat': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        'nm-inset': 'inset 6px 6px 12px #b8b9be, inset -6px -6px 12px #ffffff',
        
        // Mode Sombre (à utiliser avec le préfixe dark:shadow-...)
        'nm-flat-dark': '9px 9px 16px rgba(0,0,0,0.4), -9px -9px 16px rgba(255,255,255,0.05)',
        'nm-inset-dark': 'inset 6px 6px 12px #0e1013, inset -6px -6px 12px rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
}