// Qué dice la red (IVAO o VATSIM) de un aeropuerto: si hay controlador y si publica su ATIS.
// Lo usa functions/api/atis/red.ts con los feeds públicos, y la página para elegir la fuente.
// Regla del diseño: ante la duda, hay controlador, para nunca anunciar una pista distinta a la del ATC.
import { distanciaNm } from "./radio.ts";

export type Red = "ivao" | "vatsim" | "ninguna";
export type EstadoRed = { atc: boolean; atis: { lineas: string[]; letra: string | null } | null };
export type Fuente = "cliente" | "sin-letra" | "generado";

export type VatsimEstacion = { callsign: string; facility: number; visual_range: number; text_atis: string[] | null; atis_code?: string | null };
export type VatsimDatos = { controllers: VatsimEstacion[]; atis: VatsimEstacion[] };
export type VatsimTransceptores = { callsign: string; transceivers: { latDeg: number; lonDeg: number }[] }[];
export type IvaoAtc = { callsign: string; atcSession: { position: string }; lastTrack: { latitude: number; longitude: number } | null; atis?: { lines: string[]; revision: string } };
export type IvaoWhazzup = { clients: { atcs: IvaoAtc[] } };

type Ap = { icao: string; lat: number; lon: number };

const VATSIM_LEJANAS = new Set([1, 5, 6]); // FSS, APP/DEP, CTR
const IVAO_ALCANCE: Record<string, number> = { CTR: 150, FSS: 150, APP: 60, DEP: 60 }; // IVAO no publica alcance
const IVAO_PRIORIDAD = ["TWR", "APP", "GND", "DEL"]; // quien transmite el ATIS de voz en Aurora
const SERVIDOR_VOZ = /\.ivao\.aero\//;

const delAeropuerto = (callsign: string, icao: string) => callsign.startsWith(icao + "_");
// Por distancia solo cuentan estaciones de la misma región OACI (MM… en México): el centro de Houston
// en VATSIM publica 600 NM de alcance y no controla Guadalajara.
// ponytail: las estaciones de EE. UU. no llevan K (HOU_CTR); revisar en el plan 3 con aeropuertos de EE. UU.
const mismaRegion = (callsign: string, icao: string) => callsign.slice(0, 2) === icao.slice(0, 2);

export function fuente(red: Red, estado: EstadoRed | null): Fuente {
  if (red === "ninguna") return "generado";
  if (!estado) return "sin-letra";
  if (estado.atis) return "cliente";
  return estado.atc ? "sin-letra" : "generado";
}

export function estadoVatsim(datos: VatsimDatos, trans: VatsimTransceptores, ap: Ap): EstadoRed {
  const atisRed = datos.atis.find((e) => delAeropuerto(e.callsign, ap.icao) && e.callsign.endsWith("ATIS"));
  const posiciones = new Map(trans.map((t) => [t.callsign, t.transceivers]));
  const cerca = (e: VatsimEstacion) => VATSIM_LEJANAS.has(e.facility) && mismaRegion(e.callsign, ap.icao)
    && (posiciones.get(e.callsign) ?? []).some((t) => distanciaNm({ lat: t.latDeg, lon: t.lonDeg }, ap) < e.visual_range);
  const atc = !!atisRed || datos.controllers.some((e) => e.facility !== 0 && (delAeropuerto(e.callsign, ap.icao) || cerca(e)));
  const lineas = atisRed?.text_atis ?? [];
  return { atc, atis: atisRed && lineas.length ? { lineas, letra: atisRed.atis_code ?? null } : null };
}

export function estadoIvao(w: IvaoWhazzup, ap: Ap): EstadoRed {
  const propias = w.clients.atcs.filter((e) => delAeropuerto(e.callsign, ap.icao));
  const cerca = (e: IvaoAtc) => {
    const alcance = IVAO_ALCANCE[e.atcSession.position];
    return !!alcance && mismaRegion(e.callsign, ap.icao) && !!e.lastTrack && distanciaNm({ lat: e.lastTrack.latitude, lon: e.lastTrack.longitude }, ap) < alcance;
  };
  const atc = propias.length > 0 || w.clients.atcs.some(cerca);
  const rango = (e: IvaoAtc) => { const i = IVAO_PRIORIDAD.indexOf(e.atcSession.position); return i < 0 ? IVAO_PRIORIDAD.length : i; };
  const conAtis = propias.filter((e) => e.atis).sort((a, b) => rango(a) - rango(b))[0];
  const lineas = conAtis?.atis!.lines.filter((l) => !SERVIDOR_VOZ.test(l)) ?? [];
  return { atc, atis: conAtis && lineas.length ? { lineas, letra: conAtis.atis!.revision } : null };
}
