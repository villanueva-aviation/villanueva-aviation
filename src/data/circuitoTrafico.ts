export interface TramoCircuito {
  id: string;
  numero: number;
  nombre: string;
  nombreIngles: string;
  xPct: number;
  yPct: number;
  queHace: string;
  reporteRadio: string;
}

export interface SituacionCircuito {
  id: string;
  prompt: string;
  tramoCorrectoId: string;
}

export const TRAMOS_CIRCUITO: TramoCircuito[] = [
  {
    id: "viento-en-cara",
    numero: 1,
    nombre: "Viento en Cara",
    nombreIngles: "Upwind",
    xPct: 68,
    yPct: 80,
    queHace: "Mantén el rumbo de pista y sigue ascendiendo hasta acercarte a la altitud de circuito (usualmente 1000 pies AGL), preparándote para el primer viraje de 90° hacia viento cruzado.",
    reporteRadio: "No suele haber un reporte de radio aquí — ya despegaste con autorización de torre o anunciaste tu salida en la frecuencia CTAF.",
  },
  {
    id: "viento-cruzado",
    numero: 2,
    nombre: "Viento Cruzado",
    nombreIngles: "Crosswind",
    xPct: 85,
    yPct: 50,
    queHace: "Viras 90° al llegar cerca de la altitud de circuito y continúas ascendiendo hasta alcanzarla por completo antes del siguiente viraje.",
    reporteRadio: "Torre, XB-VLA, viento cruzado pista 20.",
  },
  {
    id: "viento-en-cola",
    numero: 3,
    nombre: "Viento en cola",
    nombreIngles: "Downwind",
    xPct: 50,
    yPct: 20,
    queHace: "Vuelas paralelo a la pista, en sentido contrario a tu despegue, manteniendo la altitud de circuito — aquí completas tu checklist previo a aterrizaje (mezcla, mandos, luces).",
    reporteRadio: "Torre, XB-VLA, viento en cola pista 20.",
  },
  {
    id: "base",
    numero: 4,
    nombre: "Base",
    nombreIngles: "Base",
    xPct: 15,
    yPct: 50,
    queHace: "Viras 90° hacia la pista, inicias el descenso y ajustas flaps según tu procedimiento, buscando alinear tu tramo final con el eje de pista.",
    reporteRadio: "Torre, XB-VLA, base pista 20.",
  },
  {
    id: "final",
    numero: 5,
    nombre: "Final",
    nombreIngles: "Final",
    xPct: 32,
    yPct: 80,
    queHace: "Alineado con el eje de pista, en descenso estabilizado hacia el punto de aterrizaje, confirmas autorización de aterrizaje antes de cruzar el umbral.",
    reporteRadio: "Torre, XB-VLA, final pista 20.",
  },
];

