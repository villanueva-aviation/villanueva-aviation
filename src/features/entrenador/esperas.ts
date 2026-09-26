/**
 * Entradas a una espera (AIM 5-3-8, FAA). La entrada depende de la diferencia entre el rumbo con el
 * que llegas al fijo y el curso de alejamiento, contada hacia el lado de la espera:
 *   directa   de -70° a +110°  (180° de sector)
 *   gota      de 110° a 180°   (70°)
 *   paralela  de 180° a 290°   (110°)
 * En una espera a la izquierda todo se refleja. Ejemplo de la FAA: espera al este del VOR (radial 090),
 * giros a la derecha: llegar con 230° es gota, con 300° paralela y con 120° directa.
 */
export type Giros = "derecha" | "izquierda";
export type Entrada = "directa" | "gota" | "paralela";

export interface Situacion {
  /** Curso de alejamiento (el radial en el que se aleja del fijo), múltiplo de 10. */
  alejamiento: number;
  giros: Giros;
  /** Rumbo con el que llegas al fijo, múltiplo de 5. */
  rumbo: number;
}

export const norm = (grados: number) => ((grados % 360) + 360) % 360;

/** Diferencia entre el rumbo de llegada y el curso de alejamiento, de 0 a 359, medida hacia el lado de la espera. */
export function diferencia(rumbo: number, alejamiento: number, giros: Giros): number {
  return norm(giros === "derecha" ? rumbo - alejamiento : alejamiento - rumbo);
}

export function entradaEspera(rumbo: number, alejamiento: number, giros: Giros): Entrada {
  const d = diferencia(rumbo, alejamiento, giros);
  if (d > 110 && d <= 180) return "gota";
  if (d > 180 && d <= 290) return "paralela";
  return "directa";
}

/** Los tres sectores en el espacio de la diferencia (grados), para dibujarlos. */
export const SECTORES: { entrada: Entrada; desde: number; hasta: number }[] = [
  { entrada: "directa", desde: -70, hasta: 110 },
  { entrada: "gota", desde: 110, hasta: 180 },
  { entrada: "paralela", desde: 180, hasta: 290 },
];

const FRONTERAS = [110, 180, 290];
/** Las preguntas evitan rumbos pegados a una frontera, donde dos fuentes pueden discrepar por un grado. */
const MARGEN = 10;

export function generarSituacion(azar: () => number = Math.random): Situacion {
  const giros: Giros = azar() < 0.75 ? "derecha" : "izquierda";
  const alejamiento = Math.floor(azar() * 36) * 10;
  for (;;) {
    const d = Math.floor(azar() * 72) * 5;
    if (FRONTERAS.some((f) => Math.abs(d - f) < MARGEN)) continue;
    const rumbo = norm(giros === "derecha" ? alejamiento + d : alejamiento - d);
    return { alejamiento, giros, rumbo };
  }
}

export const COMO_SE_VUELA: Record<Entrada, string> = {
  directa: "Vuelas al fijo y giras en el sentido de la espera para seguir el patrón.",
  gota: "En el fijo tomas un rumbo de alejamiento desplazado 30° hacia el lado de la espera durante 1 minuto, y giras en el sentido de la espera para interceptar el acercamiento.",
  paralela:
    "En el fijo tomas un rumbo paralelo al de alejamiento, del lado contrario al de la espera, durante 1 minuto, y giras en el sentido de la espera más de 180° para volver al fijo o interceptar el acercamiento.",
};

export const NOMBRE_ENTRADA: Record<Entrada, string> = { directa: "Directa", gota: "Gota", paralela: "Paralela" };
