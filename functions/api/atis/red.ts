// Intermediario de los feeds públicos de IVAO y VATSIM para el programa ATIS:
// responde si hay controlador en un aeropuerto y si la red publica su ATIS.
// Los feeds pesan ~1 MB y cambian cada 15 s: Cloudflare los guarda 60 s.
// Sin «with { type: "json" }»: el esbuild de wrangler 3 (el que compila las Functions en Cloudflare) no lo entiende.
import { estadoIvao, estadoVatsim, type IvaoWhazzup, type VatsimDatos, type VatsimTransceptores } from "../../../src/features/atis/red.ts";

const json = (cuerpo: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", ...extra },
  });

const bajar = async <T>(url: string): Promise<T> => {
  // cf (caché de Cloudflare) no existe en el RequestInit estándar; fuera de Cloudflare se ignora.
  const r = await fetch(url, {
    headers: { "user-agent": "VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)" },
    cf: { cacheTtl: 60, cacheEverything: true },
  } as RequestInit);
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  return (await r.json()) as T;
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const q = new URL(request.url).searchParams;
  const icao = (q.get("icao") ?? "").toUpperCase();
  const red = q.get("red");
  const lat = Number(q.get("lat") ?? NaN), lon = Number(q.get("lon") ?? NaN); // Number("") y Number(" ") son 0: se exige que vengan
  const ap = { icao, lat, lon };
  // Hay ICAO con cifras (IL48) y de 3 caracteres en MSFS.
  if (!/^[A-Z0-9]{3,4}$/.test(icao) || !q.get("lat")?.trim() || !q.get("lon")?.trim() || !(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180) || (red !== "ivao" && red !== "vatsim")) return json({ error: "Solicitud inválida" }, 400);

  try {
    const estado = red === "ivao"
      ? estadoIvao(await bajar<IvaoWhazzup>("https://api.ivao.aero/v2/tracker/whazzup"), ap)
      : estadoVatsim(...(await Promise.all([
          bajar<VatsimDatos>("https://data.vatsim.net/v3/vatsim-data.json"),
          bajar<VatsimTransceptores>("https://data.vatsim.net/v3/transceivers-data.json"),
        ])), ap);
    return json(estado, 200, { "cache-control": "public, max-age=60" });
  } catch {
    return json({ error: "Red no disponible" }, 502);
  }
};
