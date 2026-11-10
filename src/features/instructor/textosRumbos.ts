import type { Muestra } from "./evaluador.ts";
import {
  ADELANTO_GRADOS, CAMPOS_RUMBOS, desvioRumbos, INCLINACION_RUMBOS, MANTENER_SEG, toleranciaRumbos,
  type CampoRumbos, type EvaluacionRumbos, type ResultadoRumbos,
} from "./evaluadorRumbos.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolRumbos, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, CORRECCION, CORTO, luz, NOMBRE, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en virajes a rumbos, el briefing y la explicación. Puro.

export type PasoRumbos = "estabiliza" | "vira" | "manten" | "terminado" | "invalido";

export function pasoRumbos(ev: EvaluacionRumbos | null, _m: Muestra | null): PasoRumbos | null {
  if (!ev) return null;
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev.fase;
  return ev.fase === "armado" ? "estabiliza" : ev.fase === "virando" ? "vira" : "manten";
}

const rumbo3 = (r: number) => String(Math.round(((r % 360) + 360) % 360) || 360).padStart(3, "0");

function texto(paso: PasoRumbos, ev: EvaluacionRumbos | null, idioma: Idioma): string {
  const en = idioma === "en";
  const a = ev?.asignado;
  switch (paso) {
    case "estabiliza":
      return en ? "Level off and stabilize: wings level, constant altitude and airspeed." : "Nivela y estabiliza: alas niveladas, altitud y velocidad constantes.";
    case "vira": {
      if (!a || !ev?.objetivo) return "";
      const alt = (Math.round(ev.objetivo.altitud / 10) * 10).toLocaleString("en-US");
      return en
        ? `Turn ${a.lado === "derecha" ? "right" : "left"} to heading ${rumbo3(a.rumbo)}, ${INCLINACION_RUMBOS} degrees of bank. Hold ${alt} feet.`
        : `Vira por la ${a.lado} al rumbo ${rumbo3(a.rumbo)}, con ${INCLINACION_RUMBOS} grados de inclinación. Mantén ${alt} pies.`;
    }
    case "manten":
      return a ? (en ? `Hold heading ${rumbo3(a.rumbo)}.` : `Mantén rumbo ${rumbo3(a.rumbo)}.`) : "";
    case "terminado":
      return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido":
      return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenRumbos(antes: PasoRumbos | null, ahora: PasoRumbos | null, ev: EvaluacionRumbos | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoRumbos(paso: PasoRumbos | null, ev: EvaluacionRumbos | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

function desviaciones(ev: EvaluacionRumbos | null, m: Muestra | null): Record<CampoRumbos, number | null> {
  const o = ev?.objetivo;
  const a = ev?.asignado;
  const vivo = ev?.fase === "virando" || ev?.fase === "manteniendo";
  return Object.fromEntries(
    CAMPOS_RUMBOS.map((c) => [c, m && o && a && vivo ? desvioRumbos(m, o, a, c, ev.girado, ev.fase === "manteniendo") : null]),
  ) as Record<CampoRumbos, number | null>;
}

export function semaforoRumbos(ev: EvaluacionRumbos | null, m: Muestra | null): Record<CampoRumbos, Luz> {
  const d = desviaciones(ev, m);
  return Object.fromEntries(CAMPOS_RUMBOS.map((c) => [c, luz(d[c], toleranciaRumbos(ev?.nivel)[c])])) as Record<CampoRumbos, Luz>;
}

const PROPIOS: Record<Idioma, { corto: { rumbo: string }; nombre: { rumbo: string }; correccion: Pick<Record<CampoRumbos, { mas: string; menos: string }>, "rumbo" | "inclinacion"> }> = {
  es: {
    corto: { rumbo: "Cuida el rumbo" },
    nombre: { rumbo: "rumbo" },
    correccion: {
      rumbo: { mas: "Te vas a la derecha: regresa a tu rumbo", menos: "Te vas a la izquierda: regresa a tu rumbo" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_RUMBOS} grados: afloja la inclinación`, menos: `Te falta inclinación: lleva el avión a ${INCLINACION_RUMBOS} grados` },
    },
  },
  en: {
    corto: { rumbo: "Watch your heading" },
    nombre: { rumbo: "heading" },
    correccion: {
      rumbo: { mas: "Drifting right: back to your heading", menos: "Drifting left: back to your heading" },
      inclinacion: { mas: `Past ${INCLINACION_RUMBOS} degrees: shallow the bank`, menos: `Not enough bank: roll to ${INCLINACION_RUMBOS} degrees` },
    },
  },
};

export function avisoRumbos(ev: EvaluacionRumbos | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  const p = PROPIOS[idioma];
  const textos = {
    corto: { ...CORTO[idioma], ...p.corto },
    correccion: { ...CORRECCION[idioma], ...p.correccion },
    nombre: { ...NOMBRE[idioma], ...p.nombre },
  };
  return avisoDe(desviaciones(ev, m), toleranciaRumbos(ev?.nivel), CAMPOS_RUMBOS, textos, modo, idioma);
}

export function briefingRumbos(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolRumbos(nivel);
  if (idioma === "en") {
    return [
      "Today you'll practice turns to headings in the Cessna 172.",
      "Fly straight and level at any altitude and airspeed you like. Once the airplane is stable, the instructor gives you a heading and which way to turn.",
      `Turn with ${INCLINACION_RUMBOS}° of bank ±${T.inclinacionGrados}°, holding altitude ±${T.altitudFt} ft and airspeed ±${T.velocidadKt} kt, with the ball centered.`,
      `Start rolling out about ${ADELANTO_GRADOS}° before the heading and hold it ±${T.rumboGrados}° for ${MANTENER_SEG} seconds.`,
      "As you roll in, a little back pressure so you don't lose altitude; release it as you roll out.",
      "Practice first; whenever you want, move on to the graded attempt.",
      "When you're ready, press «Ready, let's start».",
    ];
  }
  return [
    "Hoy vas a practicar virajes a rumbos en el Cessna 172.",
    "Vuela recto y nivelado a la altitud y velocidad que quieras. Cuando el avión esté estable, el instructor te da un rumbo y el lado del viraje.",
    `Vira con ${INCLINACION_RUMBOS}° de inclinación ±${T.inclinacionGrados}°, manteniendo la altitud ±${T.altitudFt} ft y la velocidad ±${T.velocidadKt} kt, con la bola centrada.`,
    `Empieza a nivelar unos ${ADELANTO_GRADOS}° antes del rumbo y mantenlo ±${T.rumboGrados}° durante ${MANTENER_SEG} segundos.`,
    "Al inclinar, un poco de presión atrás para no perder altitud; al nivelar, suéltala.",
    "Primero practicas; cuando quieras, pasas al intento calificado.",
    "Cuando estés listo, presiona «Listo, empiezo».",
  ];
}

const PASOS: PasoRumbos[] = ["estabiliza", "vira", "manten"];
const NOMBRE_PASO: Record<Idioma, string[]> = { es: ["Estabiliza", "Vira al rumbo", "Mantén el rumbo"], en: ["Stabilize", "Turn to the heading", "Hold the heading"] };

export function listaPasosRumbos(paso: PasoRumbos | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerRumbos(paso: PasoRumbos | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "estabiliza") return en ? "Wings level and power set: the instructor gives you the heading once the airplane is stable." : "Alas niveladas y potencia fija: el instructor te da el rumbo cuando el avión esté estable.";
  if (paso === "vira") return en ? `Start rolling out about ${ADELANTO_GRADOS}° before the heading.` : `Empieza a nivelar unos ${ADELANTO_GRADOS}° antes del rumbo.`;
  if (paso === "manten") return en ? "Wings level and pick a point on the horizon." : "Alas niveladas y una referencia en el horizonte.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoRumbos, string>> = {
  es: { altitud: "altitud", inclinacion: "inclinación", rumbo: "rumbo", velocidad: "velocidad", bola: "coordinación" },
  en: { altitud: "altitude", inclinacion: "bank", rumbo: "heading", velocidad: "airspeed", bola: "coordination" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarRumbos(r: ResultadoRumbos, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  const bajo = r.fuera.altitud.filter((tr) => tr.peor < 0);
  const alto = r.fuera.altitud.filter((tr) => tr.peor > 0);
  if (bajo.length) {
    const ft = Math.round(-Math.min(...bajo.map((tr) => tr.peor)));
    mal(en ? `You lost ${ft} ft. As you roll in, raise the nose a little and trim.` : `Perdiste ${ft} ft. Al inclinar, sube un poco la nariz y compensa.`);
  }
  if (alto.length) {
    const ft = Math.round(Math.max(...alto.map((tr) => tr.peor)));
    mal(en ? `You gained ${ft} ft. As you roll out, lower the nose a little and trim.` : `Subiste ${ft} ft. Al nivelar, baja un poco la nariz y compensa.`);
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(INCLINACION_RUMBOS + r.peor.inclinacion);
    if (r.peor.inclinacion > 0) mal(en ? `You banked up to ${g}°: ${INCLINACION_RUMBOS}° is enough, ease off a little.` : `Inclinaste hasta ${g}°: con ${INCLINACION_RUMBOS}° basta, afloja un poco.`);
    else mal(en ? `You only reached ${g}° of bank: roll to ${INCLINACION_RUMBOS}°.` : `Te quedaste en ${g}° de inclinación: lleva el avión a ${INCLINACION_RUMBOS}°.`);
  }
  if (r.fuera.rumbo.length) {
    const o = r.objetivo;
    const tol = toleranciaRumbos(r.nivel).rumbo;
    const d = Math.round(r.rumboAlNivelar * (o.lado === "derecha" ? 1 : -1)); // positivo: se pasó
    const al = rumbo3(o.rumboFinal + r.rumboAlNivelar);
    const debia = rumbo3(o.rumboFinal);
    if (Math.abs(d) > tol && d > 0) {
      mal(en
        ? `You rolled out on ${al} and needed ${debia}: you overshot by ${d}°. Start rolling out about ${ADELANTO_GRADOS}° before the heading.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te pasaste ${d}°. Empieza a nivelar unos ${ADELANTO_GRADOS}° antes del rumbo.`);
    } else if (Math.abs(d) > tol) {
      mal(en
        ? `You rolled out on ${al} and needed ${debia}: you stopped ${-d}° short. Keep turning and start rolling out about ${ADELANTO_GRADOS}° before the heading, not earlier.`
        : `Nivelaste en ${al} y debías quedar en ${debia}: te quedaste corto ${-d}°. Sigue virando y empieza a nivelar unos ${ADELANTO_GRADOS}° antes del rumbo, no antes.`);
    } else {
      const g = Math.round(Math.abs(r.peor.rumbo));
      mal(en
        ? `After rolling out you drifted ${g}° off ${debia}: keep the wings level and pick a point on the horizon.`
        : `Después de nivelar te desviaste ${g}° del ${debia}: alas niveladas y una referencia en el horizonte frente a la nariz.`);
    }
  }
  if (r.fuera.velocidad.length) {
    const kt = Math.round(Math.abs(r.peor.velocidad));
    mal(en
      ? `Your airspeed drifted ${kt} kt. Add a little power in the turn if it drops; take it out as you roll out.`
      : `La velocidad se te fue ${kt} kt. En el viraje agrega un poco de potencia si baja; al nivelar, quítala.`);
  }
  if (r.fuera.bola.length) mal(en ? "The ball left center: step on the rudder toward the turn as you roll in." : "La bola se salió del centro: al inclinar, pie del lado del viraje.");

  const limpios = CAMPOS_RUMBOS.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good the whole time." : ", bien todo el tiempo."}` });
  }
  return lineas;
}

export function repetirRumbos(r: ResultadoRumbos, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: turns to headings" : "Repite: virajes a rumbos";
}

export function masFalladoRumbos(rs: ResultadoRumbos[], idioma: Idioma): string | null {
  let peor: CampoRumbos | null = null;
  let max = 0;
  for (const k of CAMPOS_RUMBOS) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most was your ${ETIQUETA.en[peor]}.` : `Lo que más se te salió fue ${peor === "rumbo" ? "el" : "la"} ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica; agregarlas si /admin/maniobras las necesita. */
export function paraGuardarRumbos(r: ResultadoRumbos): Omit<ResultadoRumbos, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
