import { analizar, difRumbo, invalidez, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { BANDA, fpm, fueraDeBanda } from "./evaluadorAltitud.ts";
import { CARRERA_KT } from "./fasesVuelo.ts";
import { tolCircuito, type Nivel } from "./nivel.ts";
import { VEL_C172 } from "./tomas.ts";

// Toques y despegues (lección 14, Erik 2026-11-10): cada intento es un circuito, de la carrera de despegue al toque.
// Las piernas salen de cuánto ha virado desde el rumbo de despegue; vale por la izquierda o por la derecha.

export const PATRON_AGL = 1000;
export const VEL_CIRCUITO = { vr: VEL_C172.vr, ascenso: BANDA.sube, cola: 90, final: [65, 70] as const };
export const INCLINACION_MAX = 30;
/** Rotación: −5/+10 kt de Vr, como el despegue del repaso. */
const ROTA_BANDA = [VEL_CIRCUITO.vr - 5, VEL_CIRCUITO.vr + 10] as const;
const ROTA_GRADOS = 3;
/** Ya en el aire, se arma solo por debajo de esto (si se perdió la carrera). */
export const ARMA_AGL = 500;
/** En viento en cola se mide desde estos segundos (ya nivelado y acelerado) hasta que empieza a bajar. */
const COLA_SEG = 20;
const BAJANDO_FPM = -300;
const BAJANDO_SEG = 3;
const TOQUE_SEG = 2;
const MAX_SEG = 12 * 60;

export type EtapaCircuito = "carrera" | "ascenso" | "cruzado" | "viento-cola" | "base" | "final" | "toque";
const ORDEN: EtapaCircuito[] = ["carrera", "ascenso", "cruzado", "viento-cola", "base", "final", "toque"];
export type CampoCircuito = "rotacion" | "ascenso" | "altitud" | "velocidad" | "inclinacion" | "final" | "toque";
export const CAMPOS_CIRCUITO: CampoCircuito[] = ["rotacion", "ascenso", "altitud", "velocidad", "inclinacion", "final", "toque"];
type Codigo = "1" | "2" | "3" | "4" | "5" | "6" | "7";
const CODIGO: Record<CampoCircuito, Codigo> = { rotacion: "1", ascenso: "2", altitud: "3", velocidad: "4", inclinacion: "5", final: "6", toque: "7" };
type Puntos = Record<CampoCircuito, { t: number; v: number }[]>;

export interface ResultadoCircuito {
  maniobra: "toques-despegues";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  peor: Record<CampoCircuito, number>;
  fuera: Record<CampoCircuito, Tramo[]>;
  ns: Record<CampoCircuito, boolean>;
  /** null: se armó ya en el aire. */
  rotacionKt: number | null;
  /** Régimen de descenso al tocar, positivo. */
  toqueFpm: number | null;
  /** Altitud del circuito, ft indicados. */
  patron: number;
  rumboPista: number;
  lado: Lado;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionCircuito {
  fase: "armado" | "volando" | "terminado" | "invalido";
  motivo?: string;
  resultado?: ResultadoCircuito;
  previo: Muestra | null;
  nivel?: Nivel;
  cabeceoMin: number | null;
  rotacionKt: number | null;
  despegue: Muestra | null;
  rumboPista: number;
  elevacion: number;
  girado: number;
  lado: Lado | null;
  etapa: EtapaCircuito;
  etapaDesde: number;
  vs: number;
  bajandoDesde: number | null;
  /** Ya empezó a bajar en viento en cola: la altitud del circuito no se mide más. */
  bajando: boolean;
  toque: Muestra | null;
  toqueFpm: number | null;
  puntos: Puntos;
  tramo: Muestra[];
}

export function toleranciaCircuito(n: Nivel = 3): Record<CampoCircuito, number> {
  const t = tolCircuito(n);
  return { rotacion: 0, ascenso: t.velocidadKt, altitud: t.altitudFt, velocidad: t.velocidadKt, inclinacion: t.inclinacionGrados, final: t.velocidadKt, toque: 0 };
}

const fueraDe = (v: number, [lo, hi]: readonly [number, number]) => (v < lo ? v - lo : v > hi ? v - hi : 0);
const midiendoCola = (ev: EvaluacionCircuito, m: Muestra) => ev.etapa === "viento-cola" && !ev.bajando && m.t - ev.etapaDesde >= COLA_SEG;

/** Desviación de `m` con el estado ya avanzado a `m`; null si ese campo no se mide ahora. Rotación y toque se miden una vez. */
export function desvioCircuito(m: Muestra, ev: EvaluacionCircuito, c: CampoCircuito): number | null {
  if (ev.fase !== "volando" || m.enTierra || ev.toque) return null;
  const patron = ev.elevacion + PATRON_AGL;
  if (c === "ascenso") return (ev.etapa === "ascenso" || ev.etapa === "cruzado") && ev.vs > 100 && m.agl >= 200 && m.altitud < patron - 100 ? fueraDeBanda(m.velocidad, true) : null;
  if (c === "altitud") return midiendoCola(ev, m) ? m.altitud - patron : null;
  if (c === "velocidad") return midiendoCola(ev, m) ? m.velocidad - VEL_CIRCUITO.cola : null;
  if (c === "inclinacion") return Math.max(0, Math.abs(m.inclinacion) - INCLINACION_MAX);
  if (c === "final") return ev.etapa === "final" && m.agl >= 50 && m.agl <= 500 && ev.vs < 0 ? fueraDe(m.velocidad, VEL_CIRCUITO.final) : null;
  return null;
}

const sinPuntos = (): Puntos => Object.fromEntries(CAMPOS_CIRCUITO.map((c) => [c, []])) as unknown as Puntos;

function medir(ev: EvaluacionCircuito, m: Muestra): Puntos {
  const puntos = { ...ev.puntos };
  for (const c of CAMPOS_CIRCUITO) {
    const v = desvioCircuito(m, ev, c);
    if (v !== null) puntos[c] = [...puntos[c], { t: m.t, v }];
  }
  return puntos;
}

function despegar(ev: EvaluacionCircuito, m: Muestra, vs: number): EvaluacionCircuito {
  const e: EvaluacionCircuito = {
    ...ev, fase: "volando", despegue: m, rumboPista: m.rumbo, elevacion: m.altitud - m.agl, girado: 0, lado: null, etapa: "ascenso", etapaDesde: m.t, vs, tramo: [m], previo: m,
  };
  return { ...e, puntos: medir(e, m) };
}

export function armarCircuito(m: Muestra, nivel: Nivel = 3): EvaluacionCircuito {
  const ev: EvaluacionCircuito = {
    fase: "armado", previo: m, nivel, cabeceoMin: m.enTierra ? (m.cabeceo ?? null) : null, rotacionKt: null, despegue: null, rumboPista: m.rumbo, elevacion: 0,
    girado: 0, lado: null, etapa: "carrera", etapaDesde: m.t, vs: 0, bajandoDesde: null, bajando: false, toque: null, toqueFpm: null, puntos: sinPuntos(), tramo: [],
  };
  return m.enTierra ? ev : despegar(ev, m, m.vs ?? 0);
}

/** En la carrera de despegue, o ya en el aire y bajo. */
export function armarSoloCircuito(ev: EvaluacionCircuito | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  if (invalidez(m, null) !== null) return false;
  return m.enTierra ? (m.gs ?? m.velocidad) >= CARRERA_KT : m.agl < ARMA_AGL;
}

function resultado(ev: EvaluacionCircuito, n: Nivel): ResultadoCircuito {
  const tol = toleranciaCircuito(n);
  const peor = {} as Record<CampoCircuito, number>;
  const fuera = {} as Record<CampoCircuito, Tramo[]>;
  const ns = {} as Record<CampoCircuito, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  // Rotación y toque: un solo valor cada uno.
  const unico: Partial<Record<CampoCircuito, { t: number; v: number }>> = {
    rotacion: { t: ev.despegue!.t, v: ev.rotacionKt === null ? 0 : fueraDe(ev.rotacionKt, ROTA_BANDA) },
    toque: { t: ev.toque!.t, v: Math.max(0, (ev.toqueFpm ?? 0) - tolCircuito(n).toqueFpm) },
  };
  for (const c of CAMPOS_CIRCUITO) {
    const u = unico[c];
    if (u) {
      peor[c] = u.v;
      fuera[c] = u.v ? [{ inicio: u.t, fin: u.t, peor: u.v }] : [];
      ns[c] = u.v !== 0;
      if (ns[c]) total -= 15;
    } else {
      const r = analizar(ev.puntos[c], tol[c], tolCircuito(n).nsSeg);
      peor[c] = r.peor;
      fuera[c] = r.tramos;
      ns[c] = r.ns;
      const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
      total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[c] - 1));
    }
    elementos[CODIGO[c]] = ns[c] ? "NS" : "S";
  }
  return {
    maniobra: "toques-despegues",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos, peor, fuera, ns,
    rotacionKt: ev.rotacionKt, toqueFpm: ev.toqueFpm, patron: ev.elevacion + PATRON_AGL, rumboPista: ev.rumboPista, lado: ev.lado ?? "izquierda",
    avisos: [], muestras: ev.tramo, nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarCircuito(ev: EvaluacionCircuito, m: Muestra): EvaluacionCircuito {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  const motivo = invalidez(m, p);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };
  const vs = m.vs ?? (p ? fpm(m, p) : 0);

  if (ev.fase === "armado") {
    if (!m.enTierra) return despegar({ ...ev, rotacionKt: ev.rotacionKt ?? m.velocidad }, m, vs);
    // Frenó en la pista: la rotación se vuelve a medir en la próxima carrera.
    if ((m.gs ?? m.velocidad) < CARRERA_KT) return { ...ev, cabeceoMin: null, rotacionKt: null, previo: m };
    let { cabeceoMin, rotacionKt } = ev;
    if (rotacionKt === null && m.cabeceo !== undefined) {
      if (cabeceoMin !== null && m.cabeceo - cabeceoMin >= ROTA_GRADOS) rotacionKt = m.velocidad;
      else cabeceoMin = Math.min(cabeceoMin ?? m.cabeceo, m.cabeceo);
    }
    return { ...ev, cabeceoMin, rotacionKt, previo: m };
  }

  const tramo = [...ev.tramo, m];
  if (ev.toque) {
    if (m.t - ev.toque.t < TOQUE_SEG) return { ...ev, tramo, previo: m };
    const fin = { ...ev, tramo, previo: m };
    return { ...fin, fase: "terminado", resultado: resultado(fin, ev.nivel ?? 3) };
  }
  if (m.t - ev.despegue!.t > MAX_SEG) return { ...ev, fase: "invalido", motivo: "El circuito pasó de 12 minutos: el intento no se califica.", previo: m };
  if (m.enTierra) {
    if (ev.etapa === "base" || ev.etapa === "final") return { ...ev, etapa: "toque", etapaDesde: m.t, toque: m, toqueFpm: Math.max(0, -ev.vs), tramo, previo: m };
    if (ev.etapa !== "ascenso") return { ...ev, fase: "invalido", motivo: "Tocaste tierra antes de completar el circuito.", previo: m };
    return { ...ev, tramo, previo: m }; // rebote al despegar
  }

  const girado = ev.girado + difRumbo(m.rumbo, p!.rumbo);
  const lado = ev.lado ?? (Math.abs(girado) > 45 ? (girado > 0 ? "derecha" : "izquierda") : null);
  const g = lado === "derecha" ? girado : lado === "izquierda" ? -girado : Math.abs(girado);
  const porGiro: EtapaCircuito = g < 45 ? "ascenso" : g < 135 ? "cruzado" : g < 225 ? "viento-cola" : g < 315 ? "base" : "final";
  const etapa = ORDEN.indexOf(porGiro) > ORDEN.indexOf(ev.etapa) ? porGiro : ev.etapa;
  let { bajandoDesde, bajando } = ev;
  if (etapa === "viento-cola" && !bajando) {
    bajandoDesde = vs < BAJANDO_FPM ? (bajandoDesde ?? m.t) : null;
    bajando = bajandoDesde !== null && m.t - bajandoDesde >= BAJANDO_SEG;
  }
  const nuevo: EvaluacionCircuito = { ...ev, girado, lado, etapa, etapaDesde: etapa === ev.etapa ? ev.etapaDesde : m.t, vs, bajandoDesde, bajando, tramo, previo: m };
  return { ...nuevo, puntos: medir(nuevo, m) };
}
