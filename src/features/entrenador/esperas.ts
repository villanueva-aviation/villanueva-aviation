/**
 * Entradas a una espera (AIM 5-3-8, FAA; PANS-OPS 8168, OACI). Se decide con el rumbo con el que llegas al
 * fijo (rumbo a la estación) comparado con el rumbo de ALEJAMIENTO:
 *   hasta 70° hacia el lado de la espera            -> gota      (70° de sector)
 *   hasta 110° hacia el lado contrario              -> paralela  (110°)
 *   el resto                                        -> directa   (180°)
 * En una espera a la derecha el lado de la espera es la izquierda del rumbo de alejamiento. Con números,
 * d = rumbo de llegada − curso de alejamiento (0-359; se invierte en esperas a la izquierda):
 *   paralela 0° a 110°, directa 110° a 290°, gota 290° a 360° (o sea, -70° a 0°).
 * La figura de la FAA para la espera al este del VOR (radial 090, giros a la derecha) marca los rumbos 020
 * (la línea de 70°), 090 y 200: 020 a 090 gota, 090 a 200 paralela, 200 a 020 directa. Contrastado con el
 * calculador de entradas de holdingentrycalculator.com (70 de 70 casos, esperas a la derecha y a la izquierda).
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
  if (d > 110 && d <= 290) return "directa";
  return "gota";
}

/** Los tres sectores en el espacio de la diferencia (grados), para dibujarlos. */
export const SECTORES: { entrada: Entrada; desde: number; hasta: number }[] = [
  { entrada: "gota", desde: -70, hasta: 0 },
  { entrada: "paralela", desde: 0, hasta: 110 },
  { entrada: "directa", desde: 110, hasta: 290 },
];

/** Las preguntas evitan rumbos pegados a una frontera, donde dos fuentes pueden discrepar por un grado. */
const MARGEN = 10;
const cercaDeFrontera = (d: number) => [0, 110, 290].some((f) => Math.abs(d - f) < MARGEN) || 360 - d < MARGEN;

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
