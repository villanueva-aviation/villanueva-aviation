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

    const { orderId, reservaId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return jsonResponse({ ok: false, motivo: "Falta orderId" }, 400);
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

    if (await ordenUsadaEn(supabaseAdmin, orderId, ["pagos", "pruebas_red"])) {
      // Queda en el log: puede ser una orden ya cobrada que no se registró aquí.
      console.warn("Sesión 1 a 1 rechazada (409): orden ya usada en otro producto", { orderId, email: user.email });
      return jsonResponse({ ok: false, motivo: "Esta orden ya se usó" }, 409);
    }

    const accessToken = await obtenerTokenPayPal();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!orderRes.ok) {
      console.error("PayPal orders API respondió", orderRes.status, await orderRes.text());
      return jsonResponse({ ok: false, motivo: "Orden de PayPal no encontrada" }, 400);
    }
    const order = await orderRes.json();

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

    const { error: upsertError } = await supabaseAdmin.from("pagos_sesiones").upsert(
      {
        user_id: user.id,
        email: user.email,
        reserva_id: reservaId,
        proveedor: "paypal",
        paypal_order_id: orderId,
        monto: Number(cobro.monto),
        moneda: cobro.moneda,
        estado: "completado",
        completado_at: new Date().toISOString(),
      },
      { onConflict: "paypal_order_id" },
    );

    if (upsertError) {
      console.error("Falló el upsert en pagos_sesiones:", upsertError.message);
      return jsonResponse({ ok: false, motivo: upsertError.message }, 500);
    }

    console.log("Sesión pagada y registrada para", user.email);
    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("Error no manejado en verify-paypal-session:", err);
    return jsonResponse({ ok: false, motivo: String(err) }, 500);
  }
});
