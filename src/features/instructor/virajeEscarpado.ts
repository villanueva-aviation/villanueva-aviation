/**
 * Viraje escarpado del C172: la única fuente de tolerancias y reglas que usan el
 * instructor virtual y el simulacro de checkride de vuelo (checkrideVuelo.ts).
 * Basado en el ACS de piloto privado FAA-S-ACS-6C, Área V, Tarea A.
 */

export const TOLERANCIAS = { altitudFt: 100, velocidadKt: 10, inclinacionGrados: 5, rumboSalidaGrados: 10 } as const;
export const INCLINACION_OBJETIVO = 45;
/** Un viraje empieza cuando la inclinación pasa de aquí. */
export const INCLINACION_ENTRADA = 30;
/** La tolerancia de inclinación y la bola se miden ya establecido el viraje. */
export const INCLINACION_ESTABLECIDA = 40;
/** Por debajo de esto, las alas cuentan como niveladas. */
export const INCLINACION_NIVELADO = 10;

// Desviaciones breves que se corrigen no reprueban, como haría un examinador. Ajustables tras probar en vuelo.
export const NS_SEGUNDOS = 3;
export const NS_FACTOR = 1.5;

/** Virajes de limpieza: cambios de rumbo que sumen estos grados en la ventana antes de entrar. */
export const LIMPIEZA = { ventanaSeg: 120, grados: 90 } as const;
/** Práctica recomendada, no elemento del ACS: solo genera aviso. */
export const ALTURA_SEGURA_AGL = 1500;
/** La voz avisa al pasar de esta fracción de una tolerancia, antes de salirse. Ajustable. */
export const AVISO_FRACCION = 0.6;
/** Segundos antes de repetir el mismo aviso si sigue igual. */
export const REPETIR_AVISO_SEG = 8;
/** Fracción de la deflexión total de TURN COORDINATOR BALL (−1…1). Ajustable. */
export const BOLA_TOLERANCIA = 0.25;
/** Más segundos sin muestras invalida el intento. */
export const HUECO_MAX_SEG = 2;

// Va del C172S por peso (POH).
const VA: [number, number][] = [
  [1900, 90],
  [2200, 98],
  [2550, 105],
];

export function vaPorPeso(pesoLb: number): number {
  if (pesoLb <= VA[0][0]) return VA[0][1];
  for (let i = 1; i < VA.length; i++) {
    const [p1, v1] = VA[i];
    if (pesoLb <= p1) {
      const [p0, v0] = VA[i - 1];
      return v0 + ((pesoLb - p0) / (p1 - p0)) * (v1 - v0);
    }
  }
  return VA[VA.length - 1][1];
}

export type CodigoAcs = "PA.V.A.S1" | "PA.V.A.S2" | "PA.V.A.S3" | "PA.V.A.S4" | "PA.V.A.S5";

export const ELEMENTOS_ACS: { codigo: CodigoAcs; texto: string; textoEn: string }[] = [
  { codigo: "PA.V.A.S1", texto: "Despejar el área", textoEn: "Clear the area" },
  { codigo: "PA.V.A.S2", texto: "Velocidad de entrada ≤ Va", textoEn: "Entry airspeed ≤ Va" },
  { codigo: "PA.V.A.S3", texto: "360° coordinado a ~45°", textoEn: "Coordinated 360° at ~45°" },
  { codigo: "PA.V.A.S4", texto: "Repetir al lado contrario", textoEn: "Repeat in the opposite direction" },
  { codigo: "PA.V.A.S5", texto: "Alt ±100 · Vel ±10 · Incl ±5 · Rumbo ±10", textoEn: "Alt ±100 · Spd ±10 · Bank ±5 · Hdg ±10" },
];

export const MANIOBRAS: { id: "viraje-escarpado"; avion: "C172"; nombre: string; acceso: "gratis" | "exclusivo" }[] = [
  { id: "viraje-escarpado", avion: "C172", nombre: "Viraje escarpado", acceso: "gratis" },
];
