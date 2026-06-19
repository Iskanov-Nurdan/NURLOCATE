/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas:   "rgb(var(--color-canvas) / <alpha-value>)",
        panel:    "rgb(var(--color-panel) / <alpha-value>)",
        surface:  "rgb(var(--color-surface) / <alpha-value>)",
        border:   "rgb(var(--color-border) / <alpha-value>)",
        text:     "rgb(var(--color-text) / <alpha-value>)",
        muted:    "rgb(var(--color-muted) / <alpha-value>)",
        accent:   "#dc2626",
        mint:     "#16a34a",
        amber:    "#f59e0b",
        critical: "#ef4444",
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card:        "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
        glow:        "0 0 20px rgba(220,38,38,0.15)",
        "glow-mint": "0 0 20px rgba(22,163,74,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out"
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } }
      }
    }
  },
  plugins: []
};
