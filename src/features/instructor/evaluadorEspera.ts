import { entradaEspera, norm, type Entrada } from "../entrenador/esperas.ts";
import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo } from "./evaluador.ts";
import { MOTIVO_GPS, MOTIVO_LECTOR, MOTIVO_SENAL, MOTIVO_SIN_SENAL } from "./evaluadorInterceptacion.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import {
  altitudEspera, desvioGrados, entradasValidas, entradaVolada, inventarEspera, norm180, pasoEstacion, puntos, rutaEspera, type DatosEspera,
} from "./navIfr.ts";
import { tolEspera, type Nivel } from "./nivel.ts";
import { conCono, distanciaVor, type VorElegido } from "./vorSim.ts";

// Patrones de espera (programa IFR, lección 4; reglas en el plan 2026-11-11 lecciones 2 a 4). Puro.
// Llega al fijo (el VOR) por un radial, dice la entrada, la vuela y da una vuelta completa. Termina al tercer paso por el fijo.

export type FaseEspera = "posicionando" | "llegando" | "entrada" | "vueltas" | "terminado" | "invalido";
export type CampoEspera = "dicha" | "volada" | "tramo" | "acercamiento" | "virajes" | "distancia" | "altitud";
export const CAMPOS_ESPERA: CampoEspera[] = ["dicha", "volada", "tramo", "acercamiento", "virajes", "distancia", "altitud"];
const CODIGO: Record<CampoEspera, string> = { dicha: "1", volada: "2", tramo: "3", acercamiento: "4", virajes: "5", distancia: "6", altitud: "7" };

/** salida: el radial por el que se aleja hasta 8 NM; llegada: el de regreso al fijo. */
export type EjercicioEspera = DatosEspera & { salida: number; llegada: number; altitudFt: number };

/** Sale por un radial hasta esto del VOR; ahí el instructor le da el radial de regreso. */
export const SALIDA_NM = 8;
/** Una entrada por práctica, en este orden; el examen sortea una. */
export const ENTRADAS_PRACTICA: Entrada[] = ["gota", "paralela", "directa"];
/** A cuántos segundos del fijo pregunta la entrada. */
export const PREGUNTA_SEG = 120;
export const LIMITE_ESPERA_SEG = 1800;
export const MOTIVO_TIEMPO = "La espera no se completó en 30 minutos.";
/** Tasa estándar, °/s. */
export const TASA_ESTANDAR = 3;
const SIN_SENAL_SEG = 10;
const NIVELADO = 5;
const VIRAJE = 10;
const VIRAJE_MIN_SEG = 20;
const RUMBO_TRAMO = 45;
const NIVELAR_SEG = 15;
const CERCA_NM = 1;
/** Al través del fijo: el radial del avión a 90° (con 5 de margen) del de alejamiento, ya del lado de afuera. */
const TRAVES = 95;

export interface ResultadoEspera extends ResultadoComun {
  maniobra: "espera";
  nivel: Nivel;
  ejercicio: EjercicioEspera;
  vor?: string;
  dicha: Entrada | null;
  volada: Entrada | null;
  correcta: Entrada;
  validas: Entrada[];
  /** Segundos de cada tramo de alejamiento de la vuelta. */
  tramos: number[];
  /** °/s de cada viraje después del cruce. */
  tasas: number[];
  peorAcercamiento: number;
  maxDistancia: number;
  /** ft sobre (+) o bajo (−) la altitud de la espera, el peor desde el primer cruce. */
  peorAltitud: number;
  fuera: Record<CampoEspera, Tramo[]>;
}

type Punto = { t: number; v: number };
type Corrida = { desde: number; hasta: number };

