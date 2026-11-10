import { analizar, difRumbo, invalidez, type Muestra, type Tramo } from "./evaluador.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { ALTURA_SEGURA_AGL, INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolAltitud, type Nivel } from "./nivel.ts";

// Ascensos y descensos (lección 5, Erik 2026-11-10): desde recto y nivelado, 500 ft arriba (70–74 kt, potencia completa)
// o abajo (90–95 kt), nivelar unos 50 ft antes y mantener la altitud. No es tarea del ACS; tolerancias en nivel.ts (tolAltitud).

export const CAMBIO_FT = 500;
export const ADELANTO_FT = 50;
export const MANTENER_SEG = 10;
export const BANDA = { sube: [70, 74], baja: [90, 95] } as const;
/** Menos de esto de régimen vertical durante QUIETO_SEG: niveló. */
export const QUIETO_FPM = 150;
export const QUIETO_SEG = 3;
/** Irse más que esto al otro lado anula. */
export const CONTRARIO_FT = 150;

export type CampoAltitud = "altitud" | "velocidad" | "rumbo" | "bola";
export const CAMPOS_ALTITUD: CampoAltitud[] = ["altitud", "velocidad", "rumbo", "bola"];
type Codigo = "1" | "2" | "3" | "4";
const CODIGO: Record<CampoAltitud, Codigo> = { velocidad: "1", altitud: "2", rumbo: "3", bola: "4" };
export type FaseAltitud = "armado" | "cambiando" | "manteniendo" | "terminado" | "invalido";

export interface AltitudAsignada {
  altitud: number;
  sube: boolean;
}

