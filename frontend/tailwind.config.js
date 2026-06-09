/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#07090d",
        panel: "#0d1118",
        surface: "#101720",
        border: "rgba(255,255,255,0.09)",
        muted: "#8f9daa",
        accent: "#2d78ff",
        mint: "#4de6a8",
        amber: "#ffbd4a",
        critical: "#d93030"
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};
