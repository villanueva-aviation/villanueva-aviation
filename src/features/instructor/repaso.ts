// Lección 13, repaso general: sorteo de maniobras, zona de trabajo y la lección de rampa a rampa. Puro, para poder probarlo.
import { esC172, type Muestra } from "./evaluador.ts";
import { AVIONES_VOZ, type AvionVoz } from "../../data/checklistVozAviones.ts";
import type { Aeropuerto } from "./aeropuertoSim.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { MANIOBRAS, type ManiobraId, type ResultadoComun } from "./maniobras.ts";
import { armarVuelo, avanzarVuelo, type EvaluacionVuelo } from "./fasesVuelo.ts";
import type { Modo } from "./sesion.ts";
import { crearTomas, medirTomas, type Tomas } from "./tomas.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { AGL_MIN } from "./evaluadorS.ts";
import { aNm } from "../home/navGeo.ts";
import type { Nivel } from "./nivel.ts";
import type { Leccion } from "./lecciones.ts";
import { conCono, type VorElegido } from "./vorSim.ts";
import type { Entrada } from "../entrenador/esperas.ts";
import { NOMBRE_ENTRADA } from "./textosEspera.ts";

const RAD = Math.PI / 180;

/** `n` maniobras: cada disponible al menos una vez y nunca la misma dos veces seguidas (salvo que haya una sola). */
export function sortear(disponibles: ManiobraId[], n = 4, azar = Math.random): ManiobraId[] {
  const s = [...disponibles];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  while (s.length < n) {
    const otras = disponibles.filter((d) => d !== s[s.length - 1]);
    const de = otras.length ? otras : disponibles;
    s.push(de[Math.floor(azar() * de.length)]);
  }
  return s.slice(0, n);
}

/** Se vuelan en el circuito del aeropuerto, no en la zona: no entran al sorteo. */
const CIRCUITO: ManiobraId = "toques-despegues";

/** La familiarización es el primer vuelo, no una maniobra que se repasa. */
/** La interceptación es del programa IFR. */
const FUERA_DEL_SORTEO: ManiobraId[] = [CIRCUITO, "familiarizacion", "interceptar-radial", "ruta-vor", "arco-dme", "espera"];

/** Lección de maniobra: la primera de práctica y 4 más (Erik). Repaso: 4 sorteadas. IFR: los ejercicios de la lección. */
export const maniobrasDe = (l: Leccion, azar = Math.random, modo?: Modo): ManiobraId[] =>
  l.maniobra
    ? Array(l.ejercicios ? (modo === "checkride" ? l.ejercicios.examen : l.ejercicios.practica) : 5).fill(l.maniobra)
    : sortear((Object.keys(MANIOBRAS) as ManiobraId[]).filter((id) => !FUERA_DEL_SORTEO.includes(id)), 4, azar);

/** Ft AGL desde los que la zona cuenta para esta maniobra: la «S» va de 600 a 1,000 y la «8» a la altura pivote. */
export const pisoZona = (id: ManiobraId | undefined) => (id === "s-camino" || id === "ocho-pilones" || id === "ocho-alrededor" ? AGL_MIN : ALTURA_SEGURA_AGL);

/** Lección 14: cada maniobra es un circuito desde la carrera de despegue. */
const deCircuitos = (e: EstadoRepaso) => e.sorteo[0] === CIRCUITO;

export interface Zona {
  nombre: Record<Idioma, string>;
  lat: number;
  lon: number;
  radioNm: number;
  /** Si está, la zona es este contorno [lat, lon] en lugar del círculo. */
  poligono?: [number, number][];
}

/**
 * Orilla del lago de Chapala (OpenStreetMap vía Nominatim, simplificada a ~1 km, 2026-11-09). Las islas cuentan como lago.
 * ponytail: la simplificación corta la orilla hasta ~1 km; si Erik nota que avisa sobre tierra, bajar el umbral.
 */
