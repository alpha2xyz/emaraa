import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // NOTE: manualChunks vendor-splitting was removed 2026-06-12 — it reordered
    // chunk init and blanked the production SPA (React used before its chunk
    // loaded). Re-introduce splitting only with real preview-render verification.
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
