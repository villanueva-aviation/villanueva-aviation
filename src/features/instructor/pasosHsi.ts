// Los pasos de la guía del cadete Álvaro (/resumen-hsi) para la entrada que dijo, con los números del ejercicio,
// tachándose conforme la vuela (Erik, 2026-11-11). Solo en práctica. Puro.
import type { Entrada } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { radialEspera, type EvaluacionEspera } from "./evaluadorEspera.ts";
import type { EvaluacionArco } from "./evaluadorArco.ts";
import type { EvaluacionInterceptacion } from "./evaluadorInterceptacion.ts";
import type { EvaluacionRuta } from "./evaluadorRuta.ts";
import { norm180 } from "./navIfr.ts";
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

/** Lección 1: DC30 acercándose (cabeza de la flecha), CD45 alejándose (cola), con el radial de cuando empezó. */
export function pasosInterceptacion(e: EvaluacionInterceptacion, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  const r0 = e.inicio.navRadial;
  if (e.examen || e.fase === "invalido" || r0 === undefined) return null;
  const en = idioma === "en";
  const { curso, desde } = e.ejercicio;
  const flecha = desde ? r0 : r0 + 180;
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

/** Lección 2: acercándose TO; sobre la estación, al radial de salida (con la regla de los 45° si gira más de 90°). */
export function pasosRuta(e: EvaluacionRuta, m: Muestra, idioma: "es" | "en"): PasoHsi[] | null {
  const ej = e.ejercicio;
  if (e.examen || !ej || e.fase === "invalido" || e.fase === "posicionando") return null;
  const en = idioma === "en";
  const entra = ej.entrada + 180;
  const derecha = norm180(ej.salida - entra) > 0;
  const quince = ej.salida + (derecha ? 45 : -45);
  const [I, S, Q] = [tres(entra), tres(ej.salida), tres(quince)];
  const fuera = e.fase !== "acercandose";
  const listo = e.fase === "terminado" || e.establecidoVuelta !== null;
  const conRegla = ej.giro > 90;
  const en45 = conRegla && fuera && cerca(m, quince);
  const sobre: [boolean, string] = [
    listo || en45 || (fuera && cerca(m, ej.salida)),
    en ? `Over the station: heading bug and CRS on ${S}; turn ${lado(derecha, true)} to ${S}.` : `Sobre la estación: mariposa y CRS en ${S}; vira a la ${lado(derecha, false)} al ${S}.`,
  ];
  const primero: [boolean, string] = [fuera, en ? `CRS on ${I} (TO): keep the needle centered toward the station.` : `CRS en ${I} (TO): mantén la barra centrada hacia la estación.`];
  if (!conRegla)
    return conEstados([primero, sobre, [listo, en ? `CDI alive: center the needle on ${S}.` : `CDI vivo: centra la barra en el ${S}.`]]);
  return conEstados([
    primero,
    sobre,
    [listo || en45, en ? `Abeam (the flag flips), heading bug on ${Q}, on the CDI side, and turn those 45°.` : `Al través (cambia la flechita), mariposa en ${Q}, del lado del CDI, y vira esos 45°.`],
    [listo, en ? `CDI alive: turn away from the station, to ${S}.` : `CDI vivo: vira al lado contrario de la estación, al ${S}.`],
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
  if (id === "interceptar-radial") return pasosInterceptacion(ev as EvaluacionInterceptacion, m, idioma);
  if (id === "ruta-vor") return pasosRuta(ev as EvaluacionRuta, m, idioma);
  if (id === "arco-dme") return pasosArco(ev as EvaluacionArco, m, idioma);
  return null;
}
