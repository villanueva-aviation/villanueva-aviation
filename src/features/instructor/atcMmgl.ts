// El ATC de MMGL (solo español, pista 29L por P1) como máquina de estados pura.
// Frecuencias de la carta 10-9. Los textos que dictó Erik van tal cual; los demás los propone el constructor y Erik los revisa antes de publicar.
// La calificación de lo que dice el cadete vive en colacion.ts; aquí solo está el flujo: qué se espera, qué contesta cada ATC y cuándo avanza.
import type { Muestra } from "./evaluador.ts";
import type { Extremo } from "./aeropuertoSim.ts";
import { aNm } from "../home/navGeo.ts";

export const FREQ = { atis: 127.9, terrestre: 121.9, rampa: 134.1, torre: 118.1 } as const;
export const PISTA = "29L";
export const TEXTO_PISTA = "2-9 izquierda";
export const PUNTO_ESPERA = "P1";
export const ESPERA_FRECUENCIA_S = 20;
export const DIST_RAMPA_A_TORRE_NM = 0.15; // distancia a P1 a la que Rampa pasa a Torre (a afinar con datos reales)
export const BASE_NM = 0.5; // «vire a base» al pasar 0.5 NM después de la cabecera, en viento en cola
export const FINAL_NM = 0.8; // «vire a final» al acercarse a la prolongación del eje
export const ALINEADO_NM = 0.3; // «autorizado a aterrizar» alineado con el eje
export const FINAL_LARGO_NM = 4;
export const REPORTE_LEJOS_NM = 2;
export const VEL_TOMA_KT = 40;

export type TipoElemento = "pista" | "qnh" | "codigo" | "punto-espera" | "matricula" | "punto-vfr" | "frecuencia";
export type Elemento = { tipo: TipoElemento; valor: string };
export type Etapa =
  | "atis" | "terrestre-llamada" | "terrestre-colacion" | "rampa-llamada" | "rampa-colacion" | "rodando"
  | "torre-llamada" | "torre-despegue-colacion" | "zona" | "regreso-llamada" | "regreso-colacion" | "piramide"
  | "viento-cola" | "cola-reportada" | "base" | "final" | "autorizado"
  | "rampa-regreso-llamada" | "rampa-regreso-colacion" | "fin";
export type Quien = "terrestre" | "rampa" | "torre" | "instructor";
export interface Mensaje { quien: Quien; texto: string }
export type TipoNota = "faltante" | "ininteligible" | "frecuencia-tarde" | "fuera-de-frecuencia" | "reporte-lejos";
export interface Nota { etapa: Etapa; tipo: TipoNota; detalle?: string; t: number }
export interface Registro { etapa: Etapa; completa: boolean; faltaron: TipoElemento[] }
export interface ContextoAtc {
  matricula: string; // ATC ID del lector; "XB-VNA" si viene vacío
  zona: "Cajititlán" | "Chapala"; // la que pide el cadete en su llamada a Terrestre
  qnhInHg: number;
  vientoDir: number;
  vientoKt: number;
  codigo: string;
  rutaSalida: string[] | null; // de rodaje.ts; null = sin datos de calles
  rutaRegreso: string[] | null;
  puntoEspera: { lat: number; lon: number } | null; // el de P1
  pista: Extremo | null; // umbral de la 29L
}
export interface EstadoAtc {
  etapa: Etapa;
  ordenFrecuencia: { mhz: number; t: number; avisada: boolean } | null;
  notas: Nota[];
  registros: Registro[];
  pos: { lat: number; lon: number } | null;
  pasoCola: boolean; // ya estuvo en viento en cola, a la izquierda y después de la cabecera
}
export interface Salida { estado: EstadoAtc; decir: Mensaje[] }

export const ALFABETO: Record<string, string> = {
  A: "Alpha", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf", H: "Hotel", I: "India",
  J: "Juliet", K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee", Z: "Zulu",
};
const DIGITO = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];

/** "XB-VNA" → "X-ray Bravo Victor November Alpha". */
export const matriculaHablada = (id: string): string =>
  [...id.toUpperCase()].filter((ch) => ch !== "-" && ch !== " ").map((ch) => ALFABETO[ch] ?? (/\d/.test(ch) ? DIGITO[+ch] : ch)).join(" ");
