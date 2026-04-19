import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#140A10",
          900: "#111118",
          850: "#2A1830",
          800: "#3A2340",
          700: "#4F3658",
          600: "#6A5070",
          500: "#8B6F80",
          400: "#A89CA2",
          300: "#C8BEC4",
          200: "#E0D8DC",
          100: "#F3EFF1",
          50: "#FAF7F9",
        },
        // Claude Design'daki kart/panel dolgusu — nötr siyah (burgundy değil!)
        card: "#111118",
        brand: {
          50: "#FDF2F5",
          100: "#FCE7EC",
          200: "#FBCFD8",
          300: "#F7A8B8",
          400: "#F17A92",
          500: "#E11D48",
          600: "#BE123C",
          700: "#9F1239",
          800: "#881337",
          900: "#6B0F2A",
        },
        gold: {
          400: "#FDE68A",
          500: "#F59E0B",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
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
        "route-enter": "routeEnter 0.42s cubic-bezier(0.16, 1, 0.3, 1) both",
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
        routeEnter: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
