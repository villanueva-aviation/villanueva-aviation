import { useEffect, useState } from "react";
import type { Com } from "./radio.ts";

const URL_LECTOR = "http://127.0.0.1:8767/muestra";
const CADA_MS = 1000;

export type MuestraAtis = { sim: string | null; com: Com[]; lat: number | null; lon: number | null; aglFt: number | null };
export type EstadoLectorAtis = "sin-lector" | "sin-simulador" | "conectado";

// Lee el lector ATIS cada segundo. Sin lector, la muestra queda en null.
export function useLectorAtis(): { estado: EstadoLectorAtis; muestra: MuestraAtis | null } {
  const [estado, setEstado] = useState<EstadoLectorAtis>("sin-lector");
  const [muestra, setMuestra] = useState<MuestraAtis | null>(null);

  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;
    const leer = async () => {
      try {
        const res = await fetch(URL_LECTOR, { cache: "no-store", signal: AbortSignal.timeout(2000) });
        const m = (await res.json()) as MuestraAtis;
        if (!vivo) return;
        setEstado(m.sim ? "conectado" : "sin-simulador");
        setMuestra(m);
      } catch {
        if (vivo) {
          setEstado("sin-lector");
          setMuestra(null);
        }
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
