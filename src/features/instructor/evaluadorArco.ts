import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo } from "./evaluador.ts";
import {
  avanzarInterceptacion, cerrarInterceptacion, desvioPuntos, iniciarInterceptacion, MOTIVO_GPS, responderTipo, MOTIVO_LECTOR, MOTIVO_SENAL, MOTIVO_SIN_SENAL, type EvaluacionInterceptacion, type ResultadoInterceptacion,
} from "./evaluadorInterceptacion.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import { generarArco, norm180, norm360, type EjercicioArco } from "./navIfr.ts";
import { tolArco, tolInterceptacion, type Nivel } from "./nivel.ts";

// Arcos DME (programa IFR, lección 3; reglas en el plan 2026-11-11 lecciones 2 a 4). Puro.
// Vuela un radial hasta el arco, lo sigue y sale acercándose por otro radial; la salida es una interceptación (plan 1).

export type FaseArco = "hacia-arco" | "entrando" | "en-arco" | "saliendo" | "terminado" | "invalido";
export type CampoArco = "entrada" | "distancia" | "salida";
export const CAMPOS_ARCO: CampoArco[] = ["entrada", "distancia", "salida"];
const CODIGO: Record<CampoArco, string> = { entrada: "1", distancia: "2", salida: "3" };

export const MOTIVO_SIN_DME = "Este VOR no tiene DME: elige uno con DME para los arcos.";
/** Lo que dura la entrada al arco, desde que llega a la banda. */
export const ENTRADA_SEG = 90;
/** A esta distancia (grados de radial) del radial final empieza la salida. */
export const ANTICIPO_GRADOS = 10;
export const LIMITE_ARCO_SEG = 1200;
const SIN_SENAL_SEG = 10;

export interface ResultadoArco extends ResultadoComun {
  maniobra: "arco-dme";
  nivel: Nivel;
  ejercicio: EjercicioArco;
  vor?: string;
  /** El DME en el peor punto de cada tramo de distancia. */
  extremos: number[];
  /** Lo más lejos del arco que estuvo en el arco, NM. */
  peorDistancia: number;
  sobrepasoEntrada: number;
  salida: ResultadoInterceptacion | null;
  fuera: Record<CampoArco, Tramo[]>;
}

type Punto = { t: number; v: number; dme: number };

export interface EvaluacionArco {
  fase: FaseArco;
  motivo?: string;
  resultado?: ResultadoArco;
  nivel: Nivel;
  examen: boolean;
  vor?: string;
  ctx: ContextoArmado;
  ejercicio: EjercicioArco;
  inicio: Muestra;
  previo: Muestra;
  mhz?: number;
  sinSenalDesde: number | null;
  tEntrada: number | null;
  sobrepaso: number;
  arco: Punto[];
  salida: EvaluacionInterceptacion | null;
  /** Saliendo: desde cuándo está establecido en el radial de salida. */
  estableDesde: number | null;
  muestras: Muestra[];
}

/** La salida termina con tantos segundos establecido en el radial (dentro de `establecidoPuntos`). */
const ESTABLECIDO_SEG = 30;

const anular = (e: EvaluacionArco, m: Muestra, motivo: string): EvaluacionArco => ({ ...e, fase: "invalido", motivo, previo: m });

/** Arma con un ejercicio dado (las pruebas pasan uno fijo). */
export function iniciarArco(m: Muestra, nivel: Nivel, ejercicio: EjercicioArco, ctx: ContextoArmado): EvaluacionArco {
  const e: EvaluacionArco = {
    fase: "hacia-arco", nivel, examen: ctx.examen, vor: ctx.vor, ctx, ejercicio, inicio: m, previo: m, mhz: m.navMhz, sinSenalDesde: null, tEntrada: null,
    sobrepaso: 0, arco: [], salida: null, estableDesde: null, muestras: [m],
  };
  if (m.enTierra) return anular(e, m, "Despega primero: la maniobra se arma en el aire.");
  if (lectorViejoNav(m)) return anular(e, m, MOTIVO_LECTOR);
  if (m.gpsNav) return anular(e, m, MOTIVO_GPS);
  if (!m.navSenal) return anular(e, m, MOTIVO_SIN_SENAL);
  if (!m.navTieneDme) return anular(e, m, MOTIVO_SIN_DME);
  return e;
}

export function armarArco(m: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionArco {
  return iniciarArco(m, nivel, generarArco(m.navRadial ?? 0, m.navDme ?? 10), ctx);
}

export function armarSoloArco(e: EvaluacionArco | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !!m.navTieneDme && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null, true) === null;
}

