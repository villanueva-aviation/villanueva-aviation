import type { Muestra } from "./evaluador.ts";
import { ADELANTO_FT, BANDA } from "./evaluadorAltitud.ts";
import {
  ADELANTO_GRADOS_COMB, CAMPOS_COMBINADO, desvioCombinado, INCLINACION_COMBINADO, MANTENER_SEG, toleranciaCombinado,
  type CampoCombinado, type EvaluacionCombinado, type ResultadoCombinado,
} from "./evaluadorCombinado.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolCombinado, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, CORRECCION, CORTO, luz, NOMBRE, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en virajes ascendiendo y descendiendo, el briefing y la explicación. Puro.

export type PasoCombinado = "estabiliza" | "vira" | "rumbo" | "altitud" | "manten" | "terminado" | "invalido";

export function pasoCombinado(ev: EvaluacionCombinado | null, _m: Muestra | null): PasoCombinado | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  if (ev.fase === "armado") return "estabiliza";
  if (ev.fase === "manteniendo") return "manten";
  return ev.alas ? "rumbo" : ev.nivelada ? "altitud" : "vira";
}

const rumbo3 = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");
const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const banda = (sube: boolean) => (sube ? BANDA.sube : BANDA.baja);

function texto(paso: PasoCombinado, ev: EvaluacionCombinado | null, idioma: Idioma): string {
  const en = idioma === "en";
  const a = ev?.asignado;
  const h = ev?.asignada;
  if (paso === "estabiliza") return en ? "Level off and stabilize: wings level, constant altitude and airspeed." : "Nivela y estabiliza: alas niveladas, altitud y velocidad constantes.";
  if (paso === "terminado") return en ? "Maneuver complete." : "Maniobra terminada.";
  if (paso === "invalido") return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  if (!a || !h) return "";
  const r = rumbo3(a.rumbo);
  const alt = pies(h.altitud);
  const verbo = en ? (h.sube ? "climbing" : "descending") : h.sube ? "ascendiendo" : "descendiendo";
  if (paso === "vira") {
    const [lo, hi] = banda(h.sube);
    return en
      ? `Turn ${a.lado === "derecha" ? "right" : "left"} to heading ${r} ${verbo} to ${alt} feet, between ${lo} and ${hi} knots, ${INCLINACION_COMBINADO} degrees of bank.`
      : `Vira por la ${a.lado} al rumbo ${r} ${verbo} a ${alt} pies, entre ${lo} y ${hi} nudos, con ${INCLINACION_COMBINADO} grados de inclinación.`;
  }
  if (paso === "rumbo") return en ? `Heading ${r}: wings level and keep ${verbo} to ${alt} feet.` : `Rumbo ${r}: alas niveladas y sigue ${verbo} a ${alt} pies.`;
  if (paso === "altitud") return en ? `${alt} feet: level off and keep turning to ${r}.` : `${alt} pies: nivela y sigue virando al ${r}.`;
  return en ? `Hold heading ${r} and ${alt} feet.` : `Mantén rumbo ${r} y ${alt} pies.`;
}

