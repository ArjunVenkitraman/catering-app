export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        saffron: { 50: '#fff8f0', 100: '#ffecd6', 200: '#ffd4a3', 300: '#ffb566', 400: '#ff9633', 500: '#f57c00', 600: '#e65c00', 700: '#cc4400', 800: '#a83300', 900: '#8a2800' },
        forest: { 50: '#f0f7f4', 100: '#d6ece3', 200: '#a8d5be', 300: '#72b896', 400: '#3d9b6e', 500: '#1a7a4c', 600: '#12623c', 700: '#0d4e30', 800: '#093c25', 900: '#062d1b' },
        cream: { 50: '#fdfaf5', 100: '#f9f2e4', 200: '#f0e2c4', 300: '#e5cd9f', 400: '#d4b070', 500: '#c49145', 600: '#a87730', 700: '#8a5e22', 800: '#6e4a1a', 900: '#563915' },
      },
    },
  },
  plugins: [],
}