const LAGO_CHAPALA: [number, number][] = [
  [20.2452, -103.4217], [20.2254, -103.4062], [20.2271, -103.3652], [20.1818, -103.2194], [20.1494, -103.1714], [20.1669, -103.1352],
  [20.1595, -103.0832], [20.1821, -103.0404], [20.1624, -103.021], [20.1736, -102.9721], [20.1626, -102.8665], [20.1185, -102.8244],
  [20.1419, -102.8208], [20.1664, -102.6904], [20.1835, -102.6842], [20.206, -102.6873], [20.207, -102.7675], [20.2338, -102.7072],
  [20.2642, -102.6941], [20.2835, -102.703], [20.2947, -102.7643], [20.3203, -102.7861], [20.3017, -102.8527], [20.3137, -102.9511],
  [20.3367, -102.9927], [20.3335, -103.0788], [20.3254, -103.127], [20.2844, -103.1889], [20.2903, -103.1961], [20.2921, -103.2079],
  [20.2867, -103.2338], [20.2976, -103.2693], [20.2827, -103.3351], [20.2887, -103.4111],
];

/** Los vértices en NM respecto al avión: el avión queda en el origen. */
const relativos = (lat: number, lon: number, p: [number, number][]) => p.map(([a, b]) => aNm(a, b, lat, lon));

/** Par-impar: ¿el origen está dentro? */
function dentro(v: { x: number; y: number }[]): boolean {
  let si = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    if (v[i].y > 0 !== v[j].y > 0 && 0 < ((v[j].x - v[i].x) * -v[i].y) / (v[j].y - v[i].y) + v[i].x) si = !si;
  }
  return si;
}

/** NM del origen a la orilla más cercana. */
function aLaOrilla(v: { x: number; y: number }[]): number {
  let min = Infinity;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    const dx = v[i].x - v[j].x;
    const dy = v[i].y - v[j].y;
    const k = Math.max(0, Math.min(1, -(v[j].x * dx + v[j].y * dy) / (dx * dx + dy * dy || 1)));
    min = Math.min(min, Math.hypot(v[j].x + k * dx, v[j].y + k * dy));
  }
  return min;
}

const punto = (a: Aeropuerto, rumbo: number, nm: number) => ({
  lat: a.lat + (nm * Math.cos(rumbo * RAD)) / 60,
  lon: a.lon + (nm * Math.sin(rumbo * RAD)) / 60 / Math.cos(a.lat * RAD),
});

/** Aeródromo de Chapala en la orilla norte del lago (MSFS lo llama Paco Airport). */
const AERODROMO_CHAPALA = { lat: 20.308378, lon: -103.159506 };

/** MMGL: Cajititlán o Chapala, al azar. Otro aeropuerto: 10 NM al través de la pista más larga. */
export function zonaRepaso(a: Aeropuerto | null, azar = Math.random): Zona | null {
  if (!a) return null;
  if (a.icao === "MMGL") {
    return azar() < 0.5
      ? { nombre: { es: "Cajititlán", en: "Cajititlan" }, ...punto(a, 180, 5), radioNm: 3 }
      : // Todo el lago (Erik, 2026-11-09); el centro sigue siendo el punto sobre el agua al sur del aeródromo.
        { nombre: { es: "el lago de Chapala", en: "Lake Chapala" }, lat: AERODROMO_CHAPALA.lat - 4.5 / 60, lon: AERODROMO_CHAPALA.lon, radioNm: 3, poligono: LAGO_CHAPALA };
  }
  const larga = [...a.pistas].sort((x, y) => y.largoFt - x.largoFt)[0];
  // ponytail: rumbo verdadero redondeado a 10°; la declinación local no la manda el lector.
  const rumbo = (((larga?.extremos[0].rumboV ?? 0) + 90) % 360);
  const dicho = String(Math.round(rumbo / 10) * 10 || 360).padStart(3, "0");
  return {
    nombre: { es: `la zona a 10 millas al rumbo ${dicho}`, en: `the area 10 miles out on heading ${dicho}` },
    ...punto(a, rumbo, 10),
    radioNm: 3,
  };
}

