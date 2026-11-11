import type { Muestra } from "./evaluador.ts";
import { CAMPOS_RUTA, MIN_INICIO_NM, type CampoRuta, type EvaluacionRuta, type ResultadoRuta } from "./evaluadorRuta.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { desvioGrados, norm180, norm360, puntos } from "./navIfr.ts";
import { tolRuta, type Nivel } from "./nivel.ts";
import { ANULADO, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en las rutas de acercamiento y alejamiento (programa IFR, lección 2). Puro.

export type PasoRuta = "posiciona" | "acercate" | "alejate" | "terminado" | "invalido";

export function pasoRuta(e: EvaluacionRuta | null, _m: Muestra | null): PasoRuta | null {
  if (!e) return null;
  if (e.fase === "terminado" || e.fase === "invalido") return e.fase;
  return e.fase === "posicionando" ? "posiciona" : e.fase === "acercandose" ? "acercate" : "alejate";
}

const tres = (r: number) => String(Math.round(norm360(r)) || 360).padStart(3, "0");
const numero = (x: number) => String(Math.round(x * 10) / 10);
const puntosTexto = (p: number, en: boolean) =>
  p === 1 ? (en ? "one dot" : "un punto") : p === 0.5 ? (en ? "half a dot" : "medio punto") : `${numero(p)} ${en ? "dots" : "puntos"}`;

function texto(paso: PasoRuta, e: EvaluacionRuta | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (!e) return "";
  const ej = e.ejercicio;
  // «Acércate a TST» / «Acércate al VOR».
  const de = e.vor ? ` ${e.vor}` : en ? " the VOR" : "l VOR";
  switch (paso) {
    case "posiciona":
      return en ? `Fly away from the VOR: we start at ${MIN_INICIO_NM} miles.` : `Aléjate del VOR: a ${MIN_INICIO_NM} millas empezamos.`;
    case "acercate":
      if (!ej) return "";
      return en
        ? `Fly inbound to${de} on the ${tres(ej.entrada)} radial: course ${tres(ej.entrada + 180)} TO. After the station, fly outbound on the ${tres(ej.salida)} radial.`
        : `Acércate a${de} por el radial ${tres(ej.entrada)}: curso ${tres(ej.entrada + 180)} TO. Después de la estación, aléjate por el radial ${tres(ej.salida)}.`;
    case "alejate":
      if (!ej) return "";
      return en
        ? `Station passage: turn to the ${tres(ej.salida)} radial and set ${tres(ej.salida)} on the OBS.`
        : `Pasaste la estación: vira al radial ${tres(ej.salida)} y pon ${tres(ej.salida)} en el OBS.`;
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(e.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenRuta(antes: PasoRuta | null, ahora: PasoRuta | null, e: EvaluacionRuta | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, e, idioma) || null;
}

export function textoPasoRuta(paso: PasoRuta | null, e: EvaluacionRuta | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, e, idioma);
}

const PASOS: PasoRuta[] = ["posiciona", "acercate", "alejate"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Aléjate a 5 millas", "Acércate por el radial", "Aléjate por el otro radial"],
  en: ["Fly out to 5 miles", "Fly inbound on the radial", "Fly outbound on the new radial"],
};

export function listaPasosRuta(paso: PasoRuta | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerRuta(paso: PasoRuta | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "posiciona") return en ? "Fly away from the VOR; the exercise starts by itself." : "Aléjate del VOR; el ejercicio empieza solo.";
  if (paso === "acercate")
    return en ? "Keep the needle centered with TO on the flag; correct for the wind with small heading changes." : "Mantén la barra centrada con TO en la bandera; corrige el viento con cambios pequeños de rumbo.";
  if (paso === "alejate") return en ? "Set the new course on the OBS, check FROM and keep the needle centered." : "Pon el curso nuevo en el OBS, revisa que diga FROM y mantén la barra centrada.";
  return "";
}

/** El desvío de ahora en puntos contra el radial de la fase. */
function desvioAhora(e: EvaluacionRuta, m: Muestra): number | null {
  const ej = e.ejercicio;
  if (!ej || m.navRadial === undefined) return null;
  return e.fase === "acercandose" ? puntos(desvioGrados({ radial: ej.entrada, desde: false }, m.navRadial)) : puntos(desvioGrados({ radial: ej.salida, desde: true }, m.navRadial));
}

export function semaforoRuta(e: EvaluacionRuta | null, m: Muestra | null): Record<CampoRuta, Luz> {
  const gris: Record<CampoRuta, Luz> = { acercamiento: "gris", alejamiento: "gris" };
  if (!e || !m || (e.fase !== "acercandose" && e.fase !== "alejandose")) return gris;
  const d = desvioAhora(e, m);
  if (d === null) return gris;
  const T = tolRuta(e.nivel);
  return e.fase === "acercandose" ? { ...gris, acercamiento: luz(Math.abs(d), T.puntos) } : { ...gris, alejamiento: luz(Math.abs(d), T.puntos) };
}

/** El OBS mal puesto, la deriva (solo práctica) y la altitud (no se califica, spec). */
export function avisoRuta(e: EvaluacionRuta | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (!e || !m || !e.ejercicio || (e.fase !== "acercandose" && e.fase !== "alejandose")) return null;
  const en = idioma === "en";
  const curso = e.fase === "acercandose" ? e.ejercicio.entrada + 180 : e.ejercicio.salida;
  if (m.navObs !== undefined && Math.abs(norm180(m.navObs - curso)) > 5)
    return { clave: "obs", nivel: "ambar", texto: en ? `Set course ${tres(curso)} on the OBS` : `Pon el curso ${tres(curso)} en el OBS` };
  const d = desvioAhora(e, m);
  if (modo === "practica" && d !== null && Math.abs(d) > tolRuta(e.nivel).puntos / 2) {
    const derecha = d < 0; // el curso queda del lado contrario al desvío
    return {
      clave: "deriva",
      nivel: "ambar",
      texto: en
        ? `The needle is drifting to the ${derecha ? "right" : "left"}: correct about 10 degrees that way.`
        : `La barra se te va a la ${derecha ? "derecha" : "izquierda"}: corrige unos 10° hacia ese lado.`,
    };
  }
  if (Math.abs(m.altitud - e.inicio.altitud) > 300) {
    const alt = (Math.round(e.inicio.altitud / 100) * 100).toLocaleString("en-US");
    return { clave: "altitud", nivel: "ambar", texto: en ? `Hold ${alt} feet` : `Mantén ${alt} pies` };
  }
  return null;
}

export function briefingRuta(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolRuta(nivel);
  if (idioma === "en") {
    return [
      "Today you'll fly inbound to the VOR, cross it and fly outbound on another radial.",
      "Inbound, the course on the OBS is the radial plus 180 and the flag reads TO.",
      "Over the station the needle swings and the flag changes to FROM: that's your station passage.",
      "Then turn to the new radial and set it on the OBS: outbound, the course is the radial itself.",
      `Keep the needle within ${puntosTexto(T.puntos, true)} on both legs, correcting for the wind.`,
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a acercarte al VOR, pasar sobre él y alejarte por otro radial.",
    "Acercándote, el curso en el OBS es el radial más 180 y la bandera dice TO.",
    "Sobre la estación la barra se mueve de un lado a otro y la bandera cambia a FROM: ese es el paso por la estación.",
    "Entonces vira al radial nuevo y ponlo en el OBS: alejándote, el curso es el mismo radial.",
    `Mantén la barra dentro de ${puntosTexto(T.puntos, false)} en la ida y en la vuelta, corrigiendo el viento.`,
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

export function explicarRuta(r: ResultadoRuta, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const T = tolRuta(r.nivel);
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.acercamiento.length)
    mal(en
      ? `Inbound you got ${puntosTexto(Math.round(r.peor.acercamiento * 10) / 10, true)} off the course. Correct sooner with small heading changes.`
      : `En la ida te saliste ${puntosTexto(Math.round(r.peor.acercamiento * 10) / 10, false)} del curso. Corrige antes, con cambios pequeños de rumbo.`);
  if (r.fuera.alejamiento.length)
    mal(en
      ? `Outbound you got ${puntosTexto(Math.round(r.peor.alejamiento * 10) / 10, true)} off, or took more than ${T.establecerSeg} s to settle. Set the new course on the OBS right after the station.`
      : `En la vuelta te saliste ${puntosTexto(Math.round(r.peor.alejamiento * 10) / 10, false)}, o tardaste más de ${T.establecerSeg} s en establecerte. Pon el curso nuevo en el OBS en cuanto pases la estación.`);
  if (r.notas.includes("deriva")) {
    const d = [r.deriva.acercamiento, r.deriva.alejamiento].find((x) => x !== null && Math.abs(x) > T.puntos / 2) ?? 0;
    const lado = d > 0 ? (en ? "right" : "derecha") : en ? "left" : "izquierda";
    mal(en ? `The wind kept you to the ${lado} of the course: hold a correction angle into the wind.` : `El viento te mantuvo a la ${lado} del curso: sostén un ángulo de corrección contra el viento.`);
  }
  if (!lineas.length) lineas.push({ tipo: "bien", texto: en ? "Clean route: on course inbound and outbound." : "Ruta limpia: en el curso de ida y de vuelta." });
  return lineas;
}

export function repetirRuta(r: ResultadoRuta, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: inbound and outbound courses" : "Repite: rutas de acercamiento y alejamiento";
}

const ETIQUETA: Record<Idioma, Record<CampoRuta, string>> = {
  es: { acercamiento: "el curso de acercamiento", alejamiento: "el curso de alejamiento" },
  en: { acercamiento: "the inbound course", alejamiento: "the outbound course" },
};

export function masFalladoRuta(rs: ResultadoRuta[], idioma: Idioma): string | null {
  let peor: CampoRuta | null = null;
  let max = 0;
  for (const c of CAMPOS_RUTA) {
    const n = rs.filter((r) => r.fuera[c].length).length;
    if (n > max) [peor, max] = [c, n];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was ${ETIQUETA.en[peor]}.` : `Lo que más se te complicó fue ${ETIQUETA.es[peor]}.`;
}

export function paraGuardarRuta(r: ResultadoRuta): Omit<ResultadoRuta, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
