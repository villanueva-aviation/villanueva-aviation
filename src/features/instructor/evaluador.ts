import {
  ALTURA_SEGURA_AGL,
  BOLA_TOLERANCIA,
  HUECO_MAX_SEG,
  INCLINACION_ENTRADA,
  INCLINACION_ESTABLECIDA,
  INCLINACION_NIVELADO,
  INCLINACION_OBJETIVO,
  LIMPIEZA,
  NS_FACTOR,
  NS_SEGUNDOS,
  TOLERANCIAS,
  vaPorPeso,
  type CodigoAcs,
} from "./virajeEscarpado.ts";

/** Una lectura del simulador, tal como la sirve el lector local. */
export interface Muestra {
  t: number; // segundos, reloj del lector
  inclinacion: number; // grados; el signo no importa, el lado sale del rumbo
  altitud: number; // ft indicados
  velocidad: number; // kt indicados
  rumbo: number; // grados magnéticos 0–360
  bola: number; // −1…1
  agl: number; // ft sobre el terreno
  peso: number; // lb
  enTierra: boolean;
  slew: boolean;
  tasa: number; // velocidad de simulación
  pausa: boolean;
  titulo: string; // título del avión
}

export type Fase = "armado" | "viraje1" | "entre" | "viraje2" | "terminado" | "invalido";
export type Lado = "izquierda" | "derecha";
export type Campo = "altitud" | "velocidad" | "inclinacion" | "bola";
/** t en s; peor = desviación máxima con signo dentro del tramo. */
export interface Tramo {
  inicio: number;
  fin: number;
  peor: number;
}

export interface ResultadoLado {
  lado: Lado;
  entrada: { t: number; altitud: number; rumbo: number; velocidad: number; va: number };
  peor: Record<Campo, number>; // desviación máxima con signo
  rumboSalida: number; // error con signo, −180…180
  fuera: Record<Campo, Tramo[]>;
  ns: Record<Campo | "rumbo", boolean>;
}

export interface Resultado {
  aprobado: boolean;
  calificacion: number; // 0–100 entero
  elementos: Record<CodigoAcs, "S" | "NS">;
  lados: ResultadoLado[];
  avisos: string[];
  muestras: Muestra[]; // desde 120 s antes de la entrada hasta el final
}

interface Giro {
  ref: Muestra; // última muestra nivelada antes de entrar
  muestras: Muestra[]; // desde ref
  girado: number; // con signo
}

interface Interno {
  historial: Muestra[];
  previo: Muestra | null;
  ultimaNivelada: Muestra | null;
  tramo: Muestra[]; // muestras inclinadas desde la última nivelada, sin viraje activo
  acumulado: number;
  giro: Giro | null;
  lados: ResultadoLado[];
  refs: Muestra[]; // ref de cada lado contado
  faseAntes: "armado" | "entre";
}

export interface Evaluacion {
  fase: Fase;
  motivo?: string;
  resultado?: Resultado;
  interno: Interno;
}

export const TOLERANCIA: Record<Campo, number> = {
  altitud: TOLERANCIAS.altitudFt,
  velocidad: TOLERANCIAS.velocidadKt,
  inclinacion: TOLERANCIAS.inclinacionGrados,
  bola: BOLA_TOLERANCIA,
};
const CAMPOS: Campo[] = ["altitud", "velocidad", "inclinacion", "bola"];

