import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

type Funcion = { onRequestGet: (c: { request: Request }) => Promise<Response> }

// En producción /api/atis/red lo atiende functions/api/atis/red.ts (Cloudflare Pages); aquí corre la misma función.
// Se carga con ssrLoadModule (no con import) para que las Functions sigan fuera del chequeo de tipos de Node, como discord.ts.
const atisRedLocal = (): Plugin => ({
  name: 'atis-red-local',
  configureServer(server) {
    server.middlewares.use('/api/atis/red', async (req, res) => {
      const { onRequestGet } = (await server.ssrLoadModule('/functions/api/atis/red.ts')) as Funcion
      const r = await onRequestGet({ request: new Request('http://localhost' + req.originalUrl) })
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
      // Las funciones del ATIS viven en Cloudflare (/api/atis/red corre aquí arriba); en local se usa el sitio publicado.
      // Para probar una rama antes del merge, apunta aquí a su vista previa (https://<rama>.villanueva-aviation.pages.dev).
      "/api/atis": { target: "https://programa-atis.villanueva-aviation.pages.dev", changeOrigin: true },
      "/api/wx": {
        target: "https://aviationweather.gov",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/wx/, "/api/data"),
      },
    },
  },
})
