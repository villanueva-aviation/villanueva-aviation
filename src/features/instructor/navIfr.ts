import { entradaEspera, generarSituacion, norm, type Entrada, type Giros } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { normalizar } from "./preguntas.ts";
import { CONO_NM, distanciaVor, radialPorPosicion, type VorElegido } from "./vorSim.ts";

// Geometría del VOR y los ejercicios del programa IFR. Puro.
// Radiales y cursos en grados magnéticos, como los da el radio NAV1.

/** Normal: el radial pedido queda delante (a menos de 90° del del avión); ruta pasada: queda atrás (Erik, 2026-11-13). */
export type TipoTramo = "normal" | "pasada";
/** Un tramo del vuelo encadenado: alejándose (FROM) o acercándose (TO). `esperarNm`: no se anuncia antes de esa distancia. */
export type Tramo = { desde: boolean; tipo: TipoTramo; esperarNm?: number };
/**
 * `curso`: lo que va en el OBS. Alejándose (FROM) es el radial; acercándose (TO), el radial + 180.
 * `referencia`: el radial (o, junto al VOR, el rumbo) contra el que se decide si es normal o ruta pasada.
 */
export type Ejercicio = { tipo: TipoTramo; radial: number; desde: boolean; curso: number; referencia: number };

export const norm180 = (g: number) => ((((g + 180) % 360) + 360) % 360) - 180;
export const norm360 = (g: number) => ((g % 360) + 360) % 360;
export const redondear10 = (g: number) => norm360(Math.round(g / 10) * 10);

/** La espera de la lección 4: de la carta del cadete o inventada. `acercamiento`: el curso hacia el VOR. */
/** altitudFt: la de la carta, o la que propone el programa; sin ella sale del terreno al armar. */
export type DatosEspera = { acercamiento: number; giros: Giros; tramoSeg: number; carta: boolean; altitudFt?: number };

/** La altitud de una espera inventada: elevación + 3000 ft, al millar de arriba (MMGL 5016 → 9000, Erik 2026-11-11). */
export const altitudEspera = (elevacionFt: number) => Math.ceil((elevacionFt + 3000) / 1000) * 1000;

/**
 * ¿Ya está del otro lado de la estación respecto a `radialLado`? Con histéresis: pasa a partir de 100° y regresa a 80° o menos,
 * para que el radial que oscila sobre la estación no cuente dos pasos.
 */
export function pasoEstacion(antes: boolean, radialAvion: number, radialLado: number): boolean {
  const d = Math.abs(norm180(radialAvion - radialLado));
  return antes ? d > 80 : d >= 100;
}

/** Grados de desvío: positivo si el avión está a la derecha del curso, mirando hacia donde va el curso. */
export function desvioGrados(ej: Pick<Ejercicio, "radial" | "desde">, radialAvion: number): number {
  const d = norm180(radialAvion - ej.radial);
  return ej.desde ? d : -d;
}

/** Puntos de la barra: uno cada 2° en un VOR. */
export const puntos = (grados: number) => grados / 2;

export const tipoDe = (radial: number, referencia: number): TipoTramo => (Math.abs(norm180(radial - referencia)) > 90 ? "pasada" : "normal");

/** Normal a 20–60° de la referencia, ruta pasada a 120–160°: en decenas, nunca a menos de 10° de la frontera de 90°. */
export function generarTramo(tramo: Tramo, referencia: number, azar: () => number = Math.random): Ejercicio {
  const signo = azar() < 0.5 ? 1 : -1;
  const desfase = (tramo.tipo === "normal" ? 20 : 120) + 10 * Math.floor(azar() * 5);
  const radial = redondear10(referencia + signo * desfase);
  return { tipo: tramo.tipo, radial, desde: tramo.desde, curso: tramo.desde ? radial : norm360(radial + 180), referencia };
}

/** Los tramos de la lección: 4 seguidos en práctica, 2 en el examen; el de la lección 2 mezcla una normal y una pasada. */
export function tramosDe(leccion: 1 | 2, examen: boolean, azar: () => number = Math.random): Tramo[] {
  if (examen) {
    if (leccion === 1) return [{ desde: true, tipo: "normal" }, { desde: false, tipo: "normal" }];
    return azar() < 0.5 ? [{ desde: true, tipo: "pasada" }, { desde: false, tipo: "normal" }] : [{ desde: true, tipo: "normal" }, { desde: false, tipo: "pasada" }];
  }
  const tipo: TipoTramo = leccion === 1 ? "normal" : "pasada";
  // Lección 2: tras pasar el VOR, a 3 NM, para que haya un «al través» (Erik, 2026-11-13).
  return [{ desde: true, tipo }, { desde: false, tipo }, tipo === "pasada" ? { desde: true, tipo, esperarNm: 3 } : { desde: true, tipo }, { desde: false, tipo }];
}