/** 30.02 inHg → "3002". */
export const qnhDigitos = (inHg: number): string => String(Math.round(inHg * 100));
/** 30.02 → "QNH 3-0-0-2". */
export const qnhHablado = (inHg: number): string => `QNH ${[...qnhDigitos(inHg)].join("-")}`;
/** "P2" → "Papa 2"; "A12" → "Alpha 12". */
export const calleHablada = (n: string): string => {
  const m = /^([A-Za-z])(\d*)$/.exec(n.trim());
  return m ? [ALFABETO[m[1].toUpperCase()], m[2]].filter(Boolean).join(" ") : n;
};
/** 134.1 → "uno tres cuatro punto uno". */
export const frecuenciaHablada = (mhz: number): string =>
  mhz.toFixed(1).split("").map((ch) => (ch === "." ? "punto" : DIGITO[+ch])).join(" ");
const vientoHablado = (c: ContextoAtc) => {
  const dir = String(Math.round(c.vientoDir) % 360 || 360).padStart(3, "0");
  return `viento ${[...dir].join("-")} grados ${Math.round(c.vientoKt)} nudos`;
};

/** Código VFR de 4 dígitos octales; nunca 1200, 7500, 7600 ni 7700. */
export function codigoTransponder(azar: () => number = Math.random): string {
  for (;;) {
    const cod = Array.from({ length: 4 }, () => Math.floor(azar() * 8)).join("");
    if (!["1200", "7500", "7600", "7700", "0000"].includes(cod)) return cod;
  }
}

/** El ATC solo contesta si el COM1 está en su frecuencia. Un lector sin COM1 (null) no se puede comprobar y cuenta como sí. */
export const frecuenciaCerca = (com1: number | null | undefined, mhz: number): boolean =>
  com1 === null || com1 === undefined || Math.abs(com1 - mhz) < 0.005;

export function frecuenciaDeEtapa(e: Etapa): number | null {
  switch (e) {
    case "atis": return FREQ.atis;
    case "terrestre-llamada": case "terrestre-colacion": return FREQ.terrestre;
    case "rampa-llamada": case "rampa-colacion": case "rodando": case "rampa-regreso-llamada": case "rampa-regreso-colacion": return FREQ.rampa;
    case "fin": return null;
    default: return FREQ.torre;
  }
}

export function quienDeEtapa(e: Etapa): Quien {
  const f = frecuenciaDeEtapa(e);
  return f === FREQ.terrestre ? "terrestre" : f === FREQ.rampa ? "rampa" : "torre";
}

const el = (tipo: TipoElemento, valor: string): Elemento => ({ tipo, valor });

/** Elementos obligatorios de la llamada o colación que se espera en cada etapa (vacío = el cadete no tiene que decir nada). */
export function esperado(e: Etapa, c: ContextoAtc): Elemento[] {
  const mat = el("matricula", c.matricula);
  switch (e) {
    case "terrestre-llamada": return [mat, el("punto-vfr", c.zona)];
    case "terrestre-colacion": return [el("codigo", c.codigo), el("frecuencia", FREQ.rampa.toFixed(1)), mat];
    case "rampa-llamada": return [mat];
    case "rampa-colacion": return [el("pista", PISTA), el("punto-espera", PUNTO_ESPERA), mat];
    case "torre-llamada": return [mat, el("punto-espera", PUNTO_ESPERA)];
    case "torre-despegue-colacion": return [el("pista", PISTA), mat];
    case "zona": return [mat, el("punto-vfr", "área de trabajo")];
    case "regreso-llamada": return [mat, el("punto-vfr", c.zona)];
    case "regreso-colacion": return [el("pista", PISTA), el("qnh", qnhDigitos(c.qnhInHg)), el("punto-vfr", "Pirámide")];
    case "piramide": return [mat, el("punto-vfr", "Pirámide")];
    case "viento-cola": return [mat];
    case "rampa-regreso-llamada": case "rampa-regreso-colacion": return [mat];
    default: return [];
  }
}

export const textoAtis = (c: ContextoAtc): string =>
  `Aeropuerto de Guadalajara, información Alpha. Pista en uso ${TEXTO_PISTA}. ${vientoHablado(c)}. ${qnhHablado(c.qnhInHg)}. Notifique recibida la información Alpha.`;

export const crearEstado = (): EstadoAtc => ({ etapa: "atis", ordenFrecuencia: null, notas: [], registros: [], pos: null, pasoCola: false });

const copia = (e: EstadoAtc): EstadoAtc => ({
  ...e,
  ordenFrecuencia: e.ordenFrecuencia ? { ...e.ordenFrecuencia } : null,
  notas: [...e.notas],
  registros: [...e.registros],
  pos: e.pos ? { ...e.pos } : null,
});

