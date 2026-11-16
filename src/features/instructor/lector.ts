import type { Muestra } from "./evaluador.ts";

/**
 * `desde`: la última muestra en el reloj del lector. `ajuste`: lo que se le suma para que el tiempo nunca vuelva atrás.
 * `quieta`: dónde y desde cuándo el avión no se mueve en el aire (el simulador congelado).
 */
export type EstadoLectura = { desde: number | null; ajuste: number; recibidaMs: number; quieta: { lat: number; lon: number; desde: number } | null };
export const LECTOR_INICIAL: EstadoLectura = { desde: null, ajuste: 0, recibidaMs: 0, quieta: null };

/** En el aire, con velocidad y la posición exactamente igual tanto tiempo: MSFS congelado (pausa activa, carga). */
const CONGELADO_SEG = 5;

/**
 * Lo nuevo de una respuesta del lector. El lector cuenta el tiempo desde que arrancó: si se reinicia,
 * su reloj vuelve a cero. Entonces se sigue contando desde donde iba, más el tiempo real sin muestras,
 * así la evaluación ve el hueco (y anula el intento) en vez de descartar todo por viejo.
 */
export function recibir(e: EstadoLectura, muestra: Muestra, muestras: Muestra[], ahoraMs: number): { lote: Muestra[]; estado: EstadoLectura } {
  let ajuste = e.ajuste;
  let lote: Muestra[];
  if (e.desde !== null && muestra.t < e.desde) {
    ajuste = e.desde + e.ajuste + (ahoraMs - e.recibidaMs) / 1000 - muestra.t;
    lote = [muestra];
  } else {
    lote = (muestras.length ? muestras : [muestra]).filter((m) => e.desde === null || m.t > e.desde);
  }
  if (!lote.length) return { lote, estado: e };
  // Congelado cuenta como pausa: el intento no se califica (14/11: 9½ min quieto a 130 kt, sin anular).
  let quieta = e.quieta;
  const salida = lote.map((x) => {
    const m = { ...x, t: x.t + ajuste };
    if (m.enTierra || m.velocidad < 30 || m.lat === undefined || m.lon === undefined) {
      quieta = null;
      return m;
    }
    if (!quieta || quieta.lat !== m.lat || quieta.lon !== m.lon) {
      quieta = { lat: m.lat, lon: m.lon, desde: m.t };
      return m;
    }
    return m.t - quieta.desde >= CONGELADO_SEG ? { ...m, pausa: true } : m;
  });
  return { lote: salida, estado: { desde: lote[lote.length - 1].t, ajuste, recibidaMs: ahoraMs, quieta } };
}
