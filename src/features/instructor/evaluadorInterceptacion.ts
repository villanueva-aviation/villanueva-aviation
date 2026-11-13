import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo as TramoFuera } from "./evaluador.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import { desvioGrados, generarTramo, norm180, pasoEstacion, puntos, referenciaTramo, type Ejercicio, type TipoTramo, type Tramo } from "./navIfr.ts";
import { tolInterceptacion, type Nivel } from "./nivel.ts";
import { CONO_NM, conCono, distanciaVor, type VorElegido } from "./vorSim.ts";

// Un tramo del vuelo encadenado de las lecciones IFR 1 y 2 (spec 2026-11-13): alejándose hasta las 8 NM o acercándose hasta
// pasar el VOR, normal o ruta pasada, con la pregunta «¿normal o ruta pasada?». Puro.
// El desvío sale del radial del avión contra el del ejercicio, no de la barra: así no depende de lo que el cadete ponga en el OBS.

export type FaseInterceptacion = "esperando" | "reposicionando" | "interceptando" | "establecido" | "terminado" | "invalido";
export type CampoInterceptacion = "identificar" | "interceptar" | "sobrepaso" | "corto";
export const CAMPOS_INTERCEPTACION: CampoInterceptacion[] = ["identificar", "interceptar", "sobrepaso", "corto"];
const CODIGO: Record<CampoInterceptacion, string> = { interceptar: "1", sobrepaso: "2", corto: "3", identificar: "4" };

/** El alejamiento termina aquí (o 4 NM más allá de donde empezó, si empezó lejos). */
export const FIN_NM = 8;
/** Límite de seguridad del tramo; sin cruzar el radial para entonces, error. */
export const LIMITE_SEG = 900;
/** Ruta pasada de acercamiento: el minuto después del al través (regla de 1 minuto). */
export const MINUTO_SEG = 60;
/** Desde aquí se mide el ángulo: antes, el cadete todavía está virando hacia el rumbo de interceptación. */
const ANGULO_DESDE_SEG = 20;
const SIN_SENAL_SEG = 10;

export const MOTIVO_LECTOR = "Actualiza el lector a v1.6 para el programa IFR.";
export const MOTIVO_GPS = "La barra la está manejando el GPS: cambia a NAV.";
export const MOTIVO_SENAL = "Se perdió la señal del VOR por más de 10 segundos.";
export const MOTIVO_SIN_SENAL = "No hay señal del VOR: sintoniza la frecuencia en NAV1.";

export type Nota = "sobrepaso" | "angulo";

export interface ResultadoInterceptacion extends ResultadoComun {
  maniobra: "interceptar-radial";
  nivel: Nivel;
  ejercicio: Ejercicio;
  vor?: string;
  dmeInicio: number;
  dmeCruce: number | null;
  /** Distancia al terminar el tramo (falta en los intentos de antes del vuelo encadenado). */
  dmeFin?: number | null;
  /** Lo que contestó: null si no contestó (falta en los intentos de antes del vuelo encadenado). */
  dicho?: TipoTramo | null;
  /** Lo más que se pasó al otro lado después del cruce, en puntos. */
  sobrepaso: number;
  /** El tramo más largo quedándose corto, s. */
  cortoSeg: number;
  /** Promedio del ángulo de interceptación, null si hubo pocas muestras para medirlo. */
  angulo: number | null;
  notas: Nota[];
  fuera: Record<CampoInterceptacion, TramoFuera[]>;
}

