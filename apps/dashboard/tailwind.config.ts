import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        oxanium: ["var(--font-oxanium)", "sans-serif"],
        merriweather: ["var(--font-merriweather)", "serif"],
        "fira-code": ["var(--font-fira-code)", "monospace"],
      },
    },
  },
} satisfies Config;
