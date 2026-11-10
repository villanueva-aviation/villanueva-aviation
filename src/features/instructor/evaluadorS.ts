import { analizar, difRumbo, invalidez, lectorViejoVuelo, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { estable } from "./evaluadorRumbos.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolS, type Nivel } from "./nivel.ts";
import { aNm } from "../home/navGeo.ts";

// «S» sobre un camino (lección 8, Erik 2026-11-10). El lector no sabe dónde hay caminos: el cadete cruza uno perpendicular
// con alas niveladas y empieza a virar; la última muestra nivelada antes del viraje es el camino (una línea a 90° de su rumbo).

export const AGL_MIN = 600;
export const AGL_MAX = 1000;
export const INCLINACION_MAX_S = 45;
/** Grados que tiene que haber virado una curva para que el siguiente cruce del camino la cierre. */
const CIERRA = 90;
const EMPIEZA = 10;
const CONTRARIO = 30;
const MAX_SEG = 4 * 60;
const FT_NM = 6076;
const RAD = Math.PI / 180;

export type CampoS = "altitud" | "velocidad" | "alas" | "rumbo" | "simetria" | "inclinacion";
export const CAMPOS_S: CampoS[] = ["altitud", "velocidad", "alas", "rumbo", "simetria", "inclinacion"];
type Codigo = "1" | "2" | "3" | "4" | "5" | "6";
const CODIGO: Record<CampoS, Codigo> = { altitud: "1", velocidad: "2", alas: "3", rumbo: "4", simetria: "5", inclinacion: "6" };
export interface Cruce {
  t: number;
  inclinacion: number;
  /** Error con signo respecto a la perpendicular. */
  rumbo: number;
}

export interface ResultadoS {
  maniobra: "s-camino";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  peor: Record<CampoS, number>;
  fuera: Record<CampoS, Tramo[]>;
  ns: Record<CampoS, boolean>;
  objetivo: { t: number; altitud: number; velocidad: number; rumbo: number };
  /** Lado de la primera curva. */
  lado: Lado;
  cruces: Cruce[];
  /** Lo más lejos del camino que llegó cada curva, ft. */
  profundidadFt: [number, number];
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionS {
  fase: "armado" | "listo" | "curva1" | "curva2" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoS;
  previo: Muestra | null;
  ventana: Muestra[];
  nivel?: Nivel;
  /** Última muestra con alas niveladas antes de la primera curva: ahí está el camino. */
  camino: Muestra | null;
  girado: number;
  lado: Lado | null;
  profundidad: [number, number];
  cruces: Cruce[];
  puntos: Record<"altitud" | "velocidad" | "inclinacion", { t: number; v: number }[]>;
  tramo: Muestra[];
}

export function toleranciaS(n: Nivel = 3): Record<CampoS, number> {
  const t = tolS(n);
  return { altitud: t.altitudFt, velocidad: t.velocidadKt, alas: t.alasGrados, rumbo: t.rumboGrados, simetria: t.simetriaPct, inclinacion: t.inclinacionGrados };
}

/** NM del avión al camino, positivo hacia donde iba al cruzarlo. */
export function alCamino(m: Muestra, c: Muestra): number {
  const p = aNm(m.lat!, m.lon!, c.lat!, c.lon!);
  const h = (c.rumboV ?? c.rumbo) * RAD;
  return p.x * Math.sin(h) + p.y * Math.cos(h);
}

/** Altitud, velocidad y exceso sobre 45°, mientras dura la «S». */
export function desvioS(m: Muestra, ev: EvaluacionS, c: "altitud" | "velocidad" | "inclinacion"): number | null {
  if ((ev.fase !== "curva1" && ev.fase !== "curva2") || !ev.camino) return null;
  if (c === "altitud") return m.altitud - ev.camino.altitud;
  if (c === "velocidad") return m.velocidad - ev.camino.velocidad;
  return Math.max(0, Math.abs(m.inclinacion) - INCLINACION_MAX_S);
}

export function armarS(m: Muestra, nivel: Nivel = 3): EvaluacionS {
  const ev: EvaluacionS = {
    fase: "armado", previo: m, ventana: [m], nivel, camino: null, girado: 0, lado: null, profundidad: [0, 0], cruces: [],
    puntos: { altitud: [], velocidad: [], inclinacion: [] }, tramo: [],
  };
  if (m.enTierra) return { ...ev, fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire." };
  if (lectorViejoVuelo(m)) return { ...ev, fase: "invalido", motivo: "Tu lector es de una versión anterior: baja el nuevo de Descargas para la «S»." };
  return ev;
}

export function armarSoloS(ev: EvaluacionS | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

const enAltura = (m: Muestra) => m.agl >= AGL_MIN && m.agl <= AGL_MAX;

function resultado(ev: EvaluacionS, n: Nivel): ResultadoS {
  const tol = toleranciaS(n);
  const c = ev.camino!;
  const [d1, d2] = ev.profundidad.map((d) => d * FT_NM) as [number, number];
  const peorCruce = (f: (x: Cruce) => number) => ev.cruces.reduce((a, x) => (Math.abs(f(x)) > Math.abs(a) ? f(x) : a), 0);
  const alas = peorCruce((x) => Math.abs(x.inclinacion));
  const rumbo = peorCruce((x) => x.rumbo);
  const simetria = (100 * Math.abs(d1 - d2)) / Math.max(d1, d2, 1);
  const ultimo = ev.cruces[ev.cruces.length - 1].t;
  // Los de un solo valor: lo que se pasó de la tolerancia, con su signo (0 = bien).
  const sobra = (v: number, t: number) => (Math.abs(v) > t ? v : 0);
  const unico = { alas: sobra(alas, tol.alas), rumbo: sobra(rumbo, tol.rumbo), simetria: sobra(simetria, tol.simetria) };
  const peor = {} as Record<CampoS, number>;
  const fuera = {} as Record<CampoS, Tramo[]>;
  const ns = {} as Record<CampoS, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const k of CAMPOS_S) {
    if (k === "alas" || k === "rumbo" || k === "simetria") {
      const v = unico[k];
      [peor[k], fuera[k], ns[k]] = [k === "alas" ? alas : k === "rumbo" ? rumbo : simetria, v ? [{ inicio: ultimo, fin: ultimo, peor: v }] : [], v !== 0];
      if (ns[k]) total -= 15;
    } else {
      const r = analizar(ev.puntos[k], tol[k], tolS(n).nsSeg);
      [peor[k], fuera[k], ns[k]] = [r.peor, r.tramos, r.ns];
      const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
      total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[k] - 1));
    }
    elementos[CODIGO[k]] = ns[k] ? "NS" : "S";
  }
  return {
    maniobra: "s-camino",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos, peor, fuera, ns,
    objetivo: { t: c.t, altitud: c.altitud, velocidad: c.velocidad, rumbo: c.rumbo },
    lado: ev.lado ?? "derecha", cruces: ev.cruces, profundidadFt: [d1, d2], avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarS(ev: EvaluacionS, m: Muestra): EvaluacionS {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  const motivo = invalidez(m, p);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    return { ...ev, ventana, previo: m, fase: enAltura(m) && estable(ventana) ? "listo" : "armado" };
  }
  if (ev.fase === "listo") {
    if (Math.abs(m.inclinacion) < INCLINACION_NIVELADO) return { ...ev, previo: m };
    // Empezó a virar: el camino quedó en la muestra de antes.
    return { ...ev, fase: "curva1", camino: p, girado: difRumbo(m.rumbo, p!.rumbo), tramo: [p!, m], previo: m };
  }

  const c = ev.camino!;
  if (m.t - c.t > MAX_SEG) return { ...ev, fase: "invalido", motivo: "La «S» pasó de 4 minutos: el intento no se califica.", previo: m };
  const girado = ev.girado + difRumbo(m.rumbo, p!.rumbo);
  const d = alCamino(m, c);
  let e: EvaluacionS = { ...ev, girado, tramo: [...ev.tramo, m], previo: m };
  for (const k of ["altitud", "velocidad", "inclinacion"] as const) {
    const v = desvioS(m, e, k);
    if (v !== null) e = { ...e, puntos: { ...e.puntos, [k]: [...e.puntos[k], { t: m.t, v }] } };
  }

  if (e.fase === "curva1") {
    const lado: Lado | null = e.lado ?? (Math.abs(girado) > EMPIEZA ? (girado > 0 ? "derecha" : "izquierda") : null);
    e = { ...e, lado, profundidad: [Math.max(e.profundidad[0], d), e.profundidad[1]] };
    if (Math.abs(girado) >= CIERRA && d <= 0) {
      const cruce = { t: m.t, inclinacion: m.inclinacion, rumbo: difRumbo(m.rumbo, c.rumbo + 180) };
      return { ...e, fase: "curva2", girado: 0, cruces: [cruce] };
    }
    return e;
  }
  // Segunda curva: al lado contrario de la primera, del otro lado del camino.
  const s = e.lado === "derecha" ? -1 : 1;
  if (s * girado < -CONTRARIO) return { ...e, fase: "invalido", motivo: "La segunda curva de la «S» tiene que ir al lado contrario de la primera." };
  e = { ...e, profundidad: [e.profundidad[0], Math.max(e.profundidad[1], -d)] };
  if (Math.abs(girado) >= CIERRA && d >= 0) {
    const fin = { ...e, cruces: [...e.cruces, { t: m.t, inclinacion: m.inclinacion, rumbo: difRumbo(m.rumbo, c.rumbo) }] };
    return { ...fin, fase: "terminado", resultado: resultado(fin, fin.nivel ?? 3) };
  }
  return e;
}
