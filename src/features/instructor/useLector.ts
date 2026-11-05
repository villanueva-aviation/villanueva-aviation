import { useEffect, useState } from "react";
import type { Muestra } from "./evaluador.ts";

const URL_LECTOR = "http://127.0.0.1:8766/muestra";
const CADA_MS = 100;

export type EstadoLector = "sin-lector" | "sin-simulador" | "conectado";

/** Lee el lector local cada 100 ms mientras la pestaña está a la vista. Solo cambia `muestra` cuando llega una nueva. */
export function useLector(): { estado: EstadoLector; muestra: Muestra | null } {
  const [estado, setEstado] = useState<EstadoLector>("sin-lector");
  const [muestra, setMuestra] = useState<Muestra | null>(null);

  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;

    const leer = async () => {
      if (!vivo || document.hidden) return;
      try {
        const res = await fetch(URL_LECTOR, { cache: "no-store", signal: AbortSignal.timeout(1000) });
        const json = (await res.json()) as { conectado: boolean; muestra: Muestra | null };
        if (!vivo) return;
        setEstado(json.conectado && json.muestra ? "conectado" : "sin-simulador");
        if (json.muestra) setMuestra((prev) => (prev && prev.t === json.muestra!.t ? prev : json.muestra));
      } catch {
        if (vivo) setEstado("sin-lector");
      }
      if (vivo) timer = window.setTimeout(leer, CADA_MS);
    };

    const alCambiarVista = () => {
      window.clearTimeout(timer);
      if (!document.hidden) leer();
    };

    leer();
    document.addEventListener("visibilitychange", alCambiarVista);
    return () => {
      vivo = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", alCambiarVista);
    };
  }, []);

  return { estado, muestra };
}
