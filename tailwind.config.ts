import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1018",
        panel: "#121a26",
        panelSoft: "#182232",
        line: "#273243",
        accent: "#ff7a00",
        accentSoft: "#ff9d42",
        good: "#4ade80",
        bad: "#fb7185",
        muted: "#9ca3af",
      },
      boxShadow: {
        esports: "0 20px 40px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      fontFamily: {
        display: ["Segoe UI", "Tahoma", "sans-serif"],
        body: ["Segoe UI", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
