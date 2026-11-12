import { comoSeVuela, entradaEspera, type Entrada } from "../entrenador/esperas.ts";
import type { Muestra } from "./evaluador.ts";
import { CAMPOS_ESPERA, distanciaEspera, SALIDA_NM, radialEspera, type CampoEspera, type EvaluacionEspera, type ResultadoEspera } from "./evaluadorEspera.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { desvioGrados, norm180, norm360, puntos } from "./navIfr.ts";
import { tolEspera, type Nivel } from "./nivel.ts";
import { ANULADO, luz, type Aviso, type Luz } from "./voz.ts";
import { CONO_NM } from "./vorSim.ts";

// Qué dice el instructor en los patrones de espera (programa IFR, lección 4). Puro.

/** respondida: ya dijo su entrada; prepara: a una milla del fijo, en práctica, se explica la entrada. */
export type PasoEspera = "posiciona" | "llega" | "pregunta" | "respondida" | "prepara" | "entra" | "vuelta" | "terminado" | "invalido";

/** A cuántas millas del fijo se explica la entrada (Erik, 2026-11-11). */
const PREPARA_NM = 1;

export function pasoEspera(e: EvaluacionEspera | null, m: Muestra | null): PasoEspera | null {
  if (!e) return null;
  switch (e.fase) {
    case "posicionando":
      return "posiciona";
    case "llegando": {
      const d = distanciaEspera(e, m ?? e.previo);
      if (!e.examen && d !== null && d <= PREPARA_NM) return "prepara";
      return e.dicha !== undefined ? "respondida" : e.preguntado ? "pregunta" : "llega";
    }
    case "entrada":
      return "entra";
    case "vueltas":
      return "vuelta";
    default:
      return e.fase;
  }
}

const tres = (r: number) => String(Math.round(norm360(r)) || 360).padStart(3, "0");
const uno = (x: number) => String(Math.round(x * 10) / 10);
const pies = (ft: number) => (Math.round(ft / 100) * 100).toLocaleString("en-US");
const minutos = (seg: number, en: boolean) => {
  const n = Math.round((seg / 60) * 10) / 10;
  return en ? `${n} minute${n === 1 ? "" : "s"}` : `${n} minuto${n === 1 ? "" : "s"}`;
};

export const NOMBRE_ENTRADA: Record<Idioma, Record<Entrada, string>> = {
  es: { directa: "directa", paralela: "paralela", gota: "en gota" },
  en: { directa: "direct", paralela: "parallel", gota: "teardrop" },
};

const COMO_EN: Record<Entrada, (derecha: boolean) => string> = {
  directa: (d) => `fly to the fix and turn ${d ? "right" : "left"}, like the hold's turns, to join the pattern.`,
  gota: (d) => `at the fix take an outbound heading 30 degrees toward the holding side for one minute, then turn ${d ? "right" : "left"} to intercept the inbound course.`,
  paralela: (d) => `at the fix take the outbound heading, parallel to the pattern on the non-holding side, for one minute; then turn ${d ? "left" : "right"} more than 180 degrees to intercept the inbound course.`,
};

/** La entrada que tocaba con el rumbo con el que cruzó el fijo. */
const correctaAhora = (e: EvaluacionEspera): Entrada | null =>
  e.rumboCruce === null ? null : entradaEspera(norm360(e.rumboCruce), radialEspera(e.ejercicio), e.ejercicio.giros);

/** La entrada que toca llegando por el radial de regreso. */
const entradaPrevista = (e: EvaluacionEspera): Entrada => entradaEspera(norm360(e.ejercicio.llegada + 180), radialEspera(e.ejercicio), e.ejercicio.giros);

function explicar(c: Entrada, e: EvaluacionEspera, en: boolean): string {
  const derecha = e.ejercicio.giros === "derecha";
  return en ? `${NOMBRE_ENTRADA.en[c][0].toUpperCase()}${NOMBRE_ENTRADA.en[c].slice(1)} entry: ${COMO_EN[c](derecha)}` : `Entrada ${NOMBRE_ENTRADA.es[c]}: ${comoSeVuela(c, e.ejercicio.giros)}`;
}

/** Práctica: si el curso del HSI no es el de acercamiento al cruzar el fijo, se pide (no se califica). */
function hsi(e: EvaluacionEspera, en: boolean): string {
  const obs = e.previo.navObs;
  if (e.examen || obs === undefined || Math.abs(norm180(obs - e.ejercicio.acercamiento)) <= 5) return "";
  const c = tres(e.ejercicio.acercamiento);
  return en ? ` Set course ${c} on the HSI.` : ` Pon el curso ${c} en el HSI.`;
}

export const PREGUNTA_ENTRADA: Record<Idioma, string> = { es: "¿Qué entrada vas a hacer?", en: "Which entry will you fly?" };

