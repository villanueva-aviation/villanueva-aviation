// Qué dice la red (IVAO o VATSIM) de un aeropuerto: si hay controlador y si publica su ATIS.
// Lo usa functions/api/atis/red.ts con los feeds públicos, y la página para elegir la fuente.
// Regla del diseño: ante la duda, hay controlador, para nunca anunciar una pista distinta a la del ATC.
import { esFrecuenciaSalidas } from "./datis.ts";
import { formatoDe } from "./formato.ts";
import { distanciaNm, TOLERANCIA_MHZ } from "./radio.ts";

export type Red = "ivao" | "vatsim" | "ninguna";
export type EstadoRed = { atc: boolean; atis: { lineas: string[]; letra: string | null } | null; estaciones?: AtisRed[] };
export type Fuente = "cliente" | "sin-letra" | "generado";

// Una estación ATIS de la red ya convertida: tipo por el callsign (_A_ATIS / _D_ATIS), MHz del feed.
export type AtisRed = { callsign: string; tipo: "combined" | "arr" | "dep"; mhz: number | null; lineas: string[]; letra: string | null };
export type VatsimEstacion = { callsign: string; facility: number; visual_range: number; text_atis: string[] | null; frequency?: string; atis_code?: string | null };
export type VatsimDatos = { controllers: VatsimEstacion[]; atis: VatsimEstacion[] };
export type VatsimTransceptores = { callsign: string; transceivers: { latDeg: number; lonDeg: number }[] }[];
export type IvaoAtc = { callsign: string; atcSession: { position: string }; lastTrack: { latitude: number; longitude: number } | null; atis?: { lines: string[]; revision: string } };
export type IvaoWhazzup = { clients: { atcs: IvaoAtc[] } };

type Ap = { icao: string; lat: number; lon: number };

const VATSIM_LEJANAS = new Set([1, 5, 6]); // FSS, APP/DEP, CTR
const IVAO_ALCANCE: Record<string, number> = { CTR: 150, FSS: 150, APP: 60, DEP: 60 }; // IVAO no publica alcance
const IVAO_PRIORIDAD = ["TWR", "APP", "GND", "DEL"]; // quien transmite el ATIS de voz en Aurora
const IVAO_LOCALES = ["TWR", "GND", "DEL"];
const SERVIDOR_VOZ = /\.ivao\.aero\//;

// EE. UU. (K, PA, PH, PG) llama a sus estaciones sin la primera letra: LAX_TWR para KLAX, ANC_TWR para PANC.
const sinPrefijo = (icao: string) => /^(K|PA|PH|PG)/.test(icao) ? icao.slice(1) + "_" : null;
export const delAeropuerto = (callsign: string, icao: string) =>
  callsign.startsWith(icao + "_") || (!!sinPrefijo(icao) && callsign.startsWith(sinPrefijo(icao)!));
// Por distancia solo cuentan estaciones de la misma región OACI: el centro de Houston en VATSIM publica
// 600 NM de alcance y no controla Guadalajara. Regiones de una letra (C, Y, Z, U y la K de EE. UU.): compara la primera.
// Un prefijo que no es OACI de 4 letras (HOU_CTR, TOR_CTR, LON_S_CTR) cuenta en todo aeropuerto que no sea de México
// ni Latinoamérica (ahí Houston queda fuera), y en EE. UU. los centros KZxx de IVAO; ante la duda, hay controlador
// (la distancia sigue acotando).
const REGION_1 = ["C", "Y", "Z", "U", "K"];
const prefijoOaci = (callsign: string) => /^[A-Z]{4}$/.test(callsign.split("_")[0]);
const mismaRegion = (callsign: string, icao: string) => {
  const pref = callsign.split("_")[0];
  const formato = formatoDe(icao);
  if (formato !== "mx" && formato !== "latam" && !prefijoOaci(callsign)) return true;
  if (formato === "faa" && pref.startsWith("KZ")) return true;
  const n = REGION_1.includes(icao[0]) ? 1 : 2;
  return pref.slice(0, n) === icao.slice(0, n);
};
// Torre, superficie o autorizaciones con un prefijo que no es OACI (FAI_TWR en PAFA, SJU_TWR en TJSJ, SY_TWR en YSSY):
// cuentan si están a menos de 10 NM del aeropuerto.
const LOCAL_NM = 10;
const localCerca = (callsign: string, lat: number, lon: number, ap: Ap) =>
  !prefijoOaci(callsign) && distanciaNm({ lat, lon }, ap) < LOCAL_NM;