const dicen = (quien: Quien, texto: string): Mensaje => ({ quien, texto });
const calles = (r: string[]) => r.map(calleHablada).join(", ");

/** Lo que contesta el ATC a la llamada o colación de la etapa, y la etapa que sigue. */
function respuesta(e: Etapa, c: ContextoAtc): { decir: Mensaje | null; sigue: Etapa; orden?: number } {
  const m = matriculaHablada(c.matricula);
  const ok = (quien: Quien, sigue: Etapa) => ({ decir: dicen(quien, `${m}, correcto.`), sigue });
  switch (e) {
    case "terrestre-llamada":
      return {
        decir: dicen("terrestre", `${m}, Guadalajara Terrestre, autorizado VFR local a ${c.zona}, código ${[...c.codigo].join("-")}, contacte Rampa ${frecuenciaHablada(FREQ.rampa)}.`),
        sigue: "terrestre-colacion",
        orden: FREQ.rampa,
      };
    case "terrestre-colacion": return ok("terrestre", "rampa-llamada");
    case "rampa-llamada":
      return {
        decir: dicen("rampa", c.rutaSalida?.length ? `${m}, pista ${TEXTO_PISTA}, ruede vía ${calles(c.rutaSalida)}.` : `${m}, ruede a punto de espera pista ${TEXTO_PISTA}.`),
        sigue: "rampa-colacion",
      };
    case "rampa-colacion": return ok("rampa", "rodando");
    case "torre-llamada":
      return {
        decir: dicen("torre", `${m}, pista ${TEXTO_PISTA}, ${vientoHablado(c)}, autorizado a despegar, salida por el Sierra Eco, notifique establecido en el área de trabajo.`),
        sigue: "torre-despegue-colacion",
      };
    case "torre-despegue-colacion": return ok("torre", "zona");
    case "zona": return { decir: dicen("torre", `${m}, enterado.`), sigue: "regreso-llamada" };
    case "regreso-llamada":
      return {
        decir: dicen("torre", `${m}, pista ${TEXTO_PISTA}, ${vientoHablado(c)}, ${qnhHablado(c.qnhInHg)}, proceda a Pirámide, notifique Pirámide.`),
        sigue: "regreso-colacion",
      };
    case "regreso-colacion": return ok("torre", "piramide");
    case "piramide":
      return { decir: dicen("torre", `${m}, incorpórese a viento en cola izquierdo pista ${TEXTO_PISTA}, notifique viento en cola.`), sigue: "viento-cola" };
    case "viento-cola": return { decir: dicen("torre", `${m}, enterado.`), sigue: "cola-reportada" };
    case "rampa-regreso-llamada":
      return {
        decir: dicen("rampa", c.rutaRegreso?.length ? `${m}, ruede a plataforma de aviación general vía ${calles(c.rutaRegreso)}.` : `${m}, ruede a plataforma de aviación general.`),
        sigue: "rampa-regreso-colacion",
      };
    case "rampa-regreso-colacion": return ok("rampa", "fin");
    default: return { decir: null, sigue: e };
  }
}

const faltaron = (e: EstadoAtc, etapa: Etapa, falt: Elemento[], t: number) => {
  e.registros.push({ etapa, completa: falt.length === 0, faltaron: falt.map((x) => x.tipo) });
  for (const f of falt) e.notas.push({ etapa, tipo: "faltante", detalle: f.tipo, t });
};

/** El cadete hizo la llamada o colación de la etapa (con `falt` sin decir, ya pedidos una vez): el ATC contesta y la etapa avanza. */
export function completarEtapa(e0: EstadoAtc, c: ContextoAtc, falt: Elemento[], t: number): Salida {
  if (esperado(e0.etapa, c).length === 0) return { estado: e0, decir: [] };
  const e = copia(e0);
  const r = respuesta(e.etapa, c);
  faltaron(e, e.etapa, falt, t);
  if (r.orden !== undefined) e.ordenFrecuencia = { mhz: r.orden, t, avisada: false };
  e.etapa = r.sigue;
  return { estado: e, decir: r.decir ? [r.decir] : [] };
}

/** Sigue sin oír nada claro por segunda vez: el ATC actúa como si hubiera oído lo esperado, y queda anotado. */
export function ininteligible(e0: EstadoAtc, c: ContextoAtc, t: number): Salida {
  const falt = esperado(e0.etapa, c);
  if (!falt.length) return { estado: e0, decir: [] };
  const s = completarEtapa(e0, c, falt, t);
  s.estado.notas = s.estado.notas.filter((n) => !(n.t === t && n.tipo === "faltante" && n.etapa === e0.etapa));
  s.estado.notas.push({ etapa: e0.etapa, tipo: "ininteligible", t });
  return s;
}

