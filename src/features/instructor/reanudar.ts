// Una lección a medias guardada en el navegador, para seguirla tras recargar la página (Erik, 2026-11-11). Puro.
// Cada ejercicio terminado ya está en la base; esto guarda la lección alrededor de ellos.
import type { SeccionId } from "../../data/checklistVozC172.ts";
import type { Checklist } from "./checklistVoz.ts";
import type { ManiobraId, ResultadoComun } from "./maniobras.ts";
import type { DatosEspera } from "./navIfr.ts";
import type { Grabador } from "./recorrido.ts";
import type { EstadoRepaso } from "./repaso.ts";
import type { Modo } from "./sesion.ts";

export const CLAVE_REANUDAR = "instructor-leccion-en-curso";
/** Más vieja que esto ya no se ofrece. */
export const VIGENCIA_MS = 3 * 3600 * 1000;

export interface LeccionGuardada {
  v: 1;
  /** programa-número, p. ej. «ifr-4». */
  clave: string;
  /** Date.now() al guardar. */
  en: number;
  sesionId: string;
  modo: Modo;
  repaso: EstadoRepaso;
  cl: Checklist;
  grabador: Grabador;
  resultados: { maniobra: ManiobraId; resultado: ResultadoComun }[];
  espera: DatosEspera | null;
  llegada: number | null;
  esperaUsada: boolean;
  rutaPrimera: { salida: number; llegada: number } | null;
  dichos: SeccionId[];
  respondidas: string[];
}

/**
 * Las muestras de un resultado pesan megas: el mapa solo usa la primera y la última (inicio y fin del intento).
 * ponytail: tras reanudar, la explicación del viraje escarpado de antes pierde «a los X° girados»; guardar una serie si importa.
 */
const ligero = (r: ResultadoComun): ResultadoComun => ({ ...r, muestras: r.muestras.length > 2 ? [r.muestras[0], r.muestras[r.muestras.length - 1]] : r.muestras });

export function paraReanudar(x: Omit<LeccionGuardada, "v">): LeccionGuardada {
  return {
    ...x,
    v: 1,
    repaso: { ...x.repaso, hechas: x.repaso.hechas.map((h) => (h.resultado ? { ...h, resultado: ligero(h.resultado) } : h)) },
    resultados: x.resultados.map((r) => ({ ...r, resultado: ligero(r.resultado) })),
    // El búfer del checklist se vuelve a llenar solo.
    cl: { ...x.cl, muestras: [] },
  };
}

/** La lección guardada si es de esta lección, reciente y sin terminar; si no, null. */
export function leerReanudable(texto: string | null, clave: string, ahora: number): LeccionGuardada | null {
  if (!texto) return null;
  let g: LeccionGuardada;
  try {
    g = JSON.parse(texto);
  } catch {
    return null;
  }
  if (g?.v !== 1 || g.clave !== clave || !(ahora - g.en < VIGENCIA_MS) || !g.repaso) return null;
  if (g.repaso.etapa === "terminado" || g.repaso.etapa === "invalido") return null;
  // Sin la muestra de antes, el hueco de la recarga no parece un salto ni una caída del simulador.
  return { ...g, repaso: { ...g.repaso, vuelo: g.repaso.vuelo && { ...g.repaso.vuelo, previo: null } } };
}