export type DatosRed = { letra: string; pista: string | null; salida: string | null; tl: string | null; taFt: number | null };

// Lo que se lee del ATIS de texto de la red, para decirlo con las piezas. null: no trae letra que se entienda.
// La letra: la que publica la red (IVAO revision, VATSIM atis_code) o «INFORMATION ALPHA» (la inicial de la palabra).
// pista: la de llegada (ARR RWY 01, LANDING RUNWAY 24R) o, si no la dice, la primera que se nombra (RWY IN USE 9).
// salida: la de salida solo si es otra (DEP RWY 19). tl: TL FL190, TRANSITION LEVEL 70. taFt: TA 18000FT.
const PISTA = String.raw`(?:RWYS?|RUNWAYS?)\s+(?:IN\s+USE\s+)?(\d{1,2}[LRC]?)\b`;
const LLEGADA = new RegExp(String.raw`\b(?:ARR(?:IVALS?)?|LANDING|LDG)\s+` + PISTA);
const SALIDA = new RegExp(String.raw`\b(?:DEP(?:ARTURES?)?|DEPARTING|TAKE-?OFF|TKOF)\s+` + PISTA);
const CUALQUIERA = new RegExp(String.raw`\b` + PISTA);
export function datosDeRed(atis: NonNullable<EstadoRed["atis"]>): DatosRed | null {
  const texto = atis.lineas.join(" ").toUpperCase();
  const letra = /^[A-Z]$/.exec((atis.letra ?? "").toUpperCase())?.[0] ?? /\bINFO(?:RMATION)?\s+([A-Z])[A-Z]*\b/.exec(texto)?.[1];
  if (!letra) return null;
  const id = (re: RegExp) => re.exec(texto)?.[1].replace(/^\d(?!\d)/, "0$&") ?? null; // RWY 9 → 09
  const pista = id(LLEGADA) ?? id(CUALQUIERA);
  const salida = id(SALIDA);
  const tl = /\b(?:TL|TRANS(?:ITION)?[\s-]+LEVEL)\s*:?\s*(?:FL\s*)?(\d{2,3})\b/.exec(texto)?.[1] ?? null;
  const ta = /\b(?:TA|TRANS(?:ITION)?[\s-]+ALT(?:ITUDE)?)\s*:?\s*(\d{3,5})\s*(?:FT|FEET)?\b/.exec(texto)?.[1];
  return { letra, pista, salida: salida && salida !== pista ? salida : null, tl, taFt: ta ? Number(ta) : null };
}

export function fuente(red: Red, estado: EstadoRed | null): Fuente {
  if (red === "ninguna") return "generado";
  if (!estado) return "sin-letra";
  if (estado.atis) return "cliente";
  return estado.atc ? "sin-letra" : "generado";
}

// Respuesta de la red que la página puede usar ahora. Una de más de 2 minutos no se usa: anunciaría la pista
// de cuando no había controlador. "esperando": no hay nada vigente y la pregunta sigue en camino (silencio).
// null: falló y no hay nada vigente; fuente() lo toma como «hay controlador».
export const VIGENCIA_RED_MS = 120_000;
export type EntradaRed = { estado: EstadoRed | null; recibidoMs: number; fallo: boolean };
export function estadoVigente(e: EntradaRed, ahoraMs: number): EstadoRed | null | "esperando" {
  if (e.estado && ahoraMs - e.recibidoMs < VIGENCIA_RED_MS) return e.estado;
  return e.fallo ? null : "esperando";
}

