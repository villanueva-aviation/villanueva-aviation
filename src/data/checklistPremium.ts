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
    id: "falla-motor-vuelo",
    titulo: "Falla de motor en vuelo",
    pasos: ["Velocidad de mejor planeo", "Área de aterrizaje seleccionada", "Combustible: AMBOS", "Mezcla: RICA", "Magnetos: AMBOS, luego cada uno", "Bomba auxiliar: ON", "Si no responde: MAYDAY"],
  },
  {
    id: "fuego-vuelo",
    titulo: "Fuego en vuelo (motor)",
    pasos: ["Mezcla: CORTE", "Combustible: OFF", "Calefacción cabina: cerrada", "Velocidad de planeo establecida", "Magnetos: OFF"],
  },
  {
    id: "falla-electrica",
    titulo: "Falla eléctrica total",
    pasos: ["Alternador y breakers: verificados", "Cargas no esenciales: OFF", "Priorizar transponder y radio", "Planear aeropuerto más cercano"],
  },
  {
    id: "aterrizaje-forzado",
    titulo: "Aterrizaje forzado sin motor",
    pasos: ["Velocidad de mejor planeo", "Área seleccionada, viento a favor", "Combustible y magnetos: OFF", "Puertas: sin asegurar", "Cinturones: ajustados al máximo", "Squawk 7700"],
  },
  {
    id: "perdida-barrena",
    titulo: "Recuperación de pérdida / barrena incipiente",
    pasos: ["Potencia: ralentí", "Alerones: neutros", "Timón: opuesto a la rotación", "Elevador: presión hacia adelante", "Nivelar y aplicar potencia"],
  },
];

// Análogos al C172 — misma familia de procedimientos, valores de V-speeds distintos.
export const FLUJOS_C152: Flujo[] = FLUJOS_C172.map((f) => ({ ...f, id: `c152-${f.id}` }));

export const VSPEEDS_C172: VSpeed[] = [
  { clave: "Vr", nombre: "Rotación", valor: "55 kt" },
  { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "62 kt" },
  { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "74 kt" },
  { clave: "Va", nombre: "Velocidad de maniobra (a peso máximo)", valor: "97 kt" },
  { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "85 kt" },
  { clave: "Vno", nombre: "Máxima estructural normal", valor: "129 kt" },
  { clave: "Vne", nombre: "Nunca exceder", valor: "163 kt" },
  { clave: "Vs", nombre: "Pérdida, configuración limpia", valor: "48 kt" },
  { clave: "Vs0", nombre: "Pérdida, configuración de aterrizaje", valor: "41 kt" },
];

export const VSPEEDS_C152: VSpeed[] = [
  { clave: "Vr", nombre: "Rotación", valor: "50 kt" },
  { clave: "Vx", nombre: "Mejor ángulo de ascenso", valor: "54 kt" },
  { clave: "Vy", nombre: "Mejor tasa de ascenso", valor: "67 kt" },
  { clave: "Va", nombre: "Velocidad de maniobra (a peso máximo)", valor: "93 kt" },
  { clave: "Vfe", nombre: "Máxima con flaps extendidos", valor: "85 kt" },
  { clave: "Vno", nombre: "Máxima estructural normal", valor: "111 kt" },
  { clave: "Vne", nombre: "Nunca exceder", valor: "149 kt" },
  { clave: "Vs", nombre: "Pérdida, configuración limpia", valor: "40 kt" },
  { clave: "Vs0", nombre: "Pérdida, configuración de aterrizaje", valor: "33 kt" },
];