function texto(paso: PasoEspera, e: EvaluacionEspera | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (!e) return "";
  const ej = e.ejercicio;
  const derecha = ej.giros === "derecha";
  switch (paso) {
    case "posiciona":
      return en
        ? `Intercept the ${tres(ej.salida)} radial outbound and climb to ${pies(ej.altitudFt)} feet. At ${SALIDA_NM} miles I'll give you the way back.`
        : `Intercepta el radial ${tres(ej.salida)} alejándote y sube a ${pies(ej.altitudFt)} pies. A ${SALIDA_NM} millas te doy el regreso.`;
    case "llega": {
      const sobre = e.vor ?? (en ? "the VOR" : "el VOR");
      return en
        ? `Fly back to the station on the ${tres(ej.llegada)} radial. Hold over ${sobre}: inbound course ${tres(ej.acercamiento)}, ${derecha ? "right" : "left"} turns, ${minutos(ej.tramoSeg, true)} legs; cross the fix at ${pies(ej.altitudFt)} feet.`
        : `Regresa a la estación por el radial ${tres(ej.llegada)}. Espera sobre ${sobre}: curso de acercamiento ${tres(ej.acercamiento)}, virajes a la ${derecha ? "derecha" : "izquierda"}, tramos de ${minutos(ej.tramoSeg, false)}; cruza el fijo a ${pies(ej.altitudFt)} pies.`;
    }
    case "pregunta":
      return PREGUNTA_ENTRADA[idioma];
    case "respondida":
      return texto("llega", e, idioma);
    case "prepara":
      return explicar(entradaPrevista(e), e, en);
    case "entra": {
      const c = correctaAhora(e);
      if (e.examen || !c) return (en ? "Over the fix: fly your entry." : "Sobre el fijo: vuela tu entrada.") + hsi(e, en);
      return explicar(c, e, en) + hsi(e, en);
    }
    case "vuelta":
      return en ? "Entry complete: now one full lap of the hold." : "Entrada terminada: ahora una vuelta completa a la espera.";
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(e.motivo ?? "", idioma)}`.trim();
  }
}

/** La pregunta no va aquí: la página la hace y escucha la respuesta. Explicada la entrada, sobre el fijo basta con volarla. */
export function ordenEspera(antes: PasoEspera | null, ahora: PasoEspera | null, e: EvaluacionEspera | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado" || ahora === "pregunta" || ahora === "respondida") return null;
  if (ahora === "entra" && antes === "prepara" && e)
    return (idioma === "en" ? "Over the fix: fly your entry." : "Sobre el fijo: vuela tu entrada.") + hsi(e, idioma === "en");
  return texto(ahora, e, idioma) || null;
}

export function textoPasoEspera(paso: PasoEspera | null, e: EvaluacionEspera | null, idioma: Idioma): string {
  if (!paso || paso === "invalido") return "";
  // La pregunta se queda en pantalla con la espera: el cadete necesita los datos para contestar.
  if (paso === "pregunta") return `${texto("llega", e, idioma)} ${PREGUNTA_ENTRADA[idioma]}`;
  return texto(paso, e, idioma);
}

const PASOS: PasoEspera[] = ["posiciona", "llega", "pregunta", "entra", "vuelta"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Sal por el radial", "Regresa al fijo", "Di tu entrada", "Vuela la entrada", "Una vuelta completa"],
  en: ["Fly out on the radial", "Fly back to the fix", "Call your entry", "Fly the entry", "One full lap"],
};

export function listaPasosEspera(paso: PasoEspera | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  // Contestada (o explicada) la entrada, lo que sigue es volarla.
  const actual = paso === "terminado" ? PASOS.length : paso === "respondida" || paso === "prepara" ? 3 : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerEspera(paso: PasoEspera | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "posiciona")
    return en ? `Intercept the outbound radial and fly out; at ${SALIDA_NM} miles I'll give you the way back.` : `Intercepta el radial de salida y aléjate; a ${SALIDA_NM} millas te doy el regreso.`;
  if (paso === "llega" || paso === "pregunta" || paso === "respondida")
    return en
      ? "Compare your heading to the fix with the outbound course to pick the entry: teardrop, parallel or direct."
      : "Compara tu rumbo al fijo con el curso de alejamiento para elegir la entrada: gota, paralela o directa.";
  if (paso === "entra" || paso === "prepara") return en ? "Fly the entry and come back to the fix on the inbound course." : "Vuela la entrada y regresa al fijo por el curso de acercamiento.";
  if (paso === "vuelta") return en ? "Standard-rate turns, one minute outbound, and the needle centered inbound." : "Virajes de tasa estándar, un minuto de alejamiento y la barra centrada en el acercamiento.";
  return "";
}

