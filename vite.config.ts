import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    define: {
      'import.meta.env.VITE_FORGE_KEY': JSON.stringify(env.FORGE_KEY),
      'import.meta.env.VITE_VENICE_IMAGE_API_KEY': JSON.stringify(env.VITE_VENICE_IMAGE_API_KEY),
      'import.meta.env.VITE_PHOTO_API_KEY': JSON.stringify(env.VITE_PHOTO_API_KEY),
    },
  };
});
