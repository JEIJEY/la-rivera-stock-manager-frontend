import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@core": "/src/js/core",
      "@modules": "/src/js/modules",
      "@shared": "/src/js/shared",
      "@assets": "/src/assets",
      "@styles": "/src/styles",
    },
  },
});