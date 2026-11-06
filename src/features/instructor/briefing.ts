import type { Detalle } from "./colaVoz.ts";
import type { Campo, Resultado } from "./evaluador.ts";
import { repetir } from "./explicacion.ts";
import { BANCO } from "./bancoPreguntas.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { lineasPreguntas, type Respondida } from "./preguntas.ts";
import type { IntentoSesion } from "./sesion.ts";
import type { PasoVoz } from "./voz.ts";
import { ALTURA_SEGURA_AGL, INCLINACION_ENTRADA, INCLINACION_OBJETIVO, LIMPIEZA, TOLERANCIAS } from "./virajeEscarpado.ts";

// Lo que el instructor explica antes, durante y después de la sesión.

const ALTURA = `${ALTURA_SEGURA_AGL.toLocaleString("en-US")} ft`;
const TOL = TOLERANCIAS;
const I = INCLINACION_OBJETIVO;

export function briefing(idioma: Idioma = "es"): string[] {
  if (idioma === "en") {
    return [
      "Today, in this hour, you'll practice the steep turn in the Cessna 172, just like on a checkride.",
      `The maneuver: a 360° turn at ${I}° of bank, roll out on your entry heading and immediately do another 360° in the opposite direction.`,
      `Tolerances: altitude ±${TOL.altitudFt} ft, airspeed ±${TOL.velocidadKt} kt, bank ${I}° ±${TOL.inclinacionGrados}°, the ball centered and exit heading ±${TOL.rumboSalidaGrados}°.`,
      `Before you start, climb to ${ALTURA} above the ground, trim the airplane and stabilize your entry airspeed without exceeding Va.`,
      `Then do your clearing turns: at least ${LIMPIEZA.grados}° to look for traffic.`,
      `Common errors: losing altitude past ${INCLINACION_ENTRADA}° from too little back pressure, overbanking past ${I}°, rolling out late and flying with the ball off center.`,
      "The plan: about 25 minutes of practice with corrections, a checkride without help and a debriefing of your attempts at the end.",
      "In practice I correct you live; on the checkride I only give you instructions. If you pass the checkride, you can send it for review for your badge.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy, en esta hora, vas a practicar el viraje escarpado en el Cessna 172, como en un checkride.",
    `La maniobra: un viraje de 360° a ${I}° de inclinación, nivelas en tu rumbo de entrada y de inmediato otro de 360° al lado contrario.`,
    `Tolerancias: altitud ±${TOL.altitudFt} ft, velocidad ±${TOL.velocidadKt} kt, inclinación ${I}° ±${TOL.inclinacionGrados}°, la bola centrada y el rumbo de salida ±${TOL.rumboSalidaGrados}°.`,
    `Antes de empezar sube a ${ALTURA} sobre el terreno, compensa el avión y estabiliza tu velocidad de entrada sin pasar de Va.`,
    `Luego haz tus virajes de limpieza: al menos ${LIMPIEZA.grados}° para buscar tráfico.`,
    `Errores comunes: perder altitud al pasar de ${INCLINACION_ENTRADA}° por falta de presión atrás, pasarte de ${I}°, nivelar tarde y volar con la bola descentrada.`,
    "El plan: unos 25 minutos de práctica con correcciones, un checkride sin ayudas y al final un debriefing de tus intentos.",
    "En práctica te corrijo en vivo; en el checkride solo te doy órdenes. Si apruebas el checkride, puedes mandarlo a revisión para tu insignia.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

export const PASOS: PasoVoz[] = ["bajo", "limpieza", "viraje1", "nivelar1", "viraje2", "nivelar2"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Subir", "Virajes de limpieza", "Viraje 1", "Nivelar", "Viraje 2", "Nivelar"],
  en: ["Climb", "Clearing turns", "Turn 1", "Roll out", "Turn 2", "Roll out"],
};
/** Paso actual en la lista; "despejado" ya es el viraje 1 y "entre" el viraje 2. */
const POSICION: Partial<Record<PasoVoz, number>> = { despejado: 2, entre: 4, terminado: PASOS.length };

export function listaPasos(paso: PasoVoz | null, idioma: Idioma = "es"): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso ? (POSICION[paso] ?? PASOS.indexOf(paso)) : -1;
  return PASOS.map((_, k) => ({
    nombre: NOMBRE_PASO[idioma][k],
    estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente",
  }));
}

const QUE_HACER: Record<Idioma, { bajo: string; limpieza: string; viraje: string; nivelar: string; entre: string }> = {
  es: {
    bajo: "Potencia y velocidad de ascenso; nivela y compensa al llegar.",
    limpieza: `Dos virajes suaves de ${LIMPIEZA.grados}°, uno a cada lado, buscando tráfico.`,
    viraje: `Al pasar de ${INCLINACION_ENTRADA}° agrega presión atrás y un poco de potencia; pedal para la bola.`,
    nivelar: "Empieza a nivelar unos 20° antes del rumbo de entrada y quita la presión atrás.",
    entre: `Sin detenerte, alabea al lado contrario hasta ${I}°.`,
  },
  en: {
    bajo: "Climb power and climb airspeed; level off and trim when you get there.",
    limpieza: `Two gentle ${LIMPIEZA.grados}° turns, one each way, looking for traffic.`,
    viraje: `Past ${INCLINACION_ENTRADA}°, add back pressure and a little power; rudder for the ball.`,
    nivelar: "Start rolling out about 20° before your entry heading and release the back pressure.",
    entre: `Without stopping, roll the other way to ${I}°.`,
  },
};

export function queHacer(paso: PasoVoz | null, idioma: Idioma = "es"): string {
  const q = QUE_HACER[idioma];
  switch (paso) {
    case "bajo":
      return q.bajo;
    case "limpieza":
      return q.limpieza;
    case "despejado":
    case "viraje1":
    case "viraje2":
      return q.viraje;
    case "nivelar1":
    case "nivelar2":
      return q.nivelar;
    case "entre":
      return q.entre;
    default:
      return "";
  }
}

export type Material = { titulo: { es: string; en: string }; to: string; exclusivo: boolean };

const CAMPOS: Campo[] = ["altitud", "velocidad", "inclinacion", "bola"];
const CONSEJO: Record<Idioma, Record<Campo, [string, string]>> = {
  es: {
    altitud: ["la altitud", `al pasar de ${INCLINACION_ENTRADA}° agrega presión atrás y usa el compensador.`],
    velocidad: ["la velocidad", "ajusta potencia al entrar: en el viraje la resistencia sube."],
    inclinacion: ["la inclinación", `detén el alabeo un poco antes de ${I}° y sostenlo.`],
    bola: ["la coordinación", "centra la bola con el pedal del lado al que se va."],
  },
  en: {
    altitud: ["altitude", `past ${INCLINACION_ENTRADA}°, add back pressure and use the trim.`],
    velocidad: ["airspeed", "adjust power on entry: drag goes up in the turn."],
    inclinacion: ["bank", `stop the roll a little before ${I}° and hold it.`],
    bola: ["coordination", "center the ball with the rudder on the side it goes to."],
  },
};

/** «Lo que más se te salió…» del viraje: el campo con más segundos fuera en todos los lados. */
export function masFalladoViraje(rs: Resultado[], idioma: Idioma): string | null {
  const fuera = (c: Campo) => rs.reduce((s, r) => s + r.lados.reduce((t, l) => t + l.fuera[c].reduce((u, tr) => u + tr.fin - tr.inicio, 0), 0), 0);
  const peorCampo = CAMPOS.reduce((a, b) => (fuera(b) > fuera(a) ? b : a));
  if (fuera(peorCampo) <= 0) return null;
  const [nombre, consejo] = CONSEJO[idioma][peorCampo];
  return idioma === "en" ? `What slipped the most was your ${nombre}: ${consejo}` : `Lo que más se te salió fue ${nombre}: ${consejo}`;
}

/** Lo que cambia del debriefing según la maniobra. */
export type OpcionesDebriefing = {
  masFallado: (rs: any[], idioma: Idioma) => string | null;
  repetir: (r: any, idioma: Idioma) => string | null;
  calificado: Record<Idioma, string>;
};
export const DEBRIEF_VIRAJE: OpcionesDebriefing = { masFallado: masFalladoViraje, repetir, calificado: { es: "checkride", en: "checkride" } };
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

/** Debriefing de la sesión: comparación de intentos, lo que más falló, qué repetir y material. */
export function debriefing(
  intentos: IntentoSesion[],
  material: Material[],
  idioma: Idioma = "es",
  respondidas: Respondida[] = [],
  op: OpcionesDebriefing = DEBRIEF_VIRAJE,
): { lineas: string[]; material: { titulo: string; to: string; exclusivo: boolean }[] } {
  const nombre = op.calificado[idioma];
  const en = idioma === "en";
  const n = intentos.length;
  const lineas = [
    en
      ? `You did ${n} graded attempt${n === 1 ? "" : "s"} this session.`
      : `Hiciste ${n} ${n === 1 ? "intento calificado" : "intentos calificados"} en esta sesión.`,
  ];
  const cal = (i: IntentoSesion) => i.resultado.calificacion;
  if (n >= 2) {
    const mejor = intentos.reduce((a, b) => (cal(b) > cal(a) ? b : a));
    const peor = intentos.reduce((a, b) => (cal(b) < cal(a) ? b : a));
    const num = (i: IntentoSesion) => intentos.indexOf(i) + 1;
    lineas.push(
      cal(mejor) === cal(peor)
        ? en
          ? `All ${n} attempts scored ${cal(mejor)} out of 100.`
          : `Los ${n} intentos sacaron ${cal(mejor)} de 100.`
        : en
          ? `Best: ${cal(mejor)} out of 100 (attempt ${num(mejor)}). Lowest: ${cal(peor)} out of 100 (attempt ${num(peor)}).`
          : `El mejor: ${cal(mejor)} de 100 (intento ${num(mejor)}). El más bajo: ${cal(peor)} de 100 (intento ${num(peor)}).`,
    );
  }
  const primera = intentos.find((i) => i.modo === "practica");
  const checkride = intentos.find((i) => i.modo === "checkride");
  if (primera && checkride) {
    const a = cal(primera);
    const c = cal(checkride);
    const tendencia =
      c > a
        ? en ? "You're improving." : "Vas mejorando."
        : c < a
          ? en ? `You dropped a little: that's normal under ${nombre} pressure.` : "Bajaste un poco: es normal con la presión del examen."
          : en ? "You stayed steady." : "Te mantuviste parejo.";
    lineas.push(
      en
        ? `From your first practice attempt to the ${nombre} you went from ${a} to ${c}. ${tendencia}`
        : `Del primer intento de práctica al ${nombre} pasaste de ${a} a ${c}. ${tendencia}`,
    );
  }
  const mas = op.masFallado(intentos.map((i) => i.resultado), idioma);
  if (mas) lineas.push(mas);
  if (checkride) {
    const r = checkride.resultado;
    lineas.push(
      en
        ? `${mayus(nombre)}: ${r.aprobado ? "passed" : "not passed"}, ${r.calificacion} out of 100.`
        : `${mayus(nombre)}: ${r.aprobado ? "aprobado" : "no aprobado"}, ${r.calificacion} de 100.`,
    );
  }
  lineas.push(...lineasPreguntas(respondidas, BANCO, idioma));
  const rep = n ? op.repetir(intentos[n - 1].resultado, idioma) : null;
  if (rep) lineas.push(rep); // siempre la última línea: vozDebriefing cuenta con eso
  return {
    lineas,
    material: material.map((m) => ({ titulo: en ? `${m.titulo.en} (in Spanish)` : m.titulo.es, to: m.to, exclusivo: m.exclusivo })),
  };
}

/** Lo que la voz lee del debriefing. Si lo último fue el checkride, su lectura ya dijo «Repite»: no se repite. */
export function vozDebriefing(lineas: string[], intentos: IntentoSesion[], detalle: Detalle): string[] {
  if (detalle === "necesario") return lineas.filter((l, k) => k === 0 || /^(Checkride|Intento calificado|Graded attempt|Preguntas|Questions):/.test(l));
  const yaDicho = intentos.at(-1)?.modo === "checkride" && /^(Repite|Repeat):/.test(lineas.at(-1) ?? "");
  return yaDicho ? lineas.slice(0, -1) : lineas;
}
