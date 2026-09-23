import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { PRECIO_CONTENIDO_EXCLUSIVO } from "../../lib/constants";

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    paypal?: any;
  }
}

function cargarSdkPayPal(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal"));
    document.body.appendChild(script);
  });
}

interface PayPalButtonProps {
  onSuccess: () => void;
  /** Monto en USD. Por defecto, el pago único de Contenido Exclusivo. */
  monto?: string;
  /** Edge Function que verifica la orden del lado del servidor. */
  funcion?: string;
  /** Campos extra para esa función (por ejemplo, la reserva que se está pagando). */
  cuerpo?: Record<string, unknown>;
  /** Texto que ve el cadete en su recibo de PayPal. */
  descripcion?: string;
}

export function PayPalButton({
  onSuccess,
  monto = PRECIO_CONTENIDO_EXCLUSIVO,
  funcion = "verify-paypal-payment",
  cuerpo,
  descripcion,
}: PayPalButtonProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  // El SDK de PayPal solo se monta una vez: sus callbacks leen los props de aquí
  // para no re-renderizar el botón en cada cambio de estado de la página.
  const propsRef = useRef({ onSuccess, monto, funcion, cuerpo, descripcion });
  propsRef.current = { onSuccess, monto, funcion, cuerpo, descripcion };
  const [error, setError] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !contenedorRef.current) return;

    let cancelado = false;

    cargarSdkPayPal(CLIENT_ID)
      .then(() => {
        if (cancelado || !contenedorRef.current || !window.paypal) return;

        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", label: "pay" },
            createOrder: (_: unknown, actions: any) =>
              actions.order.create({
                purchase_units: [
                  {
                    amount: { value: propsRef.current.monto, currency_code: "USD" },
                    ...(propsRef.current.descripcion ? { description: propsRef.current.descripcion } : {}),
                  },
                ],
              }),
            onApprove: async (data: { orderID: string }, actions: any) => {
              await actions.order.capture();
              setVerificando(true);
              setError(null);
              const { data: resultado, error: fnError } = await supabase.functions.invoke(
                propsRef.current.funcion,
                { body: { orderId: data.orderID, ...propsRef.current.cuerpo } },
              );
              setVerificando(false);
              if (fnError || !resultado?.ok) {
                setError("No pudimos confirmar tu pago con PayPal. Si el cargo se realizó, contáctanos.");
                return;
              }
              propsRef.current.onSuccess();
            },
            onError: () => {
              setError("Ocurrió un error con PayPal. Intenta de nuevo.");
            },
          })
          .render(contenedorRef.current);
      })
      .catch(() => setError("No se pudo cargar PayPal. Revisa tu conexión e intenta de nuevo."));

    return () => {
      cancelado = true;
    };
  }, []);

  if (!CLIENT_ID) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
        Pagos disponibles próximamente.
      </p>
    );
  }

  return (
    <div>
      <div ref={contenedorRef} />
      {verificando && <p className="mt-2 text-xs text-white/50">Confirmando tu pago…</p>}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