/** Diferencia de rumbos en el círculo, −180…180. */
export function difRumbo(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

const vacio = (): Interno => ({
  historial: [],
  previo: null,
  ultimaNivelada: null,
  tramo: [],
  acumulado: 0,
  giro: null,
  lados: [],
  refs: [],
  faseAntes: "armado",
});

export function crearEvaluacion(): Evaluacion {
  return { fase: "armado", interno: vacio() };
}

export function armar(_ev: Evaluacion, m: Muestra): Evaluacion {
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", interno: vacio() };
  const nivelada = Math.abs(m.inclinacion) < INCLINACION_NIVELADO;
  return { fase: "armado", interno: { ...vacio(), historial: [m], previo: m, ultimaNivelada: nivelada ? m : null } };
}

function invalidez(m: Muestra, previo: Muestra | null): string | null {
  if (previo && m.t - previo.t > HUECO_MAX_SEG) return "Se perdió la conexión con el simulador por más de 2 segundos.";
  if (m.pausa) return "Pausaste el simulador: el intento no se califica.";
  if (m.slew) return "Usaste el modo slew: el intento no se califica.";
  if (m.tasa !== 1) return "La velocidad de simulación no estaba en 1×: el intento no se califica.";
  if (!/172/.test(m.titulo)) return `Esta maniobra es para el C172 y tu avión es «${m.titulo}».`;
  return null;
}

function analizar(puntos: { t: number; v: number }[], tol: number) {
  let peor = 0;
  const tramos: Tramo[] = [];
  let abierto: Tramo | null = null;
  for (const p of puntos) {
    if (Math.abs(p.v) > Math.abs(peor)) peor = p.v;
    if (Math.abs(p.v) > tol) {
      if (!abierto) {
        abierto = { inicio: p.t, fin: p.t, peor: p.v };
        tramos.push(abierto);
      } else if (Math.abs(p.v) > Math.abs(abierto.peor)) abierto.peor = p.v;
    } else if (abierto) {
      abierto.fin = p.t; // primera muestra de regreso dentro
      abierto = null;
    }
  }
  if (abierto) abierto.fin = puntos[puntos.length - 1].t;
  const ns = tramos.some((tr) => tr.fin - tr.inicio > NS_SEGUNDOS) || Math.abs(peor) > NS_FACTOR * tol;
  return { peor, tramos, ns };
}

function evaluarLado({ ref, muestras, girado }: Giro): ResultadoLado {
  let g = 0;
  const vuelta = muestras.map((m, k) => (k === 0 ? 0 : Math.abs((g += difRumbo(m.rumbo, muestras[k - 1].rumbo)))));
  // Inclinación y bola: desde que el viraje se establece hasta los 330°.
  const inicio = muestras.findIndex((m) => Math.abs(m.inclinacion) >= INCLINACION_ESTABLECIDA);
  const establecido = muestras.filter((_, k) => inicio >= 0 && k >= inicio && vuelta[k] < 330);
  const puntos: Record<Campo, { t: number; v: number }[]> = {
    altitud: muestras.map((m) => ({ t: m.t, v: m.altitud - ref.altitud })),
    velocidad: muestras.map((m) => ({ t: m.t, v: m.velocidad - ref.velocidad })),
    inclinacion: establecido.map((m) => ({ t: m.t, v: Math.abs(m.inclinacion) - INCLINACION_OBJETIVO })),
    bola: establecido.map((m) => ({ t: m.t, v: m.bola })),
  };
  const peor = {} as Record<Campo, number>;
  const fuera = {} as Record<Campo, Tramo[]>;
  const ns = {} as Record<Campo | "rumbo", boolean>;
  for (const c of CAMPOS) {
    const a = puntos[c].length ? analizar(puntos[c], TOLERANCIA[c]) : { peor: 0, tramos: [], ns: false };
    peor[c] = a.peor;
    fuera[c] = a.tramos;
    ns[c] = a.ns;
  }
  const rumboSalida = difRumbo(muestras[muestras.length - 1].rumbo, ref.rumbo);
  ns.rumbo = Math.abs(rumboSalida) > TOLERANCIAS.rumboSalidaGrados;
  return {
    lado: girado < 0 ? "izquierda" : "derecha",
    entrada: { t: ref.t, altitud: ref.altitud, rumbo: ref.rumbo, velocidad: ref.velocidad, va: vaPorPeso(ref.peso) },
    peor,
    rumboSalida,
    fuera,
    ns,
  };
}

const segundosFuera = (tramos: Tramo[]) => tramos.reduce((s, tr) => s + tr.fin - tr.inicio, 0);

function resultado(lados: ResultadoLado[], refs: Muestra[], historial: Muestra[]): Resultado {
  const t0 = refs[0].t;
  const antes = historial.filter((m) => m.t >= t0 - LIMPIEZA.ventanaSeg && m.t <= t0);
  const limpieza = antes.reduce((s, m, k) => (k === 0 ? 0 : s + Math.abs(difRumbo(m.rumbo, antes[k - 1].rumbo))), 0);
  const elementos: Record<CodigoAcs, "S" | "NS"> = {
    "PA.V.A.S1": limpieza >= LIMPIEZA.grados ? "S" : "NS",
    "PA.V.A.S2": lados.every((l) => l.entrada.velocidad <= l.entrada.va) ? "S" : "NS",
    "PA.V.A.S3": lados.every((l) => !l.ns.bola) ? "S" : "NS",
    "PA.V.A.S4": lados.length === 2 && lados[0].lado !== lados[1].lado ? "S" : "NS",
    "PA.V.A.S5": lados.every((l) => !l.ns.altitud && !l.ns.velocidad && !l.ns.inclinacion && !l.ns.rumbo) ? "S" : "NS",
  };
  let puntos = 100;
  for (const l of lados) {
    for (const c of CAMPOS) {
      puntos -= Math.min(10, 2 * segundosFuera(l.fuera[c]) + 5 * Math.max(0, Math.abs(l.peor[c]) / TOLERANCIA[c] - 1));
    }
    puntos -= Math.min(10, Math.max(0, Math.abs(l.rumboSalida) - TOLERANCIAS.rumboSalidaGrados));
  }
  for (const c of ["PA.V.A.S1", "PA.V.A.S2", "PA.V.A.S4"] as const) if (elementos[c] === "NS") puntos -= 10;
  const avisos: string[] = [];
  if (historial.some((m) => m.t >= t0 && m.agl < ALTURA_SEGURA_AGL)) {
    avisos.push("Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto.");
  }
  return {
    aprobado: Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(puntos)),
    elementos,
    lados,
    avisos,
    muestras: historial.filter((m) => m.t >= t0 - LIMPIEZA.ventanaSeg),
  };
}

