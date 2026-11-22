import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { onRequestGet as atisRed } from './functions/api/atis/red.ts'

// En producción /api/atis/red lo atiende functions/api/atis/red.ts (Cloudflare Pages); aquí corre la misma función.
const atisRedLocal = (): Plugin => ({
  name: 'atis-red-local',
  configureServer(server) {
    server.middlewares.use('/api/atis/red', async (req, res) => {
      const r = await atisRed({ request: new Request('http://localhost' + req.originalUrl) })
      res.statusCode = r.status
      r.headers.forEach((v, k) => res.setHeader(k, v))
      res.end(await r.text())
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), atisRedLocal()],
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
