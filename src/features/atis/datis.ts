// Lectura del D-ATIS real de EE. UU. (atis.info) y armado del ATIS reproducible.
import type { Metar, Nube } from "../../lib/clima.ts";
import type { AeropuertoAtis } from "./datos.ts";
import { armarAtis, type Atis, type Parte } from "./generado.ts";
import { hablado, habladoMetar } from "./hablado.ts";
import type { AtisRed } from "./red.ts";
import { TOLERANCIA_MHZ } from "./radio.ts";

export type EntradaDatis = {
  airport: string;
  type: "combined" | "arr" | "dep";
  code: string;
  datis: string;
  time: string;
  updatedAt: string;
};

export type DatisLeido = {
  letra: string;
  hora: string;
  especial: boolean;
  metar: string | null;
  rmk: string | null;
  resto: string[];
};

const ENCABEZADO = /^\s*\w{3} (?:ATIS|ARR|DEP) INFO ([A-Z]) (\d{4})Z( SPECIAL)?\./;
const CIERRE = /\.*\s*ADVS YOU HAVE INFO [A-Z]\.?\s*$/;
const ALTIMETRO = /\bA\d{4}\b/;

export function leerDatis(e: EntradaDatis): DatisLeido {
  const h = ENCABEZADO.exec(e.datis);
  const cuerpo = e.datis.slice(h ? h[0].length : 0).replace(CIERRE, "");
  // Oraciones: se corta en ". " o al final; las vacías y los "." sueltos se descartan.
  const oraciones = cuerpo
    .split(/\.(?:\s+|$)/)
    .map((o) => o.trim().replace(/[,\s]+$/, ""))
    .filter((o) => o && o !== ";")
    .map((o) => o + ".");
  const i = oraciones.findIndex((o) => ALTIMETRO.test(o));
  let metar: string | null = null;
  let rmk: string | null = null;
  if (i >= 0) {
    const bloque = oraciones.slice(0, i + 1).join(" ").replace(/\.$/, "");
    const [clima, ...nota] = bloque.split(/\s+RMK\s+/);
    metar = clima.replace(/\s*\([^)]*\)/g, "").trim();
    rmk = nota.length ? nota.join(" RMK ").trim() : null;
  }
  return {
    letra: h ? h[1] : e.code,
    hora: h ? h[2] : e.time,
    especial: !!h?.[3],
    metar,
    rmk,
    resto: oraciones.slice(i + 1),
  };
}

const MIN_MS = 60_000;

// La hora HHMM Zulu más reciente; hasta 5 min en el futuro cuenta como hoy (reloj atrasado).
export function emitidoMs(time: string, ahoraMs: number): number {
  const d = new Date(ahoraMs);
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), +time.slice(0, 2), +time.slice(2, 4));
  return t > ahoraMs + 5 * MIN_MS ? t - 24 * 60 * MIN_MS : t;
}

// Vigente si se emitió hace menos de 90 minutos.
export function vigenteDatis(e: EntradaDatis, ahoraMs: number): boolean {
  return ahoraMs - emitidoMs(e.time, ahoraMs) < 90 * MIN_MS;
}

// Frecuencia ATIS de salidas real de los aeropuertos con ATIS de llegadas y salidas aparte (FAA, ciclo 29-oct-2026,
// vía AirNav). MSFS 2020 les pone el mismo nombre a las dos (p. ej. «KATL»), así que el nombre no basta.
const ATIS_SALIDAS: Record<string, number> = {
  KATL: 125.55, KCLE: 132.375, KCLT: 132.1, KCVG: 135.3, KDEN: 134.025, KDFW: 135.925, KDTW: 118.125,
  KMCO: 120.525, KMIA: 133.675, KMSP: 120.8, KPHL: 135.925, KPIT: 135.9, KTPA: 128.475,
};

// La frecuencia sintonizada es la del ATIS de salidas: coincide con la real de salidas o MSFS la llama «DEP».
export function esFrecuenciaSalidas(icao: string, mhz: number | undefined, nombreFrec: string | null): boolean {
  const salidas = ATIS_SALIDAS[icao];
  return (salidas !== undefined && mhz !== undefined && Math.abs(mhz - salidas) < TOLERANCIA_MHZ + 1e-9)
    || !!nombreFrec?.toUpperCase().includes("DEP");
}

