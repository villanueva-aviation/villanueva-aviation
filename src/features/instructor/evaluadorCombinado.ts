import { analizar, difRumbo, invalidez, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import {
  altitudAsignada, CONTRARIO_FT, fpm, fueraDeBanda, midiendoVelocidad, QUIETO_FPM, QUIETO_SEG, type AltitudAsignada,
} from "./evaluadorAltitud.ts";
import { estable, rumboAsignado, type Asignado } from "./evaluadorRumbos.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolCombinado, type Nivel } from "./nivel.ts";

// Virajes ascendiendo y descendiendo (lección 6, Erik 2026-11-10): rumbo de la lección 4 y altitud de la 5 a la vez,
// con 15° de inclinación. Rumbo y altitud se nivelan por separado; al final se mantienen los dos.

export const INCLINACION_COMBINADO = 15;
/** Grados antes del rumbo para nivelar alas: la mitad de la inclinación. */
export const ADELANTO_GRADOS_COMB = 8;
export const MANTENER_SEG = 10;
const NIVELADO = 5;
const CONTRARIO = 30;

export type CampoCombinado = "velocidad" | "inclinacion" | "rumbo" | "altitud" | "bola";
export const CAMPOS_COMBINADO: CampoCombinado[] = ["velocidad", "inclinacion", "rumbo", "altitud", "bola"];
type Codigo = "1" | "2" | "3" | "4" | "5";
const CODIGO: Record<CampoCombinado, Codigo> = { velocidad: "1", inclinacion: "2", rumbo: "3", altitud: "4", bola: "5" };
export type FaseCombinado = "armado" | "virando" | "manteniendo" | "terminado" | "invalido";

export interface ResultadoCombinado {
  maniobra: "virajes-ascendiendo";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  objetivo: { t: number; altitud: number; rumbo: number; velocidad: number; rumboFinal: number; lado: Lado; altitudFinal: number; sube: boolean };
  peor: Record<CampoCombinado, number>;
  fuera: Record<CampoCombinado, Tramo[]>;
  ns: Record<CampoCombinado, boolean>;
  rumboAlNivelar: number;
  altitudAlNivelar: number;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionCombinado {
  fase: FaseCombinado;
  motivo?: string;
  resultado?: ResultadoCombinado;
  previo: Muestra | null;
  ventana: Muestra[];
  objetivo: Muestra | null;
  asignado: Asignado | null;
  asignada: AltitudAsignada | null;
  girado: number;
  quieto: Muestra | null;
  /** Donde niveló alas en el rumbo. */
  alas: Muestra | null;
  /** Donde niveló en la altitud. */
  nivelada: Muestra | null;
  tramo: Muestra[];
  nivel?: Nivel;
}

export function toleranciaCombinado(n: Nivel = 3): Record<CampoCombinado, number> {
  const t = tolCombinado(n);
  return { altitud: t.altitudFt, velocidad: t.velocidadKt, inclinacion: t.inclinacionGrados, rumbo: t.rumboGrados, bola: t.bola };
}

const midiendoInclinacion = (girado: number, a: Asignado) => girado > ADELANTO_GRADOS_COMB && a.giro - girado > ADELANTO_GRADOS_COMB + 5;

/** `alas`/`nivelada`: si ya niveló el rumbo / la altitud en esta muestra. */
export function desvioCombinado(
  m: Muestra, o: Muestra, a: Asignado, h: AltitudAsignada, c: CampoCombinado, girado: number, alas: boolean, nivelada: boolean,
): number | null {
  if (c === "bola") return m.bola;
  if (c === "rumbo") return alas ? difRumbo(m.rumbo, a.rumbo) : null;
  if (c === "altitud") return nivelada ? m.altitud - h.altitud : null;
  if (c === "inclinacion") return !alas && midiendoInclinacion(girado, a) ? Math.abs(m.inclinacion) - INCLINACION_COMBINADO : null;
  const cambiado = (h.sube ? 1 : -1) * (m.altitud - o.altitud);
  return !nivelada && midiendoVelocidad(cambiado, Math.abs(h.altitud - o.altitud)) ? fueraDeBanda(m.velocidad, h.sube) : null;
}

export function armarCombinado(m: Muestra, nivel: Nivel = 3): EvaluacionCombinado {
  const vacia = { previo: m, ventana: [m], objetivo: null, asignado: null, asignada: null, girado: 0, quieto: null, alas: null, nivelada: null, tramo: [], nivel };
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", ...vacia };
  return { fase: "armado", ...vacia };
}

export function armarSoloCombinado(ev: EvaluacionCombinado | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

function resultado(ev: EvaluacionCombinado, tramo: Muestra[], n: Nivel): ResultadoCombinado {
  const o = ev.objetivo!;
  const a = ev.asignado!;
  const h = ev.asignada!;
  const tol = toleranciaCombinado(n);
  const s = a.lado === "derecha" ? 1 : -1;
  const puntos = Object.fromEntries(CAMPOS_COMBINADO.map((c) => [c, [] as { t: number; v: number }[]])) as Record<CampoCombinado, { t: number; v: number }[]>;
  let girado = 0;
  tramo.forEach((m, i) => {
    if (i > 0) girado += s * difRumbo(m.rumbo, tramo[i - 1].rumbo);
    for (const c of CAMPOS_COMBINADO) {
      const v = desvioCombinado(m, o, a, h, c, girado, m.t >= ev.alas!.t, m.t >= ev.nivelada!.t);
      if (v !== null) puntos[c].push({ t: m.t, v });
    }
  });
  const peor = {} as Record<CampoCombinado, number>;
  const fuera = {} as Record<CampoCombinado, Tramo[]>;
  const ns = {} as Record<CampoCombinado, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const c of CAMPOS_COMBINADO) {
    const r = analizar(puntos[c], tol[c], tolCombinado(n).nsSeg);
    peor[c] = r.peor;
    fuera[c] = r.tramos;
    ns[c] = r.ns;
    elementos[CODIGO[c]] = r.ns ? "NS" : "S";
    const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
    total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[c] - 1));
  }
  return {
    maniobra: "virajes-ascendiendo",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos,
    objetivo: { t: o.t, altitud: o.altitud, rumbo: o.rumbo, velocidad: o.velocidad, rumboFinal: a.rumbo, lado: a.lado, altitudFinal: h.altitud, sube: h.sube },
    peor,
    fuera,
    ns,
    rumboAlNivelar: difRumbo(ev.alas!.rumbo, a.rumbo),
    altitudAlNivelar: ev.nivelada!.altitud - h.altitud,
    avisos: [],
    muestras: tramo,
    nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarCombinado(ev: EvaluacionCombinado, m: Muestra): EvaluacionCombinado {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (!estable(ventana)) return { ...ev, ventana, previo: m };
    return {
      ...ev, fase: "virando", ventana, objetivo: m, asignado: rumboAsignado(m.rumbo), asignada: altitudAsignada(m.altitud, m.agl), girado: 0, tramo: [m], previo: m,
    };
  }

  const o = ev.objetivo!;
  const a = ev.asignado!;
  const h = ev.asignada!;
  const tramo = [...ev.tramo, m];
  if (ev.fase === "virando") {
    const girado = ev.girado + (a.lado === "derecha" ? 1 : -1) * difRumbo(m.rumbo, ev.previo!.rumbo);
    if (girado < -CONTRARIO) return { ...ev, fase: "invalido", motivo: "Viraste al lado contrario del que pidió el instructor.", previo: m };
    const cambiado = (h.sube ? 1 : -1) * (m.altitud - o.altitud);
    if (cambiado < -CONTRARIO_FT) return { ...ev, fase: "invalido", motivo: "Te fuiste en sentido contrario a la altitud que pidió el instructor.", previo: m };
    const alas = ev.alas ?? (girado > a.giro / 2 && Math.abs(m.inclinacion) < NIVELADO ? m : null);
    let quieto = ev.quieto;
    let nivelada = ev.nivelada;
    if (!nivelada) {
      quieto = Math.abs(fpm(m, ev.previo!)) < QUIETO_FPM ? (quieto ?? m) : null;
      if (quieto && cambiado > Math.abs(h.altitud - o.altitud) / 2 && m.t - quieto.t >= QUIETO_SEG) nivelada = quieto;
    }
    return { ...ev, fase: alas && nivelada ? "manteniendo" : "virando", girado, alas, quieto, nivelada, tramo, previo: m };
  }
  if (m.t - Math.max(ev.alas!.t, ev.nivelada!.t) < MANTENER_SEG) return { ...ev, tramo, previo: m };
  return { ...ev, fase: "terminado", tramo, previo: m, resultado: resultado(ev, tramo, ev.nivel ?? 3) };
}
