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

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

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
// COPIA en las tres funciones: los ids de orden de PayPal son mayúsculas y dígitos.
// Sin esto, "ABC?x=1" pasaría la llave única y PayPal devolvería la misma orden ABC.
const ORDER_ID = /^[A-Z0-9]{10,30}$/;
// Los 500 no muestran el error de la base ni de PayPal al navegador (va al log).
const ERROR_INTERNO = "No se pudo registrar el pago";

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

// COPIA en verify-paypal-payment, verify-paypal-session y verify-paypal-prueba-red:
// una orden de PayPal paga UN solo producto; si ya está en la tabla de otro, no sirve aquí.
async function ordenUsadaEn(admin: SupabaseClient, orderId: string, tablas: string[]): Promise<boolean> {
  for (const tabla of tablas) {
    const { data, error } = await admin.from(tabla).select("paypal_order_id").eq("paypal_order_id", orderId).maybeSingle();
    if (error) throw new Error(`Falló la búsqueda de la orden en ${tabla}: ${error.message}`);
    if (data) return true;
  }
  return false;
}

// COPIA en las tres funciones: el dinero solo está cobrado si la orden es intent
// CAPTURE y su primera captura está COMPLETED. El "COMPLETED" de la orden no basta
// (una orden AUTHORIZE también lo reporta). Monto y moneda salen de la captura.
// deno-lint-ignore no-explicit-any
function capturaCompletada(order: any): { monto: string; moneda: string } | null {
  const captura = order?.purchase_units?.[0]?.payments?.captures?.[0];
  if (order?.intent !== "CAPTURE" || captura?.status !== "COMPLETED") return null;
  return { monto: captura.amount?.value, moneda: captura.amount?.currency_code };
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

    let cuerpo;
    try {
      cuerpo = await req.json();
    } catch {
      return jsonResponse({ ok: false, motivo: "Cuerpo inválido" }, 400);
    }
    const { orderId, etapa } = cuerpo ?? {};
    // De qué publicación llegó (?ref=fb-ruta…): solo para medir; si no es válida se ignora, nunca bloquea el pago.
    const fuente = typeof cuerpo?.fuente === "string" && /^[a-z0-9_-]{1,40}$/.test(cuerpo.fuente) ? cuerpo.fuente : null;
    if (typeof orderId !== "string" || !ORDER_ID.test(orderId)) {
      return jsonResponse({ ok: false, motivo: "orderId inválido" }, 400);
    }
    if (etapa !== 1 && etapa !== 2) {
      return jsonResponse({ ok: false, motivo: "Etapa inválida" }, 400);
    }

    // Todo 409 queda en el log: puede ser una orden ya cobrada que no se registró.
    const conflicto = (motivo: string) => {
      console.warn("Prueba en red rechazada (409):", { orderId, email: user.email, etapa, motivo });
      return jsonResponse({ ok: false, motivo }, 409);
    };

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
      .select("id, user_id, etapa")
      .eq("paypal_order_id", orderId)
      .maybeSingle();
    if (existenteError) {
      console.error("Falló la búsqueda de la orden en pruebas_red:", existenteError.message);
      return jsonResponse({ ok: false, motivo: ERROR_INTERNO }, 500);
    }
    if (existente) {
      if (existente.user_id !== user.id || existente.etapa !== etapa) return conflicto("Esta orden ya se usó");
      return jsonResponse({ ok: true, pruebaId: existente.id }, 200);
    }

    if (await ordenUsadaEn(supabaseAdmin, orderId, ["pagos", "pagos_sesiones"])) {
      return conflicto("Esta orden ya se usó");
    }

    const { data: bloques, error: bloquesError } = await supabaseAdmin
      .from("pruebas_red")
      .select("id, bloque, estado, vence_at")
      .eq("user_id", user.id)
      .eq("etapa", etapa);
    if (bloquesError) {
      console.error("Falló la lectura de pruebas_red:", bloquesError.message);
      return jsonResponse({ ok: false, motivo: ERROR_INTERNO }, 500);
    }

    let intentos: Intento[] = [];
    if (bloques.length > 0) {
      const { data, error: intentosError } = await supabaseAdmin
        .from("intentos_prueba_red")
        .select("prueba_id, estado, aprobadas")
        .in("prueba_id", bloques.map((b) => b.id));
      if (intentosError) {
        console.error("Falló la lectura de intentos_prueba_red:", intentosError.message);
        return jsonResponse({ ok: false, motivo: ERROR_INTERNO }, 500);
      }
      intentos = data;
    }

    const regla = precioEsperado(bloques, intentos, new Date());
    if ("motivo" in regla) return conflicto(regla.motivo);

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
    if (order?.id !== orderId) {
      console.error("PayPal devolvió otra orden:", { pedida: orderId, devuelta: order?.id });
      return jsonResponse({ ok: false, motivo: "Orden inválida o incompleta" }, 400);
    }

    const cobro = capturaCompletada(order);
    if (!cobro || cobro.moneda !== "USD" || !(Number(cobro.monto) >= Number(regla.precio))) {
      console.error("Orden inválida:", {
        orderId,
        estado: order?.status,
        intent: order?.intent,
        captura: order?.purchase_units?.[0]?.payments?.captures?.[0]?.status,
        cobro,
        esperado: regla.precio,
      });
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
        paypal_order_id: order.id,
        monto: Number(cobro.monto),
        moneda: "USD",
        estado: "activa",
        pagado_at: ahora.toISOString(),
        vence_at: venceAt.toISOString(),
        fuente,
      })
      .select("id")
      .single();

    if (insertError) {
      // 23505 = unique. Si la orden ya está, otra solicitud con la misma orden ganó
      // la carrera; si no, otra orden distinta tomó este número de bloque al mismo tiempo.
      if (insertError.code === "23505") {
        const { data: ganador, error: ganadorError } = await supabaseAdmin
          .from("pruebas_red")
          .select("id, user_id, etapa")
          .eq("paypal_order_id", orderId)
          .maybeSingle();
        if (!ganadorError && !ganador) return conflicto("Ya tienes intentos activos");
        if (ganadorError || ganador!.user_id !== user.id || ganador!.etapa !== etapa) return conflicto("Esta orden ya se usó");
        return jsonResponse({ ok: true, pruebaId: ganador!.id }, 200);
      }
      console.error("Falló el insert en pruebas_red:", insertError.message);
      return jsonResponse({ ok: false, motivo: ERROR_INTERNO }, 500);
    }

    console.log("Bloque", siguiente, "de prueba en red etapa", etapa, "registrado para", user.email);
    return jsonResponse({ ok: true, pruebaId: insertado.id }, 200);
  } catch (err) {
    console.error("Error no manejado en verify-paypal-prueba-red:", err);
    return jsonResponse({ ok: false, motivo: ERROR_INTERNO }, 500);
  }
});
