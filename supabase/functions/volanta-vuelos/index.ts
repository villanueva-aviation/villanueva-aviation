// Supabase Edge Function: trae de Volanta los últimos vuelos del fundador para
// prellenar el formulario de /admin/aventura. Existe porque el navegador no puede
// llamar a la API de Volanta desde el sitio (CORS), y porque solo el fundador debe usarla.
//
// La API de Volanta NO es oficial ni está documentada: es la misma que usa su
// página de perfil público (fly.volanta.app/profile/<usuario>). Puede cambiar o
// cerrarse sin aviso; si eso pasa, el formulario manual sigue funcionando.
//
// Deploy: supabase functions deploy volanta-vuelos --project-ref nkgzllhpmwcahicwxcdx
// No requiere secrets.

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Debe coincidir con FOUNDER_EMAIL de src/lib/constants.ts.
const FOUNDER_EMAIL = "villanuevaaviation@gmail.com";
const USUARIO_VOLANTA = "CapiEVilla";
const CUANTOS = 15;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ ok: false, motivo: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ ok: false, motivo: "No autorizado" }, 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return jsonResponse({ ok: false, motivo: "No autorizado" }, 401);
  if (data.user.email !== FOUNDER_EMAIL) return jsonResponse({ ok: false, motivo: "Solo el fundador" }, 403);

  try {
    const url =
      `https://api.volanta.app/api/v1/Profiles/${encodeURIComponent(USUARIO_VOLANTA)}/Flights/Search` +
      `?Page=1&PageSize=${CUANTOS}&SortField=OffBlocksTime&Ascending=false&RemoveNulls=false`;
    const res = await fetch(url);
    if (!res.ok) return jsonResponse({ ok: false, motivo: `Volanta respondió ${res.status}` }, 502);
    const cuerpo = await res.json();

    // deno-lint-ignore no-explicit-any
    const vuelos = (cuerpo.items ?? []).map((f: any) => ({
      id: f.id,
      // Volanta manda la hora sin zona: es UTC.
      salida: `${f.offBlocksTime}Z`,
      minutos: f.realFlightTime,
      aterrizaje: f.landingRate,
      origen: f.origin?.icaoCode ?? "",
      destino: f.destination?.icaoCode ?? "",
      avion: f.aircraft?.aircraftTypeIcao ?? "",
      matricula: f.aircraft?.registration ?? null,
    }));
    return jsonResponse({ ok: true, vuelos }, 200);
  } catch (e) {
    console.error("volanta-vuelos falló", e);
    return jsonResponse({ ok: false, motivo: "No se pudo consultar Volanta" }, 502);
  }
});
