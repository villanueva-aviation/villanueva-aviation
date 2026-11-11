import { entradaEspera, generarSituacion, norm, type Entrada, type Giros } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { normalizar } from "./preguntas.ts";

// Geometría del VOR y los ejercicios del programa IFR. Puro.
// Radiales y cursos en grados magnéticos, como los da el radio NAV1.

export type CasoInterceptacion = "alejandose" | "acercandose" | "alejandose-amplio" | "acercandose-amplio" | "contrario";
/** `curso`: lo que va en el OBS. Alejándose (FROM) es el radial; acercándose (TO), el radial + 180. */
export type Ejercicio = { caso: CasoInterceptacion; radial: number; desde: boolean; curso: number };

/** Las 5 prácticas de la lección 1: el ángulo y el sentido cambian; la distancia es la que haya (el consejo la dice). */
export const CASOS_PRACTICA: CasoInterceptacion[] = ["alejandose", "acercandose", "alejandose-amplio", "acercandose-amplio", "contrario"];

export const norm180 = (g: number) => ((((g + 180) % 360) + 360) % 360) - 180;
export const norm360 = (g: number) => ((g % 360) + 360) % 360;
export const redondear10 = (g: number) => norm360(Math.round(g / 10) * 10);

/** La espera de la lección 4: de la carta del cadete o inventada. `acercamiento`: el curso hacia el VOR. */
export type DatosEspera = { acercamiento: number; giros: Giros; tramoSeg: number; carta: boolean };

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

/** Grados entre el radial del avión y el pedido para quedar a unas 2.5 NM: entre 15 y 60; amplio, 30 más (hasta 90). */
export function deltaRadial(dme: number, amplio: boolean): number {
  const base = Math.min(60, Math.max(15, (Math.asin(Math.min(1, 2.5 / Math.max(dme, 0.1))) * 180) / Math.PI));
  return Math.round(amplio ? Math.min(90, base + 30) : base);
}

export function generarEjercicio(caso: CasoInterceptacion, radialAvion: number, dme: number, rumbo: number, azar: () => number = Math.random): Ejercicio {
  if (caso === "contrario") {
    // El radial de al lado, en el sentido que obliga a virar más de 90°.
    const radial = redondear10(radialAvion + 20);
    const desde = Math.abs(norm180(radial - rumbo)) > 90;
    return { caso, radial, desde, curso: desde ? radial : norm360(radial + 180) };
  }
  const signo = azar() < 0.5 ? 1 : -1;
  const radial = redondear10(radialAvion + signo * deltaRadial(dme, caso.endsWith("amplio")));
  const desde = caso.startsWith("alejandose");
  return { caso, radial, desde, curso: desde ? radial : norm360(radial + 180) };
}

/** Lección 2: se acerca por `entrada` (curso entrada + 180, TO), pasa la estación y se aleja por `salida` (FROM). */
export type EjercicioRuta = { entrada: number; salida: number; giro: number };

/** Cuánto vira sobre la estación en cada práctica. */
export const CASOS_RUTA = [45, 90, 135];

export function generarRuta(radialAvion: number, giro: number, azar: () => number = Math.random): EjercicioRuta {
  const entrada = redondear10(radialAvion);
  const signo = azar() < 0.5 ? 1 : -1;
  return { entrada, salida: norm360(entrada + 180 + signo * giro), giro };
}

/**
 * Lección 3: vuela el radial `desde` hasta el arco de `radioNm`, lo sigue 60° hasta `hasta` y se acerca por él.
 * `sentido` +1 = radiales crecientes. `alejandose`: llega al arco desde adentro.
 */
export type EjercicioArco = { radioNm: number; desde: number; hasta: number; sentido: 1 | -1; alejandose: boolean };

/** El arco queda 4 NM más allá del avión (o más acá si ya está lejos), entre 6 y 18 NM. */
export function generarArco(radialAvion: number, dme: number, azar: () => number = Math.random): EjercicioArco {
  const desde = redondear10(radialAvion);
  const radioNm = dme <= 14 ? Math.min(18, Math.max(6, Math.round(dme) + 4)) : Math.round(dme) - 4;
  const sentido: 1 | -1 = azar() < 0.5 ? 1 : -1;
  return { radioNm, desde, hasta: norm360(desde + sentido * 60), sentido, alejandose: dme < radioNm };
}

/** Lección 4 sin carta: la espera de las preguntas de esperas, con tramos de un minuto. */
export function inventarEspera(azar: () => number = Math.random): DatosEspera {
  const s = generarSituacion(azar);
  return { acercamiento: norm(s.alejamiento + 180), giros: s.giros, tramoSeg: 60, carta: false };
}

/** Las entradas que valen con cualquiera de estos rumbos de llegada (cerca de una frontera valen las dos). */
export function entradasValidas(rumbos: number[], alejamiento: number, giros: Giros): Entrada[] {
  return [...new Set(rumbos.map((r) => entradaEspera(norm(r), alejamiento, giros)))];
}

const PALABRAS_ENTRADA: [Entrada, string[]][] = [
  ["directa", ["directa", "direct"]],
  ["paralela", ["paralela", "parallel"]],
  ["gota", ["gota", "lagrima", "teardrop", "tear drop"]],
];

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

/** El examen: una interceptación alejándose y una acercándose, sin consejos. */
export function casosExamen(azar: () => number = Math.random): [CasoInterceptacion, CasoInterceptacion] {
  return [azar() < 0.5 ? "alejandose" : "alejandose-amplio", azar() < 0.5 ? "acercandose" : "acercandose-amplio"];
}

/** Cerca, la barra se mueve rápido; lejos, tarda (Erik). */
export const distanciaConsejo = (dme: number): "cerca" | "lejos" | null => (dme < 5 ? "cerca" : dme > 15 ? "lejos" : null);