export function avanzarArco(e: EvaluacionArco, m: Muestra): EvaluacionArco {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  if (m.t <= e.previo.t) return e;
  const motivo = invalidez(m, e.previo, true) ?? (lectorViejoNav(m) ? MOTIVO_LECTOR : m.gpsNav ? MOTIVO_GPS : null);
  if (motivo) return anular(e, m, motivo);
  const muestras = [...e.muestras, m];

  // La salida es una interceptación: se le pasan las muestras y se copia su final.
  if (e.fase === "saliendo" && e.salida) {
    const s = avanzarInterceptacion(e.salida, m);
    const n: EvaluacionArco = { ...e, salida: s, muestras, previo: m };
    if (s.fase === "invalido") return anular(n, m, s.motivo ?? MOTIVO_SENAL);
    if (s.fase === "terminado") return terminar(n, []);
    // Ya cruzó y se queda dentro de la tolerancia: la salida está hecha sin volar hasta el VOR.
    const dentro = !!s.cruce && Math.abs(desvioPuntos(s, m)) <= tolInterceptacion(e.nivel).establecidoPuntos;
    const estableDesde = dentro ? (e.estableDesde ?? m.t) : null;
    if (estableDesde !== null && m.t - estableDesde >= ESTABLECIDO_SEG) return terminar({ ...n, salida: cerrarInterceptacion(s, m) }, []);
    return { ...n, estableDesde };
  }

  const otraEstacion = e.mhz !== undefined && m.navMhz !== undefined && Math.abs(m.navMhz - e.mhz) >= 0.03;
  if (!m.navSenal || otraEstacion) {
    const desde = e.sinSenalDesde ?? m.t;
    if (m.t - desde > SIN_SENAL_SEG) return anular(e, m, MOTIVO_SENAL);
    return { ...e, sinSenalDesde: desde, muestras, previo: m };
  }
  if (!m.navTieneDme) return anular(e, m, MOTIVO_SIN_DME);
  const n: EvaluacionArco = { ...e, sinSenalDesde: null, muestras, previo: m };
  const ej = e.ejercicio;
  const T = tolArco(e.nivel);
  const dme = m.navDme ?? ej.radioNm;
  const v = dme - ej.radioNm;
  const desde = e.tEntrada ?? e.inicio.t;
  if (m.t - desde > LIMITE_ARCO_SEG) return terminar(n, [{ inicio: desde, fin: m.t, peor: m.t - desde }]);

  if (n.fase === "hacia-arco") {
    if (Math.abs(v) <= T.distanciaNm) {
      n.fase = "entrando";
      n.tEntrada = m.t;
    }
    return n;
  }
  if (n.fase === "entrando") {
    // Pasarse: hacia el lado al que iba (afuera si llegó alejándose, adentro si llegó acercándose).
    n.sobrepaso = Math.max(e.sobrepaso, ej.alejandose ? v : -v);
    if (m.t - e.tEntrada! >= ENTRADA_SEG) n.fase = "en-arco";
    return n;
  }
  // En el arco.
  if (m.navRadial !== undefined && Math.abs(norm180(m.navRadial - ej.hasta)) <= ANTICIPO_GRADOS) {
    const radialSalida = { tipo: "normal" as const, radial: ej.hasta, desde: false, curso: norm360(ej.hasta + 180), referencia: m.navRadial };
    // Salir del arco siempre es normal: no se le pregunta.
    const s = responderTipo(iniciarInterceptacion(m, e.nivel, radialSalida, e.ctx), "normal");
    if (s.fase === "invalido") return anular(n, m, s.motivo ?? MOTIVO_SENAL);
    return { ...n, fase: "saliendo", salida: s };
  }
  n.arco = [...e.arco, { t: m.t, v, dme }];
  return n;
}

function terminar(e: EvaluacionArco, limite: Tramo[]): EvaluacionArco {
  const T = tolArco(e.nivel);
  const ej = e.ejercicio;
  const distancia = analizar(e.arco, T.distanciaNm).tramos;
  // El DME en el peor punto de cada tramo.
  const extremos = distancia.map((tr) => e.arco.find((p) => p.t >= tr.inicio && p.t <= tr.fin && p.v === tr.peor)?.dme ?? ej.radioNm + tr.peor);
  const tEntrada = e.tEntrada ?? e.inicio.t;
  const salida = e.salida?.resultado ?? null;
  const fuera: Record<CampoArco, Tramo[]> = {
    entrada: e.sobrepaso > T.distanciaNm ? [{ inicio: tEntrada, fin: tEntrada + ENTRADA_SEG, peor: e.sobrepaso }] : [],
    distancia,
    salida: [...limite, ...(salida ? [...salida.fuera.interceptar, ...salida.fuera.sobrepaso, ...salida.fuera.corto] : [])],
  };
  const errores = CAMPOS_ARCO.filter((c) => fuera[c].length).length;
  const resultado: ResultadoArco = {
    maniobra: "arco-dme",
    aprobado: errores === 0,
    calificacion: Math.max(0, 100 - 35 * errores),
    elementos: Object.fromEntries(CAMPOS_ARCO.map((c) => [CODIGO[c], fuera[c].length ? "NS" : "S"])) as Record<string, "S" | "NS">,
    avisos: [],
    muestras: e.muestras,
    nivel: e.nivel,
    ejercicio: ej,
    vor: e.vor,
    extremos,
    peorDistancia: Math.max(0, ...e.arco.map((p) => Math.abs(p.v))),
    sobrepasoEntrada: e.sobrepaso,
    salida,
    fuera,
  };
  return { ...e, fase: "terminado", resultado };
}
