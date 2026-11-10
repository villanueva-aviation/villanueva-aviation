import { analizar, difRumbo, invalidez, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { tolRumbos, type Nivel } from "./nivel.ts";

// Virajes a rumbos (lección 4, Erik 2026-11-09): desde recto y nivelado, viraje con 30° a un rumbo asignado,
// nivelar unos 15° antes y mantenerlo. No es tarea del ACS; tolerancias en nivel.ts (tolRumbos).

export const INCLINACION_RUMBOS = 30;
/** Grados antes del rumbo para empezar a nivelar: la mitad de la inclinación. */
export const ADELANTO_GRADOS = 15;
/** Segundos manteniendo el rumbo después de nivelar. */
export const MANTENER_SEG = 10;
/** Alas a menos de esto, ya cerca del rumbo: niveló. */
const NIVELADO = 5;
/** Girar más que esto al lado contrario anula. */
const CONTRARIO = 30;

export type CampoRumbos = "altitud" | "inclinacion" | "rumbo" | "velocidad" | "bola";
export const CAMPOS_RUMBOS: CampoRumbos[] = ["altitud", "velocidad", "inclinacion", "rumbo", "bola"];
type Codigo = "1" | "2" | "3" | "4" | "5";
const CODIGO: Record<CampoRumbos, Codigo> = { altitud: "1", inclinacion: "2", rumbo: "3", velocidad: "4", bola: "5" };
export type FaseRumbos = "armado" | "virando" | "manteniendo" | "terminado" | "invalido";

export interface Asignado {
  rumbo: number;
  lado: Lado;
  /** Grados a girar hacia `lado`. */
  giro: number;
}

export interface ResultadoRumbos {
  maniobra: "virajes-rumbos";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<Codigo, "S" | "NS">;
  objetivo: { t: number; altitud: number; rumbo: number; velocidad: number; rumboFinal: number; lado: Lado };
  peor: Record<CampoRumbos, number>;
  fuera: Record<CampoRumbos, Tramo[]>;
  ns: Record<CampoRumbos, boolean>;
  /** Rumbo al nivelar contra el asignado, −180…180 (positivo = a la derecha). */
  rumboAlNivelar: number;
  avisos: string[];
  muestras: Muestra[];
  nivel: Nivel;
}

export interface EvaluacionRumbos {
  fase: FaseRumbos;
  motivo?: string;
  resultado?: ResultadoRumbos;
  previo: Muestra | null;
  ventana: Muestra[];
  objetivo: Muestra | null;
  asignado: Asignado | null;
  /** Grados girados hacia el lado asignado (negativo = al otro). */
  girado: number;
  nivelado: Muestra | null;
  tramo: Muestra[];
  nivel?: Nivel;
}

const norm = (r: number) => ((r % 360) + 360) % 360;
const GIROS = [90, 180, 120, 150];

/**
 * Sale del rumbo de entrada, así cada repetición (que empieza donde terminó la anterior) pide otro.
 * ponytail: tabla fija de 4 giros; si se siente repetitivo, sortear.
 */
export function rumboAsignado(rumbo: number): Asignado {
  const k = Math.round(norm(rumbo) / 30);
  const lado: Lado = k % 2 ? "derecha" : "izquierda";
  const s = lado === "derecha" ? 1 : -1;
  const final = norm(Math.round((rumbo + s * GIROS[k % 4]) / 30) * 30);
  return { rumbo: final, lado, giro: norm(s * (final - rumbo)) };
}

export function toleranciaRumbos(n: Nivel = 3): Record<CampoRumbos, number> {
  const t = tolRumbos(n);
  return { altitud: t.altitudFt, inclinacion: t.inclinacionGrados, rumbo: t.rumboGrados, velocidad: t.velocidadKt, bola: t.bola };
}

/** ¿Se califica la inclinación? Ya entró al viraje y todavía no le toca nivelar. */
export const midiendoInclinacion = (girado: number, a: Asignado) => girado > ADELANTO_GRADOS && a.giro - girado > ADELANTO_GRADOS + 5;

/** Desviación de una muestra; `girado` decide si la inclinación cuenta y `nivelo` si el rumbo cuenta. */
export function desvioRumbos(m: Muestra, o: Muestra, a: Asignado, c: CampoRumbos, girado: number, nivelo: boolean): number | null {
  if (c === "altitud") return m.altitud - o.altitud;
  if (c === "velocidad") return m.velocidad - o.velocidad;
  if (c === "bola") return m.bola;
  if (c === "inclinacion") return midiendoInclinacion(girado, a) ? Math.abs(m.inclinacion) - INCLINACION_RUMBOS : null;
  return nivelo ? difRumbo(m.rumbo, a.rumbo) : null;
}

export function armarRumbos(m: Muestra, nivel: Nivel = 3): EvaluacionRumbos {
  const vacia = { previo: m, ventana: [m], objetivo: null, asignado: null, girado: 0, nivelado: null, tramo: [], nivel };
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", ...vacia };
  return { fase: "armado", ...vacia };
}

export function armarSoloRumbos(ev: EvaluacionRumbos | null, m: Muestra): boolean {
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

function resultado(ev: EvaluacionRumbos, tramo: Muestra[], n: Nivel): ResultadoRumbos {
  const o = ev.objetivo!;
  const a = ev.asignado!;
  const tol = toleranciaRumbos(n);
  const s = a.lado === "derecha" ? 1 : -1;
  // Se recorre el tramo otra vez para saber cuánto llevaba girado en cada muestra.
  const puntos = Object.fromEntries(CAMPOS_RUMBOS.map((c) => [c, [] as { t: number; v: number }[]])) as Record<CampoRumbos, { t: number; v: number }[]>;
  let girado = 0;
  tramo.forEach((m, i) => {
    if (i > 0) girado += s * difRumbo(m.rumbo, tramo[i - 1].rumbo);
    const nivelo = m.t >= ev.nivelado!.t;
    for (const c of CAMPOS_RUMBOS) {
      const v = desvioRumbos(m, o, a, c, girado, nivelo);
      if (v !== null) puntos[c].push({ t: m.t, v });
    }
  });
  const peor = {} as Record<CampoRumbos, number>;
  const fuera = {} as Record<CampoRumbos, Tramo[]>;
  const ns = {} as Record<CampoRumbos, boolean>;
  const elementos = {} as Record<Codigo, "S" | "NS">;
  let total = 100;
  for (const c of CAMPOS_RUMBOS) {
    const r = analizar(puntos[c], tol[c], tolRumbos(n).nsSeg);
    peor[c] = r.peor;
    fuera[c] = r.tramos;
    ns[c] = r.ns;
    elementos[CODIGO[c]] = r.ns ? "NS" : "S";
    const segundos = r.tramos.reduce((x, tr) => x + tr.fin - tr.inicio, 0);
    total -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(r.peor) / tol[c] - 1));
  }
  return {
    maniobra: "virajes-rumbos",
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(total)),
    elementos,
    objetivo: { t: o.t, altitud: o.altitud, rumbo: o.rumbo, velocidad: o.velocidad, rumboFinal: a.rumbo, lado: a.lado },
    peor,
    fuera,
    ns,
    rumboAlNivelar: difRumbo(ev.nivelado!.rumbo, a.rumbo),
    avisos: [],
    muestras: tramo,
    nivel: n,
  };
}

