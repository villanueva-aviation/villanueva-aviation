import { useEffect, useState } from "react";
import type { Com } from "./radio.ts";

const URL_LECTOR = "http://127.0.0.1:8767/muestra";
const URL_AEROPUERTOS = "http://127.0.0.1:8767/aeropuertos";
const CADA_MS = 1000;
const AEROPUERTOS_CADA_MS = 30_000;
const AEROPUERTOS_VACIO_CADA_MS = 5_000;

export type MuestraAtis = { sim: string | null; com: Com[]; lat: number | null; lon: number | null; aglFt: number | null };
export type AeropuertoSim = { icao: string; nombre: string; lat: number; lon: number; elevFt: number; atisMhz: number[]; pistas: { ident: string; rumboV: number; largoFt: number }[] };
export type EstadoLectorAtis = "sin-lector" | "sin-simulador" | "conectado";

// Lee el lector ATIS cada segundo. Sin lector, la muestra queda en null.
export function useLectorAtis(): { estado: EstadoLectorAtis; muestra: MuestraAtis | null; aeropuertos: AeropuertoSim[] | null } {
  const [estado, setEstado] = useState<EstadoLectorAtis>("sin-lector");
  const [muestra, setMuestra] = useState<MuestraAtis | null>(null);
  const [aeropuertos, setAeropuertos] = useState<AeropuertoSim[] | null>(null);

  // Aeropuertos con ATIS cerca del avión: cada 30 s, y cada 5 s mientras la lista está vacía.
  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;
    const leer = async () => {
      let espera = AEROPUERTOS_CADA_MS;
      try {
        const res = await fetch(URL_AEROPUERTOS, { cache: "no-store", signal: AbortSignal.timeout(5000) });
        const l = (await res.json()) as AeropuertoSim[];
        if (!vivo) return;
        setAeropuertos(l);
        if (l.length === 0) espera = AEROPUERTOS_VACIO_CADA_MS;
      } catch {
        // Un fallo suelto no borra la lista: se queda la última buena y se reintenta en 5 s.
        espera = AEROPUERTOS_VACIO_CADA_MS;
      }
      if (vivo) timer = window.setTimeout(leer, espera);
    };
    leer();
    return () => {
      vivo = false;
      window.clearTimeout(timer);
    };
  }, []);

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

  return { estado, muestra, aeropuertos };
}
