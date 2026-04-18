import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#111118",
          850: "#16161f",
          800: "#1a1a24",
          700: "#242430",
          600: "#3a3a4a",
          500: "#555566",
          400: "#7a7a8c",
          300: "#a0a0b0",
          200: "#c8c8d4",
          100: "#ececf2",
          50: "#f8f8fb",
        },
        brand: {
          50: "#fff5f5",
          100: "#ffe3e3",
          400: "#ff8787",
          500: "#ff6b6b",
          600: "#e85d5d",
          700: "#c94a4a",
        },
      },
      fontFamily: {
        // Editorial display serif — sets the personality
        display: [
          "var(--font-display)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        // Clean grotesque for body — modern but not cliché
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        // Editorial-scale display sizes
        "display-sm": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["6rem", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "display-xl": ["8rem", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
