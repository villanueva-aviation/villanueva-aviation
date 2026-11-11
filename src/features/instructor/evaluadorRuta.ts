import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo } from "./evaluador.ts";
import { MOTIVO_GPS, MOTIVO_LECTOR, MOTIVO_SENAL, MOTIVO_SIN_SENAL } from "./evaluadorInterceptacion.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import { CASOS_RUTA, desvioGrados, generarRuta, pasoEstacion, puntos, type EjercicioRuta } from "./navIfr.ts";
import { tolRuta, type Nivel } from "./nivel.ts";
import { distanciaVor, type VorElegido } from "./vorSim.ts";

// Rutas de acercamiento y alejamiento (programa IFR, lección 2; reglas en el plan 2026-11-11 lecciones 2 a 4). Puro.
// Se acerca por un radial (TO), pasa la estación y se aleja por otro (FROM). El desvío sale del radial del avión, no de la barra.

export type FaseRuta = "posicionando" | "acercandose" | "alejandose" | "terminado" | "invalido";
export type CampoRuta = "acercamiento" | "alejamiento";
export const CAMPOS_RUTA: CampoRuta[] = ["acercamiento", "alejamiento"];
const CODIGO: Record<CampoRuta, string> = { acercamiento: "1", alejamiento: "2" };

/** A menos de esto del VOR la ruta no empieza: el cadete se aleja primero. */
export const MIN_INICIO_NM = 5;
/** Cerca de la estación la barra es demasiado sensible: esas muestras no cuentan. */
const CERCA_NM = 2;
/** Sin posición, lo que no cuenta alrededor del paso. */
const CERCA_SEG = 60;
/** Ya establecido en la salida, cuánto se sostiene. */
export const SOSTENER_SEG = 120;
export const LIMITE_RUTA_SEG = 1800;
const SIN_SENAL_SEG = 10;

export type NotaRuta = "deriva";

export interface ResultadoRuta extends ResultadoComun {
  maniobra: "ruta-vor";
  nivel: Nivel;
  ejercicio: EjercicioRuta;
  vor?: string;
  distanciaInicio: number | null;
  /** Promedio con signo del desvío en lo calificado, en puntos (+ = a la derecha del curso). */
  deriva: { acercamiento: number | null; alejamiento: number | null };
  peor: Record<CampoRuta, number>;
  notas: NotaRuta[];
  fuera: Record<CampoRuta, Tramo[]>;
}

type Punto = { t: number; v: number };

export interface EvaluacionRuta {
  fase: FaseRuta;
  motivo?: string;
  resultado?: ResultadoRuta;
  nivel: Nivel;
  examen: boolean;
  vor?: string;
  estacion?: VorElegido;
  generar: (radial: number) => EjercicioRuta;
  ejercicio: EjercicioRuta | null;
  /** La muestra con la que empezó el ejercicio (después de posicionarse). */
  inicio: Muestra;
  previo: Muestra;
  mhz?: number;
  sinSenalDesde: number | null;
  /** Del otro lado de la estación (con histéresis) y la menor distancia vista en la ida. */
  lado: boolean;
  minDist: number | null;
  tPaso: number | null;
  ida: Punto[];
  vuelta: Punto[];
  establecidoVuelta: number | null;
  tardeVuelta: Tramo | null;
  muestras: Muestra[];
}

const anular = (e: EvaluacionRuta, m: Muestra, motivo: string): EvaluacionRuta => ({ ...e, fase: "invalido", motivo, previo: m });

/** Distancia al VOR: por posición si hay estación y lat/lon; si no, el DME. */
const distancia = (e: EvaluacionRuta, m: Muestra): number | null =>
  (e.estacion ? distanciaVor(m, e.estacion) : null) ?? (m.navTieneDme ? (m.navDme ?? null) : null);

