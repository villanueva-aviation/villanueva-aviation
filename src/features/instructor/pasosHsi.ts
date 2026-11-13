// Los pasos de la guía del cadete Álvaro (/resumen-hsi) para la entrada que dijo, con los números del ejercicio,
// tachándose conforme la vuela (Erik, 2026-11-11). Solo en práctica. Puro.
import type { Entrada } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { radialEspera, type EvaluacionEspera } from "./evaluadorEspera.ts";
import type { EvaluacionArco } from "./evaluadorArco.ts";
import type { EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import { desvioGrados, norm180, type Ejercicio } from "./navIfr.ts";
import { viraALaDerecha } from "./textosArco.ts";

export type EstadoPaso = "hecho" | "actual" | "pendiente";
export interface PasoHsi { texto: string; estado: EstadoPaso }

/** En qué momento de la entrada va cada paso: antes del fijo, virando tras el cruce, el minuto, el regreso, el fijo otra vez. */
type Momento = 0 | 1 | 2 | 3 | 4;

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
/** El lector no lee la mariposa: solo el CRS se tacha antes del fijo. */
const CRS_OK = 5;

function pasos(entrada: Entrada, i: number, o: number, estandar: boolean, en: boolean): [Momento, string][] {
  const [I, O] = [tres(i), tres(o)];
  const g = tres(o + (estandar ? -30 : 30));
  const p = tres(i + (estandar ? -30 : 30));
  const signo = estandar ? "−30°" : "+30°";
  const final: [Momento, string] = [4, en ? `Over the station, turn to ${O} again.` : `Sobre la estación, vira de nuevo al ${O}.`];
  const alCdi: [Momento, string] = [3, en ? `After the minute, turn toward the CDI side to ${I}.` : `Pasado el minuto, vira hacia el lado del CDI hasta el ${I}.`];
  const crsYMariposa: [Momento, string] = [0, en ? `CRS on ${I} (inbound) and heading bug on ${O} (outbound).` : `CRS en ${I} (inbound) y mariposa en ${O} (outbound).`];
  const estabilizado: [Momento, string] = [2, en ? "Once established, start a 1-minute timer." : "Ya estabilizado, cronómetro 1 minuto."];
  if (entrada === "directa")
    return [
      crsYMariposa,
      [1, en ? `Over the station, turn ${estandar ? "right" : "left"} to ${O}.` : `Sobre la estación, vira a la ${estandar ? "derecha" : "izquierda"} al ${O}.`],
      [2, en ? "Abeam (the flag flips), start a 1-minute timer. If you can't tell, when the turn ends." : "Al través (cambia la flechita), cronómetro 1 minuto. Si no se distingue, al terminar el viraje."],
      alCdi,
      final,
    ];
  if (entrada === "gota")
    return [
      [0, en ? `CRS on ${I} (inbound).` : `CRS en ${I} (inbound).`],
      [0, en ? `Heading bug on ${g} (outbound ${O} ${signo}).` : `Mariposa en ${g} (outbound ${O} ${signo}).`],
      [1, en ? `Over the station, turn to ${g}.` : `Sobre la estación, vira al ${g}.`],
      estabilizado,
      [2, en ? `Heading bug on ${O}; the CRS stays on ${I}.` : `Mariposa en ${O}; el CRS sigue en ${I}.`],
      alCdi,
      final,
    ];
  return [
    crsYMariposa,
    [1, en ? `Over the station, turn ${estandar ? "left" : "right"} to ${O}.` : `Sobre la estación, vira a la ${estandar ? "izquierda" : "derecha"} al ${O}.`],
    estabilizado,
    [3, en ? `After the minute, turn about 210° the same way, to ${p}. Heading bug on ${p}.` : `Pasado el minuto, vira unos 210° por el mismo lado, hasta el ${p}. Mariposa en ${p}.`],
    [3, en ? `When the CDI comes alive, turn toward the station side to ${I}.` : `CDI vivo: vira hacia el lado de la estación, hasta el ${I}.`],
    [3, en ? `Heading bug on ${O}.` : `Mariposa en ${O}.`],
    final,
  ];
}

const momento = (e: EvaluacionEspera): Momento =>
  e.fase === "vueltas" || e.fase === "terminado" ? 4 : e.fase !== "entrada" ? 0 : e.tramo ? 2 : e.vistoTramo ? 3 : 1;

/** Los pasos de la entrada que dijo; null en el examen o si todavía no la dice. */
export function pasosHsi(e: EvaluacionEspera, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  if (e.examen || !e.dicha || e.fase === "invalido") return null;
  const ej = e.ejercicio;
  const ahora = momento(e);
  const crs = m.navObs !== undefined && Math.abs(norm180(m.navObs - ej.acercamiento)) <= CRS_OK;
  const lista = pasos(e.dicha, ej.acercamiento, radialEspera(ej), ej.giros === "derecha", idioma === "en");
  // De nuevo sobre el fijo, la entrada ya quedó.
  const hecho = lista.map(([mo], k) => mo < ahora || ahora === 4 || (k === 0 && crs));
  const actual = hecho.indexOf(false);
  return lista.map(([, texto], k) => ({ texto, estado: hecho[k] ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

// Lecciones 1 a 3 (Erik, 2026-11-13): las tarjetas de la guía con los números del ejercicio. El rumbo que se ve
// en la muestra tacha los virajes; la mariposa no se lee, se tacha con el viraje que sigue.
/** Cuánto puede faltarle al rumbo para dar el viraje por hecho. */
const CERCA = 15;
const cerca = (m: Muestra, rumbo: number) => Math.abs(norm180(m.rumbo - rumbo)) <= CERCA;
const crsEn = (m: Muestra, curso: number) => m.navObs !== undefined && Math.abs(norm180(m.navObs - curso)) <= CRS_OK;
const conEstados = (lista: [boolean, string][]): PasoHsi[] => {
  const actual = lista.findIndex(([h]) => !h);
  return lista.map(([h, texto], k) => ({ texto, estado: h ? "hecho" : k === actual ? "actual" : "pendiente" }));
};
const lado = (derecha: boolean, en: boolean) => (en ? (derecha ? "right" : "left") : derecha ? "derecha" : "izquierda");

/**
 * Lecciones 1 y 2: la tarjeta del tramo, hasta que el cadete contesta «normal» o «ruta pasada» (no se le adelanta la
 * respuesta). Sale la tarjeta que toca aunque haya contestado mal: ya se le corrigió de voz.
 */
export function pasosInterceptacion(e: EvaluacionInterceptacion, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  const ej = e.ejercicio;
  if (e.examen || e.fase === "invalido" || e.fase === "esperando" || !ej || e.dicho === undefined) return null;
  if (ej.tipo === "pasada") return pasosPasada(e, ej, m, idioma === "en");
  const ref = (ej as Partial<Ejercicio>).referencia ?? e.inicio.navRadial;
  if (ref === undefined) return null;
  const en = idioma === "en";
  const { curso, desde } = ej;
  // DC30 acercándose (cabeza de la flecha), CD45 alejándose (cola), con el radial de donde salió el tramo.
  const flecha = desde ? ref : ref + 180;
  const signo = Math.sign(norm180(desde ? curso - flecha : flecha - curso)) || 0;
  const vira = desde ? curso + 45 * signo : flecha + 30 * signo;
  const [D, F, X] = [tres(curso), tres(flecha), tres(vira)];
  const listo = e.fase === "establecido" || e.fase === "terminado";
  const virado = listo || cerca(m, vira) || (m.navDesv !== undefined && Math.abs(m.navDesv) <= 10);
  return conEstados([
    [virado, en ? `Heading bug on ${D} (${desde ? "heading and radial match" : "desired heading"}).` : `Mariposa en ${D} (${desde ? "rumbo y radial coinciden" : "rumbo deseado"}).`],
    [
      virado,
      desde
        ? en ? `CD45: tail ${F}, desired ${D}, 45° past: turn to ${X}.` : `CD45: cola ${F}, deseada ${D}, me paso 45°: vira al ${X}.`
        : en ? `DC30: desired ${D}, head ${F}, 30° past: turn to ${X}.` : `DC30: deseada ${D}, cabeza ${F}, me paso 30°: vira al ${X}.`,
    ],
    [listo || crsEn(m, curso), en ? `CRS on ${D}.` : `CRS en ${D}.`],
    [
      listo,
      desde
        ? en ? `CDI alive: turn away from the station, to ${D}.` : `CDI vivo: vira al lado contrario de la estación, al ${D}.`
        : en ? `CDI alive: turn toward the station, to ${D}.` : `CDI vivo: vira hacia la estación, al ${D}.`,
    ],
  ]);
}

/**
 * Lección 2 (las tarjetas de /resumen-hsi): alejándose, regla de los 45°; acercándose, regla de 1 minuto. El lado de la
 * estación es de qué lado de la línea del radial va el avión: en vivo mientras se reposiciona (vuela paralelo, no la
 * cruza) y, ya midiendo, el que fijó el evaluador, para que el número no cambie al cruzar el radial.
 */
function pasosPasada(e: EvaluacionInterceptacion, ej: Ejercicio, m: Muestra, en: boolean): PasoHsi[] {
  const midiendo = e.fase !== "reposicionando";
  const lado = midiendo ? e.signo : Math.sign(desvioGrados(ej, m.navRadial ?? ej.radial)) || 1;
  // `lado` es el de desvioGrados (al revés acercándose); s = −signo(radial del avión − radial pedido).
  const s = -(ej.desde ? lado : -lado);
  const listo = e.fase === "establecido" || e.fase === "terminado";
  const R = tres(ej.radial);
  if (ej.desde) {
    const q = ej.curso + 45 * s;
    const Q = tres(q);
    const en45 = listo || (e.atraves && cerca(m, q));
    return conEstados([
      [e.atraves || crsEn(m, ej.curso), en ? `Heading bug and CRS on ${R} (radial and heading match).` : `Mariposa y CRS al ${R} (radial y rumbo coinciden).`],
      [e.atraves || cerca(m, ej.curso), en ? `Turn to ${R}.` : `Vira al ${R}.`],
      [e.atraves, en ? `Abeam (the flag flips), heading bug 45° toward the station: ${Q}.` : `Al través (cambia la flechita), mariposa a 45° del lado de la estación: ${Q}.`],
      [en45, en ? `Turn to ${Q}.` : `Vira al ${Q}.`],
      [listo, en ? `CDI alive: turn away from the station, to ${R}.` : `CDI vivo: vira al lado contrario de la estación, al ${R}.`],
    ]);
  }
  const g = ej.radial + 90 * s;
  const C = tres(ej.curso);
  const virado = e.atraves || cerca(m, ej.radial);
  return conEstados([
    [virado, en ? `Heading bug on ${R} (requested radial).` : `Mariposa al ${R} (radial solicitado).`],
    [e.atraves || crsEn(m, ej.curso), en ? `CRS on ${C} (opposite heading).` : `CRS al ${C} (rumbo contrario).`],
    [virado, en ? `Turn to ${R}.` : `Vira al ${R}.`],
    [e.atraves, en ? "Abeam (the flag flips), start a 1-minute timer." : "Al través (cambia la flechita), cronómetro 1 minuto."],
    [listo || (midiendo && cerca(m, g)), en ? `After the minute, turn 90° toward the CDI side: ${tres(g)}.` : `Pasado el minuto, vira 90° hacia el lado del CDI: ${tres(g)}.`],
    [listo, en ? `CDI alive: turn toward the station, to ${C}.` : `CDI vivo: vira hacia la estación, al ${C}.`],
  ]);
}

/** Lección 3: media milla antes del arco y del radial; la cabeza de la flecha marca el viraje al salir. */
export function pasosArco(e: EvaluacionArco, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  if (e.examen || e.fase === "invalido") return null;
  const en = idioma === "en";
  const ej = e.ejercicio;
  const derecha = viraALaDerecha(ej);
  const rumbo = (ej.alejandose ? ej.desde : ej.desde + 180) + (derecha ? 90 : -90);
  const dme = (ej.radioNm + (ej.alejandose ? -0.5 : 0.5)).toFixed(1);
  const curso = ej.hasta + 180;
  const [C, H] = [tres(curso), tres(ej.hasta)];
  const f = e.fase;
  const enArco = f !== "hacia-arco";
  const saliendo = f === "saliendo" || f === "terminado";
  return conEstados([
    [enArco, en ? `At ${dme} DME (half a mile before the arc), turn 90° ${lado(derecha, true)}: heading ${tres(rumbo)}.` : `A ${dme} DME (media milla antes del arco), vira 90° a la ${lado(derecha, false)}: rumbo ${tres(rumbo)}.`],
    [
      saliendo,
      en
        ? `On the arc hold ${ej.radioNm} miles: if they grow, turn 10° toward the station; if they shrink, open up 10°.`
        : `En el arco mantén ${ej.radioNm} millas: si crecen, vira 10° hacia la estación; si bajan, abre 10°.`,
    ],
    [saliendo || crsEn(m, curso), en ? `CRS on ${C} (inbound course).` : `CRS en ${C} (curso de acercamiento).`],
    [
      saliendo,
      en
        ? `Half a mile before the ${H} radial, turn 90° ${lado(ej.sentido > 0, true)}, where the head of the VOR arrow points.`
        : `Media milla antes del radial ${H}, vira 90° a la ${lado(ej.sentido > 0, false)}, hacia donde apunta la cabeza de la flecha VOR.`,
    ],
    [f === "terminado", en ? `CDI alive: turn toward the station, to ${C}.` : `CDI vivo: vira hacia la estación, al ${C}.`],
  ]);
}

/** La guía para la maniobra que se esté volando; null si no tiene (o en el examen). */
export function pasosHsiDe(id: string, ev: unknown, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  if (id === "espera") return pasosHsi(ev as EvaluacionEspera, m, idioma);
  if (id === "interceptar-radial" || id === "ruta-pasada") return pasosInterceptacion(ev as EvaluacionInterceptacion, m, idioma);
  if (id === "arco-dme") return pasosArco(ev as EvaluacionArco, m, idioma);
  return null;
}
