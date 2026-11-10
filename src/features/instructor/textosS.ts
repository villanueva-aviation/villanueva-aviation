import type { Muestra } from "./evaluador.ts";
import { AGL_MAX, AGL_MIN, CAMPOS_S, desvioS, INCLINACION_MAX_S, toleranciaS, type CampoS, type EvaluacionS, type ResultadoS } from "./evaluadorS.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolS, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la «S» sobre un camino, el briefing y la explicación. Puro.

export type PasoS = "altura" | "estabiliza" | "listo" | "curva1" | "curva2" | "terminado" | "invalido";

export function pasoS(ev: EvaluacionS | null, m: Muestra | null): PasoS | null {
  if (!ev) return null;
  if (ev.fase === "armado") return m && (m.agl < AGL_MIN || m.agl > AGL_MAX) ? "altura" : "estabiliza";
  return ev.fase;
}

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const [MIN, MAX] = [pies(AGL_MIN), pies(AGL_MAX)];

function texto(paso: PasoS, ev: EvaluacionS | null, idioma: Idioma): string {
  const en = idioma === "en";
  switch (paso) {
    case "altura": return en ? `Fly between ${MIN} and ${MAX} feet above the ground, straight and level.` : `Vuela entre ${MIN} y ${MAX} pies sobre el terreno, recto y nivelado.`;
    case "estabiliza": return en ? "Straight and level: constant altitude and airspeed." : "Recto y nivelado: altitud y velocidad constantes.";
    case "listo":
      return en
        ? "Find a straight road and cross it at a right angle, wings level. Right over it, start the first half."
        : "Busca un camino recto y crúzalo perpendicular, con alas niveladas. Justo encima, empieza la primera curva.";
    case "curva1":
      return en
        ? "First half: a semicircle, same distance from the road. Tailwind, steeper bank; headwind, shallower."
        : "Primera curva: un semicírculo, misma distancia al camino. Con viento de cola inclina más; con viento de frente, menos.";
    case "curva2": return en ? "Wings level over the road and turn the other way, same size as the first." : "Alas niveladas sobre el camino y curva al otro lado, igual que la primera.";
    case "terminado": return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido": return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenS(antes: PasoS | null, ahora: PasoS | null, ev: EvaluacionS | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma);
}

export function textoPasoS(paso: PasoS | null, ev: EvaluacionS | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

type CampoAviso = "altitud" | "velocidad" | "inclinacion";
const AVISOS: CampoAviso[] = ["inclinacion", "altitud", "velocidad"];
const desviaciones = (ev: EvaluacionS | null, m: Muestra | null) =>
  Object.fromEntries(AVISOS.map((c) => [c, ev && m ? desvioS(m, ev, c) : null])) as Record<CampoAviso, number | null>;

export function semaforoS(ev: EvaluacionS | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  const tol = toleranciaS(ev?.nivel);
  return Object.fromEntries(AVISOS.map((c) => [c, luz(d[c], tol[c])])) as Record<CampoAviso, Luz>;
}

const AVISO_TEXTOS: Record<Idioma, { corto: Record<CampoAviso, string>; nombre: Record<CampoAviso, string>; correccion: Record<CampoAviso, { mas: string; menos: string }> }> = {
  es: {
    corto: { altitud: "Cuida la altitud", velocidad: "Cuida la velocidad", inclinacion: "Cuida la inclinación" },
    nombre: { altitud: "altitud", velocidad: "velocidad", inclinacion: "inclinación" },
    correccion: {
      altitud: { mas: "Vas subiendo: baja un poco la nariz", menos: "Vas bajando: un poco de presión atrás" },
      velocidad: { mas: "Vas rápido: reduce un poco la potencia", menos: "Vas lento: agrega potencia" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_MAX_S} grados: afloja la inclinación`, menos: `Te pasas de ${INCLINACION_MAX_S} grados: afloja la inclinación` },
    },
  },
  en: {
    corto: { altitud: "Watch your altitude", velocidad: "Watch your airspeed", inclinacion: "Watch your bank" },
    nombre: { altitud: "altitude", velocidad: "airspeed", inclinacion: "bank" },
    correccion: {
      altitud: { mas: "Climbing: lower the nose a little", menos: "Descending: a little back pressure" },
      velocidad: { mas: "Fast: reduce power a little", menos: "Slow: add power" },
      inclinacion: { mas: `Past ${INCLINACION_MAX_S} degrees: shallow the bank`, menos: `Past ${INCLINACION_MAX_S} degrees: shallow the bank` },
    },
  },
};

export function avisoS(ev: EvaluacionS | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  return avisoDe(desviaciones(ev, m), toleranciaS(ev?.nivel), AVISOS, AVISO_TEXTOS[idioma], modo, idioma);
}

export function briefingS(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolS(nivel);
  if (idioma === "en") {
    return [
      "Today you'll practice S-turns along a road in the Cessna 172.",
      `Fly straight and level between ${MIN} and ${MAX} ft above the ground. That altitude and airspeed are the ones you hold: ±${T.altitudFt} ft and ±${T.velocidadKt} kt.`,
      "Find a straight road and cross it perpendicular with wings level. As you cross it, start the first half: a semicircle on one side of the road.",
      `Cross it again perpendicular (±${T.rumboGrados}°) with wings level (less than ${T.alasGrados}°) and fly the other semicircle, same size, on the other side.`,
      `With wind, change the bank: steeper with a tailwind, shallower with a headwind. Never more than ${INCLINACION_MAX_S}°.`,
      "The instructor takes the road where you start turning.",
    ];
  }
  return [
    "Hoy vas a practicar la «S» sobre un camino en el Cessna 172.",
    `Vuela recto y nivelado entre ${MIN} y ${MAX} ft sobre el terreno. Esa altitud y esa velocidad son las que mantienes: ±${T.altitudFt} ft y ±${T.velocidadKt} kt.`,
    "Busca un camino recto y crúzalo perpendicular con alas niveladas. Al cruzarlo empieza la primera curva: un semicírculo de un lado del camino.",
    `Vuelve a cruzarlo perpendicular (±${T.rumboGrados}°) con alas niveladas (menos de ${T.alasGrados}°) y haz el otro semicírculo, igual de grande, del otro lado.`,
    `Con viento cambia la inclinación: más con viento de cola, menos con viento de frente. Nunca más de ${INCLINACION_MAX_S}°.`,
    "El instructor toma el camino donde empiezas a virar.",
  ];
}

const PASOS = ["estabiliza", "listo", "curva1", "curva2"] as const;
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Recto y nivelado", "Cruza el camino", "Primera curva", "Segunda curva"],
  en: ["Straight and level", "Cross the road", "First half", "Second half"],
};

export function listaPasosS(paso: PasoS | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "altura" ? 0 : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerS(paso: PasoS | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "altura" || paso === "estabiliza") return en ? "Cruise power and trim; look for a straight road below." : "Potencia de crucero y compensa; busca abajo un camino recto.";
  if (paso === "listo") return en ? "Line up perpendicular to the road and start turning as you pass over it." : "Ponte perpendicular al camino y empieza a virar justo encima.";
  if (paso === "curva1" || paso === "curva2") return en ? "Watch the road, not the instruments: same distance on both halves." : "Mira el camino, no los instrumentos: la misma distancia en las dos curvas.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoS, string>> = {
  es: { altitud: "altitud", velocidad: "velocidad", alas: "alas al cruzar", rumbo: "rumbo al cruzar", simetria: "curvas iguales", inclinacion: "inclinación" },
  en: { altitud: "altitude", velocidad: "airspeed", alas: "wings at the crossing", rumbo: "heading at the crossing", simetria: "equal halves", inclinacion: "bank" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarS(r: ResultadoS, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const o = r.objetivo;
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.altitud.length) {
    const ft = Math.round(Math.abs(r.peor.altitud));
    const como = r.peor.altitud > 0 ? (en ? "above" : "arriba") : en ? "below" : "abajo";
    mal(en
      ? `Altitude got ${ft} ft ${como} ${pies(o.altitud)}: more bank needs a little back pressure, less bank needs less.`
      : `Se te fue la altitud ${ft} ft ${como} de ${pies(o.altitud)}: con más inclinación, un poco de presión atrás; con menos, aflójala.`);
  }
  if (r.fuera.velocidad.length) {
    const kt = Math.round(o.velocidad + r.peor.velocidad);
    mal(en ? `Airspeed went to ${kt} kt and you started at ${Math.round(o.velocidad)}: adjust power and pitch.` : `La velocidad se fue a ${kt} kt y entraste a ${Math.round(o.velocidad)}: ajusta potencia y actitud.`);
  }
  if (r.fuera.alas.length) {
    const g = Math.round(r.peor.alas);
    mal(en ? `You crossed the road with ${g}° of bank: arrive wings level right over it.` : `Cruzaste el camino con ${g}° de inclinación: llega con alas niveladas justo encima.`);
  }
  if (r.fuera.rumbo.length) {
    const g = Math.round(Math.abs(r.peor.rumbo));
    mal(en ? `You crossed the road ${g}° off perpendicular: finish each half with the full 180°.` : `Cruzaste el camino a ${g}° de la perpendicular: termina cada curva con los 180° completos.`);
  }
  if (r.fuera.simetria.length) {
    const [a, b] = r.profundidadFt.map(pies);
    mal(en
      ? `The halves weren't equal: the first went ${a} ft from the road and the second ${b} ft. With wind, change the bank so both are the same size.`
      : `Las curvas no fueron iguales: la primera se alejó ${a} ft del camino y la segunda ${b} ft. Con viento, cambia la inclinación para que midan lo mismo.`);
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(INCLINACION_MAX_S + r.peor.inclinacion);
    mal(en ? `You banked up to ${g}°: ${INCLINACION_MAX_S}° is the most.` : `Inclinaste hasta ${g}°: el máximo es ${INCLINACION_MAX_S}°.`);
  }
  const limpios = CAMPOS_S.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good." : ", bien."}` });
  }
  return lineas;
}

export function repetirS(r: ResultadoS, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: S-turns" : "Repite: «S» sobre un camino";
}

export function masFalladoS(rs: ResultadoS[], idioma: Idioma): string | null {
  let peor: CampoS | null = null;
  let max = 0;
  for (const k of CAMPOS_S) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio + 1, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most: ${ETIQUETA.en[peor]}.` : `Lo que más se te salió: ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las demás lecciones nuevas. */
export function paraGuardarS(r: ResultadoS): Omit<ResultadoS, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
