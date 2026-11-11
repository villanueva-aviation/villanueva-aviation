import {
  ALTURA_SEGURA_AGL,
  HUECO_MAX_SEG,
  INCLINACION_ENTRADA,
  INCLINACION_ESTABLECIDA,
  INCLINACION_NIVELADO,
  INCLINACION_OBJETIVO,
  LIMPIEZA,
  NS_FACTOR,
  NS_SEGUNDOS,
  vaPorPeso,
  type CodigoAcs,
} from "./virajeEscarpado.ts";
import { tolViraje, type Nivel } from "./nivel.ts";

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
  // Desde el lector v1.3; un lector viejo no los manda.
  cabeceo?: number; // grados, nariz arriba positivo
  vs?: number; // ft/min
  perdida?: boolean; // aviso de pérdida sonando
  flaps?: number; // índice de la palanca, 0 = arriba
  rpm?: number;
  // Desde el lector v1.4, para el vuelo completo. rumboV y vientoDir: verdaderos. mezcla y acelerador: 0–100. altimetro y qnh: inHg.
  lat?: number;
  lon?: number;
  gs?: number; // kt sobre el suelo
  rumboV?: number;
  motor?: boolean;
  mezcla?: number;
  acelerador?: number;
  magIzq?: boolean;
  magDer?: boolean;
  master?: boolean;
  luzBeacon?: boolean;
  luzNav?: boolean;
  luzAterrizaje?: boolean;
  luzStrobe?: boolean;
  luzTaxi?: boolean;
  freno?: boolean; // freno de estacionamiento
  xpdr?: string; // "1200"
  xpdrModo?: number;
  altimetro?: number;
  qnh?: number;
  com1?: number; // MHz
  tren?: boolean;
  vientoDir?: number;
  vientoKt?: number;
  // Desde el lector v1.5, para el checklist. selector: 0 cerrado, 1 ambos, 2 izq, 3 der. trim: −100…100 (%).
  avionica?: boolean;
  selector?: number;
  valvula?: boolean;
  bomba?: boolean;
  autopiloto?: boolean;
  trim?: number;
  // Desde el lector v1.6, para el programa IFR (solo NAV1). navDesv: grados de la barra. navDesde: 0 apagado, 1 TO, 2 FROM.
  navMhz?: number;
  navObs?: number;
  navRadial?: number;
  navDesv?: number;
  navDesde?: 0 | 1 | 2;
  navDme?: number;
  navTieneDme?: boolean;
  navSenal?: boolean;
  gpsNav?: boolean;
}

/** Un lector anterior a v1.6 no manda el radio NAV1: el programa IFR no se puede calificar. */
export const lectorViejoNav = (m: Muestra) => m.navRadial === undefined;

/** Un lector anterior a v1.3 no manda el aviso de pérdida: el vuelo lento no se puede calificar. */
export const lectorViejo = (m: Muestra) => m.perdida === undefined;

/** Un lector anterior a v1.4 no manda la posición: no se puede seguir un vuelo completo. */
export const lectorViejoVuelo = (m: Muestra) => m.lat === undefined;

/** Un lector anterior a v1.5 no manda aviónica ni combustible: esos puntos del checklist solo se oyen. */
export const lectorViejoChecklist = (m: Muestra) => m.avionica === undefined;

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
  /** Con qué tolerancias se calificó. */
  nivel: Nivel;
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
  /** El último viraje que no contó, para que la voz diga por qué. Se borra al empezar otro. */
  descartado: { motivo: "corto" | "lado"; grados: number; rumbo: number } | null;
}

export interface Evaluacion {
  fase: Fase;
  motivo?: string;
  resultado?: Resultado;
  interno: Interno;
  /** Falta = Difícil. */
  nivel?: Nivel;
}

export function toleranciaViraje(n: Nivel = 3): Record<Campo, number> {
  const t = tolViraje(n);
  return { altitud: t.altitudFt, velocidad: t.velocidadKt, inclinacion: t.inclinacionGrados, bola: t.bola };
}
/** Las de Difícil (ACS). */
export const TOLERANCIA = toleranciaViraje(3);
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
  descartado: null,
});

export function crearEvaluacion(): Evaluacion {
  return { fase: "armado", interno: vacio() };
}

export function armar(_ev: Evaluacion, m: Muestra, nivel: Nivel = 3): Evaluacion {
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", interno: vacio(), nivel };
  const nivelada = Math.abs(m.inclinacion) < INCLINACION_NIVELADO;
  return { fase: "armado", interno: { ...vacio(), historial: [m], previo: m, ultimaNivelada: nivelada ? m : null }, nivel };
}

