export interface Flujo {
  id: string;
  titulo: string;
  pasos: string[];
}

export interface VSpeed {
  clave: string;
  nombre: string;
  valor: string;
}

/**
 * Flujos de memoria (memory items) para emergencias — pasos cortos pensados
 * para recitarse de memoria, no para leerse durante la emergencia como un
 * checklist normal. Valores de referencia genéricos, confirma los de tu
 * aeronave específica en su POH.
 */
export const FLUJOS_C172: Flujo[] = [
  {
    id: "falla-inmediata-despegue",
    titulo: "Falla de motor inmediatamente después del despegue",
    pasos: ["Velocidad: 70 KIAS (flaps arriba) / 65 (flaps abajo)", "Mezcla: CORTE", "Combustible: OFF", "Encendido: OFF", "Puerta: sin asegurar", "Aterrizar recto al frente"],
  },
  {
    id: "falla-motor-vuelo",
    titulo: "Falla de motor en vuelo (reencendido)",
    pasos: ["Velocidad de mejor planeo: 68 KIAS", "Válvula de combustible: ON, selector AMBOS", "Bomba auxiliar: ON", "Mezcla: RICA", "Encendido: AMBOS (o START)", "Si no responde: área seleccionada y MAYDAY"],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego de motor en vuelo",
    pasos: ["Mezcla: CORTE", "Válvula de combustible: OFF", "Bomba auxiliar: OFF", "Master: OFF", "Calefacción cabina: cerrada", "Velocidad: 100 KIAS si no se apaga"],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica (baja tensión)",
    pasos: ["Aviónica Master: OFF", "Breaker del alternador: revisado", "Master: OFF y luego ON", "Aviónica Master: ON otra vez", "Si vuelve a fallar: alternador OFF, terminar vuelo"],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    pasos: ["Velocidad: 70 KIAS (flaps arriba) / 65 (flaps abajo)", "Mezcla y combustible: OFF", "Encendido: OFF", "Puertas: sin asegurar", "Cinturones: ajustados al máximo", "Toque: cola baja"],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    pasos: ["Potencia: ralentí", "Alerones: neutros", "Timón: opuesto a la rotación", "Elevador: presión hacia adelante", "Nivelar y aplicar potencia"],
  },
];

// El C152 es de motor a carburador, una sola válvula de combustible (sin selector) y sin bomba auxiliar — no los pasos del C172 a inyección.
export const FLUJOS_C152: Flujo[] = [
  {
    id: "c152-falla-inmediata-despegue",
    titulo: "Falla de motor inmediatamente después del despegue",
    pasos: ["Velocidad: 60 KIAS", "Mezcla: CORTE", "Combustible: OFF", "Encendido: OFF", "Aterrizar recto al frente"],
  },
  {
    id: "c152-falla-motor-vuelo",
    titulo: "Falla de motor en vuelo (reencendido)",
    pasos: ["Velocidad de mejor planeo: 60 KIAS", "Calentador de carburador: ON", "Primer: adentro y trabado", "Combustible: ON", "Mezcla: RICA", "Encendido: AMBOS (o START)"],
  },
  {
    id: "c152-fuego-vuelo",
    titulo: "Fuego de motor en vuelo",
    pasos: ["Mezcla: CORTE", "Combustible: OFF", "Master: OFF", "Calefacción cabina: cerrada", "Velocidad: 85 KIAS si no se apaga"],
  },
  {
    id: "c152-falla-electrica",
    titulo: "Falla eléctrica (baja tensión)",
    pasos: ["Radios: OFF", "Master: OFF y luego ON", "Luz de baja tensión: revisada", "Si vuelve a fallar: alternador OFF, terminar vuelo"],
  },
  {
    id: "c152-aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    pasos: ["Velocidad: 65 KIAS (flaps arriba) / 60 (flaps abajo)", "Mezcla y combustible: OFF", "Encendido: OFF", "Puertas: sin asegurar", "Cinturones: ajustados al máximo", "Toque: cola baja"],
  },
  {
    id: "c152-perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    pasos: ["Alerones: neutros", "Gases: ralentí", "Timón: opuesto a la rotación, a fondo", "Control de mando: adelante con firmeza", "Al detenerse: neutralizar timón y recuperar"],
  },
];

export const VSPEEDS_C172: VSpeed[] = [
  { clave: "Vr", nombre: "Rotación", valor: "55 kt" },
  { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "62 kt" },
  { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "74 kt" },
  { clave: "Va", nombre: "Velocidad de maniobra", valor: "105 kt a 2,550 lb (98 kt a 2,200 lb; 90 kt a 1,900 lb)" },
  { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "110 kt (flaps 10°) / 85 kt (10° a 30°)" },
  { clave: "Vno", nombre: "Máxima estructural normal", valor: "129 kt" },
  { clave: "Vne", nombre: "Nunca exceder", valor: "163 kt" },
  { clave: "Vs", nombre: "Pérdida, flaps arriba (2,550 lb)", valor: "48 kt" },
  { clave: "Vs0", nombre: "Pérdida, flaps 30° (2,550 lb)", valor: "40 kt" },
];

export const VSPEEDS_C152: VSpeed[] = [
  { clave: "Vr", nombre: "Rotación", valor: "50 kt" },
  { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "55 kt" },
  { clave: "Vy", nombre: "Mejor tasa de ascenso (nivel del mar)", valor: "67 kt" },
  { clave: "Va", nombre: "Velocidad de maniobra", valor: "104 kt a 1,670 lb (98 kt a 1,500 lb; 93 kt a 1,350 lb)" },
  { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "85 kt" },
  { clave: "Vno", nombre: "Máxima estructural normal", valor: "111 kt" },
  { clave: "Vne", nombre: "Nunca exceder", valor: "149 kt" },
  { clave: "Vs", nombre: "Pérdida, flaps arriba (1,670 lb)", valor: "40 kt" },
  { clave: "Vs0", nombre: "Pérdida, flaps 30° (1,670 lb)", valor: "35 kt" },
];
