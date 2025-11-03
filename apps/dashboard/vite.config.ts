import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      //https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      "@": path.resolve(__dirname, "./src"),
      "@api/*": path.resolve(__dirname, "../api/*"),
      "@paperjet/engine": path.resolve(__dirname, "../../packages/engine/src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ph": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
