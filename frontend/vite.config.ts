import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento, o proxy evita problemas de CORS ao chamar o backend
// diretamente em /api — ver docker/docker-compose.yml para as portas.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
