// Baja el feed no oficial del D-ATIS de EE. UU. (una sola consulta con todos los aeropuertos); Cloudflare lo guarda 60 s.
import type { EntradaDatis } from "./datis.ts";

export async function bajarDatis(): Promise<EntradaDatis[]> {
  // cf (caché de Cloudflare) no existe en el RequestInit estándar; fuera de Cloudflare se ignora.
  const r = await fetch("https://atis.info/api/all", {
    headers: { "user-agent": "VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)" },
    cf: { cacheTtl: 60, cacheEverything: true },
    signal: AbortSignal.timeout(5000), // si atis.info se cuelga, falla a los 5 s y se cae al ATIS generado
  } as RequestInit);
  if (!r.ok) throw new Error(`atis.info ${r.status}`);
  const datos = await r.json();
  if (!Array.isArray(datos)) throw new Error("atis.info: formato inesperado");
  return datos as EntradaDatis[];
}
