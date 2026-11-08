import type { Idioma } from "./idiomaInstructor.ts";

// Las 14 lecciones del programa, en el orden de la escuela. Lo que todavía no existe se ve como "Próximamente".

export interface Leccion {
  numero: number;
  nombre: Record<Idioma, string>;
  disponible: boolean;
}

export const REPASO = 13;
/** Quién abre el repaso mientras no existe la suscripción (paso 6). Erik, 2026-11-08: «Solo yo primero». */
export const ACCESO_REPASO: "fundador" | "exclusivo" | "todos" = "fundador";

const l = (numero: number, es: string, en: string): Leccion => ({ numero, nombre: { es, en }, disponible: numero === REPASO });

export const LECCIONES: Leccion[] = [
  l(1, "Familiarización", "Familiarization"),
  l(2, "Vuelo recto y nivelado", "Straight and level flight"),
  l(3, "Vuelo recto y nivelado", "Straight and level flight"),
  l(4, "Virajes a rumbos", "Turns to headings"),
  l(5, "Ascensos y descensos", "Climbs and descents"),
  l(6, "Virajes ascendiendo y descendiendo", "Climbing and descending turns"),
  l(7, "Vuelo lento", "Slow flight"),
  l(8, "«S» sobre un camino", "S-turns along a road"),
  l(9, "«8» primera fase", "Figure 8, first phase"),
  l(10, "«8» segunda fase", "Figure 8, second phase"),
  l(11, "Práctica de emergencia", "Emergency practice"),
  l(12, "Práctica de emergencia", "Emergency practice"),
  l(13, "Repaso general", "General review"),
  l(14, "Toques y despegues", "Touch and goes"),
];

export function estadoLeccion(leccion: Leccion, acceso: { fundador: boolean; exclusivo: boolean }): "abierta" | "candado" | "proximamente" {
  if (!leccion.disponible) return "proximamente";
  const ok = acceso.fundador || ACCESO_REPASO === "todos" || (ACCESO_REPASO === "exclusivo" && acceso.exclusivo);
  return ok ? "abierta" : "candado";
}
