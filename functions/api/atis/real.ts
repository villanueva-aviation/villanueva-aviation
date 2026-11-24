// D-ATIS real de EE. UU. de un aeropuerto (todas sus entradas: combined o arr/dep). No oficial; solo para simulación.
// Sin «with { type: "json" }»: el esbuild de wrangler 3 no lo entiende.
import { bajarDatis } from "../../../src/features/atis/fuenteDatis.ts";

const json = (cuerpo: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", ...extra },
  });

export const onRequestGet = async ({ request }: { request: Request }) => {
  const icao = (new URL(request.url).searchParams.get("icao") ?? "").toUpperCase();
  if (!/^[A-Z0-9]{3,4}$/.test(icao)) return json({ error: "Solicitud inválida" }, 400);
  try {
    const todas = await bajarDatis();
    return json(todas.filter((e) => e.airport === icao), 200, { "cache-control": "public, max-age=60" });
  } catch {
    return json({ error: "D-ATIS no disponible" }, 502);
  }
};
