import { analizar, difRumbo, invalidez, lectorViejoVuelo, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { estable } from "./evaluadorRumbos.ts";
import { INCLINACION_MAX_S } from "./evaluadorS.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolOcho, type Nivel } from "./nivel.ts";
import { aNm, rumbo } from "../home/navGeo.ts";

// «8» sobre pilones (lección 9, Erik 2026-11-10): el ala apuntando al pilón. El lector no sabe qué punto escogió el cadete:
// el pilón es el punto del suelo al que apunta el ala cuando ya viró y la inclinación dejó de crecer (a agl / tan(incl)).
// A la altura pivote el avión le da vueltas; arriba, el pilón se adelanta al ala; abajo, se queda atrás.

export const INCLINACION_MAX_OCHO = INCLINACION_MAX_S;
/** Ft AGL alrededor de la altura pivote para empezar. */
export const MARGEN_PIVOTE = 150;
/** Segundos con alas niveladas entre los pilones. */
export const CRUCE_SEG = 3;
/** Grados que gira cada vuelta antes de nivelar hacia el otro pilón (la diagonal deja unos 270°). */
const VUELTA = 240;
const EMPIEZA = 10;
const CONTRARIO = 30;
/** °/s: la inclinación ya no crece y el ala quedó sobre el pilón. */
const ESTABLE_INCL = 3;
const MAX_SEG = 6 * 60;
const FT_NM = 6076;
const RAD = Math.PI / 180;

/** Altura pivote en ft AGL con la velocidad sobre el suelo en kt: GS² / 11.3. */
export const pivote = (gs: number) => (gs * gs) / 11.3;

export type CampoOcho = "velocidad" | "ala" | "cruce" | "inclinacion";
export const CAMPOS_OCHO: CampoOcho[] = ["velocidad", "ala", "cruce", "inclinacion"];
type Codigo = "1" | "2" | "3" | "4";
const CODIGO: Record<CampoOcho, Codigo> = { velocidad: "1", ala: "2", cruce: "3", inclinacion: "4" };

export interface Pilon {
  lat: number;
  lon: number;
  lado: Lado;
}

export interface ResultadoOcho {
  maniobra: "ocho-pilones";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  peor: Record<CampoOcho, number>;
  fuera: Record<CampoOcho, Tramo[]>;
  ns: Record<CampoOcho, boolean>;
  /** Al empezar a virar: la altura pivote sale de la velocidad sobre el suelo. */
  objetivo: { t: number; velocidad: number; gs: number; pivote: number; agl: number };
  /** Lado de la primera vuelta. */
  lado: Lado;
  /** Segundos con alas niveladas entre los pilones. */
  cruceSeg: number;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionOcho {
  fase: "armado" | "listo" | "vuelta1" | "cruce" | "vuelta2" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoOcho;
  previo: Muestra | null;
  ventana: Muestra[];
  nivel?: Nivel;
  /** Altura pivote con la última velocidad sobre el suelo, para decirla mientras se arma. */
  pivote: number | null;
  /** Última muestra nivelada antes de la primera vuelta. */
  entrada: Muestra | null;
  pilon: Pilon | null;
  girado: number;
  lado: Lado | null;
  primero: Lado | null;
  cruceSeg: number;
  puntos: Record<"velocidad" | "ala" | "inclinacion", { t: number; v: number }[]>;
  tramo: Muestra[];
}

export function toleranciaOcho(n: Nivel = 3): Record<CampoOcho, number> {
  const t = tolOcho(n);
  return { velocidad: t.velocidadKt, ala: t.alaGrados, cruce: CRUCE_SEG, inclinacion: t.inclinacionGrados };
}

/** Grados del pilón respecto a la línea del ala: + adelante (hacia la nariz), − atrás. */
export function alaPilon(m: Muestra, p: Pilon): number {
  const q = aNm(p.lat, p.lon, m.lat!, m.lon!);
  const ala = (m.rumboV ?? m.rumbo) + (p.lado === "derecha" ? 90 : -90);
  const e = difRumbo(rumbo({ x: 0, y: 0 }, q), ala);
  return p.lado === "derecha" ? -e : e;
}

/** El punto del suelo al que apunta el ala: abeam, a agl / tan(inclinación). */
function fijarPilon(m: Muestra, lado: Lado): Pilon {
  const d = m.agl / Math.tan(Math.max(Math.abs(m.inclinacion), EMPIEZA) * RAD) / FT_NM;
  const dir = ((m.rumboV ?? m.rumbo) + (lado === "derecha" ? 90 : -90)) * RAD;
  return { lat: m.lat! + (d * Math.cos(dir)) / 60, lon: m.lon! + (d * Math.sin(dir)) / (60 * Math.cos(m.lat! * RAD)), lado };
}

const enVuelta = (f: EvaluacionOcho["fase"]) => f === "vuelta1" || f === "cruce" || f === "vuelta2";

/** Velocidad, pilón respecto al ala y exceso sobre 45°, mientras dura la «8». */
export function desvioOcho(m: Muestra, ev: EvaluacionOcho, c: "velocidad" | "ala" | "inclinacion"): number | null {
  if (!enVuelta(ev.fase) || !ev.entrada) return null;
  if (c === "velocidad") return m.velocidad - ev.entrada.velocidad;
  if (c === "ala") return ev.pilon && ev.fase !== "cruce" ? alaPilon(m, ev.pilon) : null;
  return Math.max(0, Math.abs(m.inclinacion) - INCLINACION_MAX_OCHO);
}

export function armarOcho(m: Muestra, nivel: Nivel = 3): EvaluacionOcho {
  const ev: EvaluacionOcho = {
    fase: "armado", previo: m, ventana: [m], nivel, pivote: m.gs === undefined ? null : pivote(m.gs), entrada: null, pilon: null, girado: 0, lado: null,
    primero: null, cruceSeg: 0, puntos: { velocidad: [], ala: [], inclinacion: [] }, tramo: [],
  };
  if (m.enTierra) return { ...ev, fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire." };
  if (lectorViejoVuelo(m) || m.gs === undefined) return { ...ev, fase: "invalido", motivo: "Tu lector es de una versión anterior: baja el nuevo de Descargas para la «8»." };
  return ev;
}

export function armarSoloOcho(ev: EvaluacionOcho | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

export const enPivote = (m: Muestra) => m.gs !== undefined && Math.abs(m.agl - pivote(m.gs)) <= MARGEN_PIVOTE;

function resultado(ev: EvaluacionOcho, n: Nivel): ResultadoOcho {
  const tol = toleranciaOcho(n);
  const nsSeg = tolOcho(n).nsSeg;
  const e = ev.entrada!;
  const fin = ev.tramo[ev.tramo.length - 1].t;
  const peor = {} as Record<CampoOcho, number>;
  const fuera = {} as Record<CampoOcho, Tramo[]>;
  const ns = {} as Record<CampoOcho, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const k of CAMPOS_OCHO) {
    if (k === "cruce") {
      // Un solo valor: segundos que faltaron (0 = bien).
      const falta = Math.max(0, CRUCE_SEG - ev.cruceSeg);
      [peor[k], fuera[k], ns[k]] = [ev.cruceSeg, falta ? [{ inicio: fin, fin, peor: -falta }] : [], falta > 0];
      if (ns[k]) total -= 15;
    } else {
      const r = analizar(ev.puntos[k], tol[k], nsSeg);
      [peor[k], fuera[k], ns[k]] = [r.peor, r.tramos, r.ns];
      const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
      total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[k] - 1));
    }
    elementos[CODIGO[k]] = ns[k] ? "NS" : "S";
  }
  const gs = e.gs ?? e.velocidad;
  return {
    maniobra: "ocho-pilones",
    aprobado: Object.values(elementos).every((x) => x === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos, peor, fuera, ns,
    objetivo: { t: e.t, velocidad: e.velocidad, gs, pivote: pivote(gs), agl: e.agl },
    lado: ev.primero ?? "derecha", cruceSeg: ev.cruceSeg, avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarOcho(ev: EvaluacionOcho, m: Muestra): EvaluacionOcho {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  const motivo = invalidez(m, p);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };
  const nivelado = Math.abs(m.inclinacion) < INCLINACION_NIVELADO;

  if (ev.fase === "armado" || ev.fase === "listo") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    const base = { ...ev, ventana, previo: m, pivote: m.gs === undefined ? ev.pivote : pivote(m.gs) };
    if (ev.fase === "armado") return { ...base, fase: enPivote(m) && estable(ventana) ? "listo" : "armado" };
    if (nivelado) return base;
    // Empezó a virar: la entrada quedó en la muestra de antes.
    return { ...base, fase: "vuelta1", entrada: p, girado: difRumbo(m.rumbo, p!.rumbo), tramo: [p!, m] };
  }

  if (m.t - ev.entrada!.t > MAX_SEG) return { ...ev, fase: "invalido", motivo: "La «8» pasó de 6 minutos: el intento no se califica.", previo: m };
  let e: EvaluacionOcho = { ...ev, tramo: [...ev.tramo, m], previo: m };

  if (e.fase === "cruce") {
    if (nivelado) e = { ...e, cruceSeg: e.cruceSeg + m.t - p!.t };
    else e = { ...e, fase: "vuelta2", girado: difRumbo(m.rumbo, p!.rumbo), lado: null, pilon: null };
  } else {
    const girado = e.girado + difRumbo(m.rumbo, p!.rumbo);
    const lado: Lado | null = e.lado ?? (Math.abs(girado) > EMPIEZA ? (girado > 0 ? "derecha" : "izquierda") : null);
    e = { ...e, girado, lado, primero: e.primero ?? lado };
    if (e.fase === "vuelta2" && e.primero && lado === e.primero && Math.abs(girado) > CONTRARIO) {
      return { ...e, fase: "invalido", motivo: "La segunda vuelta de la «8» tiene que ir al lado contrario de la primera." };
    }
    const quieta = Math.abs(m.inclinacion) >= EMPIEZA && (Math.abs(m.inclinacion) - Math.abs(p!.inclinacion)) / (m.t - p!.t) < ESTABLE_INCL;
    if (!e.pilon && lado && quieta) e = { ...e, pilon: fijarPilon(m, lado) };
  }

  for (const k of ["velocidad", "ala", "inclinacion"] as const) {
    const v = desvioOcho(m, e, k);
    if (v !== null) e = { ...e, puntos: { ...e.puntos, [k]: [...e.puntos[k], { t: m.t, v }] } };
  }

  if (Math.abs(e.girado) >= VUELTA && nivelado) {
    if (e.fase === "vuelta1") return { ...e, fase: "cruce", cruceSeg: 0 };
    if (e.fase === "vuelta2") return { ...e, fase: "terminado", resultado: resultado(e, e.nivel ?? 3) };
  }
  return e;
}
