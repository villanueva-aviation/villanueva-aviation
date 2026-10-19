// Supabase Edge Function: verifica del lado del servidor el pago de un BLOQUE de la
// prueba en red ("¿Listo para la red?", hasta 3 intentos en vivo) antes de
// registrarlo. El navegador NUNCA decide esto solo, igual que en verify-paypal-session.
//
// Escribe en "pruebas_red", NO en "pagos": pagar la prueba no debe desbloquear
// Contenido Exclusivo.
//
// Deploy: supabase functions deploy verify-paypal-prueba-red
// Secrets requeridos (supabase secrets set):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE
//     - sandbox:  https://api-m.sandbox.paypal.com
//     - producción: https://api-m.paypal.com
//   PRECIO_PRUEBA_RED (primer bloque, ej. "32")
//   PRECIO_PRUEBA_RED_REPETICION (bloque de repetición, ej. "16")
//   supabase secrets set PRECIO_PRUEBA_RED=32 PRECIO_PRUEBA_RED_REPETICION=16

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE")!;
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PRECIO_PRIMER_BLOQUE = Deno.env.get("PRECIO_PRUEBA_RED") ?? "32";
const PRECIO_REPETICION = Deno.env.get("PRECIO_PRUEBA_RED_REPETICION") ?? "16";

const PARTES_RED = ["autorizacion", "salida", "ruta_llegada", "aproximacion"];
const ESTADOS_QUE_CUENTAN = ["realizado", "no_se_presento", "cancelado_tarde"];
const INTENTOS_POR_BLOQUE = 3;
const DIAS_VIGENCIA = 30;

type Bloque = { id: string; bloque: number; estado: string; vence_at: string };
type Intento = { prueba_id: string; estado: string; aprobadas: string[] };

// COPIA de la regla de precio. La fuente de verdad es precioSiguienteBloque en
// src/features/rutaRed/reglas.ts (Deno no importa de src/ limpiamente): si cambias
// una, cambia la otra.
function precioEsperado(bloques: Bloque[], intentos: Intento[], ahora: Date):
  { precio: string } | { motivo: string } {
  const aprobadas = new Set(intentos.filter((i) => i.estado === "realizado").flatMap((i) => i.aprobadas));
  if (PARTES_RED.every((p) => aprobadas.has(p))) {
    return { motivo: "Ya tienes la insignia de esta etapa" };
  }
  const vigentes = bloques.filter((b) => b.estado !== "reembolsada");
  if (vigentes.length === 0) return { precio: PRECIO_PRIMER_BLOQUE };
  const ultimo = vigentes.reduce((a, b) => (b.bloque > a.bloque ? b : a));
  const usados = intentos.filter((i) => i.prueba_id === ultimo.id && ESTADOS_QUE_CUENTAN.includes(i.estado)).length;
  const vencido = ahora.getTime() > new Date(ultimo.vence_at).getTime();
  if (usados < INTENTOS_POR_BLOQUE && !vencido) return { motivo: "Ya tienes intentos activos" };
  return { precio: PRECIO_REPETICION };
}

