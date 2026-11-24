// Lectura del D-ATIS real de EE. UU. (atis.info) y armado del ATIS reproducible.
import type { Metar, Nube } from "../../lib/clima.ts";
import type { AeropuertoAtis } from "./datos.ts";
import { armarAtis, type Atis, type Parte } from "./generado.ts";
import { hablado } from "./hablado.ts";
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
const CIERRE = /\.{0,3}\s*ADVS YOU HAVE INFO [A-Z]\.?\s*$/;
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

export function datisPara(entradas: EntradaDatis[], nombreFrec: string | null): EntradaDatis | null {
  const combinada = entradas.find((e) => e.type === "combined");
  if (combinada) return combinada;
  const tipo = nombreFrec?.toUpperCase().includes("DEP") ? "dep" : "arr";
  return entradas.find((e) => e.type === tipo) ?? null;
}

// Lo que la página guarda de /api/atis/real por aeropuerto. entradas null: la primera respuesta no ha llegado.
export type PreguntaReal = { entradas: EntradaDatis[] | null; fallo: boolean };

// El D-ATIS que suena en esa frecuencia. "esperando": silencio hasta la primera respuesta.
// Si la fuente falla, sigue la última respuesta buena hasta que vence (90 min).
// null: no hay uno vigente, o falló sin respuesta previa; suena el generado.
export function datisVigente(q: PreguntaReal, nombreFrec: string | null, ahoraMs: number): EntradaDatis | null | "esperando" {
  if (!q.entradas) return q.fallo ? null : "esperando";
  const e = datisPara(q.entradas, nombreFrec);
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
    const m = /^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/.exec(x);
    if (m) return [{ cover: m[1], base: Number(m[2]) * 100, type: m[3] ?? null }];
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

export const urlVoz = (icao: string, tipo: string, n: number, h: string) => `/api/atis/voz?icao=${icao}&tipo=${tipo}&n=${n}&h=${h}`;

// Lo que ya tiene piezas se dice con piezas; el resto (oraciones del D-ATIS y lo que el armado no pudo decir) va en vivo.
// Con ap null se usa un aeropuerto mínimo: la Function obtiene las mismas partes en vivo que la página.
export function armarDatis(e: EntradaDatis, ap: AeropuertoAtis | null, ahoraMs: number): Atis {
  const l = leerDatis(e);
  const inicioMs = emitidoMs(e.time, ahoraMs);
  const apReal = ap ?? { icao: e.airport, nombreEs: null, nombreEn: null, nombreSim: e.airport, lat: 0, lon: 0, elevFt: 0, atisMhz: [], pistas: [] };
  const metar = metarDeTexto(e.airport, inicioMs, l.metar ?? "");
  const { deRed: _, ...base } = armarAtis(metar, apReal, { deRed: { letra: l.letra, pista: null, salida: null, tl: null, taFt: null } });
  const parte = (tipo: Parte["tipo"], texto: string): Parte => ({ tipo, idioma: "en", texto, vivo: hablado(texto), piezas: [] });
  const nuevas = [...l.resto.map((o) => parte("avisos", o))];
  const rmk: Parte[] = l.rmk ? [{ tipo: "observaciones", idioma: "en", texto: l.rmk, piezas: [], soloTexto: true }] : [];
  const cierre = base.partes.at(-1)!;
  const partes = [...base.partes.slice(0, -1).map((p) => (p.soloTexto ? parte(p.tipo, p.texto) : p)), ...nuevas, ...rmk, cierre];
  let n = 0;
  for (const p of partes) if (p.vivo) p.piezas = [{ idioma: "en", clave: `vivo-${n}`, url: urlVoz(e.airport, e.type, n++, huella(p.vivo)) }];
  return { ...base, partes, real: true, huella: huella(e.datis) };
}

// Nombre que MSFS le da a esa frecuencia ATIS del aeropuerto (p. ej. "ATIS DEP"); null si no está o el lector no lo mandó.
export function nombreFrecuencia(ap: AeropuertoAtis, mhz: number): string | null {
  const i = ap.atisMhz.findIndex((m) => Math.abs(m - mhz) < TOLERANCIA_MHZ + 1e-9);
  return (i >= 0 && ap.atisNombres?.[i]) || null;
}

export function vivosDe(atis: Atis): { n: number; texto: string; h: string }[] {
  return atis.partes.filter((p) => p.vivo).map((p, n) => ({ n, texto: p.vivo!, h: huella(p.vivo!) }));
}
