import { CAMPOS_RECTO, desvioRecto, type CampoRecto, type ResultadoRecto } from "./evaluadorRecto.ts";
import { reducir, type Linea } from "./explicacion.ts";
import type { Idioma } from "./idiomaInstructor.ts";
import { tolRecto, type Nivel } from "./nivel.ts";
import type { PasoRecto } from "./vozRecto.ts";

export function briefingRecto(idioma: Idioma, nivel: Nivel = 3): string[] {
  const TOL = tolRecto(nivel);
  const seg = TOL.duracionSeg;
  const dura = seg % 60 ? `${seg} ${idioma === "en" ? "seconds" : "segundos"}` : `${seg / 60} ${idioma === "en" ? (seg === 60 ? "minute" : "minutes") : seg === 60 ? "minuto" : "minutos"}`;
  if (idioma === "en") {
    return [
      "Today you'll practice straight-and-level flight in the Cessna 172: the foundation of every maneuver.",
      "Fly at any altitude and airspeed you like. Once the airplane is stable, the instructor takes your altitude, heading and airspeed.",
      `For ${dura} hold altitude ±${TOL.altitudFt} ft, heading ±${TOL.rumboGrados}° and airspeed ±${TOL.velocidadKt} kt, with the ball centered.`,
      "Set the attitude on the horizon, set the power and trim so you aren't holding the yoke.",
      "Look outside and scan the instruments in a cycle: attitude, altimeter, heading and airspeed.",
      "Practice first; whenever you want, move on to the graded attempt.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar vuelo recto y nivelado en el Cessna 172: la base de todas las maniobras.",
    "Vuela a la altitud y velocidad que quieras. Cuando el avión esté estable, el instructor toma tu altitud, rumbo y velocidad.",
    `Durante ${dura} mantén la altitud ±${TOL.altitudFt} ft, el rumbo ±${TOL.rumboGrados}° y la velocidad ±${TOL.velocidadKt} kt, con la bola centrada.`,
    "Fija la actitud con el horizonte, pon la potencia y compensa para no cargar el yugo.",
    "Mira afuera y revisa los instrumentos en ciclo: actitud, altímetro, rumbo y velocidad.",
    "Primero practicas; cuando quieras, pasas al intento calificado.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

const PASOS: PasoRecto[] = ["estabiliza", "manten", "mitad"];
const NOMBRE_PASO: Record<Idioma, string[]> = { es: ["Estabiliza", "Mantén", "Un minuto"], en: ["Stabilize", "Hold", "One minute"] };

export function listaPasosRecto(paso: PasoRecto | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({
    nombre: NOMBRE_PASO[idioma][k],
    estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente",
  }));
}

export function queHacerRecto(paso: PasoRecto | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "estabiliza") {
    return en
      ? "Wings level and power set: the instructor starts once the airplane stops climbing or descending."
      : "Alas niveladas y potencia fija: el instructor empieza cuando el avión deje de subir o bajar.";
  }
  if (paso === "manten" || paso === "mitad") return en ? "Trim, and correct with small changes." : "Compensa y corrige con cambios pequeños.";
  return "";
}

/** Nombre para «Lo que más se te salió fue…» y consejo, sin mayúscula inicial. */
const CONSEJO: Record<Idioma, Record<CampoRecto, [string, string]>> = {
  es: {
    altitud: ["la altitud", "revisa la actitud y compensa para no cargar el yugo."],
    rumbo: ["el rumbo", "mantén las alas niveladas y toma una referencia en el horizonte."],
    velocidad: ["la velocidad", "ajusta la potencia y deja que se estabilice antes de compensar."],
    bola: ["la coordinación", "corrige con el pedal."],
  },
  en: {
    altitud: ["altitude", "check your attitude and trim so you aren't holding the yoke."],
    rumbo: ["heading", "keep the wings level and pick a point on the horizon."],
    velocidad: ["airspeed", "set the power and let it settle before you trim."],
    bola: ["coordination", "correct with the rudder."],
  },
};
const ETIQUETA: Record<Idioma, Record<CampoRecto, string>> = {
  es: { altitud: "altitud", rumbo: "rumbo", velocidad: "velocidad", bola: "coordinación" },
  en: { altitud: "altitude", rumbo: "heading", velocidad: "airspeed", bola: "coordination" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarRecto(r: ResultadoRecto, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const c = CONSEJO[idioma];
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  const bajo = r.fuera.altitud.filter((tr) => tr.peor < 0);
  const alto = r.fuera.altitud.filter((tr) => tr.peor > 0);
  if (bajo.length) {
    const ft = Math.round(-Math.min(...bajo.map((tr) => tr.peor)));
    mal(en ? `You lost ${ft} ft. ${mayus(c.altitud[1])}` : `Perdiste ${ft} ft. ${mayus(c.altitud[1])}`);
  }
  if (alto.length) {
    const ft = Math.round(Math.max(...alto.map((tr) => tr.peor)));
    mal(en ? `You gained ${ft} ft. Lower the nose a little and trim.` : `Subiste ${ft} ft. Baja un poco la nariz y compensa.`);
  }
  if (r.fuera.rumbo.length) {
    const g = Math.round(Math.abs(r.peor.rumbo));
    mal(en ? `You drifted ${g}° off heading. ${mayus(c.rumbo[1])}` : `Te desviaste ${g}° del rumbo. ${mayus(c.rumbo[1])}`);
  }
  if (r.fuera.velocidad.length) {
    const kt = Math.round(Math.abs(r.peor.velocidad));
    mal(en ? `Your airspeed drifted ${kt} kt. ${mayus(c.velocidad[1])}` : `La velocidad se te fue ${kt} kt. ${mayus(c.velocidad[1])}`);
  }
  if (r.fuera.bola.length) mal(en ? "The ball left center: correct with the rudder." : "La bola se salió del centro: corrige con el pedal.");

  const limpios = CAMPOS_RECTO.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good the whole time." : ", bien todo el tramo."}` });
  }
  return lineas;
}

export function repetirRecto(r: ResultadoRecto, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: straight and level" : "Repite: recto y nivelado";
}

const segundosFuera = (r: ResultadoRecto, k: CampoRecto) => r.fuera[k].reduce((s, tr) => s + tr.fin - tr.inicio, 0);

/** El campo con más segundos fuera en todos los intentos, o null si todo estuvo dentro. */
export function masFalladoRecto(rs: ResultadoRecto[], idioma: Idioma): string | null {
  let peor: CampoRecto | null = null;
  let max = 0;
  for (const k of CAMPOS_RECTO) {
    const s = rs.reduce((acc, r) => acc + segundosFuera(r, k), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  const [nombre, consejo] = CONSEJO[idioma][peor];
  return idioma === "en" ? `What slipped the most was your ${nombre}: ${consejo}` : `Lo que más se te salió fue ${nombre}: ${consejo}`;
}

/** Sin muestras: una serie de ≤300 puntos por campo contra el objetivo. */
export function paraGuardarRecto(r: ResultadoRecto): Omit<ResultadoRecto, "muestras"> & { series: Record<CampoRecto, { t: number; v: number }[]> } {
  const { muestras, ...resto } = r;
  const series = Object.fromEntries(
    CAMPOS_RECTO.map((k) => [k, reducir(muestras.map((m) => ({ t: m.t, v: desvioRecto(m, r.objetivo, k) })))]),
  ) as Record<CampoRecto, { t: number; v: number }[]>;
  return { ...resto, series };
}
