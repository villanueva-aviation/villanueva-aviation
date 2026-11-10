import type { Muestra } from "./evaluador.ts";
import {
  ADELANTO_FT, BANDA, CAMPOS_ALTITUD, desvioAltitud, MANTENER_SEG, toleranciaAltitud,
  type CampoAltitud, type EvaluacionAltitud, type ResultadoAltitud,
} from "./evaluadorAltitud.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolAltitud, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, CORRECCION, CORTO, luz, NOMBRE, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en ascensos y descensos, el briefing y la explicación. Puro.

export type PasoAltitud = "estabiliza" | "cambia" | "manten" | "terminado" | "invalido";

export function pasoAltitud(ev: EvaluacionAltitud | null, _m: Muestra | null): PasoAltitud | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  return ev.fase === "armado" ? "estabiliza" : ev.fase === "cambiando" ? "cambia" : "manten";
}

const rumbo3 = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const banda = (sube: boolean) => (sube ? BANDA.sube : BANDA.baja);

function texto(paso: PasoAltitud, ev: EvaluacionAltitud | null, idioma: Idioma): string {
  const en = idioma === "en";
  const a = ev?.asignada;
  switch (paso) {
    case "estabiliza":
      return en ? "Level off and stabilize: wings level, constant altitude and airspeed." : "Nivela y estabiliza: alas niveladas, altitud y velocidad constantes.";
    case "cambia": {
      if (!a || !ev?.objetivo) return "";
      const [lo, hi] = banda(a.sube);
      const r = rumbo3(ev.objetivo.rumbo);
      return en
        ? `${a.sube ? "Climb" : "Descend"} to ${pies(a.altitud)} feet, between ${lo} and ${hi} knots. Hold heading ${r}.`
        : `${a.sube ? "Asciende" : "Desciende"} a ${pies(a.altitud)} pies, entre ${lo} y ${hi} nudos. Mantén rumbo ${r}.`;
    }
    case "manten":
      return a ? (en ? `Hold ${pies(a.altitud)} feet.` : `Mantén ${pies(a.altitud)} pies.`) : "";
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenAltitud(antes: PasoAltitud | null, ahora: PasoAltitud | null, ev: EvaluacionAltitud | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoAltitud(paso: PasoAltitud | null, ev: EvaluacionAltitud | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

function desviaciones(ev: EvaluacionAltitud | null, m: Muestra | null): Record<CampoAltitud, number | null> {
  const o = ev?.objetivo;
  const a = ev?.asignada;
  const vivo = ev?.fase === "cambiando" || ev?.fase === "manteniendo";
  return Object.fromEntries(
    CAMPOS_ALTITUD.map((c) => [c, m && o && a && vivo ? desvioAltitud(m, o, a, c, ev.fase === "manteniendo") : null]),
  ) as Record<CampoAltitud, number | null>;
}

export function semaforoAltitud(ev: EvaluacionAltitud | null, m: Muestra | null): Record<CampoAltitud, Luz> {
  const d = desviaciones(ev, m);
  return Object.fromEntries(CAMPOS_ALTITUD.map((c) => [c, luz(d[c], toleranciaAltitud(ev?.nivel)[c])])) as Record<CampoAltitud, Luz>;
}

const PROPIOS: Record<Idioma, { corto: { rumbo: string }; nombre: { rumbo: string }; correccion: Pick<Record<CampoAltitud, { mas: string; menos: string }>, "rumbo" | "velocidad"> }> = {
  es: {
    corto: { rumbo: "Cuida el rumbo" },
    nombre: { rumbo: "rumbo" },
    correccion: {
      rumbo: { mas: "Te vas a la derecha: regresa a tu rumbo", menos: "Te vas a la izquierda: pie derecho y regresa a tu rumbo" },
      velocidad: { mas: "Vas rápido: sube un poco la nariz", menos: "Vas lento: baja un poco la nariz" },
    },
  },
  en: {
    corto: { rumbo: "Watch your heading" },
    nombre: { rumbo: "heading" },
    correccion: {
      rumbo: { mas: "Drifting right: back to your heading", menos: "Drifting left: right rudder and back to your heading" },
      velocidad: { mas: "Fast: raise the nose a little", menos: "Slow: lower the nose a little" },
    },
  },
};

export function avisoAltitud(ev: EvaluacionAltitud | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  const p = PROPIOS[idioma];
  const textos = {
    corto: { ...CORTO[idioma], ...p.corto },
    correccion: { ...CORRECCION[idioma], ...p.correccion },
    nombre: { ...NOMBRE[idioma], ...p.nombre },
  };
  return avisoDe(desviaciones(ev, m), toleranciaAltitud(ev?.nivel), CAMPOS_ALTITUD, textos, modo, idioma);
}

export function briefingAltitud(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolAltitud(nivel);
  const [sl, sh] = BANDA.sube;
  const [bl, bh] = BANDA.baja;
  if (idioma === "en") {
    return [
      "Today you'll practice climbs and descents in the Cessna 172.",
      "Fly straight and level at any altitude and airspeed you like. Once the airplane is stable, the instructor gives you an altitude 500 ft above or below.",
      `Climb with full power between ${sl} and ${sh} kt; descend with reduced power between ${bl} and ${bh} kt (about 500 ft/min). Margin: ${T.velocidadKt} kt outside the band.`,
      `Hold your heading ±${T.rumboGrados}° the whole time, with the ball centered. Climbing at full power takes right rudder.`,
      `Start leveling off about ${ADELANTO_FT} ft before the altitude and hold it ±${T.altitudFt} ft for ${MANTENER_SEG} seconds, back at cruise power.`,
      "Practice first; whenever you want, move on to the graded attempt.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar ascensos y descensos en el Cessna 172.",
    "Vuela recto y nivelado a la altitud y velocidad que quieras. Cuando el avión esté estable, el instructor te da una altitud 500 ft arriba o abajo.",
    `Sube con potencia completa entre ${sl} y ${sh} kt; baja con potencia reducida entre ${bl} y ${bh} kt (unos 500 ft/min). Margen: ${T.velocidadKt} kt fuera de la banda.`,
    `Mantén el rumbo ±${T.rumboGrados}° todo el tiempo, con la bola centrada. Subiendo con potencia completa hace falta pie derecho.`,
    `Empieza a nivelar unos ${ADELANTO_FT} ft antes de la altitud y mantenla ±${T.altitudFt} ft durante ${MANTENER_SEG} segundos, ya con potencia de crucero.`,
    "Primero practicas; cuando quieras, pasas al intento calificado.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

const PASOS: PasoAltitud[] = ["estabiliza", "cambia", "manten"];
const NOMBRE_PASO: Record<Idioma, string[]> = { es: ["Estabiliza", "Sube o baja", "Mantén la altitud"], en: ["Stabilize", "Climb or descend", "Hold the altitude"] };

export function listaPasosAltitud(paso: PasoAltitud | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerAltitud(paso: PasoAltitud | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "estabiliza") return en ? "Wings level and power set: the instructor gives you the altitude once the airplane is stable." : "Alas niveladas y potencia fija: el instructor te da la altitud cuando el avión esté estable.";
  if (paso === "cambia") return en ? `Start leveling off about ${ADELANTO_FT} ft before the altitude.` : `Empieza a nivelar unos ${ADELANTO_FT} ft antes de la altitud.`;
  if (paso === "manten") return en ? "Cruise power and trim." : "Potencia de crucero y compensa.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoAltitud, string>> = {
  es: { altitud: "altitud", velocidad: "velocidad", rumbo: "rumbo", bola: "coordinación" },
  en: { altitud: "altitude", velocidad: "airspeed", rumbo: "heading", bola: "coordination" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarAltitud(r: ResultadoAltitud, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const o = r.objetivo;
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.velocidad.length) {
    const [lo, hi] = banda(o.sube);
    const kt = Math.round((r.peor.velocidad > 0 ? hi : lo) + r.peor.velocidad);
    const nariz = r.peor.velocidad > 0 ? (en ? "raise the nose a little" : "sube un poco la nariz") : en ? "lower the nose a little" : "baja un poco la nariz";
    mal(en
      ? `You ${o.sube ? "climbed" : "descended"} at ${kt} kt: ${nariz} to stay between ${lo} and ${hi}.`
      : `${o.sube ? "Subiste" : "Bajaste"} a ${kt} kt: ${nariz} para quedar entre ${lo} y ${hi}.`);
  }
  if (r.fuera.altitud.length) {
    const tol = toleranciaAltitud(r.nivel).altitud;
    const d = Math.round(r.altitudAlNivelar * (o.sube ? 1 : -1)); // positivo: se pasó
    const al = pies(o.altitudFinal + r.altitudAlNivelar);
    const debia = pies(o.altitudFinal);
    if (Math.abs(d) > tol && d > 0) {
      mal(en
        ? `You leveled off at ${al} and needed ${debia}: you overshot by ${d} ft. Start leveling off about ${ADELANTO_FT} ft before.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te pasaste ${d} ft. Empieza a nivelar unos ${ADELANTO_FT} ft antes.`);
    } else if (Math.abs(d) > tol) {
      mal(en
        ? `You leveled off at ${al} and needed ${debia}: you stopped ${-d} ft short. Keep going and level off about ${ADELANTO_FT} ft before, not earlier.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te quedaste corto ${-d} ft. Sigue y nivela unos ${ADELANTO_FT} ft antes, no antes.`);
    } else {
      const ft = Math.round(Math.abs(r.peor.altitud));
      mal(en
        ? `After leveling off you drifted ${ft} ft from ${debia}: set cruise power and trim.`
        : `Después de nivelar se te fue la altitud ${ft} ft de ${debia}: pon potencia de crucero y compensa.`);
    }
  }
  if (r.fuera.rumbo.length) {
    const g = Math.round(Math.abs(r.peor.rumbo));
    const izq = r.peor.rumbo < 0;
    mal(en
      ? `You drifted ${g}° ${izq ? "left" : "right"} of your heading.${izq && o.sube ? " Climbing at full power the airplane yaws left: right rudder." : " Keep the wings level and pick a point on the horizon."}`
      : `Te desviaste ${g}° a la ${izq ? "izquierda" : "derecha"} de tu rumbo.${izq && o.sube ? " Subiendo con potencia completa el avión se va a la izquierda: pie derecho." : " Alas niveladas y una referencia en el horizonte."}`);
  }
  if (r.fuera.bola.length) {
    mal(o.sube
      ? en ? "The ball left center: climbing at full power, right rudder." : "La bola se salió del centro: subiendo con potencia completa, pie derecho."
      : en ? "The ball left center: correct with the rudder." : "La bola se salió del centro: corrige con el pedal.");
  }
  const limpios = CAMPOS_ALTITUD.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good the whole time." : ", bien todo el tiempo."}` });
  }
  return lineas;
}

export function repetirAltitud(r: ResultadoAltitud, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: climbs and descents" : "Repite: ascensos y descensos";
}

export function masFalladoAltitud(rs: ResultadoAltitud[], idioma: Idioma): string | null {
  let peor: CampoAltitud | null = null;
  let max = 0;
  for (const k of CAMPOS_ALTITUD) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was your ${ETIQUETA.en[peor]}.` : `Lo que más se te salió fue ${peor === "rumbo" ? "el" : "la"} ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como virajes a rumbos. */
export function paraGuardarAltitud(r: ResultadoAltitud): Omit<ResultadoAltitud, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
