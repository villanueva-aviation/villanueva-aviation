// Supabase Edge Function: verifica del lado del servidor el pago de una sesión
// 1 a 1 con el fundador antes de registrarla como pagada. El navegador NUNCA
// decide esto solo, igual que en verify-paypal-payment.
//
// Escribe en "pagos_sesiones", NO en "pagos": pagar una sesión no debe
// desbloquear Contenido Exclusivo.
//
// Deploy: supabase functions deploy verify-paypal-session
// Secrets requeridos (supabase secrets set):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE
//     - sandbox:  https://api-m.sandbox.paypal.com
//     - producción: https://api-m.paypal.com
//   PRECIO_SESION_1A1 (ej. "15.99")

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
const PRECIO_ESPERADO = Deno.env.get("PRECIO_SESION_1A1") ?? "15.99";
// COPIA en las tres funciones: los ids de orden de PayPal son mayúsculas y dígitos.
// Sin esto, "ABC?x=1" pasaría la llave única y PayPal devolvería la misma orden ABC.
const ORDER_ID = /^[A-Z0-9]{10,30}$/;

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

// Fila de "pagos_sesiones" que ya registró esta orden, o null.
async function filaDeOrden(
  admin: SupabaseClient,
  orderId: string,
): Promise<{ user_id: string; reserva_id: string } | null> {
  const { data, error } = await admin
    .from("pagos_sesiones")
    .select("user_id, reserva_id")
    .eq("paypal_order_id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Falló la búsqueda de la orden en pagos_sesiones: ${error.message}`);
  return data;
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

    const { orderId, reservaId } = await req.json();
    if (typeof orderId !== "string" || !ORDER_ID.test(orderId)) {
      return jsonResponse({ ok: false, motivo: "orderId inválido" }, 400);
    }
    if (!reservaId || typeof reservaId !== "string") {
      return jsonResponse({ ok: false, motivo: "Falta reservaId" }, 400);
    }

    // Con el cliente del usuario: RLS garantiza que solo encuentre SUS reservas,
    // así nadie puede marcar como pagada la cita de otra persona.
    const { data: reserva, error: reservaError } = await supabase
      .from("reservas")
      .select("id, estado")
      .eq("id", reservaId)
      .maybeSingle();
    if (reservaError || !reserva) {
      console.error("Reserva no encontrada para", user.email, reservaError?.message);
      return jsonResponse({ ok: false, motivo: "Reserva no encontrada" }, 400);
    }

    console.log("Verificando orden PayPal", orderId, "de sesión", reservaId, "para", user.email);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotencia: la misma orden del mismo cadete para la MISMA reserva ya registrada
    // (reintento tras un fallo de red) es ok. Para otra reserva o de otro cadete, no:
    // si no, una sola orden pagaría varias sesiones o se pasaría a otra cuenta.
    const previa = await filaDeOrden(supabaseAdmin, orderId);
    if (previa) {
      if (previa.user_id === user.id && previa.reserva_id === reservaId) return jsonResponse({ ok: true }, 200);
      console.warn("Sesión 1 a 1 rechazada (409): orden ya usada", { orderId, reservaId, email: user.email });
      return jsonResponse({ ok: false, motivo: "Esta orden ya se usó" }, 409);
    }

    if (await ordenUsadaEn(supabaseAdmin, orderId, ["pagos", "pruebas_red"])) {
      // Queda en el log: puede ser una orden ya cobrada que no se registró aquí.
      console.warn("Sesión 1 a 1 rechazada (409): orden ya usada en otro producto", { orderId, email: user.email });
      return jsonResponse({ ok: false, motivo: "Esta orden ya se usó" }, 409);
    }

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
    if (!cobro || cobro.moneda !== "USD" || !(Number(cobro.monto) >= Number(PRECIO_ESPERADO))) {
      console.error("Orden inválida:", {
        orderId,
        estado: order?.status,
        intent: order?.intent,
        captura: order?.purchase_units?.[0]?.payments?.captures?.[0]?.status,
        cobro,
        esperado: PRECIO_ESPERADO,
      });
      return jsonResponse({ ok: false, motivo: "Orden inválida o incompleta" }, 400);
    }

    const { error: insertError } = await supabaseAdmin.from("pagos_sesiones").insert({
      user_id: user.id,
      email: user.email,
      reserva_id: reservaId,
      proveedor: "paypal",
      paypal_order_id: order.id,
      monto: Number(cobro.monto),
      moneda: cobro.moneda,
      estado: "completado",
      completado_at: new Date().toISOString(),
    });

    if (insertError) {
      // 23505 = unique. Si la orden ya está, otra solicitud con la misma orden ganó la
      // carrera; si no, esta reserva ya estaba pagada con otra orden.
      if (insertError.code === "23505") {
        const ganador = await filaDeOrden(supabaseAdmin, orderId);
        if (ganador?.user_id === user.id && ganador.reserva_id === reservaId) return jsonResponse({ ok: true }, 200);
        const motivo = ganador ? "Esta orden ya se usó" : "Esta sesión ya está pagada";
        console.warn("Sesión 1 a 1 rechazada (409):", { orderId, reservaId, email: user.email, motivo });
        return jsonResponse({ ok: false, motivo }, 409);
      }
      console.error("Falló el insert en pagos_sesiones:", insertError.message);
      return jsonResponse({ ok: false, motivo: "No se pudo registrar el pago" }, 500);
    }

    console.log("Sesión pagada y registrada para", user.email);
    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("Error no manejado en verify-paypal-session:", err);
    return jsonResponse({ ok: false, motivo: "No se pudo registrar el pago" }, 500);
  }
});
