import type { Muestra } from "./evaluador.ts";
import {
  CAMPOS_INTERCEPTACION, desvioPuntos, LIMITE_SEG, type CampoInterceptacion, type EvaluacionInterceptacion, type ResultadoInterceptacion,
} from "./evaluadorInterceptacion.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { distanciaConsejo, norm180, type Ejercicio, type TipoTramo } from "./navIfr.ts";
import { tolInterceptacion, type Nivel } from "./nivel.ts";
import { ANULADO, luz, REPETIR_IFR_SEG, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en un tramo de las lecciones IFR 1 y 2 (spec 2026-11-13). Puro.
// La instrucción nunca dice si es normal o ruta pasada: eso lo contesta el cadete.

/** `intercepta`: todavía no contesta; `respondida`: ya contestó y no ha cruzado el radial. */
export type PasoInterceptacion = "espera" | "intercepta" | "respondida" | "manten" | "terminado" | "invalido";

export function pasoInterceptacion(e: EvaluacionInterceptacion | null, _m: Muestra | null): PasoInterceptacion | null {
  if (!e) return null;
  if (e.fase === "terminado" || e.fase === "invalido") return e.fase;
  if (e.fase === "esperando") return "espera";
  if (e.fase === "establecido") return "manten";
  return e.dicho === undefined ? "intercepta" : "respondida";
}

const tres = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const numero = (x: number) => String(Math.round(x * 10) / 10);
const puntosTexto = (p: number, en: boolean) =>
  p === 1 ? (en ? "one dot" : "un punto") : p === 0.5 ? (en ? "half a dot" : "medio punto") : `${numero(p)} ${en ? "dots" : "puntos"}`;

export const PREGUNTA_TIPO: Record<Idioma, string> = { es: "¿Interceptación normal o ruta pasada?", en: "Normal intercept or passed route?" };
export const NOMBRE_TIPO: Record<Idioma, Record<TipoTramo, string>> = {
  es: { normal: "normal", pasada: "ruta pasada" },
  en: { normal: "normal intercept", pasada: "passed route" },
};

const CONSEJO: Record<Idioma, Record<"cerca" | "lejos", string>> = {
  es: { cerca: "Estás cerca: la barra se mueve rápido, intercepta pronto.", lejos: "Estás lejos: la barra tarda en moverse, ten paciencia." },
  en: { cerca: "You're close: the needle moves fast, intercept early.", lejos: "You're far out: the needle moves slowly, be patient." },
};

/** «Aléjate por el radial 310 de GDL.»: solo el sentido y el radial, sin curso ni tipo. */
export function instruccionTramo(ej: Pick<Ejercicio, "radial" | "desde">, vor: string | undefined, idioma: Idioma, alDespegar: boolean, altitudFt?: number): string {
  const R = tres(ej.radial);
  const alt = altitudFt?.toLocaleString("en-US");
  if (idioma === "en") {
    const de = vor ? ` of ${vor}` : "";
    return `${alDespegar ? "After takeoff, proceed" : "Proceed"} ${ej.desde ? "outbound" : "inbound"} on the ${R} radial${de}${alt ? ` and climb to ${alt} feet` : ""}.`;
  }
  const de = `${vor ? ` de ${vor}` : ""}${alt ? ` y sube a ${alt} pies` : ""}`;
  const verbo = ej.desde ? "aléjate" : "acércate";
  return alDespegar ? `Después del despegue, ${verbo} por el radial ${R}${de}.` : `${verbo.charAt(0).toUpperCase()}${verbo.slice(1)} por el radial ${R}${de}.`;
}

/** Confirma o corrige lo que contestó, con los grados entre el radial pedido y donde está. */
function respuesta(e: EvaluacionInterceptacion, idioma: Idioma): string | null {
  const ej = e.ejercicio;
  if (!ej || e.examen || e.dicho === undefined) return null;
  const en = idioma === "en";
  if (e.dicho === ej.tipo) return en ? `Correct: ${NOMBRE_TIPO.en[ej.tipo]}.` : `Correcto: ${NOMBRE_TIPO.es[ej.tipo]}.`;
  const g = Math.round(Math.abs(norm180(ej.radial - ej.referencia)));
  const R = tres(ej.radial);
  if (ej.tipo === "pasada") return en ? `It's a passed route: the ${R} is ${g} degrees away, behind you.` : `Es ruta pasada: el ${R} queda a ${g}°, atrás de ti.`;
  return en ? `It's a normal intercept: the ${R} is ${g} degrees away, ahead of you.` : `Es normal: el ${R} queda a ${g}°, adelante de ti.`;
}

function texto(paso: PasoInterceptacion, e: EvaluacionInterceptacion | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (!e) return "";
  const ej = e.ejercicio;
  switch (paso) {
    case "espera": {
      const nm = e.tramo.esperarNm ?? 3;
      return en ? `Keep going outbound; at ${nm} miles I'll give you the next radial.` : `Sigue alejándote; a las ${nm} millas te doy el siguiente radial.`;
    }
    case "intercepta":
    case "respondida": {
      if (!ej) return "";
      const orden = instruccionTramo(ej, e.vor, idioma, false);
      // El examen va sin consejos (spec).
      const lugar = !e.examen && e.inicio.navTieneDme ? distanciaConsejo(e.inicio.navDme ?? 10) : null;
      return lugar ? `${orden} ${CONSEJO[idioma][lugar]}` : orden;
    }
    case "manten": {
      if (ej && !ej.desde) return en ? "Needle centered: hold it there until you pass the VOR." : "Barra centrada: mantenla así hasta pasar el VOR.";
      const nm = Math.round(e.finNm ?? 8);
      return en ? `Needle centered: hold it there until ${nm} miles.` : `Barra centrada: mantenla hasta las ${nm} millas.`;
    }
    case "terminado":
      return en ? "Leg complete." : "Tramo terminado.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(e.motivo ?? "", idioma)}`.trim();
  }
}

/** La pregunta no va aquí: la página la hace y escucha la respuesta. */
export function ordenInterceptacion(antes: PasoInterceptacion | null, ahora: PasoInterceptacion | null, e: EvaluacionInterceptacion | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  if (ahora === "respondida") return e ? respuesta(e, idioma) : null;
  return texto(ahora, e, idioma) || null;
}

/** En pantalla la pregunta se queda mientras no conteste. */
export function textoPasoInterceptacion(paso: PasoInterceptacion | null, e: EvaluacionInterceptacion | null, idioma: Idioma): string {
  if (!paso || paso === "invalido") return "";
  const t = texto(paso, e, idioma);
  return paso === "intercepta" ? `${t} ${PREGUNTA_TIPO[idioma]}` : t;
}

const PASOS: PasoInterceptacion[] = ["intercepta", "manten"];
const NOMBRE_PASO: Record<Idioma, string[]> = { es: ["Intercepta el radial", "Mantén la barra centrada"], en: ["Intercept the radial", "Keep the needle centered"] };

export function listaPasosInterceptacion(paso: PasoInterceptacion | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "respondida" ? 0 : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerInterceptacion(paso: PasoInterceptacion | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "espera") return en ? "Keep tracking outbound." : "Sigue alejándote por el radial.";
  if (paso === "intercepta")
    return en
      ? "Compare the radial with yours: within 90 degrees it's a normal intercept, beyond 90 a passed route. Say which one."
      : "Compara el radial con el tuyo: a menos de 90° es normal, a más es ruta pasada. Dilo en voz alta.";
  if (paso === "respondida") return en ? "Follow the steps of the HSI guide." : "Sigue los pasos de la guía del HSI.";
  if (paso === "manten") return en ? "Small heading corrections to keep the needle centered." : "Correcciones pequeñas de rumbo para mantener la barra centrada.";
  return "";
}

const EN_CURSO = new Set(["reposicionando", "interceptando", "establecido"]);

export function semaforoInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra | null): Record<CampoInterceptacion, Luz> {
  const vivo = !!e && !!m && !!e.ejercicio && EN_CURSO.has(e.fase) && m.navRadial !== undefined;
  if (!vivo) return { identificar: "gris", interceptar: "gris", sobrepaso: "gris", corto: "gris" };
  const T = tolInterceptacion(e.nivel);
  return {
    identificar: e.dicho === undefined ? "gris" : e.dicho === e.ejercicio!.tipo ? "verde" : "rojo",
    interceptar: luz(m.t - e.inicio.t, LIMITE_SEG),
    sobrepaso: e.cruce ? luz(Math.max(0, -desvioPuntos(e, m)), T.sobrepasoPuntos) : "gris",
    corto: e.corto.desde !== null ? luz(m.t - e.corto.desde, T.cortoSeg) : "gris",
  };
}

