/**
 * Entradas a una espera (AIM 5-3-8, FAA; PANS-OPS 8168, OACI). Se decide con el rumbo con el que llegas al
 * fijo respecto al curso de ACERCAMIENTO (el rumbo del tramo que llega al fijo). En una espera estándar
 * (giros a la derecha), medido desde ese rumbo:
 *   a su derecha (0° a 180°)               -> directa    (180° de sector)
 *   a su izquierda, hasta 70°              -> gota       (70°)
 *   a su izquierda, de 70° a 180°          -> paralela   (110°)
 * En una espera a la izquierda todo se refleja.
 *
 * Es lo mismo que decir: directa si girar en el sentido de la espera hasta el rumbo de alejamiento son menos
 * de 180°; si no, paralela cuando bastan menos de 110° a la izquierda, y gota en el resto.
 * Ejemplo de la FAA: espera al este del VOR (radial 090), a la derecha: llegar con 230° es gota, con 160°
 * paralela y con 340° directa.
 *
 * Internamente se usa la diferencia d = rumbo de llegada − curso de alejamiento (0-359, hacia el lado de la
 * espera): paralela 0-110, gota 110-180, directa 180-360.
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

/** Diferencia entre el rumbo de llegada y el curso de alejamiento, de 0 a 359 (se invierte en esperas a la izquierda). */
export function diferencia(rumbo: number, alejamiento: number, giros: Giros): number {
  return norm(giros === "derecha" ? rumbo - alejamiento : alejamiento - rumbo);
}

export function entradaEspera(rumbo: number, alejamiento: number, giros: Giros): Entrada {
  const d = diferencia(rumbo, alejamiento, giros);
  if (d > 0 && d <= 110) return "paralela";
  if (d > 110 && d <= 180) return "gota";
  return "directa";
}

/** Los tres sectores en el espacio de la diferencia (grados), para dibujarlos. */
export const SECTORES: { entrada: Entrada; desde: number; hasta: number }[] = [
  { entrada: "paralela", desde: 0, hasta: 110 },
  { entrada: "gota", desde: 110, hasta: 180 },
  { entrada: "directa", desde: 180, hasta: 360 },
];

/** Las preguntas evitan rumbos pegados a una frontera, donde dos fuentes pueden discrepar por un grado. */
const MARGEN = 10;
const cercaDeFrontera = (d: number) => [0, 110, 180].some((f) => Math.abs(d - f) < MARGEN) || 360 - d < MARGEN;

export function generarSituacion(azar: () => number = Math.random): Situacion {
  const giros: Giros = azar() < 0.75 ? "derecha" : "izquierda";
  const alejamiento = Math.floor(azar() * 36) * 10;
  for (;;) {
    const d = Math.floor(azar() * 72) * 5;
    if (cercaDeFrontera(d)) continue;
    const rumbo = norm(giros === "derecha" ? alejamiento + d : alejamiento - d);
    return { alejamiento, giros, rumbo };
  }
}

/** Cómo se vuela cada entrada, con los giros escritos en el sentido correcto para esa espera. */
export function comoSeVuela(entrada: Entrada, giros: Giros): string {
  const enLaEspera = giros === "derecha" ? "a la derecha" : "a la izquierda";
  const haciaElLado = giros === "derecha" ? "a la izquierda" : "a la derecha";
  switch (entrada) {
    case "directa":
      return `Vuelas al fijo y giras ${enLaEspera} (como los giros de la espera) para seguir el patrón.`;
    case "gota":
      return `En el fijo tomas un rumbo de alejamiento desplazado 30° hacia el lado de la espera durante 1 minuto, y giras ${enLaEspera} para interceptar el acercamiento.`;
    case "paralela":
      return `En el fijo tomas el rumbo de alejamiento, paralelo al patrón y del lado contrario al de la espera, durante 1 minuto; luego giras ${haciaElLado} (hacia el lado de la espera, contrario a los giros del patrón) más de 180° para interceptar el acercamiento.`;
  }
}

export const NOMBRE_ENTRADA: Record<Entrada, string> = { directa: "Directa", gota: "Gota", paralela: "Paralela" };
