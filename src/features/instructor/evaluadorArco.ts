import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo } from "./evaluador.ts";
import {
  avanzarInterceptacion, cerrarInterceptacion, desvioPuntos, iniciarInterceptacion, MOTIVO_GPS, responderTipo, MOTIVO_LECTOR, MOTIVO_SENAL, MOTIVO_SIN_SENAL, type EvaluacionInterceptacion, type ResultadoInterceptacion,
} from "./evaluadorInterceptacion.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import { generarArcoRegreso, generarArcoSalida, norm180, norm360, radialRegreso, REGRESO_NM, viraALaDerecha, type EjercicioArco, type Lado } from "./navIfr.ts";
import { tolArco, tolInterceptacion, type Nivel } from "./nivel.ts";

// Arcos DME (programa IFR, lección 3; reglas en el plan 2026-11-11 lecciones 2 a 4). Puro.
// Vuela un radial hasta el arco, lo sigue y sale por otro radial; la salida es una interceptación (plan 1).
// Vuelo encadenado (Erik, 2026-11-16): los pares son arcos de salida (alejándose) y los nones de regreso (acercándose).
// El de salida se anuncia alejándose del VOR; el de regreso, a las 10 NM: primero intercepta un radial de acercamiento y,
// ya en él, el instructor le da el arco. En los dos el cadete dice hacia qué lado vira para entrar al arco.

export type FaseArco = "esperando" | "posicionando" | "hacia-arco" | "entrando" | "en-arco" | "saliendo" | "terminado" | "invalido";
export type CampoArco = "entrada" | "distancia" | "salida" | "identificar";
export const CAMPOS_ARCO: CampoArco[] = ["entrada", "distancia", "salida", "identificar"];
const CODIGO: Record<CampoArco, string> = { entrada: "1", distancia: "2", salida: "3", identificar: "4" };
/** El arco de salida después de un regreso: se anuncia ya pasada la estación, a esta distancia. */
const SALIDA_NM = 2;

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
  /** Lo que dijo hacia dónde viraba al arco; null si no contestó (falta en los intentos de antes del 16/11). */
  dicho?: Lado | null;
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
  /** null mientras espera la distancia o intercepta el radial del regreso. */
  ejercicio: EjercicioArco | null;
  /** Regreso: la interceptación del radial de acercamiento, antes de darle el arco. */
  posicion: EvaluacionInterceptacion | null;
  /** Esperando la salida tras un regreso: lo más cerca que ha pasado de la estación. */
  minDist: number | null;
  /** La pregunta «¿hacia qué lado viras?» está pendiente. */
  preguntar: boolean;
  /** undefined: todavía no contesta; null: contestó algo que no se entendió. */
  dicho: Lado | null | undefined;
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

function vacia(m: Muestra, nivel: Nivel, ctx: ContextoArmado): EvaluacionArco {
  return {
    fase: "esperando", nivel, examen: ctx.examen, vor: ctx.vor, ctx, ejercicio: null, posicion: null, minDist: null, preguntar: false, dicho: undefined,
    inicio: m, previo: m, mhz: m.navMhz, sinSenalDesde: null, tEntrada: null, sobrepaso: 0, arco: [], salida: null, estableDesde: null, muestras: [m],
  };
}

function motivoAlArmar(m: Muestra): string | null {
  if (m.enTierra) return "Despega primero: la maniobra se arma en el aire.";
  if (lectorViejoNav(m)) return MOTIVO_LECTOR;
  if (m.gpsNav) return MOTIVO_GPS;
  if (!m.navSenal) return MOTIVO_SIN_SENAL;
  if (!m.navTieneDme) return MOTIVO_SIN_DME;
  return null;
}

/** Empieza el arco: desde aquí cuentan el tiempo y las muestras, y la pregunta queda pendiente. */
const conArco = (e: EvaluacionArco, m: Muestra, ejercicio: EjercicioArco): EvaluacionArco =>
  ({ ...e, fase: "hacia-arco", ejercicio, posicion: null, inicio: m, previo: m, muestras: [m], preguntar: true });

/** Arma con un ejercicio dado (las pruebas pasan uno fijo). */
export function iniciarArco(m: Muestra, nivel: Nivel, ejercicio: EjercicioArco, ctx: ContextoArmado): EvaluacionArco {
  const motivo = motivoAlArmar(m);
  const e = conArco(vacia(m, nivel, ctx), m, ejercicio);
  return motivo ? anular(e, m, motivo) : e;
}

const esSalida = (ctx: ContextoArmado) => ctx.intento % 2 === 0;