/** Contra qué se mide el tramo: junto al VOR, la pista (o el rumbo); lejos, el radial del avión. */
export function referenciaTramo(m: Muestra, vor: VorElegido | undefined, rumboPista?: number): number {
  const dist = vor ? distanciaVor(m, vor) : m.navTieneDme ? (m.navDme ?? null) : null;
  if (dist !== null && dist < CONO_NM) return rumboPista ?? m.rumbo;
  return m.navRadial ?? (vor ? radialPorPosicion(m, vor) : null) ?? m.rumbo;
}

/**
 * Lección 3: vuela el radial `desde` hasta el arco de `radioNm`, lo sigue hasta `hasta` y sale por él.
 * `sentido` +1 = radiales crecientes. `alejandose`: llega al arco desde adentro.
 * `saleAlejandose`: sale del arco alejándose por `hasta` (arco de salida); si falta, acercándose (los de antes del 16/11).
 */
export type EjercicioArco = { radioNm: number; desde: number; hasta: number; sentido: 1 | -1; alejandose: boolean; saleAlejandose?: boolean };

/** Hacia dónde vira el cadete para entrar al arco: la pregunta del ejercicio. */
export type Lado = "derecha" | "izquierda";

/** Hacia dónde vira al llegar al arco: depende del sentido y de si llega alejándose o acercándose. */
export const viraALaDerecha = (ej: EjercicioArco) => (ej.sentido > 0) === ej.alejandose;

/** Lección 3 encadenada: el regreso se anuncia a esta distancia (o donde vaya, si ya está más lejos). */
export const REGRESO_NM = 10;
/** El arco del regreso queda tantas millas más acá de donde se establece en el radial de acercamiento. */
const REGRESO_ADENTRO_NM = 3;
const ARCO_MIN_NM = 4;

const giroArco = (azar: () => number) => (3 + Math.floor(azar() * 4)) * 10;

/** Arco de salida (Erik, 2026-11-16): alejándose por el radial del avión, el arco a 6–9 NM (sorteado, y al menos 4 NM más allá
 * del avión), y sale alejándose 30–60° después. */
export function generarArcoSalida(radialAvion: number, dme: number, azar: () => number = Math.random): EjercicioArco {
  const desde = redondear10(radialAvion);
  const radioNm = Math.min(18, Math.max(Math.round(dme) + 4, 6 + Math.floor(azar() * 4)));
  const sentido: 1 | -1 = azar() < 0.5 ? 1 : -1;
  return { radioNm, desde, hasta: norm360(desde + sentido * giroArco(azar)), sentido, alejandose: true, saleAlejandose: true };
}

/** Arco de regreso: ya establecido acercándose por `radial`, el arco 3 o 4 NM más acá (sorteado), y se acerca por otro radial 30–60° después. */
export function generarArcoRegreso(radial: number, dme: number, azar: () => number = Math.random): EjercicioArco {
  const radioNm = Math.max(ARCO_MIN_NM, Math.floor(dme - REGRESO_ADENTRO_NM - Math.floor(azar() * 2)));
  const sentido: 1 | -1 = azar() < 0.5 ? 1 : -1;
  return { radioNm, desde: norm360(radial), hasta: norm360(radial + sentido * giroArco(azar)), sentido, alejandose: false, saleAlejandose: false };
}

/** El radial de acercamiento del regreso: 30° a un lado del radial del avión, para interceptarlo como en la lección 1. */
export const radialRegreso = (radialAvion: number, azar: () => number = Math.random) => redondear10(radialAvion + (azar() < 0.5 ? 30 : -30));

/** Lección 5 (spec 2026-11-16): la autorización de la llegada se da a esta distancia. */
export const LLEGADA_NM = 15;
/** Una llegada: interceptar `r1` acercándose, el arco hasta su `hasta` (R2), acercarse al VOR y la espera. */
export type Llegada = { r1: number; arco: EjercicioArco; espera: DatosEspera; entrada: Entrada };
/** El radial de alejamiento de la espera (donde está el patrón). */
export const radialEsperaDe = (ll: Llegada) => norm360(ll.espera.acercamiento + 180);
/** Antes de la siguiente llegada se aleja siguiendo de largo por R2 después del VOR. */
export const alejamientoSiguiente = (anterior: Llegada) => norm360(anterior.arco.hasta + 180);