/** `piso`: ft AGL desde los que cuenta; la «S» se vuela más abajo que las demás. */
export function enZona(m: Muestra, z: Zona, piso = ALTURA_SEGURA_AGL): boolean {
  if (m.lat === undefined || m.lon === undefined || m.agl < piso) return false;
  if (z.poligono) return dentro(relativos(m.lat, m.lon, z.poligono));
  const d = aNm(m.lat, m.lon, z.lat, z.lon);
  return Math.hypot(d.x, d.y) <= z.radioNm;
}

/** Para salir hace falta pasarse del margen: así el aviso no se repite al volar justo en el borde. */
const MARGEN_NM = 0.5;
const MARGEN_FT = 100;
export function fueraDeZona(m: Muestra, z: Zona, piso = ALTURA_SEGURA_AGL): boolean {
  if (m.lat === undefined || m.lon === undefined) return true;
  if (m.agl < piso - MARGEN_FT) return true;
  if (z.poligono) {
    const v = relativos(m.lat, m.lon, z.poligono);
    return !dentro(v) && aLaOrilla(v) > MARGEN_NM;
  }
  const d = aNm(m.lat, m.lon, z.lat, z.lon);
  return Math.hypot(d.x, d.y) > z.radioNm + MARGEN_NM;
}

// ── La lección de rampa a rampa ──

export type EtapaRepaso = "rampa" | "salida" | "maniobra" | "fuera-de-zona" | "regreso" | "terminado" | "invalido";
export interface Hecha {
  id: ManiobraId;
  resultado: ResultadoComun | null;
  intentoId: string | null;
}
export interface EstadoRepaso {
  etapa: EtapaRepaso;
  modo: Modo;
  sorteo: ManiobraId[];
  actual: number;
  hechas: Hecha[];
  zona: Zona | null;
  vuelo: EvaluacionVuelo | null;
  tomas: Tomas;
  motivo?: string;
  /** Tolerancias de las maniobras y del final; el checkride en Difícil (IFR: medio como mínimo). */
  nivel: Nivel;
  programa: "vfr" | "ifr";
  /** IFR: el VOR de la lección (en VFR, null). */
  vor: VorElegido | null;
  /** IFR: desde cuándo no hay señal del VOR en maniobra. */
  sinSenalDesde: number | null;
  /** IFR: ya se dijo en tierra qué sintonizar; al despegar solo se recuerda. */
  instruido?: boolean;
  /** El avión de la lección, del título del simulador al empezar. */
  avion?: Avion;
}

/** voz: su checklist por voz (null = no hay); c172: las velocidades del debriefing son del C172. */
export type Avion = { nombre: string; voz: AvionVoz | null; c172: boolean };
export function avionDe(titulo: string): Avion {
  const voz: AvionVoz | null = esC172(titulo) ? "c172" : /152/.test(titulo) ? "c152" : /arrow|pa-?28r/i.test(titulo) ? "arrow" : null;
  return { nombre: voz ? AVIONES_VOZ[voz].nombre : titulo, voz, c172: voz === "c172" };
}

/** La base acepta 20 caracteres en `avion`: el título de MSFS se corta en una palabra (Erik, 2026-11-12). */
export function avionParaGuardar(a: Avion | undefined): string {
  const n = (a?.nombre ?? "C172").trim();
  if (n.length <= 20) return n;
  const corte = n.slice(0, 21).lastIndexOf(" ");
  return corte > 0 ? n.slice(0, corte) : n.slice(0, 20);
}
type Paso = { estado: EstadoRepaso; decir: string[] };

/** Un avión que se mueve más de esto entre dos muestras, más rápido que SALTO_KT, se movió de golpe. */
const SALTO_NM = 2;
const SALTO_KT = 200;
const HUECO_AIRE_SEG = 10;
/** IFR: segundos sin señal del VOR antes de avisar. */
const SIN_SENAL_SEG = 5;
/** IFR: desde aquí empiezan los ejercicios. */
const PISO_IFR_AGL = 1000;

