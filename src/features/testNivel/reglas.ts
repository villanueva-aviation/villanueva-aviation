// Reglas puras del test de nivel (sin datos pesados, para poder probarlas con `npm test`).

export type NivelTest = "Principiante" | "Base" | "Intermedio" | "Avanzado";

export const AREAS_TEST = ["Fundamentos", "Meteorología", "Navegación", "Comunicaciones", "Instrumentos", "IFR"] as const;
export type AreaTest = (typeof AREAS_TEST)[number];

/** Módulo de la Academia que refuerza cada área. */
export const MODULO_DE_AREA: Record<AreaTest, string> = {
  Fundamentos: "fundamentos",
  Meteorología: "meteorologia",
  Navegación: "navegacion",
  Comunicaciones: "comunicaciones",
  Instrumentos: "instrumentos",
  IFR: "ifr",
};

/** Nivel según la proporción de aciertos (12 preguntas: 0-3 Principiante, 4-6 Base, 7-9 Intermedio, 10-12 Avanzado). */
export function nivelTest(aciertos: number, total: number): NivelTest {
  const p = total === 0 ? 0 : aciertos / total;
  if (p < 0.3) return "Principiante";
  if (p < 0.55) return "Base";
  if (p < 0.8) return "Intermedio";
  return "Avanzado";
}

export interface RespuestaTest {
  area: AreaTest;
  acierto: boolean;
}

/** Aciertos y total por área, en el orden de AREAS_TEST. */
export function resumenPorArea(respuestas: RespuestaTest[]): { area: AreaTest; aciertos: number; total: number }[] {
  return AREAS_TEST.map((area) => {
    const delArea = respuestas.filter((r) => r.area === area);
    return { area, aciertos: delArea.filter((r) => r.acierto).length, total: delArea.length };
  });
}

/** El área con menos aciertos, o null si todas están completas (nada que reforzar). */
export function areaMasDebil(resumen: { area: AreaTest; aciertos: number; total: number }[]): AreaTest | null {
  let peor: { area: AreaTest; falta: number } | null = null;
  for (const r of resumen) {
    const falta = r.total - r.aciertos;
    if (falta > 0 && (!peor || falta > peor.falta)) peor = { area: r.area, falta };
  }
  return peor?.area ?? null;
}

/** `?ref=` del enlace, limpio para la columna `fuente` (minúsculas, números, guion; máximo 40). Si no sirve, null. */
export function fuenteDeEnlace(busqueda: string): string | null {
  const ref = new URLSearchParams(busqueda).get("ref")?.trim().toLowerCase() ?? "";
  return /^[a-z0-9_-]{1,40}$/.test(ref) ? ref : null;
}

/** La fila anónima que se guarda al terminar el test: sin datos de la persona, solo aciertos. */
export function filaResultado(respuestas: RespuestaTest[], total: number, fuente: string | null) {
  const aciertos = respuestas.filter((r) => r.acierto).length;
  return {
    aciertos,
    nivel: nivelTest(aciertos, total),
    areas: Object.fromEntries(resumenPorArea(respuestas).map((r) => [r.area, r.aciertos])),
    fuente,
  };
}
