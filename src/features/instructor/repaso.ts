// Lección 13, repaso general: sorteo de maniobras, zona de trabajo y la lección de rampa a rampa. Puro, para poder probarlo.
import type { Muestra } from "./evaluador.ts";
import type { Aeropuerto } from "./aeropuertoSim.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { MANIOBRAS, type ManiobraId, type ResultadoComun } from "./maniobras.ts";
import { armarVuelo, avanzarVuelo, type EvaluacionVuelo } from "./fasesVuelo.ts";
import type { Modo } from "./sesion.ts";
import { crearTomas, medirTomas, type Tomas } from "./tomas.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { aNm } from "../home/navGeo.ts";

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

export interface Zona {
  nombre: Record<Idioma, string>;
  lat: number;
  lon: number;
  radioNm: number;
}

const punto = (a: Aeropuerto, rumbo: number, nm: number) => ({
  lat: a.lat + (nm * Math.cos(rumbo * RAD)) / 60,
  lon: a.lon + (nm * Math.sin(rumbo * RAD)) / 60 / Math.cos(a.lat * RAD),
});

/** MMGL: Cajititlán o Chapala, al azar. Otro aeropuerto: 10 NM al través de la pista más larga. */
export function zonaRepaso(a: Aeropuerto | null, azar = Math.random): Zona | null {
  if (!a) return null;
  if (a.icao === "MMGL") {
    return azar() < 0.5
      ? { nombre: { es: "Cajititlán", en: "Cajititlan" }, ...punto(a, 180, 5), radioNm: 3 }
      : { nombre: { es: "Chapala", en: "Chapala" }, ...punto(a, 157.5, 15), radioNm: 5 };
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

export function enZona(m: Muestra, z: Zona): boolean {
  if (m.lat === undefined || m.lon === undefined) return false;
  const d = aNm(m.lat, m.lon, z.lat, z.lon);
  return Math.hypot(d.x, d.y) <= z.radioNm && m.agl >= ALTURA_SEGURA_AGL;
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
}
type Paso = { estado: EstadoRepaso; decir: string[] };

/** Un avión que se mueve más de esto entre dos muestras, más rápido que SALTO_KT, se movió de golpe. */
const SALTO_NM = 2;
const SALTO_KT = 200;

const T = {
  es: {
    espera: "Esperando el aeropuerto del simulador.",
    salto: "El avión se movió de golpe: la lección no se califica.",
    salida: (z: string) => `Ve a la zona de trabajo: ${z}, a 1,500 pies sobre el terreno o más.`,
    enZona: (m: string) => `Estás en la zona. Primera maniobra: ${m}.`,
    fuera: "Regresa a la zona de trabajo.",
    siguiente: (m: string, otra: boolean) => `Recto y nivelado. Siguiente maniobra: ${m}${otra ? ", con otro rumbo" : ""}.`,
    repetir: "Puedes repetirla o pasar a la siguiente.",
    regreso: "Terminamos las maniobras. Regresa al aeropuerto y aterriza.",
  },
  en: {
    espera: "Waiting for the simulator's airport.",
    salto: "The aircraft jumped to another position: this lesson won't be graded.",
    salida: (z: string) => `Head to the practice area: ${z}, at 1,500 feet above the ground or higher.`,
    enZona: (m: string) => `You're in the area. First maneuver: ${m}.`,
    fuera: "Head back to the practice area.",
    siguiente: (m: string, otra: boolean) => `Straight and level. Next maneuver: ${m}${otra ? ", on a different heading" : ""}.`,
    repetir: "You can repeat it or move on to the next one.",
    regreso: "We're done with the maneuvers. Head back to the airport and land.",
  },
};

/** «Recto y nivelado C172» → «Recto y nivelado»; «C172 steep turn» → «Steep turn». */
export function nombreManiobra(id: ManiobraId, idioma: Idioma): string {
  const t = MANIOBRAS[id].titulo[idioma].replace(/^C172 | C172$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const crearRepaso = (modo: Modo, sorteo: ManiobraId[]): EstadoRepaso => ({
  etapa: "rampa", modo, sorteo, actual: 0, hechas: sorteo.map((id) => ({ id, resultado: null, intentoId: null })), zona: null, vuelo: null, tomas: crearTomas(),
});

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
    const vuelo = armarVuelo(m, a);
    if (vuelo.fase === "invalido") return anular({ ...e, vuelo }, vuelo.motivo ?? "", idioma);
    const zona = zonaRepaso(vuelo.aeropuerto, azar);
    return { estado: { ...e, vuelo, zona, motivo: zona ? undefined : t.espera }, decir: [] };
  }
  const previo = e.vuelo.previo;
  if (previo?.lat !== undefined && previo.lon !== undefined && m.lat !== undefined && m.lon !== undefined && m.t > previo.t) {
    const d = aNm(m.lat, m.lon, previo.lat, previo.lon);
    const nm = Math.hypot(d.x, d.y);
    if (nm > SALTO_NM && (nm / (m.t - previo.t)) * 3600 > SALTO_KT) return { estado: { ...e, etapa: "invalido", motivo: t.salto }, decir: [] };
  }
  const vuelo = avanzarVuelo(e.vuelo, m, a);
  if (vuelo.fase === "invalido") return anular({ ...e, vuelo }, vuelo.motivo ?? "", idioma);
  const nuevos = vuelo.eventos.slice(e.vuelo.eventos.length);
  let tomas = medirTomas(e.tomas, previo, m, vuelo.fase, e.etapa === "regreso");
  const aterrizo = nuevos.find((x) => x.tipo === "aterrizaje");
  if (aterrizo) tomas = { ...tomas, tocoEnPista: aterrizo.pista != null };

  let etapa: EtapaRepaso = e.etapa;
  let { zona, motivo } = e;
  const decir: string[] = [];
  if (etapa === "rampa") {
    zona = zona ?? zonaRepaso(vuelo.aeropuerto, azar);
    motivo = zona ? undefined : t.espera;
    if (nuevos.some((x) => x.tipo === "despegue")) {
      zona = zona ?? zonaSinAeropuerto(m);
      motivo = undefined;
      etapa = "salida";
      if (zona) decir.push(t.salida(zona.nombre[idioma]));
    }
  } else if (etapa === "salida") {
    if (zona && enZona(m, zona)) {
      etapa = "maniobra";
      decir.push(t.enZona(nombreManiobra(e.sorteo[e.actual], idioma)));
    }
  } else if (etapa === "maniobra") {
    if (zona && !enCurso && !enZona(m, zona)) {
      etapa = "fuera-de-zona";
      decir.push(t.fuera);
    }
  } else if (etapa === "fuera-de-zona") {
    if (zona && enZona(m, zona)) etapa = "maniobra";
  }
  if (aterrizo && etapa !== "regreso") etapa = "regreso";
  if (vuelo.fase === "terminado") etapa = "terminado";
  return { estado: { ...e, etapa, zona, motivo, vuelo, tomas }, decir };
}

function avanzarManiobra(e: EstadoRepaso, idioma: Idioma): Paso {
  const actual = e.actual + 1;
  if (actual >= e.sorteo.length) return { estado: { ...e, actual, etapa: "regreso" }, decir: [T[idioma].regreso] };
  const id = e.sorteo[actual];
  return { estado: { ...e, actual }, decir: [T[idioma].siguiente(nombreManiobra(id, idioma), e.sorteo.slice(0, actual).includes(id))] };
}

const enManiobras = (e: EstadoRepaso) => e.etapa === "maniobra" || e.etapa === "fuera-de-zona";

/** Un resultado calificado de la maniobra actual, ya guardado (id null si no se pudo). */
export function alResultado(e: EstadoRepaso, r: ResultadoComun, intentoId: string | null, idioma: Idioma): Paso {
  if (!enManiobras(e)) return { estado: e, decir: [] };
  const hechas = e.hechas.map((h, i) => (i === e.actual ? { ...h, resultado: r, intentoId } : h));
  const estado = { ...e, hechas };
  if (e.modo === "checkride" || r.aprobado) return avanzarManiobra(estado, idioma);
  return { estado, decir: [T[idioma].repetir] };
}

/** Solo en práctica: dejar la maniobra actual como está y pasar a la siguiente. */
export function siguienteManiobra(e: EstadoRepaso, idioma: Idioma): Paso {
  if (e.modo !== "practica" || !enManiobras(e)) return { estado: e, decir: [] };
  return avanzarManiobra(e, idioma);
}

export const armaManiobra = (e: EstadoRepaso) => e.etapa === "maniobra";
export const maniobraActual = (e: EstadoRepaso): ManiobraId | null => (enManiobras(e) ? e.sorteo[e.actual] : null);