export function estadoVatsim(datos: VatsimDatos, trans: VatsimTransceptores, ap: Ap): EstadoRed {
  const estaciones = datos.atis.filter((e) => delAeropuerto(e.callsign, ap.icao) && e.callsign.endsWith("ATIS")).map(atisRedDe);
  const atisRed = estaciones.find((e) => e.tipo === "combined") ?? estaciones[0];
  const posiciones = new Map(trans.map((t) => [t.callsign, t.transceivers]));
  const cerca = (e: VatsimEstacion) => VATSIM_LEJANAS.has(e.facility) && mismaRegion(e.callsign, ap.icao)
    && (posiciones.get(e.callsign) ?? []).some((t) => distanciaNm({ lat: t.latDeg, lon: t.lonDeg }, ap) < e.visual_range);
  const local = (e: VatsimEstacion) => e.facility >= 2 && e.facility <= 4 // DEL, GND, TWR
    && (posiciones.get(e.callsign) ?? []).some((t) => localCerca(e.callsign, t.latDeg, t.lonDeg, ap));
  const atc = !!atisRed || datos.controllers.some((e) => e.facility !== 0 && (delAeropuerto(e.callsign, ap.icao) || cerca(e) || local(e)));
  // En VATSIM la estación ATIS existe = vPilot la reproduce, aunque no publique texto.
  return { atc, atis: atisRed ? { lineas: atisRed.lineas, letra: atisRed.letra } : null, estaciones };
}

// Una estación ATIS del feed de VATSIM ya convertida; la usan la página y la función de voz.
export function atisRedDe(e: VatsimEstacion): AtisRed {
  const mhz = Number(e.frequency ?? NaN);
  const tipo = e.callsign.endsWith("_A_ATIS") ? "arr" : e.callsign.endsWith("_D_ATIS") ? "dep" : "combined";
  return { callsign: e.callsign, tipo, mhz: Number.isFinite(mhz) ? mhz : null, lineas: e.text_atis ?? [], letra: e.atis_code ?? null };
}

// La estación que corresponde al COM sintonizado: la de esa frecuencia; si no, la combinada; si no, salidas o llegadas.
// null si no hay ninguna de esas: nunca suena la de llegadas en la frecuencia de salidas ni al revés.
export function estacionPara(estaciones: AtisRed[] | undefined, icao: string, mhz: number, nombreFrec: string | null): AtisRed | null {
  if (!estaciones?.length) return null;
  const tipo = esFrecuenciaSalidas(icao, mhz, nombreFrec) ? "dep" : "arr";
  return estaciones.find((e) => e.mhz !== null && Math.abs(e.mhz - mhz) < TOLERANCIA_MHZ + 1e-9)
    ?? estaciones.find((e) => e.tipo === "combined") ?? estaciones.find((e) => e.tipo === tipo) ?? null;
}

export function estadoIvao(w: IvaoWhazzup, ap: Ap): EstadoRed {
  const propias = w.clients.atcs.filter((e) => delAeropuerto(e.callsign, ap.icao));
  const cerca = (e: IvaoAtc) => {
    const alcance = IVAO_ALCANCE[e.atcSession.position];
    return !!alcance && mismaRegion(e.callsign, ap.icao) && !!e.lastTrack && distanciaNm({ lat: e.lastTrack.latitude, lon: e.lastTrack.longitude }, ap) < alcance;
  };
  const local = (e: IvaoAtc) => IVAO_LOCALES.includes(e.atcSession.position) && !!e.lastTrack
    && localCerca(e.callsign, e.lastTrack.latitude, e.lastTrack.longitude, ap);
  const atc = propias.length > 0 || w.clients.atcs.some((e) => cerca(e) || local(e));
  const rango = (e: IvaoAtc) => { const i = IVAO_PRIORIDAD.indexOf(e.atcSession.position); return i < 0 ? IVAO_PRIORIDAD.length : i; };
  const conAtis = propias.filter((e) => e.atis).sort((a, b) => rango(a) - rango(b))[0];
  const lineas = conAtis?.atis!.lines.filter((l) => !SERVIDOR_VOZ.test(l)) ?? [];
  return { atc, atis: conAtis && lineas.length ? { lineas, letra: conAtis.atis!.revision } : null };
}
