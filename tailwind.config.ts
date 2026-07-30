import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* National Group India palette */
        navy: {
          50:  "#EEF2F8",
          100: "#D5E0EF",
          500: "#3A5A80",
          700: "#1A2B40",
          800: "#112030",
          900: "#0F1D2E",
          950: "#070F18",
        },
        gold: {
          300: "#F0D070",
          400: "#E8B832",
          500: "#C49020",
          600: "#A87818",
          700: "#8C6010",
        },
        linen: {
          50:  "#FAF8F4",
          100: "#F5F0E8",
          200: "#EDE8DF",
          300: "#E0D9CC",
          400: "#D0C8B8",
        },
        /* Azure kept for Microsoft-specific UI elements */
        azure: {
          500: "#2699FB",
          600: "#0078D4",
          700: "#106EBE",
        },
        teams: {
          500: "#6264A7",
          600: "#4B4D8E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ['"Cascadia Code"', '"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        card:       "0 1px 4px rgba(26,43,64,0.07), 0 1px 2px rgba(26,43,64,0.04)",
        "card-hover":"0 4px 16px rgba(26,43,64,0.10), 0 2px 6px rgba(26,43,64,0.05)",
        sidebar:    "2px 0 16px rgba(0,0,0,0.30)",
        "card-float":"0 8px 32px rgba(26,43,64,0.12), 0 2px 8px rgba(26,43,64,0.07)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
