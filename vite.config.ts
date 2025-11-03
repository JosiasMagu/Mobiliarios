import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@comp": path.resolve(__dirname, "src/Components"),
      "@controller": path.resolve(__dirname, "src/Controllers"),
      "@data": path.resolve(__dirname, "src/Data"),
      "@hooks": path.resolve(__dirname, "src/Ganchos"),
      "@model": path.resolve(__dirname, "src/Model"),
      "@repo": path.resolve(__dirname, "src/Repository"),
      "@resources": path.resolve(__dirname, "src/Resources"),
      "@routes": path.resolve(__dirname, "src/Routes"),
      "@service": path.resolve(__dirname, "src/Services"),
      "@state": path.resolve(__dirname, "src/States"),
      "@utils": path.resolve(__dirname, "src/Utils"),
      "@view": path.resolve(__dirname, "src/View"),
      "@styles": path.resolve(__dirname, "src/Resources/styles"),
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 5173 },
});
