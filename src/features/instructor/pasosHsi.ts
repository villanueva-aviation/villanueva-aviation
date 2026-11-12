// Los pasos de la guía del cadete Álvaro (/resumen-hsi) para la entrada que dijo, con los números del ejercicio,
// tachándose conforme la vuela (Erik, 2026-11-11). Solo en práctica. Puro.
import type { Entrada } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { radialEspera, type EvaluacionEspera } from "./evaluadorEspera.ts";
import { norm180 } from "./navIfr.ts";

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
