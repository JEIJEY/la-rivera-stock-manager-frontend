import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

const MIME = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".eot": "application/vnd.ms-fontobject",
};

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
  plugins: [
    {
      name: "serve-src-assets",
      configureServer(server) {
        // Sirve src/assets/ en /assets/ para dev (en prod lo hace nginx vía Dockerfile)
        server.middlewares.use("/assets", (req, res, next) => {
          const filePath = path.resolve("src/assets", "." + (req.url || "/"));
          try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch { /* no-op */ }
          next();
        });

        // Sirve src/pages/ en /pages/ para dev (templates HTML del dashboard)
        server.middlewares.use("/pages", (req, res, next) => {
          const filePath = path.resolve("src/pages", "." + (req.url || "/"));
          try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const contentType = ext === ".html" ? "text/html" : (MIME[ext] || "application/octet-stream");
              res.setHeader("Content-Type", contentType);
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch { /* no-op */ }
          next();
        });
      },
    },
  ],
});