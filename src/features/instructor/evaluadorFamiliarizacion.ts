import { difRumbo, invalidez, lectorViejoVuelo, type Muestra } from "./evaluador.ts";
import { estable } from "./evaluadorRumbos.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import type { Nivel } from "./nivel.ts";

// Familiarización (lección 1, Erik 2026-11-10): el primer vuelo, para conocer los controles. Sin tolerancias: el instructor
// pide cada movimiento y espera a verlo. El lado del alabeo y de la guiñada sale del rumbo (el signo de la inclinación no
// es confiable); la guiñada, además, por la bola. El compensador no lo ve el lector.

export type IdTarea = "alabeo-izq" | "alabeo-der" | "cabeceo-arriba" | "cabeceo-abajo" | "guinada-izq" | "guinada-der" | "acelera" | "reduce";
export type Grupo = "alabeo" | "cabeceo" | "guinada" | "potencia";
export const TAREAS: { id: IdTarea; grupo: Grupo; partes: 1 | 2 }[] = [
  { id: "alabeo-izq", grupo: "alabeo", partes: 2 },
  { id: "alabeo-der", grupo: "alabeo", partes: 2 },
  { id: "cabeceo-arriba", grupo: "cabeceo", partes: 2 },
  { id: "cabeceo-abajo", grupo: "cabeceo", partes: 2 },
  { id: "guinada-izq", grupo: "guinada", partes: 2 },
  { id: "guinada-der", grupo: "guinada", partes: 2 },
  { id: "acelera", grupo: "potencia", partes: 1 },
  { id: "reduce", grupo: "potencia", partes: 1 },
];
export const GRUPOS: Grupo[] = ["alabeo", "cabeceo", "guinada", "potencia"];

/** Lo que cuenta como hecho: se pide 20° y 5°; se aceptan 15° y 4°. */
export const ALABEO_GRADOS = 15;
export const CABECEO_GRADOS = 4;
const REGRESA_CABECEO = 2;
const GIRO_LADO = 3;
const BOLA_FUERA = 0.3;
const BOLA_CENTRO = 0.15;
export const POTENCIA_KT = 5;

export interface ResultadoFamiliarizacion {
  maniobra: "familiarizacion";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<string, "S" | "NS">;
  /** Segundos que tardó cada movimiento, desde que se pidió. */
  tareas: { id: IdTarea; seg: number }[];
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionFamiliarizacion {
  fase: "armado" | "tareas" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoFamiliarizacion;
  previo: Muestra | null;
  ventana: Muestra[];
  nivel?: Nivel;
  /** Tarea en curso y su parte: 0 = hacerlo, 1 = regresar. */
  k: number;
  parte: 0 | 1;
  /** Muestra al empezar la parte; desde ahí se mide. */
  base: Muestra | null;
  girado: number;
  pedida: number;
  hechas: { id: IdTarea; seg: number }[];
  tramo: Muestra[];
}

export function armarFamiliarizacion(m: Muestra, nivel: Nivel = 3): EvaluacionFamiliarizacion {
  const ev: EvaluacionFamiliarizacion = { fase: "armado", previo: m, ventana: [m], nivel, k: 0, parte: 0, base: null, girado: 0, pedida: 0, hechas: [], tramo: [] };
  if (m.enTierra) return { ...ev, fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire." };
  if (lectorViejoVuelo(m) || m.cabeceo === undefined) {
    return { ...ev, fase: "invalido", motivo: "Tu lector es de una versión anterior: baja el nuevo de Descargas para la familiarización." };
  }
  return ev;
}

export function armarSoloFamiliarizacion(ev: EvaluacionFamiliarizacion | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

/** ¿Ya hizo lo que se pidió en esta parte? */
function cumple(id: IdTarea, parte: 0 | 1, m: Muestra, base: Muestra, girado: number): boolean {
  const izq = id.endsWith("izq");
  const lado = izq ? -girado : girado;
  const dCab = (m.cabeceo ?? 0) - (base.cabeceo ?? 0);
  switch (id) {
    case "alabeo-izq":
    case "alabeo-der":
      return parte === 0 ? Math.abs(m.inclinacion) >= ALABEO_GRADOS && lado >= GIRO_LADO : Math.abs(m.inclinacion) < INCLINACION_NIVELADO;
    case "cabeceo-arriba": return parte === 0 ? dCab >= CABECEO_GRADOS : true;
    case "cabeceo-abajo": return parte === 0 ? dCab <= -CABECEO_GRADOS : true;
    case "guinada-izq":
    case "guinada-der":
      return parte === 0 ? Math.abs(m.bola) >= BOLA_FUERA && lado >= GIRO_LADO : Math.abs(m.bola) < BOLA_CENTRO;
    case "acelera": return m.velocidad >= base.velocidad + POTENCIA_KT;
    case "reduce": return m.velocidad <= base.velocidad - POTENCIA_KT;
  }
}

function resultado(ev: EvaluacionFamiliarizacion, n: Nivel): ResultadoFamiliarizacion {
  return {
    maniobra: "familiarizacion", aprobado: true, calificacion: 100,
    elementos: Object.fromEntries(TAREAS.map((_, i) => [String(i + 1), "S"])),
    tareas: ev.hechas, avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarFamiliarizacion(ev: EvaluacionFamiliarizacion, m: Muestra): EvaluacionFamiliarizacion {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  const motivo = invalidez(m, p);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (!estable(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, ventana, previo: m, fase: "tareas", base: m, pedida: m.t, tramo: [m] };
  }

  const tarea = TAREAS[ev.k];
  const base = ev.base!;
  // Nivelado y con la bola al centro, el giro vuelve a contar desde cero: un alabeo al lado equivocado no se arrastra.
  const quieto = ev.parte === 0 && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && Math.abs(m.bola) < BOLA_CENTRO;
  const girado = quieto ? 0 : ev.girado + difRumbo(m.rumbo, p!.rumbo);
  // Regresar la nariz: cerca de donde estaba antes de subirla o bajarla (la base de la parte 0).
  const regreso = tarea.grupo === "cabeceo" && ev.parte === 1 ? Math.abs((m.cabeceo ?? 0) - (base.cabeceo ?? 0)) <= REGRESA_CABECEO : true;
  let e: EvaluacionFamiliarizacion = { ...ev, girado, previo: m, tramo: [...ev.tramo, m] };
  if (!cumple(tarea.id, ev.parte, m, base, girado) || !regreso) return e;

  if (ev.parte === 0 && tarea.partes === 2) return { ...e, parte: 1, girado: 0 };
  const hechas = [...e.hechas, { id: tarea.id, seg: m.t - e.pedida }];
  if (ev.k + 1 === TAREAS.length) {
    e = { ...e, hechas };
    return { ...e, fase: "terminado", resultado: resultado(e, e.nivel ?? 3) };
  }
  return { ...e, hechas, k: ev.k + 1, parte: 0, base: m, girado: 0, pedida: m.t };
}
