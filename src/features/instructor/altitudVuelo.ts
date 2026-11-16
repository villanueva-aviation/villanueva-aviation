// La altitud de vuelo que el cadete elige antes de empezar (Erik, 2026-11-15). Pura, para poder probarla.
// Es obligatoria en todas las lecciones; el rango depende de la lección para que sirva a la maniobra.
import { AGL_MAX, AGL_MIN } from "./evaluadorS.ts";
import { PATRON_AGL } from "./evaluadorCircuito.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import type { Leccion } from "./lecciones.ts";
import type { ManiobraId } from "./maniobras.ts";
import { altitudEspera } from "./navIfr.ts";

/** IFR: los ejercicios empiezan arriba de 1,000 pies sobre el terreno (repaso.ts). */
const PISO_IFR_AGL = 1000;
/** Sin aeropuerto del lector todavía: lo plausible mientras conecta, y se revalida al conectarse. */
export const PISO_GLOBAL_FT = 1000;
export const TECHO_FT = 18000;

export interface RangoAltitud {
  /** Pies MSL. */
  minFt: number;
  maxFt: number;
  /** La lección vuela a una sola altitud (el circuito). */
  fijo: boolean;
  /** Lo que llena el botón «usar la sugerida». */
  sugeridaFt: number;
  /** El lector todavía no manda el aeropuerto: el rango es provisional. */
  sinAeropuerto: boolean;
}

/** Las que por diseño se vuelan bajo, en una banda AGL: la «S» y los ochos. */
const EN_BANDA: ManiobraId[] = ["s-camino", "ocho-pilones", "ocho-alrededor"];

/** El rango de altitud (MSL, pies) que acepta la lección, con la elevación del aeropuerto. */
export function rangoAltitud(leccion: Pick<Leccion, "maniobra" | "programa">, elevacionFt: number | undefined): RangoAltitud {
  const ifr = leccion.programa === "ifr";
  if (elevacionFt === undefined || !Number.isFinite(elevacionFt)) {
    return { minFt: PISO_GLOBAL_FT, maxFt: TECHO_FT, fijo: false, sugeridaFt: ifr ? 3000 : ALTURA_SEGURA_AGL, sinAeropuerto: true };
  }
  const elev = Math.round(elevacionFt);
  if (!ifr && leccion.maniobra === "toques-despegues") {
    const fijo = elev + PATRON_AGL;
    return { minFt: fijo, maxFt: fijo, fijo: true, sugeridaFt: fijo, sinAeropuerto: false };
  }
  if (!ifr && leccion.maniobra && EN_BANDA.includes(leccion.maniobra)) {
    const minFt = elev + AGL_MIN;
    const maxFt = elev + AGL_MAX;
    return { minFt, maxFt, fijo: false, sugeridaFt: Math.round(((minFt + maxFt) / 2) / 100) * 100, sinAeropuerto: false };
  }
  const minFt = elev + (ifr ? PISO_IFR_AGL : ALTURA_SEGURA_AGL);
  // IFR: la sugerida es la de siempre (3,000 pies sobre el aeropuerto); VFR, la mínima.
  const sugeridaFt = ifr ? Math.min(TECHO_FT, Math.max(minFt, altitudEspera(elev))) : minFt;
  return { minFt, maxFt: TECHO_FT, fijo: false, sugeridaFt, sinAeropuerto: false };
}

/** ¿La altitud (MSL, pies) sirve para la lección? Sin rango, sin aeropuerto (no se sabe el terreno) o sin número, no. */
export function altitudValida(ft: number | null | undefined, rango: RangoAltitud | null): boolean {
  if (!rango || rango.sinAeropuerto || ft === null || ft === undefined || !Number.isFinite(ft)) return false;
  return ft >= rango.minFt && ft <= rango.maxFt;
}

/** El rango en palabras para la pantalla previa. */
export function textoRango(rango: RangoAltitud, idioma: Idioma): string {
  const n = (x: number) => x.toLocaleString("en-US");
  if (rango.fijo) return idioma === "en" ? `This lesson flies at ${n(rango.minFt)} ft.` : `Esta lección se vuela a ${n(rango.minFt)} ft.`;
  return idioma === "en" ? `Between ${n(rango.minFt)} and ${n(rango.maxFt)} ft.` : `Entre ${n(rango.minFt)} y ${n(rango.maxFt)} ft.`;
}
