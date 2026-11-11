// Geometría del VOR y los ejercicios de interceptación del programa IFR. Puro.
// Radiales y cursos en grados magnéticos, como los da el radio NAV1.

export type CasoInterceptacion = "alejandose" | "acercandose" | "alejandose-amplio" | "acercandose-amplio" | "contrario";
/** `curso`: lo que va en el OBS. Alejándose (FROM) es el radial; acercándose (TO), el radial + 180. */
export type Ejercicio = { caso: CasoInterceptacion; radial: number; desde: boolean; curso: number };

/** Las 5 prácticas de la lección 1: el ángulo y el sentido cambian; la distancia es la que haya (el consejo la dice). */
export const CASOS_PRACTICA: CasoInterceptacion[] = ["alejandose", "acercandose", "alejandose-amplio", "acercandose-amplio", "contrario"];

export const norm180 = (g: number) => ((((g + 180) % 360) + 360) % 360) - 180;
const norm360 = (g: number) => ((g % 360) + 360) % 360;
const redondear10 = (g: number) => norm360(Math.round(g / 10) * 10);

/** Grados de desvío: positivo si el avión está a la derecha del curso, mirando hacia donde va el curso. */
export function desvioGrados(ej: Ejercicio, radialAvion: number): number {
  const d = norm180(radialAvion - ej.radial);
  return ej.desde ? d : -d;
}

/** Puntos de la barra: uno cada 2° en un VOR. */
export const puntos = (grados: number) => grados / 2;

/** Grados entre el radial del avión y el pedido para quedar a unas 2.5 NM: entre 15 y 60; amplio, 30 más (hasta 90). */
export function deltaRadial(dme: number, amplio: boolean): number {
  const base = Math.min(60, Math.max(15, (Math.asin(Math.min(1, 2.5 / Math.max(dme, 0.1))) * 180) / Math.PI));
  return Math.round(amplio ? Math.min(90, base + 30) : base);
}

export function generarEjercicio(caso: CasoInterceptacion, radialAvion: number, dme: number, rumbo: number, azar: () => number = Math.random): Ejercicio {
  if (caso === "contrario") {
    // El radial de al lado, en el sentido que obliga a virar más de 90°.
    const radial = redondear10(radialAvion + 20);
    const desde = Math.abs(norm180(radial - rumbo)) > 90;
    return { caso, radial, desde, curso: desde ? radial : norm360(radial + 180) };
  }
  const signo = azar() < 0.5 ? 1 : -1;
  const radial = redondear10(radialAvion + signo * deltaRadial(dme, caso.endsWith("amplio")));
  const desde = caso.startsWith("alejandose");
  return { caso, radial, desde, curso: desde ? radial : norm360(radial + 180) };
}

/** El examen: una interceptación alejándose y una acercándose, sin consejos. */
export function casosExamen(azar: () => number = Math.random): [CasoInterceptacion, CasoInterceptacion] {
  return [azar() < 0.5 ? "alejandose" : "alejandose-amplio", azar() < 0.5 ? "acercandose" : "acercandose-amplio"];
}

/** Cerca, la barra se mueve rápido; lejos, tarda (Erik). */
export const distanciaConsejo = (dme: number): "cerca" | "lejos" | null => (dme < 5 ? "cerca" : dme > 15 ? "lejos" : null);
