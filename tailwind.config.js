export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#121212",
        accent: "#d4c4b1",
        background: "#0a0a0a",
        textPrimary: "#ffffff",
        textSecondary: "#717171",
        danger: "#ef4444",
        // Legacy aliases
        charcoal: "#121212",
        muted: "#717171",
      },
      fontFamily: {
        primary: ["Oswald", "sans-serif"],
        secondary: ["Inter", "sans-serif"],
        display: ["Bodoni Moda", "serif"],
      },
    },
  },
  plugins: [],
}