export function ordenCombinado(antes: PasoCombinado | null, ahora: PasoCombinado | null, ev: EvaluacionCombinado | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoCombinado(paso: PasoCombinado | null, ev: EvaluacionCombinado | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

function desviaciones(ev: EvaluacionCombinado | null, m: Muestra | null): Record<CampoCombinado, number | null> {
  const vivo = ev?.fase === "virando" || ev?.fase === "manteniendo";
  return Object.fromEntries(
    CAMPOS_COMBINADO.map((c) => [
      c,
      m && vivo && ev.objetivo && ev.asignado && ev.asignada ? desvioCombinado(m, ev.objetivo, ev.asignado, ev.asignada, c, ev.girado, !!ev.alas, !!ev.nivelada) : null,
    ]),
  ) as Record<CampoCombinado, number | null>;
}

export function semaforoCombinado(ev: EvaluacionCombinado | null, m: Muestra | null): Record<CampoCombinado, Luz> {
  const d = desviaciones(ev, m);
  return Object.fromEntries(CAMPOS_COMBINADO.map((c) => [c, luz(d[c], toleranciaCombinado(ev?.nivel)[c])])) as Record<CampoCombinado, Luz>;
}

type Propios = { corto: { rumbo: string }; nombre: { rumbo: string }; correccion: Pick<Record<CampoCombinado, { mas: string; menos: string }>, "rumbo" | "inclinacion" | "velocidad"> };
const PROPIOS: Record<Idioma, Propios> = {
  es: {
    corto: { rumbo: "Cuida el rumbo" },
    nombre: { rumbo: "rumbo" },
    correccion: {
      rumbo: { mas: "Te vas a la derecha: regresa a tu rumbo", menos: "Te vas a la izquierda: regresa a tu rumbo" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_COMBINADO} grados: afloja la inclinación`, menos: `Te falta inclinación: lleva el avión a ${INCLINACION_COMBINADO} grados` },
      velocidad: { mas: "Vas rápido: sube un poco la nariz", menos: "Vas lento: baja un poco la nariz" },
    },
  },
  en: {
    corto: { rumbo: "Watch your heading" },
    nombre: { rumbo: "heading" },
    correccion: {
      rumbo: { mas: "Drifting right: back to your heading", menos: "Drifting left: back to your heading" },
      inclinacion: { mas: `Past ${INCLINACION_COMBINADO} degrees: shallow the bank`, menos: `Not enough bank: roll to ${INCLINACION_COMBINADO} degrees` },
      velocidad: { mas: "Fast: raise the nose a little", menos: "Slow: lower the nose a little" },
    },
  },
};

export function avisoCombinado(ev: EvaluacionCombinado | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  const p = PROPIOS[idioma];
  const textos = {
    corto: { ...CORTO[idioma], ...p.corto },
    correccion: { ...CORRECCION[idioma], ...p.correccion },
    nombre: { ...NOMBRE[idioma], ...p.nombre },
  };
  return avisoDe(desviaciones(ev, m), toleranciaCombinado(ev?.nivel), CAMPOS_COMBINADO, textos, modo, idioma);
}

export function briefingCombinado(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolCombinado(nivel);
  const [sl, sh] = BANDA.sube;
  const [bl, bh] = BANDA.baja;
  const I = INCLINACION_COMBINADO;
  if (idioma === "en") {
    return [
      "Today you'll practice climbing and descending turns in the Cessna 172.",
      "Fly straight and level at any altitude and airspeed you like. Once the airplane is stable, the instructor gives you a heading, which way to turn, and an altitude 500 ft above or below.",
      `Turn with ${I}° of bank ±${T.inclinacionGrados}°. Climb with full power between ${sl} and ${sh} kt; descend with reduced power between ${bl} and ${bh} kt. Margin: ${T.velocidadKt} kt outside the band.`,
      `Heading and altitude are separate: roll out about ${ADELANTO_GRADOS_COMB}° before the heading (±${T.rumboGrados}°) and level off about ${ADELANTO_FT} ft before the altitude (±${T.altitudFt} ft). Whichever comes first, keep doing the other.`,
      `Then hold both for ${MANTENER_SEG} seconds, with the ball centered. Climbing at full power takes right rudder.`,
      "Practice first; whenever you want, move on to the graded attempt.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar virajes ascendiendo y descendiendo en el Cessna 172.",
    "Vuela recto y nivelado a la altitud y velocidad que quieras. Cuando el avión esté estable, el instructor te da un rumbo, el lado del viraje y una altitud 500 ft arriba o abajo.",
    `Vira con ${I}° de inclinación ±${T.inclinacionGrados}°. Sube con potencia completa entre ${sl} y ${sh} kt; baja con potencia reducida entre ${bl} y ${bh} kt. Margen: ${T.velocidadKt} kt fuera de la banda.`,
    `El rumbo y la altitud van por separado: nivela alas unos ${ADELANTO_GRADOS_COMB}° antes del rumbo (±${T.rumboGrados}°) y nivela unos ${ADELANTO_FT} ft antes de la altitud (±${T.altitudFt} ft). Lo que llegue primero, sigues con lo otro.`,
    `Luego mantienes los dos durante ${MANTENER_SEG} segundos, con la bola centrada. Subiendo con potencia completa hace falta pie derecho.`,
    "Primero practicas; cuando quieras, pasas al intento calificado.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

const PASOS = ["estabiliza", "vira", "nivela", "manten"] as const;
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Estabiliza", "Vira y sube o baja", "Nivela rumbo y altitud", "Mantén los dos"],
  en: ["Stabilize", "Turn and climb or descend", "Level heading and altitude", "Hold both"],
};

export function listaPasosCombinado(paso: PasoCombinado | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "rumbo" || paso === "altitud" ? 2 : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerCombinado(paso: PasoCombinado | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "estabiliza") return en ? "Wings level and power set: the instructor gives you heading and altitude once the airplane is stable." : "Alas niveladas y potencia fija: el instructor te da rumbo y altitud cuando el avión esté estable.";
  if (paso === "vira") return en ? `Roll out about ${ADELANTO_GRADOS_COMB}° before the heading and level off about ${ADELANTO_FT} ft before the altitude.` : `Nivela alas unos ${ADELANTO_GRADOS_COMB}° antes del rumbo y nivela unos ${ADELANTO_FT} ft antes de la altitud.`;
  if (paso === "rumbo") return en ? "Wings level, same airspeed band, keep going to the altitude." : "Alas niveladas, misma banda de velocidad, sigue hasta la altitud.";
  if (paso === "altitud") return en ? "Cruise power, trim, and keep the bank to the heading." : "Potencia de crucero, compensa y sigue con la inclinación hasta el rumbo.";
  if (paso === "manten") return en ? "Cruise power and trim; pick a point on the horizon." : "Potencia de crucero y compensa; una referencia en el horizonte.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoCombinado, string>> = {
  es: { velocidad: "velocidad", inclinacion: "inclinación", rumbo: "rumbo", altitud: "altitud", bola: "coordinación" },
  en: { velocidad: "airspeed", inclinacion: "bank", rumbo: "heading", altitud: "altitude", bola: "coordination" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarCombinado(r: ResultadoCombinado, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const o = r.objetivo;
  const tol = toleranciaCombinado(r.nivel);
  const I = INCLINACION_COMBINADO;
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.velocidad.length) {
    const [lo, hi] = banda(o.sube);
    const kt = Math.round((r.peor.velocidad > 0 ? hi : lo) + r.peor.velocidad);
    const nariz = r.peor.velocidad > 0 ? (en ? "raise the nose a little" : "sube un poco la nariz") : en ? "lower the nose a little" : "baja un poco la nariz";
    mal(en ? `You ${o.sube ? "climbed" : "descended"} at ${kt} kt: ${nariz} to stay between ${lo} and ${hi}.` : `${o.sube ? "Subiste" : "Bajaste"} a ${kt} kt: ${nariz} para quedar entre ${lo} y ${hi}.`);
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(I + r.peor.inclinacion);
    if (r.peor.inclinacion > 0) mal(en ? `You banked up to ${g}°: ${I}° is enough, ease off a little.` : `Inclinaste hasta ${g}°: con ${I}° basta, afloja un poco.`);
    else mal(en ? `You only reached ${g}° of bank: roll to ${I}°.` : `Te quedaste en ${g}° de inclinación: lleva el avión a ${I}°.`);
  }
  if (r.fuera.rumbo.length) {
    const d = Math.round(r.rumboAlNivelar * (o.lado === "derecha" ? 1 : -1)); // positivo: se pasó
    const al = rumbo3(o.rumboFinal + r.rumboAlNivelar);
    const debia = rumbo3(o.rumboFinal);
    if (Math.abs(d) > tol.rumbo && d > 0) {
      mal(en
        ? `You rolled out on ${al} and needed ${debia}: you overshot by ${d}°. Start rolling out about ${ADELANTO_GRADOS_COMB}° before the heading.`
        : `Nivelaste alas en ${al} y debías quedar en ${debia}: te pasaste ${d}°. Empieza a nivelar unos ${ADELANTO_GRADOS_COMB}° antes del rumbo.`);
    } else if (Math.abs(d) > tol.rumbo) {
      mal(en
        ? `You rolled out on ${al} and needed ${debia}: you stopped ${-d}° short. Keep turning until about ${ADELANTO_GRADOS_COMB}° before the heading.`
        : `Nivelaste alas en ${al} y debías quedar en ${debia}: te quedaste corto ${-d}°. Sigue virando hasta unos ${ADELANTO_GRADOS_COMB}° antes del rumbo.`);
    } else {
      const g = Math.round(Math.abs(r.peor.rumbo));
      mal(en ? `After rolling out you drifted ${g}° off ${debia}: wings level and pick a point on the horizon.` : `Después de nivelar alas te desviaste ${g}° del ${debia}: alas niveladas y una referencia en el horizonte.`);
    }
  }
  if (r.fuera.altitud.length) {
    const d = Math.round(r.altitudAlNivelar * (o.sube ? 1 : -1)); // positivo: se pasó
    const al = pies(o.altitudFinal + r.altitudAlNivelar);
    const debia = pies(o.altitudFinal);
    if (Math.abs(d) > tol.altitud && d > 0) {
      mal(en
        ? `You leveled off at ${al} and needed ${debia}: you overshot by ${d} ft. Start leveling off about ${ADELANTO_FT} ft before.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te pasaste ${d} ft. Empieza a nivelar unos ${ADELANTO_FT} ft antes.`);
    } else if (Math.abs(d) > tol.altitud) {
      mal(en
        ? `You leveled off at ${al} and needed ${debia}: you stopped ${-d} ft short. Keep going until about ${ADELANTO_FT} ft before.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te quedaste corto ${-d} ft. Sigue hasta unos ${ADELANTO_FT} ft antes.`);
    } else {
      const ft = Math.round(Math.abs(r.peor.altitud));
      mal(en ? `After leveling off you drifted ${ft} ft from ${debia}: set cruise power and trim.` : `Después de nivelar se te fue la altitud ${ft} ft de ${debia}: pon potencia de crucero y compensa.`);
    }
  }
  if (r.fuera.bola.length) {
    mal(o.sube
      ? en ? "The ball left center: climbing at full power, right rudder." : "La bola se salió del centro: subiendo con potencia completa, pie derecho."
      : en ? "The ball left center: rudder toward the turn as you roll in." : "La bola se salió del centro: al inclinar, pie del lado del viraje.");
  }
  const limpios = CAMPOS_COMBINADO.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good the whole time." : ", bien todo el tiempo."}` });
  }
  return lineas;
}

export function repetirCombinado(r: ResultadoCombinado, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: climbing and descending turns" : "Repite: virajes ascendiendo y descendiendo";
}

export function masFalladoCombinado(rs: ResultadoCombinado[], idioma: Idioma): string | null {
  let peor: CampoCombinado | null = null;
  let max = 0;
  for (const k of CAMPOS_COMBINADO) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was your ${ETIQUETA.en[peor]}.` : `Lo que más se te salió fue ${peor === "rumbo" ? "el" : "la"} ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las lecciones 4 y 5. */
export function paraGuardarCombinado(r: ResultadoCombinado): Omit<ResultadoCombinado, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