export interface EvaluacionInterceptacion {
  fase: FaseInterceptacion;
  motivo?: string;
  resultado?: ResultadoInterceptacion;
  nivel: Nivel;
  tramo: Tramo;
  /** null solo mientras espera la distancia para anunciarlo. */
  ejercicio: Ejercicio | null;
  vor?: string;
  estacion?: VorElegido;
  examen: boolean;
  inicio: Muestra;
  previo: Muestra;
  /** Lado del curso donde empezó a medir: +1 a la derecha. */
  signo: 1 | -1;
  cruce: Muestra | null;
  /** Después del cruce: cuánto está del otro lado, en puntos (0 si sigue del lado inicial). */
  pasado: { t: number; v: number }[];
  corto: { desde: number | null; tramos: TramoFuera[]; max: number };
  angulos: number[];
  sinSenalDesde: number | null;
  muestras: Muestra[];
  /** La pregunta «¿normal o ruta pasada?» está pendiente. */
  preguntar: boolean;
  /** undefined: todavía no contesta; null: contestó algo que no se entendió. */
  dicho: TipoTramo | null | undefined;
  /** Desde cuándo se mide la interceptación: el inicio (normal) o el al través (+ el minuto, acercándose) en la ruta pasada. */
  medirDesde: number | null;
  /** Ruta pasada: ya quedó al través de la estación (el radial del avión a 80° o menos del pedido). */
  atraves: boolean;
  /** Alejándose: a qué distancia termina. */
  finNm: number | null;
  /** Acercándose: ya pasó al otro lado de la estación. */
  lado: boolean;
  minDist: number | null;
}

const anular = (e: EvaluacionInterceptacion, m: Muestra, motivo: string): EvaluacionInterceptacion => ({ ...e, fase: "invalido", motivo, previo: m });

/** Millas al VOR: por posición si se conoce la estación, si no por el DME. */
export const distanciaTramo = (e: Pick<EvaluacionInterceptacion, "estacion">, m: Muestra): number | null =>
  (e.estacion ? distanciaVor(m, e.estacion) : null) ?? (m.navTieneDme ? (m.navDme ?? null) : null);

function motivoAlArmar(m: Muestra): string | null {
  if (m.enTierra) return "Despega primero: la maniobra se arma en el aire.";
  if (lectorViejoNav(m)) return MOTIVO_LECTOR;
  if (m.gpsNav) return MOTIVO_GPS;
  if (!m.navSenal) return MOTIVO_SIN_SENAL;
  return null;
}

function vacia(m: Muestra, nivel: Nivel, tramo: Tramo, ctx: ContextoArmado): EvaluacionInterceptacion {
  return {
    fase: "esperando", nivel, tramo, ejercicio: null, vor: ctx.vor, estacion: ctx.estacion, examen: ctx.examen, inicio: m, previo: m, signo: 1, cruce: null,
    pasado: [], corto: { desde: null, tramos: [], max: 0 }, angulos: [], sinSenalDesde: null, muestras: [], preguntar: false, dicho: undefined,
    medirDesde: null, atraves: false, finNm: null, lado: false, minDist: null,
  };
}

/** Empieza el tramo con su ejercicio: la pregunta queda pendiente. */
function empezar(e: EvaluacionInterceptacion, m: Muestra, ej: Ejercicio): EvaluacionInterceptacion {
  const d = desvioGrados(ej, m.navRadial ?? ej.radial);
  const dist = distanciaTramo(e, m);
  const normal = ej.tipo === "normal";
  return {
    ...e, fase: normal ? "interceptando" : "reposicionando", ejercicio: ej, inicio: m, previo: m, muestras: [m], signo: d >= 0 ? 1 : -1, preguntar: true,
    medirDesde: normal ? m.t : null, finNm: ej.desde ? Math.max(FIN_NM, (dist ?? 0) + 4) : null,
  };
}

/** Arma con un ejercicio dado (las pruebas y el primer tramo, ya dicho en tierra, pasan por aquí). */
export function iniciarInterceptacion(m0: Muestra, nivel: Nivel, ejercicio: Ejercicio, ctx: ContextoArmado): EvaluacionInterceptacion {
  const m = conCono(m0, ctx.estacion);
  const e = vacia(m, nivel, { desde: ejercicio.desde, tipo: ejercicio.tipo }, ctx);
  const motivo = motivoAlArmar(m);
  return motivo ? anular({ ...e, ejercicio }, m, motivo) : empezar(e, m, ejercicio);
}