export interface EvaluacionEspera {
  fase: FaseEspera;
  motivo?: string;
  resultado?: ResultadoEspera;
  nivel: Nivel;
  examen: boolean;
  vor?: string;
  estacion?: VorElegido;
  /** Ya estuvo a 2 puntos o menos del radial que toca (la salida, luego el regreso): antes no avisa, está interceptando. */
  enRadial: boolean;
  ejercicio: EjercicioEspera;
  preguntar: boolean;
  preguntado: boolean;
  /** undefined = todavía no contesta. */
  dicha: Entrada | null | undefined;
  rumboPregunta: number | null;
  rumboCruce: number | null;
  /** Los t de cada paso por el fijo. */
  cruces: number[];
  /** Índice en `muestras` del primer cruce. */
  kCruce: number;
  volada: Entrada | null | undefined;
  /** Del otro lado del radial de referencia (llegada, luego el de la espera), con histéresis. */
  lado: boolean;
  inicio: Muestra;
  previo: Muestra;
  mhz?: number;
  sinSenalDesde: number | null;
  /** El tramo de alejamiento que va volando, el viraje que va haciendo y desde cuándo está nivelado en el acercamiento. */
  tramo: Corrida | null;
  vistoTramo: boolean;
  giro: (Corrida & { suma: number }) | null;
  tNivel: number | null;
  tramos: number[];
  fueraTramo: Tramo[];
  tasas: number[];
  fueraVirajes: Tramo[];
  acerc: Punto[];
  dist: Punto[];
  alt: Punto[];
  muestras: Muestra[];
}

const anular = (e: EvaluacionEspera, m: Muestra, motivo: string): EvaluacionEspera => ({ ...e, fase: "invalido", motivo, previo: m });

export const distanciaEspera = (e: Pick<EvaluacionEspera, "estacion">, m: Muestra): number | null =>
  (e.estacion ? distanciaVor(m, e.estacion) : null) ?? (m.navTieneDme ? (m.navDme ?? null) : null);

/** El radial del lado de la espera: el curso de alejamiento. */
export const radialEspera = (ej: DatosEspera) => norm(ej.acercamiento + 180);

export function armarEspera(m: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionEspera {
  const espera = ctx.espera ?? inventarEspera();
  const entrada = ENTRADAS_PRACTICA[ctx.examen ? Math.floor(Math.random() * ENTRADAS_PRACTICA.length) : ctx.intento % ENTRADAS_PRACTICA.length];
  const ruta = rutaEspera(radialEspera(espera), espera.giros, entrada, Math.random, ctx.llegada);
  const e: EvaluacionEspera = {
    fase: "posicionando", nivel, examen: ctx.examen, vor: ctx.vor, estacion: ctx.estacion, enRadial: false,
    ejercicio: { ...espera, ...ruta, altitudFt: espera.altitudFt ?? altitudEspera(m.altitud - m.agl) }, preguntar: false, preguntado: false, dicha: undefined,
    rumboPregunta: null, rumboCruce: null, cruces: [], kCruce: -1, volada: undefined, lado: false, inicio: m, previo: m, mhz: m.navMhz,
    sinSenalDesde: null, tramo: null, vistoTramo: false, giro: null, tNivel: null, tramos: [], fueraTramo: [], tasas: [], fueraVirajes: [],
    acerc: [], dist: [], alt: [], muestras: [m],
  };
  if (m.enTierra) return anular(e, m, "Despega primero: la maniobra se arma en el aire.");
  if (lectorViejoNav(m)) return anular(e, m, MOTIVO_LECTOR);
  if (m.gpsNav) return anular(e, m, MOTIVO_GPS);
  if (!m.navSenal) return anular(e, m, MOTIVO_SIN_SENAL);
  return empezarSiPuede(e, m);
}

export function armarSoloEspera(e: EvaluacionEspera | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null) === null;
}

/** La respuesta a «¿Qué entrada vas a hacer?». Solo cuenta antes del fijo. */
export function responderEntrada(e: EvaluacionEspera, dicha: Entrada | null, rumbo: number): EvaluacionEspera {
  if (e.fase !== "posicionando" && e.fase !== "llegando") return e;
  return { ...e, dicha, rumboPregunta: rumbo, preguntar: false, preguntado: true };
}

function empezarSiPuede(e: EvaluacionEspera, m: Muestra): EvaluacionEspera {
  const d = distanciaEspera(e, m);
  if (!m.navSenal || m.navRadial === undefined) return e;
  if (d !== null && d < SALIDA_NM)
    return { ...e, enRadial: e.enRadial || Math.abs(puntos(desvioGrados({ radial: e.ejercicio.salida, desde: true }, m.navRadial))) <= 2 };
  const llegada = e.ejercicio.llegada;
  // Si empieza del otro lado del radial de llegada, primero tiene que regresar a él.
  return { ...e, fase: "llegando", enRadial: false, lado: pasoEstacion(true, m.navRadial, llegada), inicio: m, mhz: m.navMhz, muestras: [m] };
}