export function semaforoEspera(e: EvaluacionEspera | null, m: Muestra | null): Record<CampoEspera, Luz> {
  const gris: Record<CampoEspera, Luz> = { dicha: "gris", volada: "gris", tramo: "gris", acercamiento: "gris", virajes: "gris", distancia: "gris", altitud: "gris" };
  if (!e || !m || (e.fase !== "entrada" && e.fase !== "vueltas")) return gris;
  const T = tolEspera(e.nivel);
  const ultima = e.dist[e.dist.length - 1];
  const s = { ...gris, distancia: luz(ultima ? Math.max(0, ultima.v) : null, T.maxNm), altitud: luz(Math.abs(m.altitud - e.ejercicio.altitudFt), T.altitudFt) };
  if (e.fase === "vueltas" && e.tNivel !== null && m.navRadial !== undefined)
    s.acercamiento = luz(Math.abs(puntos(desvioGrados({ radial: radialEspera(e.ejercicio), desde: false }, m.navRadial))), T.puntos);
  return s;
}

/** El radial de llegada, el minuto (solo práctica) y, desde el fijo, la altitud de la espera. */
export function avisoEspera(e: EvaluacionEspera | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (!e || !m || e.fase === "terminado" || e.fase === "invalido") return null;
  const en = idioma === "en";
  const ej = e.ejercicio;
  const d = distanciaEspera(e, m);
  // Cerca del VOR la aguja es demasiado sensible (y en el cono no vale): ahí no se corrige el radial.
  const lejos = d === null || d >= CONO_NM;
  if (e.fase === "posicionando") {
    if (!lejos || !e.enRadial || m.navRadial === undefined || Math.abs(puntos(desvioGrados({ radial: ej.salida, desde: true }, m.navRadial))) <= 2) return null;
    return {
      clave: "salida",
      nivel: "ambar",
      texto: en ? `Get back on the ${tres(ej.salida)} radial: course ${tres(ej.salida)} FROM.` : `Regresa al radial ${tres(ej.salida)}: curso ${tres(ej.salida)} FROM.`,
    };
  }
  if (e.fase === "llegando" && lejos && e.enRadial && m.navRadial !== undefined && Math.abs(puntos(desvioGrados({ radial: ej.llegada, desde: false }, m.navRadial))) > 2)
    return {
      clave: "llegada",
      nivel: "ambar",
      texto: en ? `Get back on the ${tres(ej.llegada)} radial: course ${tres(ej.llegada + 180)} TO.` : `Regresa al radial ${tres(ej.llegada)}: curso ${tres(ej.llegada + 180)} TO.`,
    };
  if (modo === "practica" && e.tramo && m.t - e.tramo.desde >= ej.tramoSeg)
    return { clave: "minuto", nivel: "ambar", texto: ej.tramoSeg === 60 ? (en ? "One minute: turn." : "Un minuto: vira.") : en ? "Time: turn." : "Tiempo: vira." };
  if (e.fase !== "llegando" && Math.abs(m.altitud - ej.altitudFt) > tolEspera(e.nivel).altitudFt) {
    const alt = pies(ej.altitudFt);
    return { clave: "altitud", nivel: "ambar", texto: en ? `Hold ${alt} feet` : `Mantén ${alt} pies` };
  }
  return null;
}

/** Lo que se agrega a «Sintoniza…» en tierra: el primer ejercicio (Erik, 2026-11-11). */
export function autorizacionEspera(salida: number, altitudFt: number, idioma: Idioma): string {
  return idioma === "en"
    ? `After takeoff intercept the ${tres(salida)} radial outbound and climb to ${pies(altitudFt)} feet.`
    : `Al despegar intercepta el radial ${tres(salida)} alejándote y sube a ${pies(altitudFt)} pies.`;
}

