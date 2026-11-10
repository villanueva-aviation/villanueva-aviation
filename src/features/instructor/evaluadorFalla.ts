import { analizar, invalidez, lectorViejoVuelo, type Muestra, type Tramo } from "./evaluador.ts";
import { fueraDeBanda } from "./evaluadorAltitud.ts";
import { estable } from "./evaluadorRumbos.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolFalla, type Nivel } from "./nivel.ts";

// Falla de motor simulada (lección 11, Erik 2026-11-10): el lector no apaga el motor, el cadete pone ralentí a la orden,
// planea a 68 kt con el checklist y recupera con potencia completa a la orden, a 1,000 ft AGL. No es tarea del ACS.

export const PLANEO_KT = 68;
export const ARMA_AGL = 2000;
export const RECUPERA_AGL = 1000;
export const MIN_AGL = 500;
/** Acelerador (0–100) que cuenta como ralentí / potencia completa. */
const RALENTI = 10;
const COMPLETA = 90;
/** El planeo se mide desde estos segundos después del ralentí: lo que tarda en bajar de crucero a 68. */
const PLANEO_SEG = 10;
const SIN_RALENTI_SEG = 15;
const ASCENSO = { desde: 5, hasta: 20 };

export type ItemFalla = "mezcla" | "selector" | "bomba" | "magnetos";
export const ITEMS_FALLA: ItemFalla[] = ["mezcla", "selector", "bomba", "magnetos"];
export type CampoFalla = "reaccion" | "planeo" | "checklist" | "recuperacion" | "ascenso";
export const CAMPOS_FALLA: CampoFalla[] = ["reaccion", "planeo", "checklist", "recuperacion", "ascenso"];
type Codigo = "1" | "2" | "3" | "4" | "5";
const CODIGO: Record<CampoFalla, Codigo> = { reaccion: "1", planeo: "2", checklist: "3", recuperacion: "4", ascenso: "5" };