async function obtenerTokenPayPal(): Promise<string> {
  const credenciales = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credenciales}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const cuerpo = await res.text();
    console.error("PayPal OAuth token falló", res.status, cuerpo);
    throw new Error(`No se pudo autenticar con PayPal (${res.status}): ${cuerpo}`);
  }
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, motivo: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ ok: false, motivo: "No autorizado" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("auth.getUser falló:", userError?.message);
      return jsonResponse({ ok: false, motivo: "No autorizado" }, 401);
    }
    const user = userData.user;

    const { orderId, etapa } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return jsonResponse({ ok: false, motivo: "Falta orderId" }, 400);
    }
    if (etapa !== 1 && etapa !== 2) {
      return jsonResponse({ ok: false, motivo: "Etapa inválida" }, 400);
    }

    // service_role: el cadete no puede insertar en pruebas_red (RLS), y así leemos
    // sus bloques e intentos sin depender de su sesión.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotencia: si esta orden ya quedó registrada (reintento tras un fallo de
    // red), devolvemos el mismo bloque sin volver a revisar el precio.
    const { data: existente, error: existenteError } = await supabaseAdmin
      .from("pruebas_red")
      .select("id, user_id")
      .eq("paypal_order_id", orderId)
      .maybeSingle();
    if (existenteError) {
      console.error("Falló la búsqueda de la orden en pruebas_red:", existenteError.message);
      return jsonResponse({ ok: false, motivo: existenteError.message }, 500);
    }
    if (existente) {
      if (existente.user_id !== user.id) {
        return jsonResponse({ ok: false, motivo: "Esta orden ya se usó" }, 409);
      }
      return jsonResponse({ ok: true, pruebaId: existente.id }, 200);
    }

    // Una orden que ya pagó Contenido Exclusivo o una sesión 1 a 1 no puede
    // reutilizarse para comprar un bloque.
    for (const tabla of ["pagos", "pagos_sesiones"]) {
      const { data: usada, error } = await supabaseAdmin
        .from(tabla)
        .select("paypal_order_id")
        .eq("paypal_order_id", orderId)
        .maybeSingle();
      if (error) {
        console.error(`Falló la búsqueda de la orden en ${tabla}:`, error.message);
        return jsonResponse({ ok: false, motivo: error.message }, 500);
      }
      if (usada) return jsonResponse({ ok: false, motivo: "Esta orden ya se usó" }, 409);
    }

    const { data: bloques, error: bloquesError } = await supabaseAdmin
      .from("pruebas_red")
      .select("id, bloque, estado, vence_at")
      .eq("user_id", user.id)
      .eq("etapa", etapa);
    if (bloquesError) {
      console.error("Falló la lectura de pruebas_red:", bloquesError.message);
      return jsonResponse({ ok: false, motivo: bloquesError.message }, 500);
    }

    let intentos: Intento[] = [];
    if (bloques.length > 0) {
      const { data, error: intentosError } = await supabaseAdmin
        .from("intentos_prueba_red")
        .select("prueba_id, estado, aprobadas")
        .in("prueba_id", bloques.map((b) => b.id));
      if (intentosError) {
        console.error("Falló la lectura de intentos_prueba_red:", intentosError.message);
        return jsonResponse({ ok: false, motivo: intentosError.message }, 500);
      }
      intentos = data;
    }

    const regla = precioEsperado(bloques, intentos, new Date());
    if ("motivo" in regla) {
      return jsonResponse({ ok: false, motivo: regla.motivo }, 409);
    }

    console.log("Verificando orden PayPal", orderId, "de prueba en red etapa", etapa, "para", user.email);

    const accessToken = await obtenerTokenPayPal();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!orderRes.ok) {
      console.error("PayPal orders API respondió", orderRes.status, await orderRes.text());
      return jsonResponse({ ok: false, motivo: "Orden de PayPal no encontrada" }, 400);
    }
    const order = await orderRes.json();

    const unidad = order?.purchase_units?.[0];
    const monto = unidad?.amount?.value;
    const moneda = unidad?.amount?.currency_code;
    const completado = order?.status === "COMPLETED";

    if (!completado || moneda !== "USD" || !(Number(monto) >= Number(regla.precio))) {
      console.error("Orden inválida:", { estado: order?.status, monto, moneda, esperado: regla.precio });
      return jsonResponse({ ok: false, motivo: "Orden inválida o incompleta" }, 400);
    }

    // El número de bloque cuenta también los reembolsados, para no repetir números.
    const siguiente = Math.max(0, ...bloques.map((b) => b.bloque)) + 1;
    const ahora = new Date();
    const venceAt = new Date(ahora.getTime() + DIAS_VIGENCIA * 24 * 3600_000);

    const { data: insertado, error: insertError } = await supabaseAdmin
      .from("pruebas_red")
      .insert({
        user_id: user.id,
        email: user.email,
        etapa,
        bloque: siguiente,
        proveedor: "paypal",
        paypal_order_id: orderId,
        monto: Number(monto),
        moneda: "USD",
        estado: "activa",
        pagado_at: ahora.toISOString(),
        vence_at: venceAt.toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      // 23505 = unique: otra solicitud con la misma orden ganó la carrera.
      if (insertError.code === "23505") {
        const { data: ganador } = await supabaseAdmin
          .from("pruebas_red")
          .select("id")
          .eq("paypal_order_id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (ganador) return jsonResponse({ ok: true, pruebaId: ganador.id }, 200);
      }
      console.error("Falló el insert en pruebas_red:", insertError.message);
      return jsonResponse({ ok: false, motivo: insertError.message }, 500);
    }

    console.log("Bloque", siguiente, "de prueba en red etapa", etapa, "registrado para", user.email);
    return jsonResponse({ ok: true, pruebaId: insertado.id }, 200);
  } catch (err) {
    console.error("Error no manejado en verify-paypal-prueba-red:", err);
    return jsonResponse({ ok: false, motivo: String(err) }, 500);
  }
});
