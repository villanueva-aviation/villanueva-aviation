import type { ChecklistFase } from "./checklistC172";

/**
 * Guía paso a paso de planificación de vuelo VFR, desde el clima hasta el
 * combustible — punto de partida para que la escuela lo ajuste a su región
 * y procedimientos específicos.
 */
export const GUIA_VFR: ChecklistFase[] = [
  {
    id: "meteorologia",
    titulo: "Meteorología y NOTAMs",
    items: [
      { id: "v1", texto: "METAR y TAF de salida, destino y alterno — revisados y decodificados" },
      { id: "v2", texto: "NOTAMs de la ruta y aeródromos involucrados — revisados" },
      { id: "v3", texto: "Mínimos VFR del espacio aéreo a cruzar — verificados contra el pronóstico" },
      { id: "v4", texto: "Fenómenos relevantes (turbulencia, hielo, tormentas) — evaluados en la ruta" },
    ],
  },
  {
    id: "ruta",
    titulo: "Ruta y checkpoints",
    items: [
      { id: "v5", texto: "Checkpoints visuales identificables — seleccionados a lo largo de la ruta" },
      { id: "v6", texto: "Ruta trazada en la carta VFR con lápiz o marcador" },
      { id: "v7", texto: "Espacios aéreos a cruzar — identificados junto con sus requisitos" },
      { id: "v8", texto: "Obstáculos y MEF de cada cuadrante — revisados" },
    ],
  },
  {
    id: "navegacion",
    titulo: "Cálculos de navegación",
    items: [
      { id: "v9", texto: "Rumbo magnético — calculado para cada tramo" },
      { id: "v10", texto: "Distancia — medida por tramo y total" },
      { id: "v11", texto: "Viento pronosticado — aplicado para estimar rumbo de corrección y tiempo" },
      { id: "v12", texto: "Tiempo estimado — calculado por tramo y acumulado" },
    ],
  },
  {
    id: "combustible",
    titulo: "Combustible",
    items: [
      { id: "v13", texto: "Consumo total de la ruta — calculado según velocidad de crucero" },
      { id: "v14", texto: "Reserva reglamentaria — agregada (mínimo 30 min VFR diurno, 45 min nocturno/IFR)" },
      { id: "v15", texto: "Combustible al alterno — incluido en el cálculo si aplica" },
      { id: "v16", texto: "Autonomía total — verificada contra el combustible a bordo" },
    ],
  },
  {
    id: "alterno",
    titulo: "Alterno y contingencias",
    items: [
      { id: "v17", texto: "Aeropuerto alterno — seleccionado con mejor clima pronosticado" },
      { id: "v18", texto: "Plan B — definido si el destino no es viable a la llegada" },
      { id: "v19", texto: "Puntos de desvío intermedios — identificados a lo largo de la ruta" },
    ],
  },
  {
    id: "documentacion",
    titulo: "Documentación y plan de vuelo",
    items: [
      { id: "v20", texto: "Formulario de plan de vuelo — completado" },
      { id: "v21", texto: "Documentos de la aeronave y del piloto — vigentes y a bordo" },
      { id: "v22", texto: "Plan de vuelo — presentado a la autoridad correspondiente si aplica" },
    ],
  },
  {
    id: "dia-vuelo",
    titulo: "Día del vuelo",
    items: [
      { id: "v23", texto: "Clima actualizado — revisado justo antes de salir" },
      { id: "v24", texto: "Peso y balance — calculado con la carga real del día" },
      { id: "v25", texto: "Inspección prevuelo — realizada siguiendo la checklist de la aeronave" },
    ],
  },
];
