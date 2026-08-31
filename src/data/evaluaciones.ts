export interface ExamenTeorico {
  id: string;
  modulo: string;
  titulo: string;
  calificacion: number | null;
  intentos: number;
  estado: "aprobado" | "reprobado" | "pendiente";
  fecha: string | null;
  temasRefuerzo: string[];
}

/** Un examen puede aprobarse en vivo dentro de Academia; esta función refleja ese resultado sin duplicar el conteo en cada página. */
export function contarExamenesAprobados(examenResultado: (slug: string) => { passed: boolean } | null): number {
  return EXAMENES_TEORICOS.filter((ex) => {
    const resultado = examenResultado(ex.id.replace(/^ex-/, ""));
    return resultado ? resultado.passed : ex.estado === "aprobado";
  }).length;
}

export const EXAMENES_TEORICOS: ExamenTeorico[] = [
  {
    id: "ex-fundamentos",
    modulo: "Fundamentos",
    titulo: "Examen de Fundamentos de Aviación",
    calificacion: null,
    intentos: 0,
    estado: "pendiente",
    fecha: null,
    temasRefuerzo: [],
  },
  {
    id: "ex-meteorologia",
    modulo: "Meteorología",
    titulo: "Examen de Meteorología",
    calificacion: 78,
    intentos: 1,
    estado: "aprobado",
    fecha: "2026-07-14",
    temasRefuerzo: ["Frentes ocluidos"],
  },
  {
    id: "ex-aerodinamica",
    modulo: "Aerodinámica",
    titulo: "Examen de Aerodinámica",
    calificacion: 58,
    intentos: 2,
    estado: "reprobado",
    fecha: "2026-08-02",
    temasRefuerzo: ["Pérdida y factor de carga", "Efecto suelo"],
  },
];

export type EvaluacionPracticaEstado = "Solicitada" | "En revisión" | "Programada" | "Completada";

export interface EvaluacionPractica {
  id: string;
  tipo: string;
  aeronave: string;
  aeropuerto: string;
  fechaHorario: string;
  comentarios: string;
  estado: EvaluacionPracticaEstado;
}

export const EVALUACIONES_PRACTICAS_INICIALES: EvaluacionPractica[] = [
  {
    id: "ep-1",
    tipo: "Circuito de tráfico VFR",
    aeronave: "Cessna 172",
    aeropuerto: "MMGL — Guadalajara",
    fechaHorario: "2026-08-22 · 18:00",
    comentarios: "Primera evaluación práctica del cadete.",
    estado: "Completada",
  },
];
