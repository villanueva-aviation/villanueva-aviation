import { CAMPOS_LENTO, desvioLento, type CampoLento, type ResultadoLento } from "./evaluadorLento.ts";
import { reducir, type Linea } from "./explicacion.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";
import { GIRO_GRADOS, INCLINACION_VIRAJE, OBJETIVO_KT, RECTO_SEG } from "./vueloLento.ts";
import { tolLento, type Nivel } from "./nivel.ts";
import type { PasoLento } from "./vozLento.ts";

const ALTURA = ALTURA_SEGURA_AGL.toLocaleString("en-US");

export function briefingLento(idioma: Idioma, nivel: Nivel = 3): string[] {
  const TOL = tolLento(nivel);
  const MAX_KT = OBJETIVO_KT + TOL.velocidadMasKt;
  if (idioma === "en") {
    return [
      "Today you'll practice slow flight in the Cessna 172: full control just above the stall, like on short final.",
      `Fly at ${ALTURA} ft above the ground or higher, and clear the area before you start.`,
      `Full flaps and reduce power: slow to ${OBJETIVO_KT} kt holding your altitude. Without flaps the stall warning sounds near that speed.`,
      `Hold ${OBJETIVO_KT} to ${MAX_KT} kt straight and level for about ${RECTO_SEG} s, then a gentle ${GIRO_GRADOS}° turn each way at ${INCLINACION_VIRAJE}° of bank, and recover with full power.`,
      `Tolerances: altitude ±${TOL.altitudFt} ft, heading ±${TOL.rumboGrados}° on the straight leg, bank ±${TOL.inclinacionGrados}° in the turns and airspeed +${TOL.velocidadMasKt}/−0 kt.`,
      "Pitch controls the airspeed and power controls the altitude. If the stall warning sounds, the attempt does not pass.",
      "Practice first; whenever you want, move on to the checkride.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar vuelo lento en el Cessna 172: control total justo arriba de la pérdida, como en una final corta.",
    `Vuela a ${ALTURA} ft sobre el terreno o más, y despeja el área antes de empezar.`,
    `Flaps completos y reduce la potencia: baja a ${OBJETIVO_KT} kt manteniendo la altitud. Sin flaps el aviso de pérdida suena cerca de esa velocidad.`,
    `Mantén de ${OBJETIVO_KT} a ${MAX_KT} kt en recto y nivelado unos ${RECTO_SEG} s, luego un viraje suave de ${GIRO_GRADOS}° a cada lado con ${INCLINACION_VIRAJE}° de inclinación, y sal con potencia completa.`,
    `Tolerancias: altitud ±${TOL.altitudFt} ft, rumbo ±${TOL.rumboGrados}° en el tramo recto, inclinación ±${TOL.inclinacionGrados}° en los virajes y velocidad +${TOL.velocidadMasKt}/−0 kt.`,
    "La nariz controla la velocidad y la potencia controla la altitud. Si suena el aviso de pérdida, el intento no pasa.",
    "Primero practicas; cuando quieras, pasas al checkride.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

const PASOS: PasoLento[] = ["reduce", "recto", "vira1", "vira2", "sal"];
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Reduce", `Recto ${RECTO_SEG} s`, "Viraje 1", "Viraje 2", "Salida"],
  en: ["Slow down", `Straight ${RECTO_SEG} s`, "Turn 1", "Turn 2", "Recover"],
};

export function listaPasosLento(paso: PasoLento | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "sube" ? 0 : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({
    nombre: NOMBRE_PASO[idioma][k],
    estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente",
  }));
}

export function queHacerLento(paso: PasoLento | null, idioma: Idioma): string {
  const en = idioma === "en";
  switch (paso) {
    case "sube":
      return en ? `Climb first: the maneuver is flown at ${ALTURA} ft above the ground or higher.` : `Sube primero: la maniobra se vuela a ${ALTURA} ft sobre el terreno o más.`;
    case "reduce":
      return en
        ? `Raise the nose little by little as you slow down; the instructor starts once you are steady at ${OBJETIVO_KT} kt or a little above.`
        : `Sube la nariz poco a poco mientras bajas la velocidad; el instructor empieza cuando quedes estable en ${OBJETIVO_KT} kt o un poco más.`;
    case "recto":
      return en ? "Nose for airspeed, power for altitude, and trim." : "Nariz para la velocidad, potencia para la altitud, y compensa.";
    case "vira1":
    case "vira2":
      return en ? "Gentle bank, a little rudder and a touch of power to hold altitude." : "Inclinación suave, un poco de pedal y algo de potencia para mantener la altitud.";
    case "sal":
      return en ? "Full power first, then flaps up in stages without losing altitude." : "Primero potencia completa, luego flaps arriba por etapas sin perder altitud.";
    default:
      return "";
  }
}

/** Nombre para «Lo que más se te salió fue…» y consejo, sin mayúscula inicial. */
const CONSEJO: Record<Idioma, Record<CampoLento, [string, string]>> = {
  es: {
    altitud: ["la altitud", "corrige la altitud con la potencia y la velocidad con la nariz."],
    rumbo: ["el rumbo", "mantén las alas niveladas con pedal y alerones suaves."],
    velocidad: ["la velocidad", "corrige con la nariz y deja que se estabilice antes de compensar."],
    inclinacion: ["la inclinación", `mantén ${INCLINACION_VIRAJE}° en el horizonte: a baja velocidad no hace falta más.`],
    bola: ["la coordinación", "a baja velocidad necesitas más pedal: corrige la bola con el pie."],
  },
  en: {
    altitud: ["altitude", "fix the altitude with power and the airspeed with the nose."],
    rumbo: ["heading", "keep the wings level with gentle rudder and aileron."],
    velocidad: ["airspeed", "correct with the nose and let it settle before you trim."],
    inclinacion: ["bank", `hold ${INCLINACION_VIRAJE}° on the horizon: at low airspeed you don't need more.`],
    bola: ["coordination", "at low airspeed you need more rudder: center the ball with your feet."],
  },
};
const ETIQUETA: Record<Idioma, Record<CampoLento, string>> = {
  es: { altitud: "altitud", rumbo: "rumbo", velocidad: "velocidad", inclinacion: "inclinación", bola: "coordinación" },
  en: { altitud: "altitude", rumbo: "heading", velocidad: "airspeed", inclinacion: "bank", bola: "coordination" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarLento(r: ResultadoLento, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const c = CONSEJO[idioma];
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.perdidas.length) {
    const n = r.perdidas.length;
    const s = Math.round(r.perdidas[0] - r.objetivo.t);
    mal(
      en
        ? `The stall warning sounded ${n === 1 ? "once" : `${n} times`}, first at second ${s}. Lower the nose a little: the airspeed must stay above ${OBJETIVO_KT} kt.`
        : `Sonó el aviso de pérdida ${n === 1 ? "una vez" : `${n} veces`}, la primera en el segundo ${s}. Baja un poco la nariz: la velocidad debe quedar arriba de ${OBJETIVO_KT} kt.`,
    );
  }
  if (r.bajo) mal(en ? `You went below ${ALTURA} ft above the ground: start higher.` : `Bajaste de ${ALTURA} ft sobre el terreno: empieza más alto.`);
  if (r.virajes === false) mal(en ? "You didn't complete both turns: after the first one, turn 90° the other way." : "No completaste los dos virajes: después del primero, vira 90° al lado contrario.");
  else if (!r.salio) mal(en ? "You didn't recover with power: full power first, then flaps up in stages." : "No saliste con potencia: primero potencia completa, luego flaps arriba por etapas.");
  const bajo = r.fuera.altitud.filter((tr) => tr.peor < 0);
  const alto = r.fuera.altitud.filter((tr) => tr.peor > 0);
  if (bajo.length) {
    const ft = Math.round(-Math.min(...bajo.map((tr) => tr.peor)));
    mal(en ? `You lost ${ft} ft. ${mayus(c.altitud[1])}` : `Perdiste ${ft} ft. ${mayus(c.altitud[1])}`);
  }
  if (alto.length) {
    const ft = Math.round(Math.max(...alto.map((tr) => tr.peor)));
    mal(en ? `You gained ${ft} ft. Reduce power a little.` : `Subiste ${ft} ft. Reduce un poco la potencia.`);
  }
  if (r.fuera.rumbo.length) {
    const g = Math.round(Math.abs(r.peor.rumbo));
    mal(en ? `You drifted ${g}° off heading on a straight leg. ${mayus(c.rumbo[1])}` : `Te desviaste ${g}° del rumbo en un tramo recto. ${mayus(c.rumbo[1])}`);
  }
  if (r.fuera.velocidad.length) {
    const kt = Math.round(OBJETIVO_KT + r.peor.velocidad);
    mal(
      r.peor.velocidad < 0
        ? en ? `Your airspeed dropped to ${kt} kt, below the band. ${mayus(c.velocidad[1])}` : `La velocidad bajó a ${kt} kt, abajo de la banda. ${mayus(c.velocidad[1])}`
        : en ? `Your airspeed rose to ${kt} kt, above the band. ${mayus(c.velocidad[1])}` : `La velocidad subió a ${kt} kt, arriba de la banda. ${mayus(c.velocidad[1])}`,
    );
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(INCLINACION_VIRAJE + r.peor.inclinacion);
    mal(en ? `Your bank reached ${g}° in a turn. ${mayus(c.inclinacion[1])}` : `La inclinación llegó a ${g}° en un viraje. ${mayus(c.inclinacion[1])}`);
  }
  if (r.fuera.bola.length) mal(en ? `The ball left center. ${mayus(c.bola[1])}` : `La bola se salió del centro. ${mayus(c.bola[1])}`);

  const limpios = CAMPOS_LENTO.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good the whole time." : ", bien todo el tramo."}` });
  }
  if (!r.perdidas.length) lineas.push({ tipo: "bien", texto: en ? "The stall warning never sounded." : "El aviso de pérdida nunca sonó." });
  return lineas;
}

/** Lo que se repite primero: el aviso de pérdida, la altura y la salida. */
export function repetirLento(r: ResultadoLento, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  const en = idioma === "en";
  if (r.perdidas.length) return en ? "Repeat: slow flight without the stall warning" : "Repite: vuelo lento sin que suene el aviso de pérdida";
  if (r.bajo) return en ? `Repeat: slow flight at ${ALTURA} ft above the ground or higher` : `Repite: vuelo lento a ${ALTURA} ft sobre el terreno o más`;
  if (r.virajes === false) return en ? "Repeat: slow flight with both turns" : "Repite: vuelo lento con los dos virajes";
  if (!r.salio) return en ? "Repeat: slow flight and the recovery with power" : "Repite: vuelo lento y la salida con potencia";
  return en ? "Repeat: slow flight" : "Repite: vuelo lento";
}

const segundosFuera = (r: ResultadoLento, k: CampoLento) => r.fuera[k].reduce((s, tr) => s + tr.fin - tr.inicio, 0);

/** El aviso de pérdida si sonó en algún intento; si no, el campo con más segundos fuera, o null. */
export function masFalladoLento(rs: ResultadoLento[], idioma: Idioma): string | null {
  const en = idioma === "en";
  if (rs.some((r) => r.perdidas.length)) {
    return en
      ? "What cost you the most was the stall warning: lower the nose a little and hold the airspeed with pitch."
      : "Lo que más te costó fue el aviso de pérdida: baja un poco la nariz y sostén la velocidad con el cabeceo.";
  }
  let peor: CampoLento | null = null;
  let max = 0;
  for (const k of CAMPOS_LENTO) {
    const s = rs.reduce((acc, r) => acc + segundosFuera(r, k), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  const [nombre, consejo] = CONSEJO[idioma][peor];
  return en ? `What slipped the most was your ${nombre}: ${consejo}` : `Lo que más se te salió fue ${nombre}: ${consejo}`;
}

/** Sin muestras: una serie de ≤300 puntos por campo; la velocidad contra OBJETIVO_KT. */
export function paraGuardarLento(r: ResultadoLento): Omit<ResultadoLento, "muestras"> & { series: Record<CampoLento, { t: number; v: number }[]> } {
  const { muestras, ...resto } = r;
  const series = Object.fromEntries(
    CAMPOS_LENTO.map((k) => [k, reducir(muestras.map((m) => ({ t: m.t, v: k === "velocidad" ? m.velocidad - OBJETIVO_KT : desvioLento(m, r.objetivo, k) })))]),
  ) as Record<CampoLento, { t: number; v: number }[]>;
  return { ...resto, series };
}