const ENTRADAS: Entrada[] = ["directa", "paralela", "gota"];

/** Interceptando R1 a 30° se establece al menos esto antes del arco (Erik, 2026-11-16: a 20–40° llegaba encima del arco). */
const MARGEN_ARCO_NM = 3;

/**
 * R1 a 5–15° del avión (el radial de 10 en 10 de al lado), arco de 8–10 NM (más chico si con 30° no cabe) hasta 30–60° más
 * allá, y una espera lejos de R2 con otra entrada que la anterior.
 */
export function generarLlegada(radialAvion: number, altitudFt: number, anterior?: Llegada, azar: () => number = Math.random): Llegada {
  const signo = azar() < 0.5 ? 1 : -1;
  const r1 = redondear10(radialAvion + signo * 10);
  // A 30° desde las 15 NM (16 con el viraje) llega a R1 a 2·D·sen(30° − Δ) del VOR.
  const delta = (Math.abs(norm180(r1 - radialAvion)) * Math.PI) / 180;
  const llega = 2 * (LLEGADA_NM + 1) * Math.sin(Math.PI / 6 - delta);
  const radioNm = Math.max(ARCO_MIN_NM, Math.min(8 + Math.floor(azar() * 3), Math.floor(llega - MARGEN_ARCO_NM)));
  const sentido: 1 | -1 = azar() < 0.5 ? 1 : -1;
  const hasta = norm360(r1 + sentido * giroArco(azar));
  const opciones = ENTRADAS.filter((x) => x !== anterior?.entrada);
  const entrada = opciones[Math.floor(azar() * opciones.length)];
  // Igual que rutaEspera: la entrada vale con ±10° de rumbo de llegada.
  const candidatos = (["derecha", "izquierda"] as Giros[]).flatMap((giros) =>
    Array.from({ length: 36 }, (_, k) => k * 10)
      .filter((r) => Math.abs(norm180(r - hasta)) >= 30 && [-10, 0, 10].every((d) => entradaEspera(norm360(hasta + 180 + d), r, giros) === entrada))
      .map((r) => ({ r, giros })),
  );
  const { r, giros } = candidatos[Math.floor(azar() * candidatos.length)];
  return {
    r1,
    arco: { radioNm, desde: r1, hasta, sentido, alejandose: false, saleAlejandose: false },
    espera: { acercamiento: norm360(r + 180), giros, tramoSeg: 60, carta: false, altitudFt },
    entrada,
  };
}

/** Lección 4 sin carta: la espera de las preguntas de esperas, con tramos de un minuto. */
export function inventarEspera(azar: () => number = Math.random, elevacionFt?: number): DatosEspera {
  const s = generarSituacion(azar);
  const e: DatosEspera = { acercamiento: norm(s.alejamiento + 180), giros: s.giros, tramoSeg: 60, carta: false };
  return elevacionFt === undefined ? e : { ...e, altitudFt: altitudEspera(elevacionFt) };
}

/**
 * Lección 4, la salida guiada (Erik, 2026-11-11): el radial de regreso cae en la zona de `entrada`, a 10° o más de sus
 * fronteras, y el de salida queda a 20–40° de él (a 10 NM, unas 3.5–6 NM para interceptar). `llegada` fija el regreso.
 */
export function rutaEspera(alejamiento: number, giros: Giros, entrada: Entrada, azar: () => number = Math.random, llegada?: number): { salida: number; llegada: number } {
  const ok = (r: number) => [-10, 0, 10].every((d) => entradaEspera(norm(r + 180 + d), alejamiento, giros) === entrada);
  const candidatos = Array.from({ length: 36 }, (_, k) => k * 10).filter(ok);
  const l = llegada ?? candidatos[Math.floor(azar() * candidatos.length)];
  const giro = (2 + Math.floor(azar() * 3)) * 10 * (azar() < 0.5 ? -1 : 1);
  return { llegada: l, salida: norm360(l + giro) };
}

/** Las entradas que valen con cualquiera de estos rumbos de llegada (cerca de una frontera valen las dos). */
export function entradasValidas(rumbos: number[], alejamiento: number, giros: Giros): Entrada[] {
  return [...new Set(rumbos.map((r) => entradaEspera(norm(r), alejamiento, giros)))];
}

