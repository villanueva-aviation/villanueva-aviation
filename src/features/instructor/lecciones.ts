import type { Idioma } from "./idiomaInstructor.ts";
import type { ManiobraId } from "./maniobras.ts";

// Las 14 lecciones del programa, en el orden de la escuela. Lo que todavía no existe se ve como "Próximamente".

export interface Leccion {
  numero: number;
  nombre: Record<Idioma, string>;
  disponible: boolean;
  /** La maniobra que se vuela en la zona; sin ella es el repaso (sorteo). */
  maniobra?: ManiobraId;
}

export const REPASO = 13;
/** Quién abre las lecciones mientras no existe la suscripción (paso 6). Erik, 2026-11-08: «Solo yo primero». */
export const ACCESO_REPASO: "fundador" | "exclusivo" | "todos" = "fundador";

const l = (numero: number, es: string, en: string, maniobra?: ManiobraId): Leccion => ({ numero, nombre: { es, en }, disponible: numero === REPASO || !!maniobra, maniobra });

export const LECCIONES: Leccion[] = [
  l(1, "Familiarización", "Familiarization"),
  // ponytail: 2 y 3 son iguales hasta que Erik diga qué cambia entre ellas en la escuela.
  l(2, "Vuelo recto y nivelado", "Straight and level flight", "recto-nivelado"),
  l(3, "Vuelo recto y nivelado", "Straight and level flight", "recto-nivelado"),
  l(4, "Virajes a rumbos", "Turns to headings", "virajes-rumbos"),
  l(5, "Ascensos y descensos", "Climbs and descents", "ascensos-descensos"),
  l(6, "Virajes ascendiendo y descendiendo", "Climbing and descending turns", "virajes-ascendiendo"),
  l(7, "Vuelo lento", "Slow flight", "vuelo-lento"),
  l(8, "«S» sobre un camino", "S-turns along a road"),
  l(9, "«8» primera fase", "Figure 8, first phase"),
  l(10, "«8» segunda fase", "Figure 8, second phase"),
  // ponytail: la 12 se abre cuando Erik diga qué cambia respecto a la 11.
  l(11, "Práctica de emergencia", "Emergency practice", "falla-motor"),
  l(12, "Práctica de emergencia", "Emergency practice"),
  l(13, "Repaso general", "General review"),
  l(14, "Toques y despegues", "Touch and goes", "toques-despegues"),
];

export function estadoLeccion(leccion: Leccion, acceso: { fundador: boolean; exclusivo: boolean }): "abierta" | "candado" | "proximamente" {
  if (!leccion.disponible) return "proximamente";
  const ok = acceso.fundador || ACCESO_REPASO === "todos" || (ACCESO_REPASO === "exclusivo" && acceso.exclusivo);
  return ok ? "abierta" : "candado";
}

/** El valor de `maniobra` en intentos_maniobra para la lección entera. */
export const claveLeccion = (x: Leccion) => (x.numero === REPASO ? "repaso-general" : `leccion-${x.numero}`);

/** El número de la URL (sin número: el repaso, la ruta de antes); null si no existe o no está disponible. */
export function leccionDe(numero: string | undefined): Leccion | null {
  const x = numero === undefined ? LECCIONES[REPASO - 1] : LECCIONES.find((y) => String(y.numero) === numero);
  return x?.disponible ? x : null;
}