/** El cadete ya está en 118.1 en el rodaje: se pasa a Torre sin esperar a que Rampa lo mande. */
export function adelantarATorre(e: EstadoAtc): EstadoAtc {
  return e.etapa === "rodando" ? { ...copia(e), etapa: "torre-llamada" } : e;
}

/** Posición en el plano de la pista: s = NM después de la cabecera hacia donde se aterriza; l = NM a la izquierda del eje. */
export function enPista(p: { lat: number; lon: number }, u: Extremo): { s: number; l: number } {
  const q = aNm(p.lat, p.lon, u.lat, u.lon);
  const r = (u.rumboV * Math.PI) / 180;
  return { s: q.x * Math.sin(r) + q.y * Math.cos(r), l: -q.x * Math.cos(r) + q.y * Math.sin(r) };
}

const distNm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const q = aNm(a.lat, a.lon, b.lat, b.lon);
  return Math.hypot(q.x, q.y);
};

/** Cada muestra del lector: ATIS a Terrestre, cercanía a P1, circuito, toma, y vigilancia del cambio de frecuencia. */
export function alMuestrear(e0: EstadoAtc, m: Muestra, c: ContextoAtc): Salida {
  const e = copia(e0);
  const decir: Mensaje[] = [];
  const mat = matriculaHablada(c.matricula);
  const hay = m.lat !== undefined && m.lon !== undefined;
  if (hay) e.pos = { lat: m.lat!, lon: m.lon! };
  const ir = (sigue: Etapa, msg?: Mensaje, orden?: number) => {
    e.etapa = sigue;
    if (msg) decir.push(msg);
    if (orden !== undefined) e.ordenFrecuencia = { mhz: orden, t: m.t, avisada: false };
  };

  if (e.etapa === "atis" && m.com1 !== undefined && frecuenciaCerca(m.com1, FREQ.terrestre)) ir("terrestre-llamada");
  else if (e.etapa === "rodando" && hay && c.puntoEspera && distNm(e.pos!, c.puntoEspera) <= DIST_RAMPA_A_TORRE_NM)
    ir("torre-llamada", dicen("rampa", `${mat}, contacte Torre ${frecuenciaHablada(FREQ.torre)}.`), FREQ.torre);
  else if (hay && c.pista && ["viento-cola", "cola-reportada", "base", "final"].includes(e.etapa)) {
    const { s, l } = enPista(e.pos!, c.pista);
    const alineado = Math.abs(l) <= ALINEADO_NM && s < 0 && s > -FINAL_LARGO_NM;
    if (e.etapa !== "base" && e.etapa !== "final" && l > ALINEADO_NM && s > 0) e.pasoCola = true;
    if (alineado) ir("autorizado", dicen("torre", `${mat}, autorizado a aterrizar pista ${TEXTO_PISTA}, ${vientoHablado(c)}.`));
    else if (e.etapa === "base" && Math.abs(l) <= FINAL_NM && s < 0) ir("final", dicen("torre", `${mat}, vire a final.`));
    else if ((e.etapa === "viento-cola" || e.etapa === "cola-reportada") && e.pasoCola && s <= -BASE_NM && l > ALINEADO_NM)
      ir("base", dicen("torre", `${mat}, vire a base.`));
  } else if (e.etapa === "autorizado" && m.enTierra && (m.gs ?? m.velocidad) < VEL_TOMA_KT)
    ir("rampa-regreso-llamada", dicen("torre", `${mat}, abandone pista vía Papa 1, contacte Rampa ${frecuenciaHablada(FREQ.rampa)}.`), FREQ.rampa);

  const o = e.ordenFrecuencia;
  if (o && m.com1 !== undefined) {
    if (frecuenciaCerca(m.com1, o.mhz)) e.ordenFrecuencia = null;
    else if (!o.avisada && m.t - o.t >= ESPERA_FRECUENCIA_S) {
      o.avisada = true;
      e.notas.push({ etapa: e.etapa, tipo: "frecuencia-tarde", detalle: o.mhz.toFixed(1), t: m.t });
      decir.push(dicen("instructor", `Revisa tu frecuencia: te pidieron cambiar a ${frecuenciaHablada(o.mhz)}.`));
    }
  }
  return { estado: e, decir };
}