const T = {
  es: {
    espera: "Esperando el aeropuerto del simulador.",
    salto: "El avión se movió de golpe: la lección no se califica.",
    hueco: "Se perdió la conexión con el simulador en vuelo: la lección no se califica.",
    salida: (z: string, bajo: boolean) => `Ve a la zona de trabajo: ${z}, ${bajo ? "entre 600 y 1,000 pies sobre el terreno" : "a 1,500 pies sobre el terreno o más"}.`,
    enZona: (m: string) => `Estás en la zona. Primera maniobra: ${m}.`,
    fuera: "Regresa a la zona de trabajo.",
    devuelta: (m: string) => `De vuelta en la zona. Maniobra: ${m}.`,
    siguiente: (m: string, otra: boolean) => `Recto y nivelado. Siguiente maniobra: ${m}${otra ? ", con otro rumbo" : ""}.`,
    repetir: "Puedes repetirla o pasar a la siguiente.",
    regreso: "Terminamos las maniobras. Regresa al aeropuerto y aterriza.",
    circuito: (k: number, n: number, inicio: boolean) =>
      inicio ? `Circuito ${k} de ${n}.` : `Circuito ${k} de ${n}: potencia completa y despega${k === n ? "; este termina con aterrizaje completo" : ""}.`,
    finCircuitos: "Terminamos los circuitos. Sal de la pista y rueda a la plataforma.",
    eligeVor: "Elige un VOR.",
    sintoniza: (mhz: string, id: string) => `Sintoniza ${mhz} en NAV1, ${id}. Arriba de 1,000 pies sobre el terreno empezamos.`,
    sintonizaRampa: (mhz: string, id: string) => `Sintoniza ${id}, ${mhz}, en NAV1, con la barra en NAV.`,
    recuerda: (mhz: string, id: string) => `Recuerda: ${id} en NAV1, ${mhz}. Arriba de 1,000 pies sobre el terreno empezamos.`,
    conSenal: (id: string) => `Tenemos señal de ${id}. Primer ejercicio.`,
    sinSenal: (id: string) => `Perdí la señal de ${id}: revisa NAV1 o acércate al VOR.`,
    devueltaSenal: (id: string) => `Señal de ${id} de vuelta. Seguimos.`,
    siguienteIfr: "Siguiente ejercicio.",
  },
  en: {
    espera: "Waiting for the simulator's airport.",
    salto: "The aircraft jumped to another position: this lesson won't be graded.",
    hueco: "The connection to the simulator dropped in flight: this lesson won't be graded.",
    salida: (z: string, bajo: boolean) => `Head to the practice area: ${z}, ${bajo ? "between 600 and 1,000 feet above the ground" : "at 1,500 feet above the ground or higher"}.`,
    enZona: (m: string) => `You're in the area. First maneuver: ${m}.`,
    fuera: "Head back to the practice area.",
    devuelta: (m: string) => `Back in the area. Maneuver: ${m}.`,
    siguiente: (m: string, otra: boolean) => `Straight and level. Next maneuver: ${m}${otra ? ", on a different heading" : ""}.`,
    repetir: "You can repeat it or move on to the next one.",
    regreso: "We're done with the maneuvers. Head back to the airport and land.",
    circuito: (k: number, n: number, inicio: boolean) =>
      inicio ? `Pattern ${k} of ${n}.` : `Pattern ${k} of ${n}: full power and take off${k === n ? "; this one ends with a full-stop landing" : ""}.`,
    finCircuitos: "We're done with the patterns. Exit the runway and taxi to the ramp.",
    eligeVor: "Pick a VOR.",
    sintoniza: (mhz: string, id: string) => `Tune ${mhz} on NAV1, ${id}. We start above 1,000 feet above the ground.`,
    sintonizaRampa: (mhz: string, id: string) => `Tune ${id}, ${mhz}, on NAV1, with the needle on NAV.`,
    recuerda: (mhz: string, id: string) => `Remember: ${id} on NAV1, ${mhz}. We start above 1,000 feet above the ground.`,
    conSenal: (id: string) => `We have ${id}. First exercise.`,
    sinSenal: (id: string) => `I lost ${id}: check NAV1 or get closer to the VOR.`,
    devueltaSenal: (id: string) => `${id} is back. Let's continue.`,
    siguienteIfr: "Next exercise.",
  },
};

