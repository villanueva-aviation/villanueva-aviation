// Del estado del simulador a lo que lee el instructor: la misma Muestra, el mismo Aeropuerto y los mismos VOR
// que manda el lector de MSFS. Puro.
import { aNm, rumbo } from "../home/navGeo.ts";
import type { Aeropuerto, TipoFrecuencia } from "../instructor/aeropuertoSim.ts";
import type { Muestra } from "../instructor/evaluador.ts";
import { TITULO_SIM_WEB } from "../instructor/simWeb.ts";
import type { VorSim } from "../instructor/vorSim.ts";
import type { Sim } from "./bucle.ts";
import type { AeropuertoSim, Vor } from "./datos.ts";
import type { EstadoAp } from "./piloto.ts";
import { recibirNav } from "./radios.ts";

// ponytail: peso fijo; solo lo usa el viraje escarpado (no es lección IFR).
const PESO_LB = 5500;
const FT_POR_NM = 6076.12;

/** El AP mueve el helicóptero: algún modo distinto de ATT (que es la palanca del piloto). */
export const apMueve = (ap: EstadoAp) => ap.ap && (ap.lat !== "ATT" || ap.vert !== "ATT" || ap.ias || ap.armado !== null);

export function aMuestra(s: Sim, x: { t: number; sueloFt: number; decl: number; vors: Vor[] }): Muestra {
  const { e } = s;
  const l = recibirNav(s.radios.nav1[0], s.radios.obs, e, x.vors);
  return {
    t: x.t,
    inclinacion: e.inclinacion,
    altitud: e.altFt,
    velocidad: e.ias,
    rumbo: (((e.rumboV - x.decl) % 360) + 360) % 360,
    bola: e.bola,
    agl: e.altFt - x.sueloFt,
    peso: PESO_LB,
    enTierra: e.enTierra,
    slew: false,
    tasa: 1,
    pausa: s.pausa,
    titulo: TITULO_SIM_WEB,
    cabeceo: e.cabeceo,
    vs: e.vs,
    lat: e.lat,
    lon: e.lon,
    gs: e.gs,
    rumboV: e.rumboV,
    motor: s.motor,
    com1: s.radios.com1[0],
    vientoDir: s.viento.dir,
    vientoKt: s.viento.kt,
    autopiloto: apMueve(s.ap),
    navMhz: s.radios.nav1[0],
    navObs: s.radios.obs,
    navSenal: !!l,
    navRadial: l?.radial,
    // Grados de la barra; + = el curso está a la derecha.
    navDesv: l?.desvGrados,
    navDesde: !l ? 0 : l.desde ? 2 : 1,
    navTieneDme: !!l?.vor.dme,
    navDme: l?.dmeNm ?? undefined,
    gpsNav: s.fuente === "gps",
  };
}

const TIPOS: [RegExp, TipoFrecuencia][] = [
  [/TWR|TOWER/i, "torre"],
  [/GND|GROUND/i, "rodaje"],
  [/ATIS/i, "atis"],
  [/APP|APPROACH/i, "aproximacion"],
  [/DEP/i, "salida"],
  [/CLD|DEL|CLNC/i, "autorizacion"],
  [/UNIC/i, "unicom"],
];
const tipoDe = (t: string): TipoFrecuencia => TIPOS.find(([r]) => r.test(t))?.[1] ?? "otra";

export function aAeropuerto(a: AeropuertoSim): Aeropuerto {
  return {
    icao: a.icao,
    nombre: a.nombre,
    lat: a.lat,
    lon: a.lon,
    elevacionFt: a.elevFt,
    // Sin helipuertos («H1»…): aterrizar en uno cuenta como plataforma, para poder terminar la lección ahí.
    pistas: a.pistas
      .filter((p) => !/^H/i.test(p.a) && p.b)
      .map((p) => {
        const d = aNm(p.latB, p.lonB, p.latA, p.lonA);
        const ab = rumbo({ x: 0, y: 0 }, d);
        return {
          extremos: [
            { ident: p.a, rumboV: ab, lat: p.latA, lon: p.lonA },
            { ident: p.b, rumboV: (ab + 180) % 360, lat: p.latB, lon: p.lonB },
          ],
          largoFt: Math.hypot(d.x, d.y) * FT_POR_NM,
          anchoFt: p.anchoFt,
        };
      }),
    frecuencias: a.com.map((c) => ({ tipo: tipoDe(c.tipo), mhz: c.mhz, nombre: c.tipo })),
  };
}

export const aVorSim = (v: Vor): VorSim => ({ ident: v.ident, region: "", lat: v.lat, lon: v.lon, mhz: v.mhz, dme: v.dme });

/** El aeropuerto más cercano a `maxNm` o menos (como el que manda el lector), o null. */
export function aeropuertoCercano(lista: AeropuertoSim[], lat: number, lon: number, maxNm = 5): AeropuertoSim | null {
  let mejor: AeropuertoSim | null = null;
  let dMejor = maxNm;
  for (const a of lista) {
    const p = aNm(a.lat, a.lon, lat, lon);
    const d = Math.hypot(p.x, p.y);
    if (d <= dMejor) [mejor, dMejor] = [a, d];
  }
  return mejor;
}