export function datisPara(entradas: EntradaDatis[], nombreFrec: string | null, mhz?: number): EntradaDatis | null {
  const combinada = entradas.find((e) => e.type === "combined");
  if (combinada) return combinada;
  const tipo = esFrecuenciaSalidas(entradas[0]?.airport ?? "", mhz, nombreFrec) ? "dep" : "arr";
  return entradas.find((e) => e.type === tipo) ?? null;
}

// Lo que la página guarda de /api/atis/real por aeropuerto. entradas null: la primera respuesta no ha llegado.
export type PreguntaReal = { entradas: EntradaDatis[] | null; fallo: boolean };

// El D-ATIS que suena en esa frecuencia. "esperando": silencio hasta la primera respuesta.
// Si la fuente falla, sigue la última respuesta buena hasta que vence (90 min).
// null: no hay uno vigente, o falló sin respuesta previa; suena el generado.
export function datisVigente(q: PreguntaReal, nombreFrec: string | null, ahoraMs: number, mhz?: number): EntradaDatis | null | "esperando" {
  if (!q.entradas) return q.fallo ? null : "esperando";
  const e = datisPara(q.entradas, nombreFrec, mhz);
  return e && vigenteDatis(e, ahoraMs) ? e : null;
}

// FNV-1a de 32 bits en hex (síncrono: lo usan la página y la Function).
export function huella(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0");
}

// METAR mínimo desde el cuerpo del D-ATIS (sin estación, fecha ni RMK). emitido en ms.
export function metarDeTexto(icao: string, emitido: number, cuerpo: string): Metar {
  const d = new Date(emitido);
  const dd = String(d.getUTCDate()).padStart(2, "0"), hh = String(d.getUTCHours()).padStart(2, "0"), mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ts = cuerpo.split(/\s+/).filter(Boolean);
  const viento = /^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/.exec(ts.find((x) => /^(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT$/.test(x)) ?? "");
  const vis = /(?:^|\s)(?:(\d+) )?([PM]?\d+(?:\/\d+)?)SM(?=\s|$)/.exec(cuerpo);
  const temp = /(?:^|\s)(M?\d{2})\/(M?\d{2})?(?=\s|$)/.exec(cuerpo);
  const alt = /(?:^|\s)A(\d{4})(?=\s|$)/.exec(cuerpo);
  const grados = (x?: string) => (x ? (x.startsWith("M") ? -Number(x.slice(1)) : Number(x)) : null);
  const clouds = ts.flatMap<Nube>((x) => {
    const m = /^(FEW|SCT|BKN|OVC|VV)(\d{3}|\/{3})(CB|TCU)?$/.exec(x);
    // SCT///: la capa sin altura se guarda (va a solo texto); si se tirara, quedaría «Sky clear».
    if (m) return [{ cover: m[1], base: m[2] === "///" ? null : Number(m[2]) * 100, type: m[3] ?? null }];
    return /^(?:CLR|SKC|NSC|NCD)$/.test(x) ? [{ cover: x, base: null }] : [];
  });
  const wx = ts.filter((x) => /^(?:[-+]|VC)?(?:MI|PR|BC|DR|BL|SH|TS|FZ)?(?:DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)+$/.test(x));
  return {
    icaoId: icao, rawOb: `${icao} ${dd}${hh}${mm}Z ${cuerpo}`, obsTime: Math.floor(emitido / 1000),
    temp: grados(temp?.[1]), dewp: grados(temp?.[2]),
    wdir: viento ? (viento[1] === "VRB" ? "VRB" : Number(viento[1])) : null, wspd: viento ? Number(viento[2]) : null,
    wgst: viento?.[3] ? Number(viento[3]) : null,
    visib: vis ? `${vis[1] ? vis[1] + " " : ""}${vis[2].replace(/^P(\d+)$/, "$1+")}` : null,
    altim: alt ? (Number(alt[1]) / 100) * 33.8639 : null, elev: null,
    wxString: wx.length ? wx.join(" ") : null, clouds,
  };
}

// METAR crudo de metar.vatsim.net («YBAF 270032Z AUTO 06012KT 9999 ... Q1021») con la forma de aviationweather;
// respaldo para estaciones que aviationweather no tiene. Visibilidad en millas y QNH en hPa, como aviationweather.
export function metarDeCrudo(crudo: string, ahoraMs: number): Metar | null {
  const m = /^(?:METAR |SPECI )?([A-Z0-9]{4}) (\d{2})(\d{2})(\d{2})Z (.+)$/.exec(crudo.trim().split("\n")[0]);
  if (!m) return null;
  const [, icao, dd, hh, mi, resto] = m;
  const hoy = new Date(ahoraMs);
  let emitido = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), Number(dd), Number(hh), Number(mi));
  if (emitido > ahoraMs + 3_600_000) emitido = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 1, Number(dd), Number(hh), Number(mi)); // día del mes pasado
  const cuerpo = resto.split(/\sRMK\s/)[0].replace(/=$/, "");
  const r = metarDeTexto(icao, emitido, cuerpo);
  const q = /(?:^|\s)Q(\d{4})(?=\s|$)/.exec(cuerpo);
  if (q) r.altim = Number(q[1]);
  // Visibilidad métrica: el primer grupo de 4 cifras después del viento (9999 = 10 km o más, aviationweather dice "6+").
  const metros = /(?:KT|MPS)(?:\s\d{3}V\d{3})?\s(\d{4})(?=\s|$)/.exec(cuerpo)?.[1];
  if (r.visib === null && (metros || /(?:^|\s)CAVOK(?=\s|$)/.test(cuerpo))) {
    r.visib = !metros || metros === "9999" ? "6+" : Math.round((Number(metros) / 1609.344) * 100) / 100;
  }
  r.rawOb = `${icao} ${dd}${hh}${mi}Z ${cuerpo}`;
  return r;
}

