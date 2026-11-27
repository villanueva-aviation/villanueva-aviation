// Intermediario de aviationweather.gov para el Briefing del piloto.
// El servicio no envía cabeceras CORS, así que el navegador no puede consultarlo directo.
// Si aviationweather no tiene METAR de la estación (p. ej. YBAF, AUTO de Australia), se pide a metar.vatsim.net.
import { metarDeCrudo } from "../../../src/features/atis/datis.ts";

const TIPOS = new Set(["metar", "taf"]);

const UA = { "user-agent": "VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)" };

// Abierto a cualquier origen: son datos públicos de solo lectura, y así el fondo de pantalla
// animado (un archivo local, sin dominio) puede mostrar el METAR.
const json = (cuerpo: string, status = 200, extra: Record<string, string> = {}) =>
  new Response(cuerpo, {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", ...extra },
  });

export const onRequestGet = async ({ params, request }: { params: { tipo: string }; request: Request }) => {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").toUpperCase();
  if (!TIPOS.has(params.tipo) || !/^[A-Z0-9]{4}$/.test(ids)) {
    return json(JSON.stringify({ error: "Solicitud inválida" }), 400);
  }

  try {
    const r = await fetch(`https://aviationweather.gov/api/data/${params.tipo}?ids=${ids}&format=json`, { headers: UA });
    if (!r.ok && r.status !== 204) return json(JSON.stringify({ error: "Servicio de clima no disponible" }), 502);
    const texto = r.status === 204 ? "[]" : await r.text(); // 204: sin reporte para esa estación
    if (params.tipo === "metar" && /^\s*\[\s*\]\s*$/.test(texto)) return json(JSON.stringify(await respaldoVatsim(ids)), 200, { "cache-control": "public, max-age=60" });
    return json(texto, 200, { "cache-control": "public, max-age=60" });
  } catch {
    return json(JSON.stringify({ error: "Servicio de clima no disponible" }), 502);
  }
};

// Una falla del respaldo no es error: queda «sin reporte», como antes.
async function respaldoVatsim(ids: string): Promise<unknown[]> {
  try {
    const r = await fetch(`https://metar.vatsim.net/${ids}`, { headers: UA, signal: AbortSignal.timeout(4000) });
    const m = r.ok ? metarDeCrudo(await r.text(), Date.now()) : null;
    return m && m.icaoId === ids ? [m] : [];
  } catch {
    return [];
  }
}