export function avanzarEspera(e: EvaluacionEspera, crudo: Muestra): EvaluacionEspera {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  // Sobre el fijo manda la posición: la aguja no vale en el cono y el cruce se ve en su momento.
  const m = conCono(crudo, e.estacion);
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
  const n: EvaluacionEspera = { ...e, sinSenalDesde: null, muestras, previo: m };
  if (m.t - e.inicio.t > LIMITE_ESPERA_SEG) return anular(n, m, MOTIVO_TIEMPO);
  const ej = e.ejercicio;
  const radial = m.navRadial ?? ej.llegada;
  const dist = distanciaEspera(e, m);

  if (n.fase === "llegando") {
    n.enRadial ||= Math.abs(puntos(desvioGrados({ radial: ej.llegada, desde: false }, radial))) <= 2;
    if (!n.preguntado && (dist === null || (dist / Math.max(m.gs ?? m.velocidad, 1)) * 3600 <= PREGUNTA_SEG)) {
      n.preguntar = true;
      n.preguntado = true;
    }
    const lado = pasoEstacion(e.lado, radial, ej.llegada);
    if (lado && !e.lado) {
      return {
        ...n, fase: "entrada", preguntar: false, dicha: e.dicha ?? null, rumboCruce: m.rumbo, cruces: [m.t], kCruce: muestras.length - 1,
        lado: pasoEstacion(true, radial, radialEspera(ej)),
      };
    }
    n.lado = lado;
    return n;
  }

  seguir(n, m, e.previo, dist);
  const lado = pasoEstacion(e.lado, radial, radialEspera(ej));
  n.lado = lado;
  if (!lado || e.lado) return n;
  // Cruzó el fijo desde el lado de la espera.
  n.cruces = [...e.cruces, m.t];
  if (n.fase === "entrada") {
    return { ...n, fase: "vueltas", volada: entradaVolada(muestras.slice(e.kCruce), radialEspera(ej), ej.giros), tramo: null, vistoTramo: false, tNivel: null };
  }
  return terminar(n);
}

/** Lo que se mide en cada muestra después del primer cruce: distancia, virajes, tramo de alejamiento y acercamiento. */
function seguir(n: EvaluacionEspera, m: Muestra, antes: Muestra, dist: number | null) {
  const ej = n.ejercicio;
  const T = tolEspera(n.nivel);
  const banco = Math.abs(m.inclinacion);
  if (dist !== null) n.dist = [...n.dist, { t: m.t, v: dist }];
  n.alt = [...n.alt, { t: m.t, v: m.altitud - ej.altitudFt }];

  if (banco >= VIRAJE) {
    n.giro = n.giro ? { ...n.giro, hasta: m.t, suma: n.giro.suma + norm180(m.rumbo - antes.rumbo) } : { desde: m.t, hasta: m.t, suma: 0 };
  } else if (n.giro) cerrarGiro(n);

  // El tramo de alejamiento: en la vuelta empieza al través del fijo o al nivelar, lo que ocurra después (en la entrada,
  // al nivelar); sigue hasta que vuelve a virar.
  const haciaFuera = Math.abs(norm180(m.rumbo - radialEspera(ej))) <= RUMBO_TRAMO;
  const alTraves = n.fase !== "vueltas" || m.navRadial === undefined || Math.abs(norm180(m.navRadial - radialEspera(ej))) <= TRAVES;
  if (haciaFuera && (n.tramo ? banco < VIRAJE : banco < NIVELADO && alTraves)) {
    n.tramo = n.tramo ? { ...n.tramo, hasta: m.t } : { desde: m.t, hasta: m.t };
    n.vistoTramo = true;
  } else if (n.tramo) {
    if (n.fase === "vueltas") {
      const dur = n.tramo.hasta - n.tramo.desde;
      n.tramos = [...n.tramos, dur];
      if (Math.abs(dur - ej.tramoSeg) > T.tramoSeg) n.fueraTramo = [...n.fueraTramo, { inicio: n.tramo.desde, fin: n.tramo.hasta, peor: dur - ej.tramoSeg }];
    }
    n.tramo = null;
  }

  // El acercamiento de la vuelta: desde 15 s después de nivelar hasta el fijo, sin lo de muy cerca.
  if (n.fase !== "vueltas" || !n.vistoTramo || n.tramo) return;
  if (n.tNivel === null && banco < NIVELADO && Math.abs(norm180(m.rumbo - ej.acercamiento)) <= RUMBO_TRAMO) n.tNivel = m.t;
  if (n.tNivel !== null && m.t - n.tNivel >= NIVELAR_SEG && (dist === null || dist >= CERCA_NM) && m.navRadial !== undefined)
    n.acerc = [...n.acerc, { t: m.t, v: puntos(desvioGrados({ radial: radialEspera(ej), desde: false }, m.navRadial)) }];
}