/** Pura: devuelve una evaluación nueva sin tocar la anterior (useReducer la puede llamar dos veces). */
export function avanzar(ev: Evaluacion, m: Muestra): Evaluacion {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const i = ev.interno;
  const motivo = invalidez(m, i.previo);
  if (motivo) return { fase: "invalido", motivo, interno: i };

  const d = i.previo ? difRumbo(m.rumbo, i.previo.rumbo) : 0;
  const banco = Math.abs(m.inclinacion);
  const sig: Interno = { ...i, historial: [...i.historial, m], previo: m };
  const nivelado = { ultimaNivelada: m, tramo: [], acumulado: 0 };

  if (!i.giro) {
    if (banco < INCLINACION_NIVELADO) return { ...ev, interno: { ...sig, ...nivelado } };
    const acumulado = i.acumulado + d;
    const tramo = [...i.tramo, m];
    if (banco <= INCLINACION_ENTRADA) return { ...ev, interno: { ...sig, tramo, acumulado } };
    const ref = i.ultimaNivelada ?? tramo[0];
    const muestras = i.ultimaNivelada ? [i.ultimaNivelada, ...tramo] : tramo;
    return {
      fase: i.lados.length === 0 ? "viraje1" : "viraje2",
      interno: { ...sig, giro: { ref, muestras, girado: acumulado }, tramo: [], acumulado: 0, faseAntes: ev.fase === "entre" ? "entre" : "armado" },
    };
  }

  const giro: Giro = { ref: i.giro.ref, muestras: [...i.giro.muestras, m], girado: i.giro.girado + d };
  if (banco >= INCLINACION_NIVELADO) return { ...ev, interno: { ...sig, giro } };

  const base: Interno = { ...sig, ...nivelado, giro: null };
  // Niveló antes de los 330°: entrada abortada o viraje incompleto. Se repite sin calificar.
  if (Math.abs(giro.girado) < 330) return { fase: i.faseAntes, interno: base };

  const lado = evaluarLado(giro);
  // El segundo viraje tiene que ser al lado contrario.
  if (i.lados.length === 1 && lado.lado === i.lados[0].lado) return { fase: "entre", interno: base };
  const lados = [...i.lados, lado];
  const refs = [...i.refs, giro.ref];
  if (lados.length < 2) return { fase: "entre", interno: { ...base, lados, refs } };
  return { fase: "terminado", resultado: resultado(lados, refs, sig.historial), interno: { ...base, lados, refs } };
}