export function armarInterceptacion(m0: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionInterceptacion {
  const tramo = ctx.tramos?.[ctx.intento] ?? { desde: true, tipo: "normal" };
  if (ctx.intento === 0 && ctx.primero) return iniciarInterceptacion(m0, nivel, ctx.primero, ctx);
  const m = conCono(m0, ctx.estacion);
  const e = vacia(m, nivel, tramo, ctx);
  const motivo = motivoAlArmar(m);
  if (motivo) return anular(e, m, motivo);
  const dist = distanciaTramo(e, m);
  if (tramo.esperarNm !== undefined && dist !== null && dist < tramo.esperarNm) return e;
  return empezar(e, m, generarTramo(tramo, referenciaTramo(m, ctx.estacion)));
}

export function armarSoloInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null, true) === null;
}

/** La primera respuesta es la que cuenta. */
export function responderTipo(e: EvaluacionInterceptacion, dicho: TipoTramo | null): EvaluacionInterceptacion {
  if (e.dicho !== undefined || !e.ejercicio || e.fase === "terminado" || e.fase === "invalido") return e;
  return { ...e, dicho, preguntar: false };
}

/** Puntos de desvío de la muestra, + = del lado donde empezó a medir. */
export const desvioPuntos = (e: EvaluacionInterceptacion, m: Muestra) =>
  e.ejercicio ? e.signo * puntos(desvioGrados(e.ejercicio, m.navRadial ?? e.ejercicio.radial)) : 0;

export function avanzarInterceptacion(e: EvaluacionInterceptacion, crudo: Muestra): EvaluacionInterceptacion {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  const m = conCono(crudo, e.estacion);
  if (m.t <= e.previo.t) return e;
  const motivo = invalidez(m, e.previo, true) ?? (lectorViejoNav(m) ? MOTIVO_LECTOR : m.gpsNav ? MOTIVO_GPS : null);
  if (motivo) return anular(e, m, motivo);

  if (e.fase === "esperando") {
    const dist = distanciaTramo(e, m);
    if (!m.navSenal || dist === null || dist < (e.tramo.esperarNm ?? 0)) return { ...e, previo: m };
    return empezar(e, m, generarTramo(e.tramo, referenciaTramo(m, e.estacion)));
  }

  const muestras = [...e.muestras, m];
  // Otra frecuencia en NAV1 es otra estación: cuenta como sin señal del VOR del ejercicio.
  const otraEstacion = e.inicio.navMhz !== undefined && m.navMhz !== undefined && Math.abs(m.navMhz - e.inicio.navMhz) >= 0.03;
  if (!m.navSenal || otraEstacion) {
    const desde = e.sinSenalDesde ?? m.t;
    if (m.t - desde > SIN_SENAL_SEG) return anular(e, m, MOTIVO_SENAL);
    return { ...e, sinSenalDesde: desde, muestras, previo: m };
  }
  const n: EvaluacionInterceptacion = { ...e, sinSenalDesde: null, muestras, previo: m };
  const ej = e.ejercicio!;
  const radial = m.navRadial ?? ej.radial;
  const dist = distanciaTramo(e, m);

  // Ruta pasada: nada se mide hasta el al través (y, acercándose, el minuto que le sigue).
  if (n.medirDesde === null) {
    n.atraves = pasoEstacion(e.atraves, radial, ej.radial + 180);
    if (n.atraves) n.medirDesde = m.t + (ej.desde ? 0 : MINUTO_SEG);
  }
  const midiendo = n.medirDesde !== null && m.t >= n.medirDesde;

  // El fin del tramo.
  if (ej.desde) {
    if (dist !== null && n.finNm !== null && dist >= n.finNm) return terminar(n, dist);
  } else if (midiendo) {
    n.lado = pasoEstacion(e.lado, radial, ej.radial);
    n.minDist = dist === null ? e.minDist : Math.min(e.minDist ?? dist, dist);
    // También pasó si ya estuvo encima y se está alejando.
    const alejandose = dist !== null && n.minDist !== null && n.minDist < 1.5 && dist > n.minDist + 0.5;
    if (n.lado || alejandose) return terminar(n, dist);
  }
  if (m.t - e.inicio.t > LIMITE_SEG) return terminar({ ...n, corto: cerrarCorto(n.corto) }, dist);
  if (!midiendo) return n;

  if (n.fase === "reposicionando") {
    // Ya en posición: desde aquí se mide como una interceptación normal.
    n.fase = "interceptando";
    n.signo = desvioGrados(ej, radial) >= 0 ? 1 : -1;
  }
  // Dentro del cono la aguja no vale.
  if (dist !== null && dist < CONO_NM) return n;

  const T = tolInterceptacion(e.nivel);
  const d = desvioPuntos(n, m);
  const angulo = Math.abs(norm180(m.rumbo - ej.curso));
  if (!n.cruce) {
    if (d <= 0 || Math.abs(d) <= 0.25) {
      n.cruce = m;
      n.fase = "establecido";
      n.corto = cerrarCorto(n.corto);
    } else {
      if (d > 2 && m.t - n.medirDesde! >= ANGULO_DESDE_SEG) n.angulos = [...n.angulos, angulo];
      if (angulo <= 10 && d > 1) {
        const desde = n.corto.desde ?? m.t;
        const dur = m.t - desde;
        n.corto = { ...n.corto, desde, max: Math.max(n.corto.max, dur) };
        if (dur > T.cortoSeg) {
          const otros = n.corto.tramos.filter((tr) => tr.inicio !== desde);
          n.corto.tramos = [...otros, { inicio: desde, fin: m.t, peor: dur }];
        }
      } else n.corto = cerrarCorto(n.corto);
    }
  }
  if (n.cruce) n.pasado = [...n.pasado, { t: m.t, v: Math.max(0, -d) }];
  return n;
}