/** Solo avisos: el OBS mal puesto (ya contestado: el curso lo saca el cadete) y la altitud (no se califica, spec). */
export function avisoInterceptacion(e: EvaluacionInterceptacion | null, m: Muestra | null, _modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  if (!e || !m || !e.ejercicio || !EN_CURSO.has(e.fase)) return null;
  const en = idioma === "en";
  const curso = e.ejercicio.curso;
  if (e.dicho !== undefined && m.navObs !== undefined && Math.abs(norm180(m.navObs - curso)) > 5)
    return { clave: "obs", nivel: "ambar", repetir: REPETIR_IFR_SEG, texto: en ? `Set course ${tres(curso)} on the OBS` : `Pon el curso ${tres(curso)} en el OBS` };
  // Con la altitud de la lección: mientras sube a ella no se le pide mantener otra (el primer tramo arma a 1,000 pies
  // sobre el terreno, recién despegado). Sin ella, la del inicio del tramo.
  const meta = e.altitudFt;
  const llego = meta !== undefined && (m.altitud >= meta - 300 || e.muestras.some((x) => x.altitud >= meta - 300));
  if (meta !== undefined ? llego && Math.abs(m.altitud - meta) > 300 : Math.abs(m.altitud - e.inicio.altitud) > 300) {
    const alt = (Math.round((meta ?? e.inicio.altitud) / 100) * 100).toLocaleString("en-US");
    return { clave: "altitud", nivel: "ambar", repetir: REPETIR_IFR_SEG, texto: en ? `Hold ${alt} feet` : `Mantén ${alt} pies` };
  }
  return null;
}