/** La página se arma sola sin intento o tras uno anulado, cuando el avión vuela nivelado y en condiciones de calificar. Nunca encima de un resultado. */
export function armarSolo(ev: Evaluacion | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

/** MSFS a veces titula el C172 solo como «Skyhawk» (p. ej. los liveries de la flota). */
export const esC172 = (titulo: string) => /172|skyhawk/i.test(titulo);

export function invalidez(m: Muestra, previo: Muestra | null): string | null {
  if (previo && m.t - previo.t > HUECO_MAX_SEG) return "Se perdió la conexión con el simulador por más de 2 segundos.";
  if (m.pausa) return "Pausaste el simulador: el intento no se califica.";
  if (m.slew) return "Usaste el modo slew: el intento no se califica.";
  if (m.tasa !== 1) return "La velocidad de simulación no estaba en 1×: el intento no se califica.";
  if (!esC172(m.titulo)) return `Esta maniobra es para el C172 y tu avión es «${m.titulo}».`;
  return null;
}

export function analizar(puntos: { t: number; v: number }[], tol: number, nsSeg: number = NS_SEGUNDOS) {
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
  const ns = tramos.some((tr) => tr.fin - tr.inicio > nsSeg) || Math.abs(peor) > NS_FACTOR * tol;
  return { peor, tramos, ns };
}

/** Desde dónde se mide la inclinación: al llegar a 40°; si nunca llega, desde la entrada (30°), para que un viraje bajo no se salve. */
export function inicioEstablecido(muestras: Muestra[]): { k: number; llego: boolean } {
  const k = muestras.findIndex((m) => Math.abs(m.inclinacion) >= INCLINACION_ESTABLECIDA);
  if (k >= 0) return { k, llego: true };
  return { k: muestras.findIndex((m) => Math.abs(m.inclinacion) > INCLINACION_ENTRADA), llego: false };
}

/** Inclinación y bola se califican desde que el viraje se establece hasta el giro mínimo del nivel (330° en Difícil). `muestras` empieza en la entrada nivelada. */
export function virajeEstablecido(muestras: Muestra[], giroMin = 330): Muestra[] {
  let g = 0;
  const vuelta = muestras.map((m, k) => (k === 0 ? 0 : Math.abs((g += difRumbo(m.rumbo, muestras[k - 1].rumbo)))));
  const inicio = inicioEstablecido(muestras).k;
  return muestras.filter((_, k) => inicio >= 0 && k >= inicio && vuelta[k] < giroMin);
}

function evaluarLado({ ref, muestras, girado }: Giro, n: Nivel): ResultadoLado {
  const tol = tolViraje(n);
  const establecido = virajeEstablecido(muestras, tol.giroMin);
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
    const a = puntos[c].length ? analizar(puntos[c], toleranciaViraje(n)[c], tol.nsSeg) : { peor: 0, tramos: [], ns: false };
    peor[c] = a.peor;
    fuera[c] = a.tramos;
    ns[c] = a.ns;
  }
  const rumboSalida = difRumbo(muestras[muestras.length - 1].rumbo, ref.rumbo);
  ns.rumbo = Math.abs(rumboSalida) > tol.rumboSalidaGrados;
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

function resultado(lados: ResultadoLado[], refs: Muestra[], historial: Muestra[], n: Nivel): Resultado {
  const tol = toleranciaViraje(n);
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
      puntos -= Math.min(10, 2 * segundosFuera(l.fuera[c]) + 5 * Math.max(0, Math.abs(l.peor[c]) / tol[c] - 1));
    }
    puntos -= Math.min(10, Math.max(0, Math.abs(l.rumboSalida) - tolViraje(n).rumboSalidaGrados));
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
    nivel: n,
  };
}

/** Las muestras que juntó el lector desde la última lectura, en orden. */
export function avanzarLote(ev: Evaluacion, muestras: Muestra[]): Evaluacion {
  return muestras.reduce(avanzar, ev);
}

/** Pura: devuelve una evaluación nueva sin tocar la anterior (useReducer la puede llamar dos veces). Conserva el nivel. */
export function avanzar(ev: Evaluacion, m: Muestra): Evaluacion {
  const sig = paso(ev, m);
  return sig === ev || sig.nivel === ev.nivel ? sig : { ...sig, nivel: ev.nivel };
}

function paso(ev: Evaluacion, m: Muestra): Evaluacion {
  const n = ev.nivel ?? 3;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const i = ev.interno;
  // Repetida o vieja (los lotes del lector se enciman): ya se contó.
  if (i.previo && m.t <= i.previo.t) return ev;
  const motivo = invalidez(m, i.previo);
  if (motivo) return { fase: "invalido", motivo, interno: i };

  const d = i.previo ? difRumbo(m.rumbo, i.previo.rumbo) : 0;
  const banco = Math.abs(m.inclinacion);
  // Antes del primer viraje solo importa la ventana de limpieza: armado en el ascenso no acumula todo el vuelo.
  const esperando = ev.fase === "armado" && !i.giro;
  const historial = esperando ? i.historial.filter((x) => x.t >= m.t - LIMPIEZA.ventanaSeg - 10) : i.historial;
  const sig: Interno = { ...i, historial: [...historial, m], previo: m };
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
      interno: { ...sig, giro: { ref, muestras, girado: acumulado }, tramo: [], acumulado: 0, faseAntes: ev.fase === "entre" ? "entre" : "armado", descartado: null },
    };
  }

  const giro: Giro = { ref: i.giro.ref, muestras: [...i.giro.muestras, m], girado: i.giro.girado + d };
  if (banco >= INCLINACION_NIVELADO) return { ...ev, interno: { ...sig, giro } };

  const base: Interno = { ...sig, ...nivelado, giro: null };
  // Niveló antes del giro mínimo del nivel: entrada abortada o viraje incompleto. Se repite sin calificar.
  const descartado = (motivo: "corto" | "lado") => ({ ...base, descartado: { motivo, grados: Math.abs(giro.girado), rumbo: giro.ref.rumbo } });
  if (Math.abs(giro.girado) < tolViraje(n).giroMin) return { fase: i.faseAntes, interno: descartado("corto") };

  const lado = evaluarLado(giro, n);
  // El segundo viraje tiene que ser al lado contrario.
  if (i.lados.length === 1 && lado.lado === i.lados[0].lado) return { fase: "entre", interno: descartado("lado") };
  const lados = [...i.lados, lado];
  const refs = [...i.refs, giro.ref];
  if (lados.length < 2) return { fase: "entre", interno: { ...base, lados, refs } };
  return { fase: "terminado", resultado: resultado(lados, refs, sig.historial, n), interno: { ...base, lados, refs } };
}