export const SITUACIONES_CIRCUITO: SituacionCircuito[] = [
  { id: "sit-1", prompt: "Acabas de despegar y sigues alineado con el eje de pista, ganando altitud antes del primer viraje. ¿En qué tramo estás?", tramoCorrectoId: "viento-en-cara" },
  { id: "sit-2", prompt: "Estás a la altitud de despegue, todavía sin haber virado, justo después de cruzar el umbral de pista. ¿Qué tramo es este?", tramoCorrectoId: "viento-en-cara" },
  { id: "sit-3", prompt: "Escuchas: \"Torre, XB-VLA, viento cruzado pista 20.\" ¿En qué tramo está ese avión?", tramoCorrectoId: "viento-cruzado" },
  { id: "sit-4", prompt: "Acabas de virar 90° tras el despegue y sigues ascendiendo hacia la altitud de circuito. ¿Qué tramo es?", tramoCorrectoId: "viento-cruzado" },
  { id: "sit-5", prompt: "Escuchas: \"Torre, XB-VLA, viento en cola pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "viento-en-cola" },
  { id: "sit-6", prompt: "Vuelas paralelo a la pista, en sentido contrario a tu despegue, completando tu checklist previo a aterrizaje. ¿Qué tramo es?", tramoCorrectoId: "viento-en-cola" },
  { id: "sit-7", prompt: "Escuchas: \"Torre, XB-VLA, base pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "base" },
  { id: "sit-8", prompt: "Acabas de virar hacia la pista y comienzas a descender, bajando flaps. ¿Qué tramo es?", tramoCorrectoId: "base" },
  { id: "sit-9", prompt: "Escuchas: \"Torre, XB-VLA, final pista 20.\" ¿En qué tramo está?", tramoCorrectoId: "final" },
  { id: "sit-10", prompt: "Estás alineado con el eje de pista, en descenso estabilizado, a punto de cruzar el umbral. ¿Qué tramo es?", tramoCorrectoId: "final" },
];

/**
 * Las situaciones de arriba preguntan por el reporte de radio, que es lo que
 * importa en Comunicaciones. Estas otras dos tandas atacan el mismo tablero
 * desde donde le duele a cada módulo: en VFR, dónde estás y a qué altura; en
 * Operación, qué te toca hacer en cada tramo.
 */
export const SITUACIONES_CIRCUITO_VFR: SituacionCircuito[] = [
  { id: "vfr-1", prompt: "Vienes desde fuera del aeródromo y te incorporas al circuito con un ángulo de 45° hacia el tramo largo, paralelo a la pista. ¿A qué tramo te estás incorporando?", tramoCorrectoId: "viento-en-cola" },
  { id: "vfr-2", prompt: "Es el único tramo en el que vuelas en sentido contrario al de aterrizaje, manteniendo la altitud de circuito. ¿Cuál es?", tramoCorrectoId: "viento-en-cola" },
  { id: "vfr-3", prompt: "Acabas de dejar la altitud de circuito e iniciaste el descenso, perpendicular al eje de pista. ¿En qué tramo vas?", tramoCorrectoId: "base" },
  { id: "vfr-4", prompt: "Es el último viraje antes de quedar alineado con la pista, y el punto donde más accidentes por entrada en pérdida ocurren por cruzar el viraje con timón. ¿De qué tramo sales en ese viraje?", tramoCorrectoId: "base" },
  { id: "vfr-5", prompt: "Todavía no has virado y sigues ascendiendo sobre la prolongación del eje de pista, con el viento de frente. ¿Qué tramo es?", tramoCorrectoId: "viento-en-cara" },
  { id: "vfr-6", prompt: "Es el primer viraje después del despegue, perpendicular a la pista y todavía en ascenso hacia la altitud de circuito. ¿Cómo se llama ese tramo?", tramoCorrectoId: "viento-cruzado" },
  { id: "vfr-7", prompt: "Estás alineado con el eje de pista, en descenso estabilizado. Si en este punto no tienes la aeronave estabilizada, corresponde un motor y al aire. ¿Qué tramo es?", tramoCorrectoId: "final" },
  { id: "vfr-8", prompt: "Otro avión te reporta que está a tu izquierda y por debajo, alineado con la pista para aterrizar, mientras tú todavía vuelas paralelo en sentido contrario. ¿En qué tramo está él?", tramoCorrectoId: "final" },
];

export const SITUACIONES_CIRCUITO_OPERACION: SituacionCircuito[] = [
  { id: "ope-1", prompt: "Es el tramo donde corresponde completar el checklist previo a aterrizaje: mezcla, mandos y luces. ¿Cuál es?", tramoCorrectoId: "viento-en-cola" },
  { id: "ope-2", prompt: "Aquí ajustas flaps y empiezas a configurar la aeronave para el descenso final, después de virar 90° hacia la pista. ¿Qué tramo es?", tramoCorrectoId: "base" },
  { id: "ope-3", prompt: "Es donde confirmas tu autorización de aterrizaje antes de cruzar el umbral. ¿En qué tramo estás?", tramoCorrectoId: "final" },
  { id: "ope-4", prompt: "En este tramo todavía no hay reporte de radio: ya despegaste con autorización o anunciaste tu salida en la frecuencia. ¿Cuál es?", tramoCorrectoId: "viento-en-cara" },
  { id: "ope-5", prompt: "Aquí terminas de alcanzar la altitud de circuito por completo, antes del siguiente viraje. ¿Qué tramo es?", tramoCorrectoId: "viento-cruzado" },
  { id: "ope-6", prompt: "Si tuvieras que abortar el aterrizaje y hacer motor y al aire, volverías a encontrarte volando sobre la prolongación del eje de pista, en ascenso. ¿A qué tramo regresas?", tramoCorrectoId: "viento-en-cara" },
  { id: "ope-7", prompt: "Es el tramo más largo del circuito y el que te da tiempo de organizar la secuencia con el tráfico que ya está en el aire. ¿Cuál es?", tramoCorrectoId: "viento-en-cola" },
  { id: "ope-8", prompt: "Torre te pide extender este tramo por tráfico en final. Estás volando paralelo a la pista en sentido contrario. ¿Qué tramo te pidieron extender?", tramoCorrectoId: "viento-en-cola" },
];

/** Tandas de preguntas que puede pedir una actividad de la Academia. */
export const CIRCUITO_SETS: Record<string, SituacionCircuito[]> = {
  comunicaciones: SITUACIONES_CIRCUITO,
  vfr: SITUACIONES_CIRCUITO_VFR,
  operacion: SITUACIONES_CIRCUITO_OPERACION,
};
