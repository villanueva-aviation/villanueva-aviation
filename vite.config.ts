import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    // En producción lo atiende functions/api/wx/[tipo].ts (Cloudflare Pages); aquí lo imitamos.
    proxy: {
      "/api/wx": {
        target: "https://aviationweather.gov",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/wx/, "/api/data"),
      },
    },
  },
})