const cerrarCorto = (c: EvaluacionInterceptacion["corto"]) => ({ ...c, desde: null });

/** La salida del arco DME (lección 3) termina establecida, no al pasar el VOR: el arco la cierra con esto. */
export const cerrarInterceptacion = (e: EvaluacionInterceptacion, m: Muestra): EvaluacionInterceptacion =>
  terminar({ ...e, corto: cerrarCorto(e.corto) }, distanciaTramo(e, m));

function terminar(e: EvaluacionInterceptacion, dist: number | null): EvaluacionInterceptacion {
  const T = tolInterceptacion(e.nivel);
  const ej = e.ejercicio!;
  const fin = e.previo.t;
  const pasado = analizar(e.pasado, T.sobrepasoPuntos);
  const sobrepaso = Math.max(0, ...e.pasado.map((p) => p.v));
  const angulo = e.angulos.length >= 10 ? e.angulos.reduce((a, b) => a + b, 0) / e.angulos.length : null;
  const dicho = e.dicho ?? null;
  const fuera: Record<CampoInterceptacion, TramoFuera[]> = {
    identificar: dicho === ej.tipo ? [] : [{ inicio: e.inicio.t, fin, peor: 1 }],
    interceptar: e.cruce ? [] : [{ inicio: e.inicio.t, fin, peor: fin - e.inicio.t }],
    sobrepaso: pasado.tramos,
    corto: e.corto.tramos,
  };
  const notas: Nota[] = [];
  if (!fuera.sobrepaso.length && sobrepaso > T.sobrepasoPuntos / 2) notas.push("sobrepaso");
  if (angulo !== null && (angulo < T.anguloMin || angulo > T.anguloMax)) notas.push("angulo");
  const elementos = Object.fromEntries(CAMPOS_INTERCEPTACION.map((c) => [CODIGO[c], fuera[c].length ? "NS" : "S"])) as Record<string, "S" | "NS">;
  const errores = CAMPOS_INTERCEPTACION.filter((c) => fuera[c].length).length;
  const resultado: ResultadoInterceptacion = {
    maniobra: "interceptar-radial",
    aprobado: errores === 0,
    calificacion: Math.max(0, 100 - 35 * errores - 10 * notas.length),
    elementos,
    avisos: [],
    muestras: e.muestras,
    nivel: e.nivel,
    ejercicio: ej,
    vor: e.vor,
    dmeInicio: e.inicio.navDme ?? 0,
    dmeCruce: e.cruce?.navDme ?? null,
    dmeFin: dist,
    dicho,
    sobrepaso,
    cortoSeg: e.corto.max,
    angulo,
    notas,
    fuera,
  };
  return { ...e, fase: "terminado", preguntar: false, resultado };
}