/** Pura: ignora muestras repetidas o viejas. */
export function avanzarRumbos(ev: EvaluacionRumbos, m: Muestra): EvaluacionRumbos {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ESTABLE.seg);
    if (!estable(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, fase: "virando", ventana, objetivo: m, asignado: rumboAsignado(m.rumbo), girado: 0, tramo: [m], previo: m };
  }

  const a = ev.asignado!;
  const tramo = [...ev.tramo, m];
  if (ev.fase === "virando") {
    const girado = ev.girado + (a.lado === "derecha" ? 1 : -1) * difRumbo(m.rumbo, ev.previo!.rumbo);
    if (girado < -CONTRARIO) return { ...ev, fase: "invalido", motivo: "Viraste al lado contrario del que pidió el instructor.", previo: m };
    const nivelo = girado > a.giro / 2 && Math.abs(m.inclinacion) < NIVELADO;
    return { ...ev, fase: nivelo ? "manteniendo" : "virando", girado, nivelado: nivelo ? m : null, tramo, previo: m };
  }
  if (m.t - ev.nivelado!.t < MANTENER_SEG) return { ...ev, tramo, previo: m };
  return { ...ev, fase: "terminado", tramo, previo: m, resultado: resultado(ev, tramo, ev.nivel ?? 3) };
}
