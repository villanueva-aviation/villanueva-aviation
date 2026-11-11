import type { Muestra } from "./evaluador.ts";
import {
  CAMPOS_INTERCEPTACION, desvioPuntos, ESTABLECIDO_SEG, LIMITE_SEG, type CampoInterceptacion, type EvaluacionInterceptacion, type ResultadoInterceptacion,
} from "./evaluadorInterceptacion.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { distanciaConsejo, norm180 } from "./navIfr.ts";
import { tolInterceptacion, type Nivel } from "./nivel.ts";
import { ANULADO, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la interceptación de radiales (programa IFR). Puro.

export type PasoInterceptacion = "intercepta" | "manten" | "terminado" | "invalido";

export function pasoInterceptacion(e: EvaluacionInterceptacion | null, _m: Muestra | null): PasoInterceptacion | null {
  if (!e) return null;
  if (e.fase === "terminado" || e.fase === "invalido") return e.fase;
  return e.fase === "interceptando" ? "intercepta" : "manten";
}

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const numero = (x: number) => String(Math.round(x * 10) / 10);
const puntosTexto = (p: number, en: boolean) =>
  p === 1 ? (en ? "one dot" : "un punto") : p === 0.5 ? (en ? "half a dot" : "medio punto") : `${numero(p)} ${en ? "dots" : "puntos"}`;

const CONSEJO: Record<Idioma, Record<"cerca" | "lejos", string>> = {
  es: { cerca: "Estás cerca: la barra se mueve rápido, intercepta pronto.", lejos: "Estás lejos: la barra tarda en moverse, ten paciencia." },
  en: { cerca: "You're close: the needle moves fast, intercept early.", lejos: "You're far out: the needle moves slowly, be patient." },
};

function texto(paso: PasoInterceptacion, e: EvaluacionInterceptacion | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (!e) return "";
  const ej = e.ejercicio;
  switch (paso) {
    case "intercepta": {
      const de = e.vor ? (en ? ` of ${e.vor}` : ` de ${e.vor}`) : "";
      const orden = en
        ? `Intercept the ${tres(ej.radial)} radial${de} ${ej.desde ? "outbound" : "inbound"}: course ${tres(ej.curso)} on the OBS.`
        : `Intercepta el radial ${tres(ej.radial)}${de} ${ej.desde ? "alejándote" : "acercándote"}: curso ${tres(ej.curso)} en el OBS.`;
      // El examen va sin consejos (spec).
      const lugar = !e.examen && e.inicio.navTieneDme ? distanciaConsejo(e.inicio.navDme ?? 10) : null;
      return lugar ? `${orden} ${CONSEJO[idioma][lugar]}` : orden;
    }
    case "manten":
      return en ? `Needle centered: hold it there for ${ESTABLECIDO_SEG} seconds.` : `Barra centrada: mantenla así ${ESTABLECIDO_SEG} segundos.`;
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(e.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenInterceptacion(antes: PasoInterceptacion | null, ahora: PasoInterceptacion | null, e: EvaluacionInterceptacion | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, e, idioma) || null;
}

export function textoPasoInterceptacion(paso: PasoInterceptacion | null, e: EvaluacionInterceptacion | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, e, idioma);
}

const PASOS: PasoInterceptacion[] = ["intercepta", "manten"];
const NOMBRE_PASO: Record<Idioma, string[]> = { es: ["Intercepta el radial", "Mantén la barra centrada"], en: ["Intercept the radial", "Keep the needle centered"] };

export function listaPasosInterceptacion(paso: PasoInterceptacion | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerInterceptacion(paso: PasoInterceptacion | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "intercepta")
    return en
      ? "Turn to cut the course at about 30 degrees; when the needle starts moving toward center, turn onto the course."
      : "Vira para cortar el curso con unos 30°; cuando la barra empiece a moverse al centro, vira al curso.";
  if (paso === "manten") return en ? "Small heading corrections to keep the needle centered." : "Correcciones pequeñas de rumbo para mantener la barra centrada.";
  return "";
}

export function semaforoInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra | null): Record<CampoInterceptacion, Luz> {
  const vivo = !!e && !!m && (e.fase === "interceptando" || e.fase === "establecido") && m.navRadial !== undefined;
  if (!vivo) return { interceptar: "gris", sobrepaso: "gris", corto: "gris" };
  const T = tolInterceptacion(e.nivel);
  return {
    interceptar: luz(m.t - e.inicio.t, LIMITE_SEG),
    sobrepaso: e.cruce ? luz(Math.max(0, -desvioPuntos(e, m)), T.sobrepasoPuntos) : "gris",
    corto: e.corto.desde !== null ? luz(m.t - e.corto.desde, T.cortoSeg) : "gris",
  };
}

/** Solo avisos: el OBS mal puesto y la altitud (la altitud no se califica, spec). */
export function avisoInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra | null, _modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (!e || !m || (e.fase !== "interceptando" && e.fase !== "establecido")) return null;
  const en = idioma === "en";
  const curso = e.ejercicio.curso;
  if (m.navObs !== undefined && Math.abs(norm180(m.navObs - curso)) > 5)
    return { clave: "obs", nivel: "ambar", texto: en ? `Set course ${tres(curso)} on the OBS` : `Pon el curso ${tres(curso)} en el OBS` };
  if (Math.abs(m.altitud - e.inicio.altitud) > 300) {
    const alt = (Math.round(e.inicio.altitud / 100) * 100).toLocaleString("en-US");
    return { clave: "altitud", nivel: "ambar", texto: en ? `Hold ${alt} feet` : `Mantén ${alt} pies` };
  }
  return null;
}

