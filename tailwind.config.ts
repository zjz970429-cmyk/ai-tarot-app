import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        surface: "#131313",
        primary: {
          DEFAULT: "#6D4AFF",
          light: "#8B6FFF",
          dark: "#5233CC",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8CD6E",
          dark: "#A8862A",
        },
        foreground: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(109, 74, 255, 0.35)",
        "glow-gold": "0 0 30px rgba(212, 175, 55, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
