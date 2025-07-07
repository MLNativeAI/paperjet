import baseConfig from "@paperjet/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
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
