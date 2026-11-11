import { analizar, invalidez, lectorViejoNav, type Muestra, type Tramo } from "./evaluador.ts";
import type { ContextoArmado, ResultadoComun } from "./maniobras.ts";
import { CASOS_PRACTICA, desvioGrados, generarEjercicio, norm180, puntos, type Ejercicio } from "./navIfr.ts";
import { tolInterceptacion, type Nivel } from "./nivel.ts";

// Interceptación de radiales (programa IFR, lección 1; reglas en la spec 2026-11-11). Puro.
// El desvío sale del radial del avión contra el del ejercicio, no de la barra: así no depende de lo que el cadete ponga en el OBS.

export type FaseInterceptacion = "interceptando" | "establecido" | "terminado" | "invalido";
export type CampoInterceptacion = "sobrepaso" | "corto" | "interceptar";
export const CAMPOS_INTERCEPTACION: CampoInterceptacion[] = ["interceptar", "sobrepaso", "corto"];
const CODIGO: Record<CampoInterceptacion, string> = { interceptar: "1", sobrepaso: "2", corto: "3" };

/** Segundos dentro de la tolerancia para darlo por establecido. */
export const ESTABLECIDO_SEG = 30;
/** Sin establecerse en este tiempo: error. */
export const LIMITE_SEG = 480;
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
  /** Lo más que se pasó al otro lado después del cruce, en puntos. */
  sobrepaso: number;
  /** El tramo más largo quedándose corto, s. */
  cortoSeg: number;
  /** Promedio del ángulo de interceptación, null si hubo pocas muestras para medirlo. */
  angulo: number | null;
  notas: Nota[];
  fuera: Record<CampoInterceptacion, Tramo[]>;
}

export interface EvaluacionInterceptacion {
  fase: FaseInterceptacion;
  motivo?: string;
  resultado?: ResultadoInterceptacion;
  nivel: Nivel;
  ejercicio: Ejercicio;
  vor?: string;
  examen: boolean;
  inicio: Muestra;
  previo: Muestra;
  /** Lado del curso donde empezó: +1 a la derecha. */
  signo: 1 | -1;
  cruce: Muestra | null;
  /** Después del cruce: cuánto está del otro lado, en puntos (0 si sigue del lado inicial). */
  pasado: { t: number; v: number }[];
  corto: { desde: number | null; tramos: Tramo[]; max: number };
  angulos: number[];
  estableDesde: number | null;
  sinSenalDesde: number | null;
  muestras: Muestra[];
}

const anular = (e: EvaluacionInterceptacion, m: Muestra, motivo: string): EvaluacionInterceptacion => ({ ...e, fase: "invalido", motivo, previo: m });

/** Arma con un ejercicio dado (las pruebas y el examen con casos ya sorteados pasan por aquí). */
export function iniciarInterceptacion(m: Muestra, nivel: Nivel, ejercicio: Ejercicio, ctx: ContextoArmado): EvaluacionInterceptacion {
  const d = desvioGrados(ejercicio, m.navRadial ?? ejercicio.radial);
  const e: EvaluacionInterceptacion = {
    fase: "interceptando", nivel, ejercicio, vor: ctx.vor, examen: ctx.examen, inicio: m, previo: m, signo: d >= 0 ? 1 : -1, cruce: null,
    pasado: [], corto: { desde: null, tramos: [], max: 0 }, angulos: [], estableDesde: null, sinSenalDesde: null, muestras: [m],
  };
  if (m.enTierra) return anular(e, m, "Despega primero: la maniobra se arma en el aire.");
  if (lectorViejoNav(m)) return anular(e, m, MOTIVO_LECTOR);
  if (m.gpsNav) return anular(e, m, MOTIVO_GPS);
  if (!m.navSenal) return anular(e, m, MOTIVO_SIN_SENAL);
  return e;
}

export function armarInterceptacion(m: Muestra, nivel: Nivel = 2, ctx: ContextoArmado = { intento: 0, examen: false }): EvaluacionInterceptacion {
  const caso = ctx.casos?.[ctx.intento] ?? CASOS_PRACTICA[ctx.intento % CASOS_PRACTICA.length];
  const ej = generarEjercicio(caso, m.navRadial ?? 0, m.navDme ?? 0, m.rumbo);
  return iniciarInterceptacion(m, nivel, ej, ctx);
}

