export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        danger: "var(--color-danger)",
        borderSubtle: "var(--color-border-subtle)",
        // Legacy aliases
        charcoal: "var(--color-secondary)",
        muted: "var(--color-text-secondary)",
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