// Grupos que solo trae un METAR (viento, visibilidad, capa de nubes): marcan la oración del clima.
const GRUPO_METAR = /(?:^|\s)(?:(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT|[PM]?\d+(?:\/\d+)?SM|(?:FEW|SCT|BKN|OVC|VV)(?:\d{3}|\/{3})|CLR|SKC)(?=[\s.,]|$)/;

// cs: callsign de la estación de VATSIM; sin él es el D-ATIS de atis.info.
export const urlVoz = (icao: string, tipo: string, n: number, h: string, cs?: string) =>
  `/api/atis/voz?icao=${icao}&tipo=${tipo}&n=${n}&h=${h}${cs ? `&red=vatsim&cs=${cs}` : ""}`;

// Lo que ya tiene piezas se dice con piezas; el resto (oraciones del D-ATIS y lo que el armado no pudo decir) va en vivo.
// Con ap null se usa un aeropuerto mínimo: la Function obtiene las mismas partes en vivo que la página.
export function armarDatis(e: EntradaDatis, ap: AeropuertoAtis | null, ahoraMs: number, cs?: string): Atis {
  const l = leerDatis(e);
  const inicioMs = emitidoMs(e.time, ahoraMs);
  const apReal = ap ?? { icao: e.airport, nombreEs: null, nombreEn: null, nombreSim: e.airport, lat: 0, lon: 0, elevFt: 0, atisMhz: [], pistas: [] };
  const metar = metarDeTexto(e.airport, inicioMs, l.metar ?? "");
  const { deRed: _, ...base } = armarAtis(metar, apReal, { deRed: { letra: l.letra, pista: null, salida: null, tl: null, taFt: null } });
  const parte = (tipo: Parte["tipo"], texto: string): Parte => ({ tipo, idioma: "en", texto, vivo: hablado(texto), piezas: [] });
  const soloTexto = (tipo: Parte["tipo"], texto: string): Parte => ({ tipo, idioma: "en", texto, piezas: [], soloTexto: true });
  // Lo que el armado del METAR no dijo con piezas: con regla (visibilidad, RVR, tiempo) va en vivo; sin regla, solo en texto.
  const delMetar = (p: Parte): Parte[] => {
    if (!p.soloTexto) return [p];
    const vivos: Parte[] = [], sinRegla: string[] = [];
    for (const g of p.tipo === "observaciones" ? p.texto.split(/\s+/) : [p.texto]) {
      const v = habladoMetar(g);
      if (v) vivos.push({ tipo: p.tipo, idioma: "en", texto: g, piezas: [], vivo: v }); else sinRegla.push(g);
    }
    return sinRegla.length ? [...vivos, soloTexto(p.tipo, sinRegla.join(" "))] : vivos;
  };
  // Sin altímetro no se reconoce el METAR: la oración del clima queda en texto (hablado la leería mal).
  const nuevas = l.resto.map((o) => (!l.metar && GRUPO_METAR.test(o) ? soloTexto("observaciones", o) : parte("avisos", o)));
  const rmk: Parte[] = l.rmk ? [soloTexto("observaciones", l.rmk)] : [];
  const cierre = base.partes.at(-1)!;
  // Sin grupo de nubes (o sin METAR) no se dice «Sky clear»: el ATIS real solo lo dice con CLR/SKC.
  const clima = base.partes.slice(0, -1).filter((p) => metar.clouds.length || p.tipo !== "nubes");
  const partes = [...clima.flatMap(delMetar), ...nuevas, ...rmk, cierre];
  let n = 0;
  for (const p of partes) if (p.vivo) p.piezas = [{ idioma: "en", clave: `vivo-${n}`, url: urlVoz(e.airport, e.type, n++, huella(p.vivo), cs) }];
  return { ...base, partes, real: true, huella: huella(e.datis) };
}

// ATIS de texto de VATSIM en EE. UU. como D-ATIS: la única regla de «se puede leer» (página y función de voz).
// Pide letra, hora (el primer «HHMMZ», seguido de espacios opcionales y un punto), altímetro en el cuerpo
// (después de la hora) y a lo más 1200 caracteres.
const HORA_VATSIM = /(\d{4})Z(\s*\.)?/;
export function entradaDeVatsim(icao: string, est: AtisRed): EntradaDatis | null {
  const texto = est.lineas.join(" ");
  const h = HORA_VATSIM.exec(texto);
  if (!est.letra || !/^[A-Z]$/.test(est.letra) || !h?.[2] || texto.length > 1200) return null;
  const cuerpo = texto.slice(h.index + h[0].length).trim();
  if (!ALTIMETRO.test(cuerpo)) return null;
  return { airport: icao, type: est.tipo, code: est.letra, time: h[1], updatedAt: "", datis: `${icao.slice(1)} ATIS INFO ${est.letra} ${h[1]}Z. ${cuerpo}` };
}

// El ATIS de VATSIM armado como el D-ATIS; las URLs de voz llevan el callsign para que la función lo vuelva a bajar.
export function armarVatsim(icao: string, est: AtisRed, ap: AeropuertoAtis | null, ahoraMs: number): Atis | null {
  const e = entradaDeVatsim(icao, est);
  if (!e) return null;
  const { real: _, ...a } = armarDatis(e, ap, ahoraMs, est.callsign);
  return { ...a, deRed: true };
}

// Nombre que MSFS le da a esa frecuencia ATIS del aeropuerto (p. ej. "ATIS DEP"); null si no está o el lector no lo mandó.
export function nombreFrecuencia(ap: AeropuertoAtis, mhz: number): string | null {
  const i = ap.atisMhz.findIndex((m) => Math.abs(m - mhz) < TOLERANCIA_MHZ + 1e-9);
  return (i >= 0 && ap.atisNombres?.[i]) || null;
}

export function vivosDe(atis: Atis): { n: number; texto: string; h: string }[] {
  return atis.partes.filter((p) => p.vivo).map((p, n) => ({ n, texto: p.vivo!, h: huella(p.vivo!) }));
}
