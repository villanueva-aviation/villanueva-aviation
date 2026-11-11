// Lo que se graba del vuelo para el debriefing con mapa: un punto por segundo, las fases y lo que dijo el instructor. Puro.
import type { Muestra } from "./evaluador.ts";
import type { EstadoRepaso } from "./repaso.ts";

/** [t, lat, lon, altitud, velocidad, rumbo, inclinación, bola, agl]: arreglo y no objeto para que una hora pese poco. */
export type Punto = [t: number, lat: number, lon: number, altitud: number, velocidad: number, rumbo: number, inclinacion: number, bola: number, agl: number];
export const CAMPO_PUNTO = { t: 0, lat: 1, lon: 2, altitud: 3, velocidad: 4, rumbo: 5, inclinacion: 6, bola: 7, agl: 8 } as const;

export type FaseMapa = "rodaje" | "despegue" | "zona" | "circuitos" | "aterrizaje" | "rodaje-regreso";
export type TramoFase = { fase: FaseMapa; inicio: number; fin: number };

export interface Grabador {
  puntos: Punto[];
  fases: TramoFase[];
  voz: { t: number; texto: string }[];
}

export const crearGrabador = (): Grabador => ({ puntos: [], fases: [], voz: [] });

const CADA_SEG = 1;
const r = (x: number, d = 0) => Math.round(x * 10 ** d) / 10 ** d;

/** null mientras no hay vuelo o si la lección se anuló: el grabador deja las fases como estaban. */
export function faseMapa(e: EstadoRepaso): FaseMapa | null {
  const f = e.vuelo?.fase;
  if (!f) return null;
  switch (e.etapa) {
    case "rampa":
      return f === "carrera-despegue" ? "despegue" : "rodaje";
    case "salida":
      return "despegue";
    case "maniobra":
    case "fuera-de-zona":
      return e.sorteo[0] === "toques-despegues" ? "circuitos" : "zona";
    case "regreso":
      return f === "rodaje-regreso" || f === "terminado" ? "rodaje-regreso" : "aterrizaje";
    case "terminado":
      return "rodaje-regreso";
    default:
      return null;
  }
}

/** Muta `g`: un punto por segundo y la fase extendida (o una nueva que empieza donde acabó la anterior). */
export function grabarMuestra(g: Grabador, m: Muestra, e: EstadoRepaso): void {
  const fase = faseMapa(e);
  if (fase) {
    const ultimo = g.fases[g.fases.length - 1];
    if (ultimo?.fase === fase) ultimo.fin = m.t;
    else {
      if (ultimo) ultimo.fin = m.t;
      g.fases.push({ fase, inicio: m.t, fin: m.t });
    }
  }
  if (m.lat === undefined || m.lon === undefined) return;
  const previo = g.puntos[g.puntos.length - 1];
  // El t guardado va redondeado a 0.1 s: sin el margen, un reloj en x.37 grabaría cada 2 s.
  if (previo && m.t - previo[0] < CADA_SEG - 0.05) return;
  g.puntos.push([r(m.t, 1), r(m.lat, 5), r(m.lon, 5), r(m.altitud), r(m.velocidad), r(m.rumbo), r(m.inclinacion), r(m.bola, 2), r(m.agl)]);
}

export function grabarVoz(g: Grabador, t: number, textos: string[]): void {
  for (const texto of textos) g.voz.push({ t, texto });
}

/** El punto con t más cercano; fuera del vuelo, el extremo. */
export function puntoEn(puntos: Punto[], t: number): Punto | null {
  if (!puntos.length) return null;
  let a = 0;
  let b = puntos.length - 1;
  while (b - a > 1) {
    const k = (a + b) >> 1;
    if (puntos[k][0] <= t) a = k;
    else b = k;
  }
  return Math.abs(puntos[a][0] - t) <= Math.abs(puntos[b][0] - t) ? puntos[a] : puntos[b];
}
