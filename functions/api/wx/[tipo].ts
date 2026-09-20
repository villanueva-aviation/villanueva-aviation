// Intermediario de aviationweather.gov para el Briefing del piloto.
// El servicio no envía cabeceras CORS, así que el navegador no puede consultarlo directo.
const TIPOS = new Set(["metar", "taf"]);

const json = (cuerpo: string, status = 200, extra: Record<string, string> = {}) =>
  new Response(cuerpo, { status, headers: { "content-type": "application/json; charset=utf-8", ...extra } });

export const onRequestGet = async ({ params, request }: { params: { tipo: string }; request: Request }) => {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").toUpperCase();
  if (!TIPOS.has(params.tipo) || !/^[A-Z0-9]{4}$/.test(ids)) {
    return json(JSON.stringify({ error: "Solicitud inválida" }), 400);
  }

  try {
    const r = await fetch(`https://aviationweather.gov/api/data/${params.tipo}?ids=${ids}&format=json`, {
      headers: { "user-agent": "VillanuevaAviation/1.0 (+https://villanueva-aviation.pages.dev)" },
    });
    if (r.status === 204) return json("[]", 200, { "cache-control": "public, max-age=60" }); // sin reporte para esa estación
    if (!r.ok) return json(JSON.stringify({ error: "Servicio de clima no disponible" }), 502);
    return json(await r.text(), 200, { "cache-control": "public, max-age=60" });
  } catch {
    return json(JSON.stringify({ error: "Servicio de clima no disponible" }), 502);
  }
};
