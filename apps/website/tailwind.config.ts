import baseConfig from "@paperjet/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}"
    ],
    presets: [baseConfig],
    theme: {
        container: {
            center: true,
        },
    },
} satisfies Config;
