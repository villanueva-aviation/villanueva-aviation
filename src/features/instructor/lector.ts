import type { Muestra } from "./evaluador.ts";

/** `desde`: la última muestra en el reloj del lector. `ajuste`: lo que se le suma para que el tiempo nunca vuelva atrás. */
export type EstadoLectura = { desde: number | null; ajuste: number; recibidaMs: number };
export const LECTOR_INICIAL: EstadoLectura = { desde: null, ajuste: 0, recibidaMs: 0 };

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
  return {
    lote: lote.map((m) => ({ ...m, t: m.t + ajuste })),
    estado: { desde: lote[lote.length - 1].t, ajuste, recibidaMs: ahoraMs },
  };
}
