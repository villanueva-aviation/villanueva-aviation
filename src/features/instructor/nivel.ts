// Niveles de dificultad (Erik, 2026-11-08): Fácil y Medio abren las tolerancias para practicar sin frustrarse;
// Difícil es el estándar de siempre (ACS) y es el único del checkride. Puro.
import type { Idioma } from "./idiomaInstructor.ts";

export type Nivel = 1 | 2 | 3;
export const NIVELES: Nivel[] = [1, 2, 3];
export const NOMBRE_NIVEL: Record<Idioma, Record<Nivel, string>> = {
  es: { 1: "Fácil", 2: "Medio", 3: "Difícil" },
  en: { 1: "Easy", 2: "Medium", 3: "Hard" },
};

const BOLA = 0.25;
const por = <T,>(n: Nivel, facil: T, medio: T, dificil: T): T => (n === 1 ? facil : n === 2 ? medio : dificil);
/** Comunes a las tres maniobras: bola y segundos fuera que todavía no reprueban. */
const comunes = (n: Nivel) => ({ bola: BOLA * por(n, 2, 1.5, 1), nsSeg: por(n, 6, 4, 3) });

export const tolViraje = (n: Nivel = 3) => ({
  altitudFt: por(n, 200, 150, 100),
  velocidadKt: por(n, 20, 15, 10),
  inclinacionGrados: por(n, 10, 7, 5),
  rumboSalidaGrados: por(n, 20, 15, 10),
  ...comunes(n),
  /** Grados girados para que el 360° cuente. */
  giroMin: por(n, 300, 315, 330),
});

export const tolRecto = (n: Nivel = 3) => ({
  altitudFt: por(n, 200, 150, 100),
  rumboGrados: por(n, 20, 15, 10),
  velocidadKt: por(n, 20, 15, 10),
  ...comunes(n),
  duracionSeg: por(n, 60, 90, 120),
});

export const tolLento = (n: Nivel = 3) => ({
  altitudFt: por(n, 200, 150, 100),
  rumboGrados: por(n, 20, 15, 10),
  inclinacionGrados: por(n, 20, 15, 10),
  /** Banda de velocidad: objetivo +X/−0. */
  velocidadMasKt: por(n, 20, 15, 10),
  ...comunes(n),
});

export const tolRumbos = (n: Nivel = 3) => ({
  altitudFt: por(n, 200, 150, 100),
  inclinacionGrados: por(n, 10, 7, 5),
  /** Rumbo al nivelar y mientras se mantiene. */
  rumboGrados: por(n, 20, 15, 10),
  velocidadKt: por(n, 20, 15, 10),
  ...comunes(n),
});

export const tolAltitud = (n: Nivel = 3) => ({
  /** Al nivelar y mientras se mantiene. */
  altitudFt: por(n, 200, 150, 100),
  /** Kt fuera de la banda de velocidad (70–74 al subir, 90–95 al bajar; Erik). */
  velocidadKt: por(n, 10, 7, 5),
  rumboGrados: por(n, 20, 15, 10),
  ...comunes(n),
});

export const tolCombinado = (n: Nivel = 3) => ({
  /** Al nivelar y mientras se mantiene. */
  altitudFt: por(n, 200, 150, 100),
  /** Kt fuera de la banda (la misma de ascensos y descensos). */
  velocidadKt: por(n, 10, 7, 5),
  inclinacionGrados: por(n, 10, 7, 5),
  /** Al nivelar alas y mientras se mantiene. */
  rumboGrados: por(n, 20, 15, 10),
  ...comunes(n),
});

export const tolCircuito = (n: Nivel = 3) => ({
  /** Altitud del circuito en viento en cola. */
  altitudFt: por(n, 200, 150, 100),
  /** Kt fuera de la banda (ascenso y final) o de 90 en viento en cola. */
  velocidadKt: por(n, 10, 7, 5),
  /** Grados sobre 30°. */
  inclinacionGrados: por(n, 10, 7, 5),
  /** Régimen de descenso máximo al tocar. ponytail: números míos, Erik los ajusta. */
  toqueFpm: por(n, 600, 500, 400),
  ...comunes(n),
});

export const tolFalla = (n: Nivel = 3) => ({
  /** Segundos para ralentí tras «falla de motor» y para potencia completa tras «recupera». */
  reaccionSeg: por(n, 5, 4, 3),
  /** Kt de la velocidad de planeo (68) o fuera de la banda de ascenso. */
  velocidadKt: por(n, 10, 7, 5),
  ...comunes(n),
});

/** Maniobras con referencia en tierra («S», «8»): Difícil = ACS (±100 ft, ±10 kt). */
export const tolS = (n: Nivel = 3) => ({
  altitudFt: por(n, 200, 150, 100),
  velocidadKt: por(n, 20, 15, 10),
  /** Inclinación al cruzar el camino. */
  alasGrados: por(n, 20, 15, 10),
  /** Rumbo al cruzar: perpendicular al camino. */
  rumboGrados: por(n, 20, 15, 10),
  /** Diferencia entre lo que se aleja cada curva, en % de la mayor. ponytail: números míos. */
  simetriaPct: por(n, 40, 30, 20),
  /** Grados sobre 45°. */
  inclinacionGrados: por(n, 10, 7, 5),
  ...comunes(n),
});

/** Velocidad en final del repaso, kt bajo y sobre la de aproximación. */
export const tolFinal = (n: Nivel = 3) => ({ menos: por(n, 10, 7, 5), mas: por(n, 15, 12, 10) });

export const INVITA_SUBIR: Record<Idioma, (n: Nivel) => string> = {
  es: (n) => `Aprobaste dos seguidas: ya puedes intentarlo en ${NOMBRE_NIVEL.es[n]}.`,
  en: (n) => `Two passes in a row: you can try it on ${NOMBRE_NIVEL.en[n]} now.`,
};

/** El nivel guardado en el detalle de un intento; los viejos no lo tienen y fueron con las tolerancias de Difícil. */
export function nivelDe(detalle: unknown): Nivel {
  const n = (detalle as { nivel?: unknown } | null | undefined)?.nivel;
  return n === 1 || n === 2 ? n : 3;
}

/** El nivel siguiente si las dos últimas prácticas fueron aprobadas en el nivel actual; si no, null. */
export function sugerirNivel(intentos: { modo: string; aprobado: boolean; detalle: unknown }[], nivel: Nivel): Nivel | null {
  if (nivel === 3) return null;
  const ultimas = intentos.filter((x) => x.modo === "practica").slice(-2);
  if (ultimas.length < 2 || intentos.at(-1)?.modo !== "practica") return null;
  return ultimas.every((x) => x.aprobado && nivelDe(x.detalle) === nivel) ? ((nivel + 1) as Nivel) : null;
}
