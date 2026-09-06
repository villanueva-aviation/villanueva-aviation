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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("No autorizado", { status: 401 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return new Response("No autorizado", { status: 401 });
    const user = userData.user;

    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return new Response("Falta orderId", { status: 400 });
    }

    const accessToken = await obtenerTokenPayPal();
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!orderRes.ok) return new Response("Orden de PayPal no encontrada", { status: 400 });
    const order = await orderRes.json();

    const unidad = order?.purchase_units?.[0];
    const monto = unidad?.amount?.value;
    const moneda = unidad?.amount?.currency_code;
    const completado = order?.status === "COMPLETED";

    if (!completado || moneda !== "USD" || Number(monto) < Number(PRECIO_ESPERADO)) {
      return new Response(JSON.stringify({ ok: false, motivo: "Orden inválida o incompleta" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ ok: false, motivo: upsertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, motivo: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
