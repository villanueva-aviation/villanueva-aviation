import { useEffect, useRef, useState } from "react";
import type { Muestra } from "./evaluador.ts";
import { LECTOR_INICIAL, recibir } from "./lector.ts";

const URL_LECTOR = "http://127.0.0.1:8766/muestra";
const CADA_MS = 100;

export type EstadoLector = "sin-lector" | "sin-simulador" | "conectado";

/**
 * Lee el lector local cada 100 ms. Sigue leyendo con la pestaña oculta o la ventana tapada por MSFS:
 * Chrome frena el temporizador a ~1 s, y por eso pide `?desde=` la última muestra recibida y el lector
 * le manda todas las que se juntaron. `alRecibir` recibe cada lote nuevo, en orden.
 */
export function useLector(alRecibir?: (muestras: Muestra[]) => void): { estado: EstadoLector; muestra: Muestra | null } {
  const [estado, setEstado] = useState<EstadoLector>("sin-lector");
  const [muestra, setMuestra] = useState<Muestra | null>(null);
  const callback = useRef(alRecibir);
  callback.current = alRecibir;

  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;
    let lectura = LECTOR_INICIAL;

    const leer = async () => {
      try {
        const url = lectura.desde === null ? URL_LECTOR : `${URL_LECTOR}?desde=${lectura.desde}`;
        const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
        const json = (await res.json()) as { conectado: boolean; muestra: Muestra | null; muestras?: Muestra[] };
        if (!vivo) return;
        setEstado(json.conectado && json.muestra ? "conectado" : "sin-simulador");
        if (json.muestra) {
          const r = recibir(lectura, json.muestra, json.muestras ?? [], Date.now());
          lectura = r.estado;
          if (r.lote.length) {
            callback.current?.(r.lote);
            setMuestra(r.lote[r.lote.length - 1]);
          }
        }
      } catch {
        if (vivo) setEstado("sin-lector");
      }
      if (vivo) timer = window.setTimeout(leer, CADA_MS);
    };

    leer();
    return () => {
      vivo = false;
      window.clearTimeout(timer);
    };
  }, []);

  return { estado, muestra };
}