export interface ResultadoFalla {
  maniobra: "falla-motor";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  peor: Record<CampoFalla, number>;
  fuera: Record<CampoFalla, Tramo[]>;
  ns: Record<CampoFalla, boolean>;
  /** De «falla de motor» al ralentí. */
  reaccionSeg: number;
  /** De «recupera» a potencia completa; null si recuperó antes de la orden. */
  recuperaSeg: number | null;
  recuperoAntes: boolean;
  recuperaAgl: number;
  /** Lo que no estaba hecho al dar potencia (lo que el lector no manda no cuenta). */
  faltan: ItemFalla[];
  objetivo: { t: number; altitud: number; rumbo: number; agl: number };
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionFalla {
  fase: "armado" | "falla" | "recupera" | "ascenso" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoFalla;
  previo: Muestra | null;
  ventana: Muestra[];
  nivel?: Nivel;
  falla: Muestra | null;
  ralenti: Muestra | null;
  orden: Muestra | null;
  potencia: Muestra | null;
  faltan: ItemFalla[];
  puntos: { planeo: { t: number; v: number }[]; ascenso: { t: number; v: number }[] };
  tramo: Muestra[];
}

export function toleranciaFalla(n: Nivel = 3): Record<CampoFalla, number> {
  const t = tolFalla(n);
  return { reaccion: t.reaccionSeg, planeo: t.velocidadKt, checklist: 0, recuperacion: t.reaccionSeg, ascenso: t.velocidadKt };
}

/** Cada punto del checklist: true hecho, false no, null el lector no lo manda. */
export function checklistFalla(m: Muestra): Record<ItemFalla, boolean | null> {
  return {
    mezcla: m.mezcla === undefined ? null : m.mezcla >= 90,
    selector: m.selector === undefined ? null : m.selector === 1,
    bomba: m.bomba === undefined ? null : m.bomba,
    magnetos: m.magIzq === undefined || m.magDer === undefined ? null : m.magIzq && m.magDer,
  };
}

/** Planeo y ascenso, en vivo y al calificar. */
export function desvioFalla(m: Muestra, ev: EvaluacionFalla, c: "planeo" | "ascenso"): number | null {
  if (c === "planeo") return ev.fase === "falla" && ev.ralenti && m.t - ev.ralenti.t >= PLANEO_SEG ? m.velocidad - PLANEO_KT : null;
  if (ev.fase !== "ascenso" || !ev.potencia) return null;
  const dt = m.t - ev.potencia.t;
  return dt >= ASCENSO.desde && dt <= ASCENSO.hasta ? fueraDeBanda(m.velocidad, true) : null;
}

export function armarFalla(m: Muestra, nivel: Nivel = 3): EvaluacionFalla {
  const ev: EvaluacionFalla = {
    fase: "armado", previo: m, ventana: [m], nivel, falla: null, ralenti: null, orden: null, potencia: null, faltan: [], puntos: { planeo: [], ascenso: [] }, tramo: [],
  };
  if (m.enTierra) return { ...ev, fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire." };
  if (lectorViejoVuelo(m) || m.acelerador === undefined) return { ...ev, fase: "invalido", motivo: "Tu lector es de una versión anterior: baja el nuevo de Descargas para la falla de motor." };
  return ev;
}

export function armarSoloFalla(ev: EvaluacionFalla | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

function resultado(ev: EvaluacionFalla, n: Nivel): ResultadoFalla {
  const tol = toleranciaFalla(n);
  const f = ev.falla!;
  const p = ev.potencia!;
  const reaccionSeg = ev.ralenti!.t - f.t;
  const recuperoAntes = ev.orden === null;
  const recuperaSeg = ev.orden ? p.t - ev.orden.t : null;
  // Valor con signo de cada uno de un solo valor: lo que se pasó de la tolerancia (0 = bien).
  const unico: Record<"reaccion" | "checklist" | "recuperacion", { t: number; v: number }> = {
    reaccion: { t: ev.ralenti!.t, v: Math.max(0, reaccionSeg - tol.reaccion) },
    checklist: { t: p.t, v: ev.faltan.length },
    recuperacion: { t: p.t, v: recuperoAntes ? p.agl - RECUPERA_AGL : p.agl < MIN_AGL ? p.agl - MIN_AGL : Math.max(0, recuperaSeg! - tol.recuperacion) },
  };
  const peor = {} as Record<CampoFalla, number>;
  const fuera = {} as Record<CampoFalla, Tramo[]>;
  const ns = {} as Record<CampoFalla, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const c of CAMPOS_FALLA) {
    if (c === "planeo" || c === "ascenso") {
      const r = analizar(ev.puntos[c], tol[c], tolFalla(n).nsSeg);
      [peor[c], fuera[c], ns[c]] = [r.peor, r.tramos, r.ns];
      const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
      total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[c] - 1));
    } else {
      const u = unico[c];
      [peor[c], fuera[c], ns[c]] = [u.v, u.v ? [{ inicio: u.t, fin: u.t, peor: u.v }] : [], u.v !== 0];
      if (ns[c]) total -= 15;
    }
    elementos[CODIGO[c]] = ns[c] ? "NS" : "S";
  }
  return {
    maniobra: "falla-motor",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos, peor, fuera, ns, reaccionSeg, recuperaSeg, recuperoAntes, recuperaAgl: p.agl, faltan: ev.faltan,
    objetivo: { t: f.t, altitud: f.altitud, rumbo: f.rumbo, agl: f.agl },
    avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarFalla(ev: EvaluacionFalla, m: Muestra): EvaluacionFalla {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (m.agl < ARMA_AGL || !estable(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, fase: "falla", ventana, falla: m, tramo: [m], previo: m };
  }

  const acel = m.acelerador ?? 0;
  let e: EvaluacionFalla = { ...ev, tramo: [...ev.tramo, m], previo: m };
  if (e.fase === "falla") {
    if (!e.ralenti) {
      if (acel <= RALENTI) e = { ...e, ralenti: m };
      else if (m.t - e.falla!.t > SIN_RALENTI_SEG) return { ...e, fase: "invalido", motivo: "No pusiste el acelerador en ralentí: el intento no se califica." };
    } else if (acel >= COMPLETA) {
      e = { ...e, fase: "ascenso", potencia: m, faltan: faltan(m) }; // antes de la orden
    } else if (m.agl <= RECUPERA_AGL) {
      e = { ...e, fase: "recupera", orden: m };
    }
  } else if (e.fase === "recupera") {
    if (acel >= COMPLETA) e = { ...e, fase: "ascenso", potencia: m, faltan: faltan(m) };
  } else if (e.fase === "ascenso" && m.t - e.potencia!.t > ASCENSO.hasta) {
    return { ...e, fase: "terminado", resultado: resultado(e, e.nivel ?? 3) };
  }
  const planeo = desvioFalla(m, e, "planeo");
  const ascenso = desvioFalla(m, e, "ascenso");
  if (planeo === null && ascenso === null) return e;
  return {
    ...e,
    puntos: {
      planeo: planeo === null ? e.puntos.planeo : [...e.puntos.planeo, { t: m.t, v: planeo }],
      ascenso: ascenso === null ? e.puntos.ascenso : [...e.puntos.ascenso, { t: m.t, v: ascenso }],
    },
  };
}

const faltan = (m: Muestra): ItemFalla[] => {
  const c = checklistFalla(m);
  return ITEMS_FALLA.filter((x) => c[x] === false);
};