export function briefingEspera(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolEspera(nivel);
  if (idioma === "en") {
    return [
      "Today you'll fly a holding pattern over the VOR: the fix, a turn, an outbound leg, another turn and the inbound course back to the fix.",
      `After takeoff I'll give you a radial to fly out on; at ${SALIDA_NM} miles, the radial to fly back to the station on.`,
      "Standard holds turn right; the instruction says when they turn left. Turns are standard rate: 3 degrees per second.",
      "Before the fix I'll ask which entry you'll fly. Compare your heading to the fix with the outbound course: teardrop, parallel or direct.",
      `Outbound, time one minute from wings level (within ${T.tramoSeg} seconds), then turn to the inbound course.`,
      `Inbound, keep the needle within ${uno(T.puntos)} ${T.puntos === 1 ? "dot" : "dots"}, and don't go more than ${T.maxNm} miles from the VOR.`,
      `From the fix on, hold the holding altitude within ${T.altitudFt} feet.`,
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a volar una espera sobre el VOR: el fijo, un viraje, el tramo de alejamiento, otro viraje y el curso de acercamiento de regreso al fijo.",
    `Al despegar te digo por qué radial salir; a ${SALIDA_NM} millas, por cuál regresar a la estación.`,
    "La espera estándar vira a la derecha; la instrucción dice cuándo vira a la izquierda. Los virajes son de tasa estándar: 3° por segundo.",
    "Antes del fijo te pregunto qué entrada vas a hacer. Compara tu rumbo al fijo con el curso de alejamiento: gota, paralela o directa.",
    `En el alejamiento, cuenta un minuto desde que nivelas las alas (dentro de ${T.tramoSeg} segundos) y vira al curso de acercamiento.`,
    `En el acercamiento, mantén la barra dentro de ${uno(T.puntos)} ${T.puntos === 1 ? "punto" : "puntos"} y no te alejes más de ${T.maxNm} millas del VOR.`,
    `Desde el fijo, mantén la altitud de la espera dentro de ${T.altitudFt} pies.`,
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

export function explicarEspera(r: ResultadoEspera, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const N = NOMBRE_ENTRADA[idioma];
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.dicha.length)
    mal(r.dicha
      ? en ? `You said ${N[r.dicha]}; it was ${N[r.correcta]}.` : `Dijiste ${r.dicha}; tocaba ${r.correcta}.`
      : en ? `You didn't call the entry; it was ${N[r.correcta]}.` : `No dijiste la entrada; tocaba ${r.correcta}.`);
  if (r.fuera.volada.length)
    mal(r.volada
      ? en ? `You flew a ${N[r.volada]} entry; it was ${N[r.correcta]}.` : `Volaste una entrada ${N[r.volada]}; tocaba ${N[r.correcta]}.`
      : en ? "The entry couldn't be read: fly a straight leg of a minute before turning back." : "No se reconoce la entrada: vuela un tramo recto de un minuto antes de regresar.");
  for (const tr of r.fuera.tramo)
    mal(en ? `Outbound leg of ${Math.round(tr.peor + r.ejercicio.tramoSeg)} s.` : `Tramo de ${Math.round(tr.peor + r.ejercicio.tramoSeg)} s.`);
  if (r.fuera.acercamiento.length)
    mal(en ? `Inbound you got ${uno(r.peorAcercamiento)} dots off the course.` : `En el acercamiento te saliste ${uno(r.peorAcercamiento)} puntos del curso.`);
  for (const tr of r.fuera.virajes) mal(en ? `Turn at ${uno(tr.peor + 3)} degrees per second.` : `Viraje a ${uno(tr.peor + 3)}°/s.`);
  if (r.fuera.altitud?.length)
    mal(en ? `You were ${Math.abs(Math.round(r.peorAltitud))} feet ${r.peorAltitud < 0 ? "below" : "above"} the holding altitude (${pies(r.ejercicio.altitudFt)}).`
      : `Te saliste ${Math.abs(Math.round(r.peorAltitud))} pies ${r.peorAltitud < 0 ? "debajo" : "arriba"} de la altitud de la espera (${pies(r.ejercicio.altitudFt)}).`);
  if (r.fuera.distancia.length) mal(en ? `You got ${uno(r.maxDistancia)} miles from the VOR.` : `Te alejaste ${uno(r.maxDistancia)} millas del VOR.`);
  if (!lineas.length) lineas.push({ tipo: "bien", texto: en ? "Clean hold: the right entry, a one-minute leg and on course inbound." : "Espera limpia: la entrada correcta, el minuto de alejamiento y en el curso de acercamiento." });
  return lineas;
}

export function repetirEspera(r: ResultadoEspera, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: holding pattern" : "Repite: patrón de espera";
}

const ETIQUETA: Record<Idioma, Record<CampoEspera, string>> = {
  es: { dicha: "decir la entrada", volada: "volar la entrada", tramo: "el minuto de alejamiento", acercamiento: "el curso de acercamiento", virajes: "la tasa de los virajes", distancia: "quedarte cerca del VOR", altitud: "mantener la altitud de la espera" },
  en: { dicha: "calling the entry", volada: "flying the entry", tramo: "the one-minute outbound leg", acercamiento: "the inbound course", virajes: "the turn rate", distancia: "staying close to the VOR", altitud: "holding the holding altitude" },
};

export function masFalladoEspera(rs: ResultadoEspera[], idioma: Idioma): string | null {
  let peor: CampoEspera | null = null;
  let max = 0;
  for (const c of CAMPOS_ESPERA) {
    const n = rs.filter((r) => r.fuera[c]?.length).length;
    if (n > max) [peor, max] = [c, n];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was ${ETIQUETA.en[peor]}.` : `Lo que más se te complicó fue ${ETIQUETA.es[peor]}.`;
}

export function paraGuardarEspera(r: ResultadoEspera): Omit<ResultadoEspera, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