/** «Recto y nivelado C172» → «Recto y nivelado»; «C172 steep turn» → «Steep turn». */
export function nombreManiobra(id: ManiobraId, idioma: Idioma): string {
  const t = MANIOBRAS[id].titulo[idioma].replace(/^C172 | C172$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Con su entrada: tres «Patrones de espera» seguidos confunden al cadete (Erik, 2026-11-12). */
export function nombreHecha(id: ManiobraId, entrada: Entrada | undefined, idioma: Idioma): string {
  const base = nombreManiobra(id, idioma);
  if (id !== "espera" || !entrada) return base;
  return `${base} (${idioma === "en" ? `${NOMBRE_ENTRADA.en[entrada]} entry` : `entrada ${NOMBRE_ENTRADA.es[entrada]}`})`;
}

/** La entrada que tocaba en una espera calificada; en las demás maniobras, nada. */
export const entradaDe = (r: ResultadoComun | null | undefined): Entrada | undefined => (r as { correcta?: Entrada } | null | undefined)?.correcta;

export const crearRepaso = (modo: Modo, sorteo: ManiobraId[], nivel: Nivel = 3, programa: "vfr" | "ifr" = "vfr"): EstadoRepaso => ({
  etapa: "rampa", modo, sorteo, actual: 0, hechas: sorteo.map((id) => ({ id, resultado: null, intentoId: null })), zona: null, vuelo: null, tomas: crearTomas(),
  nivel: modo !== "checkride" ? nivel : programa === "ifr" ? (Math.max(2, nivel) as Nivel) : 3,
  programa, vor: null, sinSenalDesde: null,
});

/** IFR: hay señal del VOR de la lección en NAV1 (o está en el cono, encima de él) y la barra es del VOR, no del GPS. */
export const conSenal = (m: Muestra, vor: VorElegido) => !!conCono(m, vor).navSenal && !m.gpsNav && m.navMhz !== undefined && Math.abs(m.navMhz - vor.mhz) < 0.03;

/** IFR: el VOR se elige en la rampa o, a más tardar, en la salida. */
export function ponerVor(e: EstadoRepaso, v: VorElegido): EstadoRepaso {
  if (e.etapa !== "rampa" && e.etapa !== "salida") return e;
  return { ...e, vor: v, motivo: e.motivo === T.es.eligeVor || e.motivo === T.en.eligeVor ? undefined : e.motivo };
}

/** IFR, al cerrar «Antes del despegue» en tierra: qué sintonizar y, en la lección 4, la autorización (`extra`). Una vez. */
export function instruirEnRampa(e: EstadoRepaso, idioma: Idioma, extra?: string): Paso {
  if (e.programa !== "ifr" || e.etapa !== "rampa" || !e.vor || e.instruido) return { estado: e, decir: [] };
  const texto = T[idioma].sintonizaRampa(e.vor.mhz.toFixed(2), e.vor.ident);
  return { estado: { ...e, instruido: true }, decir: [extra ? `${texto} ${extra}` : texto] };
}

const anular = (e: EstadoRepaso, motivo: string, idioma: Idioma): Paso => ({ estado: { ...e, etapa: "invalido", motivo: traducirMotivo(motivo, idioma) }, decir: [] });

/** Sin aeropuerto del lector al despegar: la zona va al través de la pista por donde despegó. */
function zonaSinAeropuerto(m: Muestra): Zona | null {
  if (m.lat === undefined || m.lon === undefined) return null;
  const e = { ident: "", rumboV: m.rumboV ?? m.rumbo, lat: m.lat, lon: m.lon };
  return zonaRepaso({ icao: "", nombre: "", lat: m.lat, lon: m.lon, elevacionFt: 0, pistas: [{ extremos: [e, e], largoFt: 1, anchoFt: 1 }], frecuencias: [] });
}

/** Cada muestra del lector. `enCurso`: hay una maniobra en curso; salir de la zona no la interrumpe. */
export function alMuestrearRepaso(e: EstadoRepaso, m: Muestra, a: Aeropuerto | null, idioma: Idioma, azar = Math.random, enCurso = false): Paso {
  if (e.etapa === "terminado" || e.etapa === "invalido") return { estado: e, decir: [] };
  const t = T[idioma];
  if (!e.vuelo) {
    const vuelo = armarVuelo(m, a, e.programa === "ifr");
    if (vuelo.fase === "invalido") return anular({ ...e, vuelo }, vuelo.motivo ?? "", idioma);
    if (e.programa === "ifr") return { estado: { ...e, vuelo, avion: avionDe(m.titulo) }, decir: [] };
    const zona = zonaRepaso(vuelo.aeropuerto, azar);
    return { estado: { ...e, vuelo, zona, motivo: zona ? undefined : t.espera }, decir: [] };
  }
  const previo = e.vuelo.previo;
  if (previo?.lat !== undefined && previo.lon !== undefined && m.lat !== undefined && m.lon !== undefined && m.t > previo.t) {
    const d = aNm(m.lat, m.lon, previo.lat, previo.lon);
    const nm = Math.hypot(d.x, d.y);
    if (nm > SALTO_NM && (nm / (m.t - previo.t)) * 3600 > SALTO_KT) return { estado: { ...e, etapa: "invalido", motivo: t.salto }, decir: [] };
  }
  // MSFS se cerró o se colgó en el aire: al volver el avión aparece en otro lado y no se puede seguir el vuelo.
  if (previo && !previo.enTierra && m.t - previo.t > HUECO_AIRE_SEG) return { estado: { ...e, etapa: "invalido", motivo: t.hueco }, decir: [] };
  const vuelo = avanzarVuelo(e.vuelo, m, a);
  if (vuelo.fase === "invalido") return anular({ ...e, vuelo }, vuelo.motivo ?? "", idioma);
  const nuevos = vuelo.eventos.slice(e.vuelo.eventos.length);
  let tomas = medirTomas(e.tomas, previo, m, vuelo.fase, e.etapa === "regreso");
  const aterrizo = nuevos.find((x) => x.tipo === "aterrizaje");
  // Sin aeropuerto no hay pistas con qué comparar: no se sabe.
  if (aterrizo) tomas = { ...tomas, tocoEnPista: vuelo.aeropuerto ? aterrizo.pista != null : null };

  let etapa: EtapaRepaso = e.etapa;
  let { zona, motivo, sinSenalDesde } = e;
  const decir: string[] = [];
  const circuitos = deCircuitos(e);
  const piso = pisoZona(e.sorteo[e.actual]);
  const vor = e.vor;
  if (e.programa === "ifr") {
    // Sin zona: los ejercicios se hacen donde haya señal del VOR, arriba de 1,000 ft AGL.
    const senal = !!vor && conSenal(m, vor);
    if (etapa === "rampa" && nuevos.some((x) => x.tipo === "despegue")) {
      etapa = "salida";
      if (vor) decir.push((e.instruido ? t.recuerda : t.sintoniza)(vor.mhz.toFixed(2), vor.ident));
      else motivo = t.eligeVor;
    } else if (etapa === "salida") {
      if (!vor) motivo = t.eligeVor;
      else if (m.agl >= PISO_IFR_AGL && !m.enTierra && senal) {
        etapa = "maniobra";
        motivo = undefined;
        sinSenalDesde = null;
        decir.push(t.conSenal(vor.ident));
      }
    } else if (etapa === "maniobra" && vor) {
      if (senal) sinSenalDesde = null;
      else {
        sinSenalDesde = sinSenalDesde ?? m.t;
        if (m.t - sinSenalDesde > SIN_SENAL_SEG) {
          etapa = "fuera-de-zona";
          decir.push(t.sinSenal(vor.ident));
        }
      }
    } else if (etapa === "fuera-de-zona" && vor && senal) {
      etapa = "maniobra";
      sinSenalDesde = null;
      decir.push(t.devueltaSenal(vor.ident));
    }
  } else if (etapa === "rampa" && circuitos) {
    // Se arma en la carrera para medir la rotación.
    if (vuelo.fase === "carrera-despegue") {
      etapa = "maniobra";
      motivo = undefined;
      decir.push(t.circuito(1, e.sorteo.length, true));
    }
  } else if (etapa === "rampa") {
    zona = zona ?? zonaRepaso(vuelo.aeropuerto, azar);
    motivo = zona ? undefined : t.espera;
    if (nuevos.some((x) => x.tipo === "despegue")) {
      zona = zona ?? zonaSinAeropuerto(m);
      motivo = undefined;
      etapa = "salida";
      if (zona) decir.push(t.salida(zona.nombre[idioma], piso < ALTURA_SEGURA_AGL));
    }
  } else if (etapa === "salida") {
    if (zona && enZona(m, zona, piso)) {
      etapa = "maniobra";
      decir.push(t.enZona(nombreManiobra(e.sorteo[e.actual], idioma)));
    }
  } else if (etapa === "maniobra") {
    if (zona && !circuitos && !enCurso && fueraDeZona(m, zona, piso)) {
      etapa = "fuera-de-zona";
      decir.push(t.fuera);
    }
  } else if (etapa === "fuera-de-zona") {
    if (zona && enZona(m, zona, piso)) {
      etapa = "maniobra";
      decir.push(t.devuelta(nombreManiobra(e.sorteo[e.actual], idioma)));
    }
  }
  // En los circuitos cada toque es parte de la maniobra; detenerse en la pista sí termina.
  if (etapa !== "regreso" && (circuitos ? vuelo.fase === "rodaje-regreso" : aterrizo)) etapa = "regreso";
  if (vuelo.fase === "terminado") etapa = "terminado";
  return { estado: { ...e, etapa, zona, motivo, vuelo, tomas, sinSenalDesde }, decir };
}

function avanzarManiobra(e: EstadoRepaso, idioma: Idioma): Paso {
  const actual = e.actual + 1;
  const t = T[idioma];
  if (actual >= e.sorteo.length) return { estado: { ...e, actual, etapa: "regreso" }, decir: [deCircuitos(e) ? t.finCircuitos : t.regreso] };
  if (deCircuitos(e)) return { estado: { ...e, actual }, decir: [t.circuito(actual + 1, e.sorteo.length, false)] };
  const id = e.sorteo[actual];
  if (e.programa === "ifr") return { estado: { ...e, actual }, decir: [t.siguienteIfr] };
  return { estado: { ...e, actual }, decir: [T[idioma].siguiente(nombreManiobra(id, idioma), e.sorteo.slice(0, actual).includes(id))] };
}

const enManiobras = (e: EstadoRepaso) => e.etapa === "maniobra" || e.etapa === "fuera-de-zona";

/** Un resultado calificado de la maniobra actual, ya guardado (id null si no se pudo). */
export function alResultado(e: EstadoRepaso, r: ResultadoComun, intentoId: string | null, idioma: Idioma): Paso {
  if (!enManiobras(e)) return { estado: e, decir: [] };
  const hechas = e.hechas.map((h, i) => (i === e.actual ? { ...h, resultado: r, intentoId } : h));
  const estado = { ...e, hechas };
  // Un circuito no se repite en el aire: el siguiente ya va en camino.
  if (e.modo === "checkride" || r.aprobado || deCircuitos(e)) return avanzarManiobra(estado, idioma);
  return { estado, decir: [T[idioma].repetir] };
}

/** Solo en práctica: dejar la maniobra actual como está y pasar a la siguiente. */
export function siguienteManiobra(e: EstadoRepaso, idioma: Idioma): Paso {
  if (e.modo !== "practica" || !enManiobras(e)) return { estado: e, decir: [] };
  return avanzarManiobra(e, idioma);
}

export const armaManiobra = (e: EstadoRepaso) => e.etapa === "maniobra";
export const maniobraActual = (e: EstadoRepaso): ManiobraId | null => (enManiobras(e) ? e.sorteo[e.actual] : null);