export interface ResultadoAltitud {
  maniobra: "ascensos-descensos";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  objetivo: { t: number; altitud: number; rumbo: number; velocidad: number; altitudFinal: number; sube: boolean };
  peor: Record<CampoAltitud, number>;
  fuera: Record<CampoAltitud, Tramo[]>;
  ns: Record<CampoAltitud, boolean>;
  /** Altitud al nivelar menos la asignada (positivo = arriba). */
  altitudAlNivelar: number;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionAltitud {
  fase: FaseAltitud;
  motivo?: string;
  resultado?: ResultadoAltitud;
  previo: Muestra | null;
  ventana: Muestra[];
  objetivo: Muestra | null;
  asignada: AltitudAsignada | null;
  /** Primera muestra del tramo sin régimen vertical en curso. */
  quieto: Muestra | null;
  nivelado: Muestra | null;
  tramo: Muestra[];
  nivel?: Nivel;
}

/**
 * Sale de la altitud de entrada: múltiplo par de 500 sube, impar baja; así cada repetición (que empieza donde
 * terminó la anterior) va al revés. Si bajar lo deja a menos de 1,500 ft AGL, sube.
 */
export function altitudAsignada(altitud: number, agl: number): AltitudAsignada {
  const k = Math.round(altitud / CAMBIO_FT);
  const sube = k % 2 === 0 || agl - (altitud - (k - 1) * CAMBIO_FT) < ALTURA_SEGURA_AGL;
  return { altitud: (k + (sube ? 1 : -1)) * CAMBIO_FT, sube };
}

export function toleranciaAltitud(n: Nivel = 3): Record<CampoAltitud, number> {
  const t = tolAltitud(n);
  return { altitud: t.altitudFt, velocidad: t.velocidadKt, rumbo: t.rumboGrados, bola: t.bola };
}

/** Kt fuera de la banda: 0 adentro, negativo abajo, positivo arriba. */
export function fueraDeBanda(kt: number, sube: boolean): number {
  const [lo, hi] = sube ? BANDA.sube : BANDA.baja;
  return kt < lo ? kt - lo : kt > hi ? kt - hi : 0;
}

/** ¿Se califica la velocidad? Ya cambió 150 ft y le faltan más de 100: ya no está acelerando ni nivelando. */
export const midiendoVelocidad = (cambiado: number, total: number) => cambiado >= 150 && total - cambiado > 100;

export function desvioAltitud(m: Muestra, o: Muestra, a: AltitudAsignada, c: CampoAltitud, nivelo: boolean): number | null {
  const total = Math.abs(a.altitud - o.altitud);
  const cambiado = (a.sube ? 1 : -1) * (m.altitud - o.altitud);
  if (c === "rumbo") return difRumbo(m.rumbo, o.rumbo);
  if (c === "bola") return m.bola;
  if (c === "altitud") return nivelo ? m.altitud - a.altitud : null;
  return !nivelo && midiendoVelocidad(cambiado, total) ? fueraDeBanda(m.velocidad, a.sube) : null;
}

export function armarAltitud(m: Muestra, nivel: Nivel = 3): EvaluacionAltitud {
  const vacia = { previo: m, ventana: [m], objetivo: null, asignada: null, quieto: null, nivelado: null, tramo: [], nivel };
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", ...vacia };
  return { fase: "armado", ...vacia };
}

export function armarSoloAltitud(ev: EvaluacionAltitud | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

const rango = (v: number[]) => Math.max(...v) - Math.min(...v);
function estable(v: Muestra[]): boolean {
  if (v.length < 2 || v[v.length - 1].t - v[0].t < 0.9 * ESTABLE.seg) return false;
  return (
    v.every((m) => Math.abs(m.inclinacion) < ESTABLE.inclinacion) &&
    rango(v.map((m) => m.altitud)) <= ESTABLE.altitudFt &&
    rango(v.map((m) => m.velocidad)) <= ESTABLE.velocidadKt &&
    rango(v.map((m) => difRumbo(m.rumbo, v[0].rumbo))) <= ESTABLE.rumboGrados
  );
}

/** Régimen vertical: el del lector, o el de las dos últimas muestras con un lector viejo. */
export const fpm = (m: Muestra, p: Muestra) => m.vs ?? ((m.altitud - p.altitud) / Math.max(0.05, m.t - p.t)) * 60;

function resultado(ev: EvaluacionAltitud, tramo: Muestra[], n: Nivel): ResultadoAltitud {
  const o = ev.objetivo!;
  const a = ev.asignada!;
  const tol = toleranciaAltitud(n);
  const peor = {} as Record<CampoAltitud, number>;
  const fuera = {} as Record<CampoAltitud, Tramo[]>;
  const ns = {} as Record<CampoAltitud, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const c of CAMPOS_ALTITUD) {
    const puntos = tramo.flatMap((m) => {
      const v = desvioAltitud(m, o, a, c, m.t >= ev.nivelado!.t);
      return v === null ? [] : [{ t: m.t, v }];
    });
    const r = analizar(puntos, tol[c], tolAltitud(n).nsSeg);
    peor[c] = r.peor;
    fuera[c] = r.tramos;
    ns[c] = r.ns;
    elementos[CODIGO[c]] = r.ns ? "NS" : "S";
    const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
    total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[c] - 1));
  }
  return {
    maniobra: "ascensos-descensos",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos,
    objetivo: { t: o.t, altitud: o.altitud, rumbo: o.rumbo, velocidad: o.velocidad, altitudFinal: a.altitud, sube: a.sube },
    peor,
    fuera,
    ns,
    altitudAlNivelar: ev.nivelado!.altitud - a.altitud,
    avisos: [],
    muestras: tramo,
    nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarAltitud(ev: EvaluacionAltitud, m: Muestra): EvaluacionAltitud {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (!estable(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, fase: "cambiando", ventana, objetivo: m, asignada: altitudAsignada(m.altitud, m.agl), tramo: [m], previo: m };
  }

  const o = ev.objetivo!;
  const a = ev.asignada!;
  const tramo = [...ev.tramo, m];
  if (ev.fase === "cambiando") {
    const cambiado = (a.sube ? 1 : -1) * (m.altitud - o.altitud);
    if (cambiado < -CONTRARIO_FT) return { ...ev, fase: "invalido", motivo: "Te fuiste en sentido contrario a la altitud que pidió el instructor.", previo: m };
    const quieto = Math.abs(fpm(m, ev.previo!)) < QUIETO_FPM ? (ev.quieto ?? m) : null;
    const nivelo = !!quieto && cambiado > Math.abs(a.altitud - o.altitud) / 2 && m.t - quieto.t >= QUIETO_SEG;
    return { ...ev, fase: nivelo ? "manteniendo" : "cambiando", quieto, nivelado: nivelo ? quieto : null, tramo, previo: m };
  }
  if (m.t - ev.nivelado!.t < MANTENER_SEG) return { ...ev, tramo, previo: m };
  return { ...ev, fase: "terminado", tramo, previo: m, resultado: resultado(ev, tramo, ev.nivel ?? 3) };
}