/** Arma con un generador de ejercicio dado (las pruebas pasan uno fijo). */
export function iniciarRuta(m: Muestra, nivel: Nivel, generar: (radial: number) => EjercicioRuta, ctx: ContextoArmado): EvaluacionRuta {
  const e: EvaluacionRuta = {
    fase: "posicionando", nivel, examen: ctx.examen, vor: ctx.vor, estacion: ctx.estacion, generar, ejercicio: null, inicio: m, previo: m, mhz: m.navMhz,
    sinSenalDesde: null, lado: false, minDist: null, tPaso: null, ida: [], vuelta: [], establecidoVuelta: null, tardeVuelta: null, muestras: [m],
  };
  if (m.enTierra) return anular(e, m, "Despega primero: la maniobra se arma en el aire.");
  if (lectorViejoNav(m)) return anular(e, m, MOTIVO_LECTOR);
  if (m.gpsNav) return anular(e, m, MOTIVO_GPS);
  if (!m.navSenal) return anular(e, m, MOTIVO_SIN_SENAL);
  return empezarSiPuede(e, m);
}

export function armarRuta(m: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionRuta {
  const giro = ctx.examen ? CASOS_RUTA[Math.floor(Math.random() * CASOS_RUTA.length)] : CASOS_RUTA[ctx.intento % CASOS_RUTA.length];
  return iniciarRuta(m, nivel, (radial) => generarRuta(radial, giro), ctx);
}

export function armarSoloRuta(e: EvaluacionRuta | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null) === null;
}

/** Posicionado (o sin forma de medir la distancia): genera el ejercicio con el radial de ahora. */
function empezarSiPuede(e: EvaluacionRuta, m: Muestra): EvaluacionRuta {
  const d = distancia(e, m);
  if (d !== null && d < MIN_INICIO_NM) return e;
  if (!m.navSenal || m.navRadial === undefined) return e;
  return { ...e, fase: "acercandose", ejercicio: e.generar(m.navRadial), inicio: m, mhz: m.navMhz, muestras: [m] };
}

export function avanzarRuta(e: EvaluacionRuta, m: Muestra): EvaluacionRuta {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  if (m.t <= e.previo.t) return e;
  const motivo = invalidez(m, e.previo) ?? (lectorViejoNav(m) ? MOTIVO_LECTOR : null);
  if (motivo) return anular(e, m, motivo);
  if (e.fase === "posicionando") return empezarSiPuede({ ...e, previo: m }, m);
  if (m.gpsNav) return anular(e, m, MOTIVO_GPS);

  const muestras = [...e.muestras, m];
  const otraEstacion = e.mhz !== undefined && m.navMhz !== undefined && Math.abs(m.navMhz - e.mhz) >= 0.03;
  if (!m.navSenal || otraEstacion) {
    const desde = e.sinSenalDesde ?? m.t;
    if (m.t - desde > SIN_SENAL_SEG) return anular(e, m, MOTIVO_SENAL);
    return { ...e, sinSenalDesde: desde, muestras, previo: m };
  }
  const n: EvaluacionRuta = { ...e, sinSenalDesde: null, muestras, previo: m };
  const ej = e.ejercicio!;
  const T = tolRuta(e.nivel);
  const radial = m.navRadial ?? ej.entrada;
  const dist = distancia(e, m);
  const cerca = dist !== null && dist < CERCA_NM;

  if (n.fase === "acercandose") {
    if (m.t - e.inicio.t > LIMITE_RUTA_SEG) return terminar(n, [{ inicio: e.inicio.t, fin: m.t, peor: m.t - e.inicio.t }]);
    n.lado = pasoEstacion(e.lado, radial, ej.entrada);
    n.minDist = dist === null ? e.minDist : Math.min(e.minDist ?? dist, dist);
    // También pasó si ya estuvo encima y se está alejando (viró antes de la estación hacia la salida).
    const alejandose = dist !== null && n.minDist !== null && n.minDist < 1.5 && dist > n.minDist + 0.5;
    if (n.lado || alejandose) {
      n.fase = "alejandose";
      n.tPaso = m.t;
      // Sin distancia, lo de los últimos segundos antes del paso no cuenta.
      if (dist === null) n.ida = n.ida.filter((p) => p.t <= m.t - CERCA_SEG);
      return n;
    }
    if (!cerca) n.ida = [...n.ida, { t: m.t, v: puntos(desvioGrados({ radial: ej.entrada, desde: false }, radial)) }];
    return n;
  }

  // Alejándose.
  const tPaso = e.tPaso!;
  const cuenta = dist !== null ? !cerca : m.t - tPaso >= CERCA_SEG;
  if (!cuenta) return n;
  const v = puntos(desvioGrados({ radial: ej.salida, desde: true }, radial));
  if (n.establecidoVuelta === null) {
    if (Math.abs(v) <= T.puntos) n.establecidoVuelta = m.t;
    else if (m.t - tPaso > T.establecerSeg) n.tardeVuelta = { inicio: tPaso, fin: m.t, peor: m.t - tPaso };
    if (m.t - tPaso > LIMITE_RUTA_SEG) return terminar(n, []);
    if (n.establecidoVuelta === null) return n;
  }
  n.vuelta = [...n.vuelta, { t: m.t, v }];
  if (m.t - n.establecidoVuelta >= SOSTENER_SEG) return terminar(n, []);
  return n;
}