function cerrarGiro(n: EvaluacionEspera) {
  const g = n.giro!;
  n.giro = null;
  const dur = g.hasta - g.desde;
  if (dur < VIRAJE_MIN_SEG) return;
  const tasa = Math.abs(g.suma) / dur;
  n.tasas = [...n.tasas, tasa];
  if (Math.abs(tasa - TASA_ESTANDAR) > tolEspera(n.nivel).tasaGrados) n.fueraVirajes = [...n.fueraVirajes, { inicio: g.desde, fin: g.hasta, peor: tasa - TASA_ESTANDAR }];
}

function terminar(e: EvaluacionEspera): EvaluacionEspera {
  const n: EvaluacionEspera = { ...e };
  if (n.giro) cerrarGiro(n);
  const T = tolEspera(n.nivel);
  const ej = n.ejercicio;
  const alejamiento = radialEspera(ej);
  const rc = n.rumboCruce!;
  const validas = entradasValidas([rc - 5, rc, rc + 5, ...(n.rumboPregunta !== null ? [n.rumboPregunta] : [])], alejamiento, ej.giros);
  const dicha = n.dicha ?? null;
  const volada = n.volada ?? null;
  const [c1, c2, c3] = n.cruces;
  const fuera: Record<CampoEspera, Tramo[]> = {
    dicha: dicha && validas.includes(dicha) ? [] : [{ inicio: c1, fin: c1, peor: 1 }],
    volada: volada && validas.includes(volada) ? [] : [{ inicio: c1, fin: c2, peor: 1 }],
    // Una vuelta sin tramo de alejamiento también es error.
    tramo: n.tramos.length ? n.fueraTramo : [{ inicio: c2, fin: c3, peor: ej.tramoSeg }],
    acercamiento: analizar(n.acerc, T.puntos).tramos,
    virajes: n.fueraVirajes,
    distancia: analizar(n.dist, T.maxNm).tramos,
    altitud: analizar(n.alt, T.altitudFt).tramos,
  };
  const errores = CAMPOS_ESPERA.filter((c) => fuera[c].length).length;
  const resultado: ResultadoEspera = {
    maniobra: "espera",
    aprobado: errores === 0,
    calificacion: Math.max(0, 100 - 20 * errores),
    elementos: Object.fromEntries(CAMPOS_ESPERA.map((c) => [CODIGO[c], fuera[c].length ? "NS" : "S"])) as Record<string, "S" | "NS">,
    avisos: [],
    muestras: n.muestras,
    nivel: n.nivel,
    ejercicio: ej,
    vor: n.vor,
    dicha,
    volada,
    correcta: entradaEspera(norm(rc), alejamiento, ej.giros),
    validas,
    tramos: n.tramos,
    tasas: n.tasas,
    peorAcercamiento: Math.max(0, ...n.acerc.map((p) => Math.abs(p.v))),
    maxDistancia: Math.max(0, ...n.dist.map((p) => p.v)),
    peorAltitud: n.alt.reduce((a, p) => (Math.abs(p.v) > Math.abs(a) ? p.v : a), 0),
    fuera,
  };
  return { ...n, fase: "terminado", resultado };
}
