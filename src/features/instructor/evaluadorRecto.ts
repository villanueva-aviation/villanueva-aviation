import { analizar, difRumbo, invalidez, type Muestra, type Tramo } from "./evaluador.ts";
import { DURACION_SEG, ESTABLE, TOLERANCIAS_RECTO } from "./rectoNivelado.ts";
import { BOLA_TOLERANCIA, INCLINACION_NIVELADO } from "./virajeEscarpado.ts";

export type CampoRecto = "altitud" | "rumbo" | "velocidad" | "bola";
export type CodigoRecto = "1" | "2" | "3" | "4"; // altitud, rumbo, velocidad, bola
export type FaseRecto = "armado" | "manteniendo" | "terminado" | "invalido";

export interface ResultadoRecto {
  maniobra: "recto-nivelado";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<CodigoRecto, "S" | "NS">;
  objetivo: { t: number; altitud: number; rumbo: number; velocidad: number };
  peor: Record<CampoRecto, number>;
  fuera: Record<CampoRecto, Tramo[]>;
  ns: Record<CampoRecto, boolean>;
  avisos: string[];
  muestras: Muestra[]; // desde el objetivo hasta el final
}

export interface EvaluacionRecto {
  fase: FaseRecto;
  motivo?: string;
  resultado?: ResultadoRecto;
  previo: Muestra | null;
  ventana: Muestra[]; // últimos ESTABLE.seg mientras espera
  objetivo: Muestra | null;
  tramo: Muestra[]; // desde el objetivo
}

export const CAMPOS_RECTO: CampoRecto[] = ["altitud", "rumbo", "velocidad", "bola"];
export const TOLERANCIA_RECTO: Record<CampoRecto, number> = {
  altitud: TOLERANCIAS_RECTO.altitudFt,
  rumbo: TOLERANCIAS_RECTO.rumboGrados,
  velocidad: TOLERANCIAS_RECTO.velocidadKt,
  bola: BOLA_TOLERANCIA,
};
const CODIGO: Record<CampoRecto, CodigoRecto> = { altitud: "1", rumbo: "2", velocidad: "3", bola: "4" };

/** Desviación de una muestra contra el objetivo; el rumbo en el círculo (358 → 004 es +6). */
export function desvioRecto(m: Muestra, o: Muestra, c: CampoRecto): number {
  if (c === "rumbo") return difRumbo(m.rumbo, o.rumbo);
  if (c === "bola") return m.bola;
  return m[c] - o[c];
}

const rango = (v: number[]) => Math.max(...v) - Math.min(...v);

/** La ventana cubre casi ESTABLE.seg (el lector no manda a ritmo exacto) y nada se mueve. */
function estable(v: Muestra[]): boolean {
  if (v.length < 2 || v[v.length - 1].t - v[0].t < 0.9 * ESTABLE.seg) return false;
  return (
    v.every((m) => Math.abs(m.inclinacion) < ESTABLE.inclinacion) &&
    rango(v.map((m) => m.altitud)) <= ESTABLE.altitudFt &&
    rango(v.map((m) => m.velocidad)) <= ESTABLE.velocidadKt &&
    rango(v.map((m) => difRumbo(m.rumbo, v[0].rumbo))) <= ESTABLE.rumboGrados
  );
}

export function armarRecto(m: Muestra): EvaluacionRecto {
  const vacia = { previo: m, ventana: [m], objetivo: null, tramo: [] };
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", ...vacia };
  return { fase: "armado", ...vacia };
}

/** Misma regla que el viraje: sin intento o tras uno anulado, en el aire, nivelado y en condiciones. */
export function armarSoloRecto(ev: EvaluacionRecto | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

function resultado(objetivo: Muestra, tramo: Muestra[]): ResultadoRecto {
  const peor = {} as Record<CampoRecto, number>;
  const fuera = {} as Record<CampoRecto, Tramo[]>;
  const ns = {} as Record<CampoRecto, boolean>;
  const elementos = {} as Record<CodigoRecto, "S" | "NS">;
  let puntos = 100;
  for (const c of CAMPOS_RECTO) {
    const a = analizar(tramo.map((m) => ({ t: m.t, v: desvioRecto(m, objetivo, c) })), TOLERANCIA_RECTO[c]);
    peor[c] = a.peor;
    fuera[c] = a.tramos;
    ns[c] = a.ns;
    elementos[CODIGO[c]] = a.ns ? "NS" : "S";
    const segundos = a.tramos.reduce((s, tr) => s + tr.fin - tr.inicio, 0);
    puntos -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(a.peor) / TOLERANCIA_RECTO[c] - 1));
  }
  return {
    maniobra: "recto-nivelado",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(puntos)),
    elementos,
    objetivo: { t: objetivo.t, altitud: objetivo.altitud, rumbo: objetivo.rumbo, velocidad: objetivo.velocidad },
    peor,
    fuera,
    ns,
    avisos: [],
    muestras: tramo,
  };
}

/** Pura, como `avanzar` del viraje: ignora muestras repetidas o viejas. */
export function avanzarRecto(ev: EvaluacionRecto, m: Muestra): EvaluacionRecto {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (!estable(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, fase: "manteniendo", ventana, objetivo: m, tramo: [m], previo: m };
  }

  const tramo = [...ev.tramo, m];
  const objetivo = ev.objetivo!;
  if (m.t - objetivo.t < DURACION_SEG) return { ...ev, tramo, previo: m };
  return { ...ev, fase: "terminado", tramo, previo: m, resultado: resultado(objetivo, tramo) };
}