/** Lección 1: la teoría corta por voz (la página con dibujos va aparte). */
export function briefingInterceptacion(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolInterceptacion(nivel);
  if (idioma === "en") {
    return [
      "Today you'll fly one continuous flight of VOR radial intercepts.",
      "I'll only tell you outbound or inbound and the radial. You tell me whether it's a normal intercept or a passed route.",
      "Compare it with the radial you're on: within 90 degrees it's normal. On the 290, the 200 through the 020 are normal; the 150 is behind you, a passed route.",
      `In this lesson they're all normal: outbound use CD45, inbound use DC30. Each dot is 2 degrees; stay within ${puntosTexto(T.establecidoPuntos, true)}.`,
      "Outbound legs are graded at 8 miles, inbound legs when you pass the VOR, and then I give you the next one.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vuelas un solo vuelo de interceptaciones de radiales del VOR.",
    "Yo solo te digo si te alejas o te acercas y el radial. Tú me dices si es una interceptación normal o una ruta pasada.",
    "Compáralo con el radial donde vas: a menos de 90 grados es normal. Por el 290, del 200 al 020 son normales; el 150 queda atrás, es ruta pasada.",
    `En esta lección todas son normales: alejándote usa CD45, acercándote DC30. Cada punto de la barra son 2 grados; quédate dentro de ${puntosTexto(T.establecidoPuntos, false)}.`,
    "El alejamiento se califica a las 8 millas y el acercamiento al pasar el VOR, y ahí te doy el siguiente.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

/** Lección 2: rutas pasadas. */
export function briefingRutaPasada(idioma: Idioma, nivel: Nivel = 2): string[] {
  const T = tolInterceptacion(nivel);
  if (idioma === "en") {
    return [
      "Today you'll fly one continuous flight of passed routes: radials behind you, more than 90 degrees from yours.",
      "I'll only tell you outbound or inbound and the radial. You tell me whether it's a normal intercept or a passed route.",
      "Outbound, use the 45 degree rule: fly the radial's heading, and once abeam, when the flag flips, turn 45 degrees toward the station.",
      "Inbound, use the one minute rule: fly the radial's heading, start a minute when abeam, then turn 90 degrees toward the needle.",
      `Each dot is 2 degrees; stay within ${puntosTexto(T.establecidoPuntos, true)}. Outbound legs are graded at 8 miles, inbound legs when you pass the VOR.`,
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vuelas un solo vuelo de rutas pasadas: radiales que quedan atrás, a más de 90 grados del tuyo.",
    "Yo solo te digo si te alejas o te acercas y el radial. Tú me dices si es una interceptación normal o una ruta pasada.",
    "Alejándote, usa la regla de 45 grados: vuela el rumbo del radial y, al través, cuando cambia la flechita, vira 45 grados hacia la estación.",
    "Acercándote, usa la regla de 1 minuto: vuela el rumbo del radial, al través cuenta un minuto y luego vira 90 grados hacia el lado de la barra.",
    `Cada punto de la barra son 2 grados; quédate dentro de ${puntosTexto(T.establecidoPuntos, false)}. El alejamiento se califica a las 8 millas y el acercamiento al pasar el VOR.`,
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

/** Antes del vuelo encadenado los resultados no traían tipo: esos no califican la identificación. */
const conTipo = (r: ResultadoInterceptacion) => (r.ejercicio as Partial<Ejercicio>).tipo !== undefined;

export function explicarInterceptacion(r: ResultadoInterceptacion, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (conTipo(r) && r.fuera.identificar?.length) {
    const era = r.ejercicio.tipo;
    if (!r.dicho) mal(en ? "You didn't say whether it was a normal intercept or a passed route." : "No dijiste si era normal o ruta pasada.");
    else mal(en ? `You said ${NOMBRE_TIPO.en[r.dicho]}; it was a ${NOMBRE_TIPO.en[era]}.` : `Dijiste ${NOMBRE_TIPO.es[r.dicho]}; era ${NOMBRE_TIPO.es[era]}.`);
  }
  if (r.fuera.interceptar.length) {
    const donde = r.ejercicio.desde ? (en ? "before 8 miles" : "antes de las 8 millas") : en ? "before passing the VOR" : "antes de pasar el VOR";
    mal(en
      ? `You didn't reach the radial ${donde}. Take your intercept heading and hold it until the needle moves.`
      : `No llegaste al radial ${donde}. Toma tu rumbo de interceptación y sostenlo hasta que la barra se mueva.`);
  }
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
      ? `You stopped short: ${Math.round(r.cortoSeg)} s on the course heading with the needle more than one dot off. Keep your intercept heading until the needle comes in.`
      : `Te quedaste corto: ${Math.round(r.cortoSeg)} s con el rumbo del curso y la barra a más de un punto. Mantén el rumbo de interceptación hasta que la barra llegue.`);
  if (r.notas.includes("angulo") && r.angulo !== null)
    mal(en ? `You intercepted at about ${Math.round(r.angulo)} degrees: 30 is the target.` : `Interceptaste con unos ${Math.round(r.angulo)}°: lo ideal es 30°.`);
  if (!lineas.length) lineas.push({ tipo: "bien", texto: en ? "Clean intercept: you settled on the radial without overshooting." : "Interceptación limpia: quedaste en el radial sin pasarte." });
  return lineas;
}

/** El vuelo encadenado no repite tramos: el siguiente ya va en camino. */
export function repetirInterceptacion(r: ResultadoInterceptacion, idioma: Idioma): string | null {
  if (r.aprobado || conTipo(r)) return null;
  return idioma === "en" ? "Repeat: radial interception" : "Repite: interceptación de radiales";
}

const ETIQUETA: Record<Idioma, Record<CampoInterceptacion, string>> = {
  es: { identificar: "decir si era normal o ruta pasada", interceptar: "llegar al radial", sobrepaso: "pasarte del curso", corto: "quedarte corto" },
  en: { identificar: "calling normal intercept or passed route", interceptar: "reaching the radial", sobrepaso: "overshooting the course", corto: "stopping short" },
};

export function masFalladoInterceptacion(rs: ResultadoInterceptacion[], idioma: Idioma): string | null {
  let peor: CampoInterceptacion | null = null;
  let max = 0;
  for (const c of CAMPOS_INTERCEPTACION) {
    // Los resultados de antes del vuelo encadenado no traen `identificar`.
    const n = rs.filter((r) => r.fuera[c]?.length).length;
    if (n > max) [peor, max] = [c, n];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was ${ETIQUETA.en[peor]}.` : `Lo que más se te complicó fue ${ETIQUETA.es[peor]}.`;
}

export function paraGuardarInterceptacion(r: ResultadoInterceptacion): Omit<ResultadoInterceptacion, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