const PALABRAS_ENTRADA: [Entrada, string[]][] = [
  ["directa", ["directa", "directo", "direct"]],
  ["paralela", ["paralela", "paralelo", "parallel"]],
  ["gota", ["gota", "lagrima", "teardrop", "tear drop"]],
];

const PALABRAS_TIPO: [TipoTramo, string[]][] = [
  ["normal", ["normal"]],
  ["pasada", ["pasada", "pasado", "passed", "behind"]],
];

const PALABRAS_LADO: [Lado, string[]][] = [
  ["derecha", ["derecha", "right"]],
  ["izquierda", ["izquierda", "left"]],
];

/** Hacia dónde dijo el cadete que vira al arco; si dijo los dos o ninguno, null. */
export function ladoDicho(texto: string, idioma: Idioma): Lado | null {
  const t = ` ${normalizar(texto, idioma)} `;
  const dichos = PALABRAS_LADO.filter(([, ps]) => ps.some((p) => t.includes(` ${p} `))).map(([x]) => x);
  return dichos.length === 1 ? dichos[0] : null;
}

/** Lo que contestó el cadete a «¿normal o ruta pasada?»; si dijo las dos o ninguna, null. */
export function tipoDicho(texto: string, idioma: Idioma): TipoTramo | null {
  const t = ` ${normalizar(texto, idioma)} `;
  const dichos = PALABRAS_TIPO.filter(([, ps]) => ps.some((p) => t.includes(` ${p} `))).map(([x]) => x);
  return dichos.length === 1 ? dichos[0] : null;
}

/** La entrada que dijo el cadete; si dijo dos distintas o ninguna, null. */
export function entradaDicha(texto: string, idioma: Idioma): Entrada | null {
  const t = ` ${normalizar(texto, idioma)} `;
  const dichas = PALABRAS_ENTRADA.filter(([, ps]) => ps.some((p) => t.includes(` ${p} `))).map(([e]) => e);
  return dichas.length === 1 ? dichas[0] : null;
}

/** Recto: alas niveladas. Un tramo de la entrada cuenta desde 30 s y a 60° o menos del alejamiento. */
const RECTO_GRADOS = 5;
const TRAMO_MIN_SEG = 30;
const TRAMO_INICIO_SEG = 180;
const TRAMO_RUMBO_GRADOS = 60;

/**
 * La entrada que voló, de las muestras entre el cruce del fijo y el regreso al fijo: el primer tramo recto y el sentido del
 * viraje que le sigue. Viraje contrario a los de la espera → paralela; si no, gota si el tramo iba 30° hacia el lado de la espera.
 */
export function entradaVolada(ms: Muestra[], alejamiento: number, giros: Giros): Entrada | null {
  if (!ms.length) return null;
  const t0 = ms[0].t;
  let fin = -1;
  let h1 = 0;
  for (let i = 0; i < ms.length && fin < 0; ) {
    const recto = (m: Muestra) => Math.abs(m.inclinacion) < RECTO_GRADOS && Math.abs(norm180(m.rumbo - alejamiento)) <= TRAMO_RUMBO_GRADOS;
    if (!recto(ms[i]) || ms[i].t - t0 > TRAMO_INICIO_SEG) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < ms.length && recto(ms[j + 1])) j++;
    if (ms[j].t - ms[i].t >= TRAMO_MIN_SEG) {
      fin = j;
      // Rumbo medio, alrededor del primero para no promediar mal cerca de 360.
      const r0 = ms[i].rumbo;
      h1 = r0 + ms.slice(i, j + 1).reduce((a, m) => a + norm180(m.rumbo - r0), 0) / (j - i + 1);
    }
    i = j + 1;
  }
  if (fin < 0) return null;
  let giro = 0;
  for (let k = fin + 1; k < ms.length && Math.abs(giro) < 90; k++) giro += norm180(ms[k].rumbo - ms[k - 1].rumbo);
  if (Math.abs(giro) < 90) return null;
  if ((giro > 0) !== (giros === "derecha")) return "paralela";
  const lado = giros === "derecha" ? -1 : 1;
  return Math.abs(norm180(h1 - (alejamiento + lado * 30))) < Math.abs(norm180(h1 - alejamiento)) ? "gota" : "directa";
}

/** Cerca, la barra se mueve rápido; lejos, tarda (Erik). */
export const distanciaConsejo = (dme: number): "cerca" | "lejos" | null => (dme < 5 ? "cerca" : dme > 15 ? "lejos" : null);