export function armarArco(m: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionArco {
  // Lección 5: el arco de la llegada autorizada, ya acercándose por R1.
  const llegada = ctx.llegadas?.at(-1);
  if (llegada) return iniciarArco(m, nivel, llegada.arco, ctx);
  const e = vacia(m, nivel, ctx);
  const motivo = motivoAlArmar(m);
  if (motivo) return anular(e, m, motivo);
  // El primero sale de una vez, recién despegado; los demás esperan su distancia.
  if (esSalida(ctx) && ctx.intento === 0) return conArco(e, m, generarArcoSalida(m.navRadial ?? 0, m.navDme ?? 0));
  return esperar(e, m);
}

/** Esperando: el de salida, a pasar la estación y alejarse; el de regreso, las 10 NM. */
function esperar(e: EvaluacionArco, m: Muestra): EvaluacionArco {
  const dme = m.navDme ?? 0;
  if (esSalida(e.ctx)) {
    const minDist = Math.min(e.minDist ?? dme, dme);
    if (minDist <= SALIDA_NM && dme >= SALIDA_NM && dme > minDist + 0.5) return conArco(e, m, generarArcoSalida(m.navRadial ?? 0, dme));
    return { ...e, minDist, previo: m };
  }
  if (dme < REGRESO_NM) return { ...e, previo: m };
  const radial = radialRegreso(m.navRadial ?? 0);
  const posicion = responderTipo(
    iniciarInterceptacion(m, e.nivel, { tipo: "normal", radial, desde: false, curso: norm360(radial + 180), referencia: m.navRadial ?? radial }, e.ctx),
    "normal",
  );
  if (posicion.fase === "invalido") return anular(e, m, posicion.motivo ?? MOTIVO_SENAL);
  return { ...e, fase: "posicionando", posicion, inicio: m, previo: m, muestras: [m] };
}

/** La primera respuesta es la que cuenta. */
export function responderLado(e: EvaluacionArco, dicho: Lado | null): EvaluacionArco {
  if (e.dicho !== undefined || !e.ejercicio || e.fase === "terminado" || e.fase === "invalido") return e;
  return { ...e, dicho, preguntar: false };
}

/** Hacia dónde se vira al arco: lo que se le pregunta al cadete. */
export const ladoArco = (ej: EjercicioArco): Lado => (viraALaDerecha(ej) ? "derecha" : "izquierda");

export function armarSoloArco(e: EvaluacionArco | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !!m.navTieneDme && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null, true) === null;
}

export function avanzarArco(e: EvaluacionArco, m: Muestra): EvaluacionArco {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  if (m.t <= e.previo.t) return e;
  const motivo = invalidez(m, e.previo, true) ?? (lectorViejoNav(m) ? MOTIVO_LECTOR : m.gpsNav ? MOTIVO_GPS : null);
  if (motivo) return anular(e, m, motivo);
  if (e.fase === "esperando") return m.navSenal ? esperar(e, m) : { ...e, previo: m };
  const muestras = [...e.muestras, m];

  // Regreso: ya en el radial de acercamiento, el arco.
  if (e.fase === "posicionando" && e.posicion) {
    const s = avanzarInterceptacion(e.posicion, m);
    if (s.fase === "invalido") return anular(e, m, s.motivo ?? MOTIVO_SENAL);
    if (s.cruce) return conArco(e, m, generarArcoRegreso(s.ejercicio!.radial, m.navDme ?? REGRESO_NM));
    // Sin llegar al radial en el tiempo de la interceptación: no entró al arco.
    if (s.fase === "terminado") return terminar({ ...e, muestras, previo: m }, [], [{ inicio: e.inicio.t, fin: m.t, peor: m.t - e.inicio.t }]);
    return { ...e, posicion: s, muestras, previo: m };
  }

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
  const ej = e.ejercicio!;
  const T = tolArco(e.nivel);
  const dme = m.navDme ?? ej.radioNm;
  const v = dme - ej.radioNm;
  const desde = e.tEntrada ?? e.inicio.t;
  if (m.t - desde > LIMITE_ARCO_SEG) return terminar(n, [{ inicio: desde, fin: m.t, peor: m.t - desde }]);

  if (n.fase === "hacia-arco") {
    // Acercándose y ya adentro del arco, cada vez más: no entró (la llegada se lo comió la interceptación).
    if (!ej.alejandose && v < -T.distanciaNm && dme < (e.previo.navDme ?? dme)) return terminar(n, [], [{ inicio: e.inicio.t, fin: m.t, peor: -v }]);
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
    const fuera = !!ej.saleAlejandose;
    const radialSalida = { tipo: "normal" as const, radial: ej.hasta, desde: fuera, curso: norm360(ej.hasta + (fuera ? 0 : 180)), referencia: m.navRadial };
    // Salir del arco siempre es normal: no se le pregunta.
    const s = responderTipo(iniciarInterceptacion(m, e.nivel, radialSalida, e.ctx), "normal");
    if (s.fase === "invalido") return anular(n, m, s.motivo ?? MOTIVO_SENAL);
    return { ...n, fase: "saliendo", salida: s };
  }
  n.arco = [...e.arco, { t: m.t, v, dme }];
  return n;
}

function terminar(e: EvaluacionArco, limite: Tramo[], sinEntrar: Tramo[] = []): EvaluacionArco {
  const T = tolArco(e.nivel);
  // Sin arco todavía (no llegó al radial del regreso): el que le habría tocado, para la hoja y el mapa.
  const ej = e.ejercicio ?? generarArcoRegreso(e.posicion?.ejercicio?.radial ?? 0, REGRESO_NM, () => 0);
  const distancia = analizar(e.arco, T.distanciaNm).tramos;
  // El DME en el peor punto de cada tramo.
  const extremos = distancia.map((tr) => e.arco.find((p) => p.t >= tr.inicio && p.t <= tr.fin && p.v === tr.peor)?.dme ?? ej.radioNm + tr.peor);
  const tEntrada = e.tEntrada ?? e.inicio.t;
  const salida = e.salida?.resultado ?? null;
  const dicho = e.dicho ?? null;
  const fuera: Record<CampoArco, Tramo[]> = {
    entrada: [...sinEntrar, ...(e.sobrepaso > T.distanciaNm ? [{ inicio: tEntrada, fin: tEntrada + ENTRADA_SEG, peor: e.sobrepaso }] : [])],
    distancia,
    salida: [...limite, ...(salida ? [...salida.fuera.interceptar, ...salida.fuera.sobrepaso, ...salida.fuera.corto] : [])],
    identificar: dicho === ladoArco(ej) ? [] : [{ inicio: e.inicio.t, fin: e.previo.t, peor: 1 }],
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
    dicho,
    fuera,
  };
  return { ...e, fase: "terminado", preguntar: false, resultado };
}