const promedio = (ps: Punto[]) => (ps.length ? ps.reduce((a, p) => a + p.v, 0) / ps.length : null);

function terminar(e: EvaluacionRuta, sinPaso: Tramo[]): EvaluacionRuta {
  const T = tolRuta(e.nivel);
  const ej = e.ejercicio!;
  // La ida se califica desde que se estableció por primera vez; si nunca lo hizo, toda es error.
  const k = e.ida.findIndex((p) => Math.abs(p.v) <= T.puntos);
  const ida = k >= 0 ? e.ida.slice(k) : [];
  const nunca: Tramo[] = k < 0 && e.ida.length ? [{ inicio: e.ida[0].t, fin: e.ida[e.ida.length - 1].t, peor: Math.max(...e.ida.map((p) => Math.abs(p.v))) }] : [];
  const fuera: Record<CampoRuta, Tramo[]> = {
    acercamiento: [...sinPaso, ...nunca, ...analizar(ida, T.puntos).tramos],
    alejamiento: [...(e.tardeVuelta ? [e.tardeVuelta] : []), ...analizar(e.vuelta, T.puntos).tramos],
  };
  const deriva = { acercamiento: promedio(ida), alejamiento: promedio(e.vuelta) };
  const notas: NotaRuta[] = [deriva.acercamiento, deriva.alejamiento].some((d) => d !== null && Math.abs(d) > T.puntos / 2) ? ["deriva"] : [];
  const errores = CAMPOS_RUTA.filter((c) => fuera[c].length).length;
  const peorDe = (ps: Punto[]) => Math.max(0, ...ps.map((p) => Math.abs(p.v)));
  const resultado: ResultadoRuta = {
    maniobra: "ruta-vor",
    aprobado: errores === 0,
    calificacion: Math.max(0, 100 - 35 * errores - 10 * notas.length),
    elementos: Object.fromEntries(CAMPOS_RUTA.map((c) => [CODIGO[c], fuera[c].length ? "NS" : "S"])) as Record<string, "S" | "NS">,
    avisos: [],
    muestras: e.muestras,
    nivel: e.nivel,
    ejercicio: ej,
    vor: e.vor,
    distanciaInicio: e.estacion ? distanciaVor(e.inicio, e.estacion) : null,
    deriva,
    peor: { acercamiento: peorDe(ida), alejamiento: peorDe(e.vuelta) },
    notas,
    fuera,
  };
  return { ...e, fase: "terminado", resultado };
}
