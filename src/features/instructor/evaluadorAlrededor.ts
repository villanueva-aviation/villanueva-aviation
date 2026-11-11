import { analizar, difRumbo, invalidez, lectorViejoVuelo, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { estable } from "./evaluadorRumbos.ts";
import { AGL_MAX, AGL_MIN } from "./evaluadorS.ts";
import { CRUCE_SEG, INCLINACION_MAX_OCHO } from "./evaluadorOcho.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolAlrededor, type Nivel } from "./nivel.ts";
import { aNm, type PuntoNm } from "../home/navGeo.ts";

// «8» alrededor de pilones (lección 10, Erik 2026-11-10): un círculo alrededor de cada pilón, a la misma distancia todo el
// tiempo, uno en cada sentido. El lector no sabe qué punto escogió el cadete: el pilón es el centro del círculo que voló
// (ajuste por mínimos cuadrados de la trayectoria inclinada). Con viento y la inclinación fija, el círculo se deforma.

const VUELTA = 240;
const EMPIEZA = 10;
const CONTRARIO = 30;
const MAX_SEG = 6 * 60;
const FT_NM = 6076;

export type CampoAlrededor = "altitud" | "velocidad" | "radio" | "cruce" | "inclinacion";
export const CAMPOS_ALREDEDOR: CampoAlrededor[] = ["altitud", "velocidad", "radio", "cruce", "inclinacion"];
type Codigo = "1" | "2" | "3" | "4" | "5";
const CODIGO: Record<CampoAlrededor, Codigo> = { altitud: "1", velocidad: "2", radio: "3", cruce: "4", inclinacion: "5" };

export interface Vuelta {
  radioFt: number;
  minFt: number;
  maxFt: number;
  /** (máx − mín) / radio, %. */
  variacionPct: number;
}

export interface ResultadoAlrededor {
  maniobra: "ocho-alrededor";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  peor: Record<CampoAlrededor, number>;
  fuera: Record<CampoAlrededor, Tramo[]>;
  ns: Record<CampoAlrededor, boolean>;
  objetivo: { t: number; altitud: number; velocidad: number };
  /** Lado de la primera vuelta. */
  lado: Lado;
  vueltas: Vuelta[];
  cruceSeg: number;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionAlrededor {
  fase: "armado" | "listo" | "vuelta1" | "cruce" | "vuelta2" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoAlrededor;
  previo: Muestra | null;
  ventana: Muestra[];
  nivel?: Nivel;
  entrada: Muestra | null;
  girado: number;
  lado: Lado | null;
  primero: Lado | null;
  cruceSeg: number;
  /** Posiciones inclinadas de la vuelta en curso, NM desde la entrada. */
  arco: PuntoNm[];
  vueltas: Vuelta[];
  puntos: Record<"altitud" | "velocidad" | "inclinacion", { t: number; v: number }[]>;
  tramo: Muestra[];
}

export function toleranciaAlrededor(n: Nivel = 3): Record<CampoAlrededor, number> {
  const t = tolAlrededor(n);
  return { altitud: t.altitudFt, velocidad: t.velocidadKt, radio: t.radioPct, cruce: CRUCE_SEG, inclinacion: t.inclinacionGrados };
}

/** Círculo de mínimos cuadrados (Kåsa); null con menos de 3 puntos o alineados. */
export function circulo(ps: PuntoNm[]): { c: PuntoNm; r: number } | null {
  if (ps.length < 3) return null;
  const mx = ps.reduce((a, p) => a + p.x, 0) / ps.length;
  const my = ps.reduce((a, p) => a + p.y, 0) / ps.length;
  let [suu, svv, suv, suz, svz, sz] = [0, 0, 0, 0, 0, 0];
  for (const p of ps) {
    const [u, v] = [p.x - mx, p.y - my];
    const z = u * u + v * v;
    [suu, svv, suv, suz, svz, sz] = [suu + u * u, svv + v * v, suv + u * v, suz + u * z, svz + v * z, sz + z];
  }
  // Centrado en la media: suu·a + suv·b = suz/2, suv·a + svv·b = svz/2.
  const det = suu * svv - suv * suv;
  if (Math.abs(det) < 1e-12) return null;
  const a = (suz * svv - svz * suv) / (2 * det);
  const b = (svz * suu - suz * suv) / (2 * det);
  return { c: { x: a + mx, y: b + my }, r: Math.sqrt(a * a + b * b + sz / ps.length) };
}

function cerrarVuelta(arco: PuntoNm[]): Vuelta {
  const f = circulo(arco);
  if (!f) return { radioFt: 0, minFt: 0, maxFt: 0, variacionPct: 0 };
  const d = arco.map((p) => Math.hypot(p.x - f.c.x, p.y - f.c.y) * FT_NM);
  const [min, max] = [Math.min(...d), Math.max(...d)];
  const radioFt = f.r * FT_NM;
  return { radioFt, minFt: min, maxFt: max, variacionPct: (100 * (max - min)) / Math.max(radioFt, 1) };
}

const enVuelta = (f: EvaluacionAlrededor["fase"]) => f === "vuelta1" || f === "cruce" || f === "vuelta2";

/** Altitud, velocidad y exceso sobre 45°, mientras dura la «8». */
export function desvioAlrededor(m: Muestra, ev: EvaluacionAlrededor, c: "altitud" | "velocidad" | "inclinacion"): number | null {
  if (!enVuelta(ev.fase) || !ev.entrada) return null;
  if (c === "altitud") return m.altitud - ev.entrada.altitud;
  if (c === "velocidad") return m.velocidad - ev.entrada.velocidad;
  return Math.max(0, Math.abs(m.inclinacion) - INCLINACION_MAX_OCHO);
}

export function armarAlrededor(m: Muestra, nivel: Nivel = 3): EvaluacionAlrededor {
  const ev: EvaluacionAlrededor = {
    fase: "armado", previo: m, ventana: [m], nivel, entrada: null, girado: 0, lado: null, primero: null, cruceSeg: 0, arco: [], vueltas: [],
    puntos: { altitud: [], velocidad: [], inclinacion: [] }, tramo: [],
  };
  if (m.enTierra) return { ...ev, fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire." };
  if (lectorViejoVuelo(m)) return { ...ev, fase: "invalido", motivo: "Tu lector es de una versión anterior: baja el nuevo de Descargas para la «8»." };
  return ev;
}

export function armarSoloAlrededor(ev: EvaluacionAlrededor | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

const enAltura = (m: Muestra) => m.agl >= AGL_MIN && m.agl <= AGL_MAX;

function resultado(ev: EvaluacionAlrededor, n: Nivel): ResultadoAlrededor {
  const tol = toleranciaAlrededor(n);
  const e = ev.entrada!;
  const fin = ev.tramo[ev.tramo.length - 1].t;
  const radio = Math.max(...ev.vueltas.map((v) => v.variacionPct));
  const falta = Math.max(0, CRUCE_SEG - ev.cruceSeg);
  // Los de un solo valor: [peor, cuánto se pasó con su signo (0 = bien)].
  const unico = { radio: [radio, radio > tol.radio ? radio : 0], cruce: [ev.cruceSeg, falta ? -falta : 0] } as const;
  const peor = {} as Record<CampoAlrededor, number>;
  const fuera = {} as Record<CampoAlrededor, Tramo[]>;
  const ns = {} as Record<CampoAlrededor, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const k of CAMPOS_ALREDEDOR) {
    if (k === "radio" || k === "cruce") {
      const [valor, sobra] = unico[k];
      [peor[k], fuera[k], ns[k]] = [valor, sobra ? [{ inicio: fin, fin, peor: sobra }] : [], sobra !== 0];
      if (ns[k]) total -= 15;
    } else {
      const r = analizar(ev.puntos[k], tol[k], tolAlrededor(n).nsSeg);
      [peor[k], fuera[k], ns[k]] = [r.peor, r.tramos, r.ns];
      const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
      total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[k] - 1));
    }
    elementos[CODIGO[k]] = ns[k] ? "NS" : "S";
  }
  return {
    maniobra: "ocho-alrededor",
    aprobado: Object.values(elementos).every((x) => x === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos, peor, fuera, ns,
    objetivo: { t: e.t, altitud: e.altitud, velocidad: e.velocidad },
    lado: ev.primero ?? "derecha", vueltas: ev.vueltas, cruceSeg: ev.cruceSeg, avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarAlrededor(ev: EvaluacionAlrededor, m: Muestra): EvaluacionAlrededor {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  const motivo = invalidez(m, p);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };
  const nivelado = Math.abs(m.inclinacion) < INCLINACION_NIVELADO;

  if (ev.fase === "armado" || ev.fase === "listo") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    const base = { ...ev, ventana, previo: m };
    if (ev.fase === "armado") return { ...base, fase: enAltura(m) && estable(ventana) ? "listo" : "armado" };
    if (nivelado) return base;
    // Empezó a virar: la entrada quedó en la muestra de antes.
    return { ...base, fase: "vuelta1", entrada: p, girado: difRumbo(m.rumbo, p!.rumbo), tramo: [p!, m] };
  }

  const en = ev.entrada!;
  if (m.t - en.t > MAX_SEG) return { ...ev, fase: "invalido", motivo: "La «8» pasó de 6 minutos: el intento no se califica.", previo: m };
  let e: EvaluacionAlrededor = { ...ev, tramo: [...ev.tramo, m], previo: m };

  if (e.fase === "cruce") {
    if (nivelado) e = { ...e, cruceSeg: e.cruceSeg + m.t - p!.t };
    else e = { ...e, fase: "vuelta2", girado: difRumbo(m.rumbo, p!.rumbo), lado: null, arco: [] };
  } else {
    const girado = e.girado + difRumbo(m.rumbo, p!.rumbo);
    const lado: Lado | null = e.lado ?? (Math.abs(girado) > EMPIEZA ? (girado > 0 ? "derecha" : "izquierda") : null);
    e = { ...e, girado, lado, primero: e.primero ?? lado };
    if (e.fase === "vuelta2" && e.primero && lado === e.primero && Math.abs(girado) > CONTRARIO) {
      return { ...e, fase: "invalido", motivo: "La segunda vuelta de la «8» tiene que ir al lado contrario de la primera." };
    }
  }
  if (e.fase !== "cruce" && Math.abs(m.inclinacion) >= EMPIEZA) e = { ...e, arco: [...e.arco, aNm(m.lat!, m.lon!, en.lat!, en.lon!)] };

  for (const k of ["altitud", "velocidad", "inclinacion"] as const) {
    const v = desvioAlrededor(m, e, k);
    if (v !== null) e = { ...e, puntos: { ...e.puntos, [k]: [...e.puntos[k], { t: m.t, v }] } };
  }

  if (Math.abs(e.girado) >= VUELTA && nivelado && e.fase !== "cruce") {
    const vueltas = [...e.vueltas, cerrarVuelta(e.arco)];
    if (e.fase === "vuelta1") return { ...e, fase: "cruce", cruceSeg: 0, vueltas, arco: [] };
    const fin = { ...e, vueltas };
    return { ...fin, fase: "terminado", resultado: resultado(fin, fin.nivel ?? 3) };
  }
  return e;
}
