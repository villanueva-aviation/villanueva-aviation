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