/** La teoría corta por voz (la página con dibujos va aparte). */
export function briefingInterceptacion(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolInterceptacion(nivel);
  if (idioma === "en") {
    return [
      "Today you'll practice intercepting VOR radials.",
      "A radial is a line going out from the VOR on a magnetic bearing: the 090 radial goes out to the east.",
      "Outbound, the course on the OBS is the radial itself and the flag reads FROM. Inbound, it's the radial plus 180 and the flag reads TO.",
      `Each dot on the needle is 2 degrees. Intercept at 30 degrees and stay within ${puntosTexto(T.establecidoPuntos, true)} for ${ESTABLECIDO_SEG} seconds.`,
      "Close to the VOR the needle moves fast: intercept early. Far out it moves slowly: be patient.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar la interceptación de radiales del VOR.",
    "Un radial es una línea que sale del VOR hacia un rumbo magnético: el radial 090 sale hacia el este.",
    "Alejándote, el curso en el OBS es el mismo radial y la bandera dice FROM. Acercándote, es el radial más 180 y dice TO.",
    `Cada punto de la barra son 2 grados. Intercepta con 30 grados y quédate dentro de ${puntosTexto(T.establecidoPuntos, false)} durante ${ESTABLECIDO_SEG} segundos.`,
    "Cerca del VOR la barra se mueve rápido: intercepta pronto. Lejos, tarda: ten paciencia.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

export function explicarInterceptacion(r: ResultadoInterceptacion, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.interceptar.length)
    mal(en
      ? `You didn't settle on the radial within ${LIMITE_SEG / 60} minutes. Turn to a 30 degree intercept heading and hold it until the needle moves.`
      : `No te estableciste en el radial en ${LIMITE_SEG / 60} minutos. Pon un rumbo de 30° de interceptación y sostenlo hasta que la barra se mueva.`);
  if (r.fuera.sobrepaso.length)
    mal(en
      ? `You went ${puntosTexto(Math.round(r.sobrepaso * 10) / 10, true)} past the course. Start turning onto the course earlier, as soon as the needle starts moving.`
      : `Te pasaste ${puntosTexto(Math.round(r.sobrepaso * 10) / 10, false)} al otro lado. Empieza a virar al curso antes, en cuanto la barra empiece a moverse.`);
  else if (r.notas.includes("sobrepaso"))
    mal(en
      ? `Good, but you went ${puntosTexto(Math.round(r.sobrepaso * 10) / 10, true)} past the course: start your turn a little earlier.`
      : `Bien, pero te pasaste ${puntosTexto(Math.round(r.sobrepaso * 10) / 10, false)}: empieza a virar un poco antes.`);
  if (r.fuera.corto.length)
    mal(en
      ? `You stopped short: ${Math.round(r.cortoSeg)} s on the course heading with the needle more than one dot off. Keep the 30 degree intercept until the needle comes in.`
      : `Te quedaste corto: ${Math.round(r.cortoSeg)} s con el rumbo del curso y la barra a más de un punto. Mantén los 30° de interceptación hasta que la barra llegue.`);
  if (r.notas.includes("angulo") && r.angulo !== null)
    mal(en ? `You intercepted at about ${Math.round(r.angulo)} degrees: 30 is the target.` : `Interceptaste con unos ${Math.round(r.angulo)}°: lo ideal es 30°.`);
  if (!lineas.length) lineas.push({ tipo: "bien", texto: en ? "Clean intercept: you settled on the radial without overshooting." : "Interceptación limpia: quedaste en el radial sin pasarte." });
  return lineas;
}

export function repetirInterceptacion(r: ResultadoInterceptacion, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: radial interception" : "Repite: interceptación de radiales";
}

const ETIQUETA: Record<Idioma, Record<CampoInterceptacion, string>> = {
  es: { interceptar: "establecerte en el radial", sobrepaso: "pasarte del curso", corto: "quedarte corto" },
  en: { interceptar: "settling on the radial", sobrepaso: "overshooting the course", corto: "stopping short" },
};

export function masFalladoInterceptacion(rs: ResultadoInterceptacion[], idioma: Idioma): string | null {
  let peor: CampoInterceptacion | null = null;
  let max = 0;
  for (const c of CAMPOS_INTERCEPTACION) {
    const n = rs.filter((r) => r.fuera[c].length).length;
    if (n > max) [peor, max] = [c, n];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was ${ETIQUETA.en[peor]}.` : `Lo que más se te complicó fue ${ETIQUETA.es[peor]}.`;
}

export function paraGuardarInterceptacion(r: ResultadoInterceptacion): Omit<ResultadoInterceptacion, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
