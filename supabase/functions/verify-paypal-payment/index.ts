// Supabase Edge Function: verifica una orden de PayPal del lado del servidor
// antes de marcar el pago como completado. El navegador NUNCA decide esto solo.
//
// Deploy: supabase functions deploy verify-paypal-payment
// Secrets requeridos (supabase secrets set):
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE
//     - sandbox:  https://api-m.sandbox.paypal.com
//     - producción: https://api-m.paypal.com
//   PRECIO_CONTENIDO_EXCLUSIVO (ej. "49.00")

import { createClient } from "npm:@supabase/supabase-js@2";

// Las Edge Functions de Supabase no agregan headers CORS por defecto -- sin
// esto, el navegador bloquea la petición (preflight OPTIONS) antes de que
// llegue aquí, y el cliente nunca ve la respuesta real.
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
const PRECIO_ESPERADO = Deno.env.get("PRECIO_CONTENIDO_EXCLUSIVO") ?? "49.00";

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
  if (!res.ok) throw new Error("No se pudo autenticar con PayPal");
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
    if (userError || !userData.user) return jsonResponse({ ok: false, motivo: "No autorizado" }, 401);
    const user = userData.user;

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return jsonResponse({ ok: false, motivo: "Falta orderId" }, 400);
    }

    const accessToken = await obtenerTokenPayPal();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!orderRes.ok) return jsonResponse({ ok: false, motivo: "Orden de PayPal no encontrada" }, 400);
    const order = await orderRes.json();

    const unidad = order?.purchase_units?.[0];
    const monto = unidad?.amount?.value;
    const moneda = unidad?.amount?.currency_code;
    const completado = order?.status === "COMPLETED";

    if (!completado || moneda !== "USD" || Number(monto) < Number(PRECIO_ESPERADO)) {
      return jsonResponse({ ok: false, motivo: "Orden inválida o incompleta" }, 400);
    }

    // service_role: escribe sin pasar por RLS -- por eso esta verificación vive
    // en el servidor y no en el navegador.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: upsertError } = await supabaseAdmin.from("pagos").upsert(
      {
        user_id: user.id,
        email: user.email,
        proveedor: "paypal",
        paypal_order_id: orderId,
        monto: Number(monto),
        moneda,
        estado: "completado",
        completado_at: new Date().toISOString(),
      },
      { onConflict: "paypal_order_id" },
    );

    if (upsertError) {
      return jsonResponse({ ok: false, motivo: upsertError.message }, 500);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, motivo: String(err) }, 500);
  }
});
