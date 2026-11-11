import type { Idioma } from "./idiomaInstructor.ts";
import type { ManiobraId } from "./maniobras.ts";

// Las 14 lecciones del programa, en el orden de la escuela. Lo que todavía no existe se ve como "Próximamente".

export interface Leccion {
  numero: number;
  nombre: Record<Idioma, string>;
  disponible: boolean;
  /** La maniobra que se vuela en la zona; sin ella es el repaso (sorteo). */
  maniobra?: ManiobraId;
  /** Falta = el programa VFR. */
  programa?: "ifr";
  /** IFR: cuántos ejercicios tiene la práctica y cuántos el examen. */
  ejercicios?: { practica: number; examen: number };
  /** IFR: solo con un VOR con DME (los arcos). */
  requiereDme?: true;
}

export const REPASO = 13;
/** Quién abre las lecciones mientras no existe la suscripción (paso 6). Erik, 2026-11-08: «Solo yo primero». */
export const ACCESO_REPASO: "fundador" | "exclusivo" | "todos" = "fundador";

const l = (numero: number, es: string, en: string, maniobra?: ManiobraId): Leccion => ({ numero, nombre: { es, en }, disponible: numero === REPASO || !!maniobra, maniobra });

export const LECCIONES: Leccion[] = [
  l(1, "Familiarización", "Familiarization", "familiarizacion"),
  // 2 y 3, y 11 y 12, son la misma lección dos veces: en la escuela son dos horas de lo mismo (Erik, 2026-11-10).
  l(2, "Vuelo recto y nivelado", "Straight and level flight", "recto-nivelado"),
  l(3, "Vuelo recto y nivelado", "Straight and level flight", "recto-nivelado"),
  l(4, "Virajes a rumbos", "Turns to headings", "virajes-rumbos"),
  l(5, "Ascensos y descensos", "Climbs and descents", "ascensos-descensos"),
  l(6, "Virajes ascendiendo y descendiendo", "Climbing and descending turns", "virajes-ascendiendo"),
  l(7, "Vuelo lento", "Slow flight", "vuelo-lento"),
  l(8, "«S» sobre un camino", "S-turns along a road", "s-camino"),
  l(9, "«8» sobre pilones", "Eights on pylons", "ocho-pilones"),
  l(10, "«8» alrededor de pilones", "Eights around pylons", "ocho-alrededor"),
  l(11, "Práctica de emergencia", "Emergency practice", "falla-motor"),
  l(12, "Práctica de emergencia", "Emergency practice", "falla-motor"),
  l(13, "Repaso general", "General review"),
  l(14, "Toques y despegues", "Touch and goes", "toques-despegues"),
];

/** El programa IFR (spec 2026-11-11): por ahora solo la 1. */
const ifr = (numero: number, es: string, en: string, maniobra?: ManiobraId, extra: Partial<Leccion> = {}): Leccion => ({
  numero, nombre: { es, en }, disponible: !!maniobra, maniobra, programa: "ifr", ...extra,
});
export const LECCIONES_IFR: Leccion[] = [
  ifr(1, "Interceptación de radiales", "Radial interception", "interceptar-radial", { ejercicios: { practica: 5, examen: 2 } }),
  ifr(2, "Rutas de acercamiento y alejamiento", "Inbound and outbound courses"),
  ifr(3, "Arcos DME", "DME arcs"),
  ifr(4, "Patrones de espera", "Holding patterns"),
  ifr(5, "Vuelo mezclado", "Mixed flight"),
  ifr(6, "Checkride IFR", "IFR checkride"),
];

export function estadoLeccion(leccion: Leccion, acceso: { fundador: boolean; exclusivo: boolean }): "abierta" | "candado" | "proximamente" {
  if (!leccion.disponible) return "proximamente";
  const ok = acceso.fundador || ACCESO_REPASO === "todos" || (ACCESO_REPASO === "exclusivo" && acceso.exclusivo);
  return ok ? "abierta" : "candado";
}

/** El valor de `maniobra` en intentos_maniobra para la lección entera. */
export const claveLeccion = (x: Leccion) => (x.programa === "ifr" ? `ifr-${x.numero}` : x.numero === REPASO ? "repaso-general" : `leccion-${x.numero}`);

/** El número de la URL (sin número: el repaso, la ruta de antes); null si no existe o no está disponible. */
export function leccionDe(numero: string | undefined): Leccion | null {
  const x = numero === undefined ? LECCIONES[REPASO - 1] : LECCIONES.find((y) => String(y.numero) === numero);
  return x?.disponible ? x : null;
}

/** La lección IFR de la URL; null si no existe o no está disponible. */
export function leccionIfrDe(numero: string | undefined): Leccion | null {
  const x = LECCIONES_IFR.find((y) => String(y.numero) === numero);
  return x?.disponible ? x : null;
}
