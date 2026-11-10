import { BANDA } from "./evaluadorAltitud.ts";
import type { Muestra } from "./evaluador.ts";
import {
  ARMA_AGL, CAMPOS_FALLA, desvioFalla, MIN_AGL, PLANEO_KT, RECUPERA_AGL, toleranciaFalla,
  type CampoFalla, type EvaluacionFalla, type ItemFalla, type ResultadoFalla,
} from "./evaluadorFalla.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolFalla, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la falla de motor simulada, el briefing y la explicación. Puro.

export type PasoFalla = "sube" | "estabiliza" | "falla" | "planea" | "recupera" | "asciende" | "terminado" | "invalido";

export function pasoFalla(ev: EvaluacionFalla | null, m: Muestra | null): PasoFalla | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  if (ev.fase === "armado") return m && m.agl < ARMA_AGL ? "sube" : "estabiliza";
  if (ev.fase === "falla") return ev.ralenti ? "planea" : "falla";
  return ev.fase === "recupera" ? "recupera" : "asciende";
}

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const seg = (s: number) => String(Math.round(s * 10) / 10);
const [al, ah] = BANDA.sube;

export const ITEM: Record<Idioma, Record<ItemFalla, string>> = {
  es: { mezcla: "mezcla rica", selector: "selector en ambos", bomba: "bomba auxiliar encendida", magnetos: "magnetos en ambos" },
  en: { mezcla: "mixture rich", selector: "fuel selector both", bomba: "fuel pump on", magnetos: "magnetos both" },
};
const lista = (xs: string[], idioma: Idioma) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${idioma === "en" ? "and" : "y"} ${xs[xs.length - 1]}`);
const checklist = (idioma: Idioma) => (Object.values(ITEM[idioma]) as string[]).join(", ");

function texto(paso: PasoFalla, ev: EvaluacionFalla | null, idioma: Idioma): string {
  const en = idioma === "en";
  switch (paso) {
    case "sube": return en ? `Climb to ${pies(ARMA_AGL)} feet above the ground or higher and fly straight and level.` : `Sube a ${pies(ARMA_AGL)} pies sobre el terreno o más y vuela recto y nivelado.`;
    case "estabiliza": return en ? "Straight and level: wings level, constant altitude and airspeed." : "Recto y nivelado: alas niveladas, altitud y velocidad constantes.";
    case "falla": return en ? "Engine failure." : "Falla de motor.";
    case "planea": return en ? `Glide at ${PLANEO_KT} knots: ${checklist("en")}.` : `Planea a ${PLANEO_KT} nudos: ${checklist("es")}.`;
    case "recupera": return en ? "Recover: full power." : "Recupera: potencia completa.";
    case "asciende": return en ? `Climb between ${al} and ${ah} knots.` : `Asciende entre ${al} y ${ah} nudos.`;
    case "terminado": return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido": return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenFalla(antes: PasoFalla | null, ahora: PasoFalla | null, ev: EvaluacionFalla | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma);
}

export function textoPasoFalla(paso: PasoFalla | null, ev: EvaluacionFalla | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

type CampoAviso = "planeo" | "ascenso";
const AVISOS: CampoAviso[] = ["planeo", "ascenso"];
const desviaciones = (ev: EvaluacionFalla | null, m: Muestra | null) =>
  ({ planeo: ev && m ? desvioFalla(m, ev, "planeo") : null, ascenso: ev && m ? desvioFalla(m, ev, "ascenso") : null });

export function semaforoFalla(ev: EvaluacionFalla | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  const tol = toleranciaFalla(ev?.nivel);
  return { planeo: luz(d.planeo, tol.planeo), ascenso: luz(d.ascenso, tol.ascenso) };
}

const AVISO_TEXTOS = {
  es: {
    corto: { planeo: "Cuida la velocidad", ascenso: "Cuida la velocidad" },
    nombre: { planeo: "velocidad", ascenso: "velocidad" },
    correccion: {
      planeo: { mas: `Vas rápido: sube un poco la nariz, ${PLANEO_KT} nudos`, menos: `Vas lento: baja un poco la nariz, ${PLANEO_KT} nudos` },
      ascenso: { mas: "Vas rápido: sube un poco la nariz", menos: "Vas lento: baja un poco la nariz" },
    },
  },
  en: {
    corto: { planeo: "Watch your airspeed", ascenso: "Watch your airspeed" },
    nombre: { planeo: "airspeed", ascenso: "airspeed" },
    correccion: {
      planeo: { mas: `Fast: raise the nose a little, ${PLANEO_KT} knots`, menos: `Slow: lower the nose a little, ${PLANEO_KT} knots` },
      ascenso: { mas: "Fast: raise the nose a little", menos: "Slow: lower the nose a little" },
    },
  },
};

export function avisoFalla(ev: EvaluacionFalla | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  return avisoDe(desviaciones(ev, m), toleranciaFalla(ev?.nivel), AVISOS, AVISO_TEXTOS[idioma], modo, idioma);
}

export function briefingFalla(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolFalla(nivel);
  if (idioma === "en") {
    return [
      "Today you'll practice a simulated engine failure in the Cessna 172. The engine keeps running: you play the failure with the throttle.",
      `Fly straight and level at ${pies(ARMA_AGL)} ft above the ground or higher. When the instructor says «Engine failure», throttle to idle within ${T.reaccionSeg} s.`,
      `Glide at ${PLANEO_KT} kt ±${T.velocidadKt} kt and run the checklist out loud: ${checklist("en")}.`,
      `At ${pies(RECUPERA_AGL)} ft above the ground the instructor says «Recover»: full power within ${T.reaccionSeg} s, never below ${MIN_AGL} ft, and climb between ${al} and ${ah} kt.`,
      "The instructor checks in the simulator what it can read: mixture, fuel selector, fuel pump and magnetos.",
    ];
  }
  return [
    "Hoy vas a practicar una falla de motor simulada en el Cessna 172. El motor sigue encendido: la falla la haces tú con el acelerador.",
    `Vuela recto y nivelado a ${pies(ARMA_AGL)} ft sobre el terreno o más. Cuando el instructor diga «Falla de motor», acelerador en ralentí en menos de ${T.reaccionSeg} s.`,
    `Planea a ${PLANEO_KT} kt ±${T.velocidadKt} kt y di el checklist en voz alta: ${checklist("es")}.`,
    `A ${pies(RECUPERA_AGL)} ft sobre el terreno el instructor dice «Recupera»: potencia completa en menos de ${T.reaccionSeg} s, nunca abajo de ${MIN_AGL} ft, y asciende entre ${al} y ${ah} kt.`,
    "El instructor revisa en el simulador lo que puede leer: mezcla, selector de combustible, bomba auxiliar y magnetos.",
  ];
}

const PASOS = ["estabiliza", "falla", "planea", "recupera", "asciende"] as const;
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Recto y nivelado", "Ralentí", "Planeo y checklist", "Recupera", "Asciende"],
  en: ["Straight and level", "Idle", "Glide and checklist", "Recover", "Climb"],
};

export function listaPasosFalla(paso: PasoFalla | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "sube" ? 0 : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerFalla(paso: PasoFalla | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "sube" || paso === "estabiliza") return en ? "Cruise power and trim: the instructor calls the failure once the airplane is stable." : "Potencia de crucero y compensa: el instructor da la falla cuando el avión esté estable.";
  if (paso === "falla") return en ? "Throttle to idle now." : "Acelerador en ralentí ya.";
  if (paso === "planea") return en ? `Pitch for ${PLANEO_KT} kt, trim, pick a field and run the checklist.` : `Actitud para ${PLANEO_KT} kt, compensa, escoge un campo y di el checklist.`;
  if (paso === "recupera") return en ? "Full power, right rudder, and pitch for the climb." : "Potencia completa, pie derecho y actitud de ascenso.";
  if (paso === "asciende") return en ? `Hold ${al} to ${ah} kt.` : `Mantén entre ${al} y ${ah} kt.`;
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoFalla, string>> = {
  es: { reaccion: "la reacción", planeo: "la velocidad de planeo", checklist: "el checklist", recuperacion: "la recuperación", ascenso: "el ascenso" },
  en: { reaccion: "reaction", planeo: "glide airspeed", checklist: "checklist", recuperacion: "recovery", ascenso: "climb" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarFalla(r: ResultadoFalla, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const T = tolFalla(r.nivel);
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.reaccion.length) {
    mal(en
      ? `You took ${seg(r.reaccionSeg)} s to go to idle: at the failure, throttle back right away (${T.reaccionSeg} s at most).`
      : `Tardaste ${seg(r.reaccionSeg)} s en poner ralentí: a la falla, acelerador atrás de inmediato (máximo ${T.reaccionSeg} s).`);
  }
  if (r.fuera.planeo.length) {
    const kt = Math.round(PLANEO_KT + r.peor.planeo);
    const nariz = r.peor.planeo > 0 ? (en ? "raise the nose and trim" : "sube la nariz y compensa") : en ? "lower the nose and trim" : "baja la nariz y compensa";
    mal(en ? `You glided at ${kt} kt: ${nariz} for ${PLANEO_KT}.` : `Planeaste a ${kt} kt: ${nariz} para ${PLANEO_KT}.`);
  }
  if (r.faltan.length) {
    const xs = r.faltan.map((x) => ITEM[idioma][x]);
    mal(en ? `Missing from the checklist: ${lista(xs, "en")}.` : `Te faltó del checklist: ${xs.join(", ")}.`);
  }
  if (r.fuera.recuperacion.length) {
    const ft = pies(r.recuperaAgl);
    if (r.recuperoAntes) {
      mal(en
        ? `You recovered at ${ft} ft above the ground, before the call: keep gliding until the instructor says «Recover».`
        : `Recuperaste a ${ft} ft sobre el terreno, antes de la orden: planea hasta que el instructor diga «Recupera».`);
    }
    if (!r.recuperoAntes && r.recuperaSeg !== null && r.recuperaSeg > T.reaccionSeg) {
      mal(en
        ? `You took ${seg(r.recuperaSeg)} s to add full power after the call: ${T.reaccionSeg} s at most.`
        : `Tardaste ${seg(r.recuperaSeg)} s en dar potencia completa tras la orden: máximo ${T.reaccionSeg} s.`);
    }
    if (r.recuperaAgl < MIN_AGL) {
      mal(en ? `You recovered at ${ft} ft above the ground: never go below ${MIN_AGL}.` : `Recuperaste a ${ft} ft sobre el terreno: nunca bajes de ${MIN_AGL}.`);
    }
  }
  if (r.fuera.ascenso.length) {
    const kt = Math.round((r.peor.ascenso > 0 ? ah : al) + r.peor.ascenso);
    const nariz = r.peor.ascenso > 0 ? (en ? "raise the nose a little" : "sube un poco la nariz") : en ? "lower the nose a little" : "baja un poco la nariz";
    mal(en ? `You climbed at ${kt} kt: ${nariz} to stay between ${al} and ${ah}.` : `Ascendiste a ${kt} kt: ${nariz} para quedar entre ${al} y ${ah}.`);
  }
  const limpios = CAMPOS_FALLA.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k].replace(/^(el|la) /, ""));
  if (limpios.length) lineas.push({ tipo: "bien", texto: `${mayus(lista(limpios, idioma))}${en ? ", good." : ", bien."}` });
  return lineas;
}

export function repetirFalla(r: ResultadoFalla, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: engine failure" : "Repite: falla de motor";
}

export function masFalladoFalla(rs: ResultadoFalla[], idioma: Idioma): string | null {
  let peor: CampoFalla | null = null;
  let max = 0;
  for (const k of CAMPOS_FALLA) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio + 1, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was your ${ETIQUETA.en[peor]}.` : `Lo que más se te salió fue ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las lecciones 4 a 6 y 14. */
export function paraGuardarFalla(r: ResultadoFalla): Omit<ResultadoFalla, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