export function armarSoloInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra): boolean {
  if (e && e.fase !== "invalido") return false;
  return !!m.navSenal && !m.gpsNav && !m.enTierra && m.agl >= 1000 && invalidez(m, null) === null;
}

/** Sobre la estación el radial da vueltas: esas muestras no cuentan. Sin DME no se puede saber. */
const sobreEstacion = (m: Muestra) => !!m.navTieneDme && (m.navDme ?? 99) < 1;

/** Puntos de desvío de la muestra, + = del lado donde empezó. */
export const desvioPuntos = (e: EvaluacionInterceptacion, m: Muestra) => (e.signo * puntos(desvioGrados(e.ejercicio, m.navRadial ?? e.ejercicio.radial)));

export function avanzarInterceptacion(e: EvaluacionInterceptacion, m: Muestra): EvaluacionInterceptacion {
  if (e.fase === "terminado" || e.fase === "invalido") return e;
  if (m.t <= e.previo.t) return e;
  const motivo = invalidez(m, e.previo) ?? (lectorViejoNav(m) ? MOTIVO_LECTOR : m.gpsNav ? MOTIVO_GPS : null);
  if (motivo) return anular(e, m, motivo);
  const muestras = [...e.muestras, m];
  // Otra frecuencia en NAV1 es otra estación: cuenta como sin señal del VOR del ejercicio.
  const otraEstacion = e.inicio.navMhz !== undefined && m.navMhz !== undefined && Math.abs(m.navMhz - e.inicio.navMhz) >= 0.03;
  if (!m.navSenal || otraEstacion) {
    const desde = e.sinSenalDesde ?? m.t;
    if (m.t - desde > SIN_SENAL_SEG) return anular(e, m, MOTIVO_SENAL);
    return { ...e, sinSenalDesde: desde, muestras, previo: m };
  }
  const n: EvaluacionInterceptacion = { ...e, sinSenalDesde: null, muestras, previo: m };
  const T = tolInterceptacion(e.nivel);
  const t = m.t - e.inicio.t;
  if (t > LIMITE_SEG) {
    return terminar({ ...n, corto: cerrarCorto(n.corto) }, [{ inicio: e.inicio.t, fin: m.t, peor: t }]);
  }
  if (sobreEstacion(m)) return n;

  const d = desvioPuntos(e, m);
  const angulo = Math.abs(norm180(m.rumbo - e.ejercicio.curso));
  if (!n.cruce) {
    if (d <= 0 || Math.abs(d) <= 0.25) {
      n.cruce = m;
      n.fase = "establecido";
      n.corto = cerrarCorto(n.corto);
    } else {
      if (d > 2 && t >= ANGULO_DESDE_SEG) n.angulos = [...n.angulos, angulo];
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

  if (Math.abs(d) <= T.establecidoPuntos) {
    n.estableDesde = n.estableDesde ?? m.t;
    if (m.t - n.estableDesde >= ESTABLECIDO_SEG) return terminar(n, []);
  } else n.estableDesde = null;
  return n;
}

const cerrarCorto = (c: EvaluacionInterceptacion["corto"]) => ({ ...c, desde: null });

function terminar(e: EvaluacionInterceptacion, interceptar: Tramo[]): EvaluacionInterceptacion {
  const T = tolInterceptacion(e.nivel);
  const pasado = analizar(e.pasado, T.sobrepasoPuntos);
  const sobrepaso = Math.max(0, ...e.pasado.map((p) => p.v));
  const angulo = e.angulos.length >= 10 ? e.angulos.reduce((a, b) => a + b, 0) / e.angulos.length : null;
  const fuera: Record<CampoInterceptacion, Tramo[]> = { sobrepaso: pasado.tramos, corto: e.corto.tramos, interceptar };
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
    ejercicio: e.ejercicio,
    vor: e.vor,
    dmeInicio: e.inicio.navDme ?? 0,
    dmeCruce: e.cruce?.navDme ?? null,
    sobrepaso,
    cortoSeg: e.corto.max,
    angulo,
    notas,
    fuera,
  };
  return { ...e, fase: "terminado", resultado };
}
