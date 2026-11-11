import type { Muestra } from "./evaluador.ts";
import {
  CAMPOS_ALREDEDOR, desvioAlrededor, toleranciaAlrededor, type CampoAlrededor, type EvaluacionAlrededor, type ResultadoAlrededor,
} from "./evaluadorAlrededor.ts";
import { CRUCE_SEG, INCLINACION_MAX_OCHO } from "./evaluadorOcho.ts";
import { AGL_MAX, AGL_MIN } from "./evaluadorS.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolAlrededor, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la «8» alrededor de pilones, el briefing y la explicación. Puro.

export type PasoAlrededor = "altura" | "estabiliza" | "listo" | "vuelta1" | "cruce" | "vuelta2" | "terminado" | "invalido";

export function pasoAlrededor(ev: EvaluacionAlrededor | null, m: Muestra | null): PasoAlrededor | null {
  if (!ev) return null;
  if (ev.fase === "armado") return m && (m.agl < AGL_MIN || m.agl > AGL_MAX) ? "altura" : "estabiliza";
  return ev.fase;
}

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");
const [MIN, MAX] = [pies(AGL_MIN), pies(AGL_MAX)];

function texto(paso: PasoAlrededor, ev: EvaluacionAlrededor | null, idioma: Idioma): string {
  const en = idioma === "en";
  switch (paso) {
    case "altura": return en ? `Fly between ${MIN} and ${MAX} feet above the ground, straight and level.` : `Vuela entre ${MIN} y ${MAX} pies sobre el terreno, recto y nivelado.`;
    case "estabiliza": return en ? "Straight and level: constant altitude and airspeed." : "Recto y nivelado: altitud y velocidad constantes.";
    case "listo":
      return en
        ? "Fly between the two pylons and turn around the first one, the same distance all the way."
        : "Vuela entre los dos pilones y vira alrededor del primero, a la misma distancia todo el tiempo.";
    case "vuelta1":
      return en
        ? "First pylon: same distance all the way. Tailwind, steeper bank; headwind, shallower."
        : "Primer pilón: la misma distancia todo el tiempo. Con viento de cola inclina más; con viento de frente, menos.";
    case "cruce": return en ? "Wings level between the pylons and get ready for the second one, the other way." : "Alas niveladas entre los pilones y prepárate para el segundo, al otro lado.";
    case "vuelta2": return en ? "Second pylon, the other way: same distance all the way." : "Segundo pilón, al otro lado: la misma distancia todo el tiempo.";
    case "terminado": return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido": return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenAlrededor(antes: PasoAlrededor | null, ahora: PasoAlrededor | null, ev: EvaluacionAlrededor | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma);
}

export function textoPasoAlrededor(paso: PasoAlrededor | null, ev: EvaluacionAlrededor | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

type CampoAviso = "altitud" | "velocidad" | "inclinacion";
const AVISOS: CampoAviso[] = ["inclinacion", "altitud", "velocidad"];
const desviaciones = (ev: EvaluacionAlrededor | null, m: Muestra | null) =>
  Object.fromEntries(AVISOS.map((c) => [c, ev && m ? desvioAlrededor(m, ev, c) : null])) as Record<CampoAviso, number | null>;

export function semaforoAlrededor(ev: EvaluacionAlrededor | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  const tol = toleranciaAlrededor(ev?.nivel);
  return Object.fromEntries(AVISOS.map((c) => [c, luz(d[c], tol[c])])) as Record<CampoAviso, Luz>;
}

const AVISO_TEXTOS: Record<Idioma, { corto: Record<CampoAviso, string>; nombre: Record<CampoAviso, string>; correccion: Record<CampoAviso, { mas: string; menos: string }> }> = {
  es: {
    corto: { altitud: "Cuida la altitud", velocidad: "Cuida la velocidad", inclinacion: "Cuida la inclinación" },
    nombre: { altitud: "altitud", velocidad: "velocidad", inclinacion: "inclinación" },
    correccion: {
      altitud: { mas: "Vas subiendo: baja un poco la nariz", menos: "Vas bajando: un poco de presión atrás" },
      velocidad: { mas: "Vas rápido: reduce un poco la potencia", menos: "Vas lento: agrega potencia" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_MAX_OCHO} grados: afloja la inclinación`, menos: `Te pasas de ${INCLINACION_MAX_OCHO} grados: afloja la inclinación` },
    },
  },
  en: {
    corto: { altitud: "Watch your altitude", velocidad: "Watch your airspeed", inclinacion: "Watch your bank" },
    nombre: { altitud: "altitude", velocidad: "airspeed", inclinacion: "bank" },
    correccion: {
      altitud: { mas: "Climbing: lower the nose a little", menos: "Descending: a little back pressure" },
      velocidad: { mas: "Fast: reduce power a little", menos: "Slow: add power" },
      inclinacion: { mas: `Past ${INCLINACION_MAX_OCHO} degrees: shallow the bank`, menos: `Past ${INCLINACION_MAX_OCHO} degrees: shallow the bank` },
    },
  },
};

export function avisoAlrededor(ev: EvaluacionAlrededor | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  return avisoDe(desviaciones(ev, m), toleranciaAlrededor(ev?.nivel), AVISOS, AVISO_TEXTOS[idioma], modo, idioma);
}

export function briefingAlrededor(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolAlrededor(nivel);
  if (idioma === "en") {
    return [
      "Today you'll practice eights around pylons in the Cessna 172.",
      `Fly straight and level between ${MIN} and ${MAX} ft above the ground. That altitude and airspeed are the ones you hold: ±${T.altitudFt} ft and ±${T.velocidadKt} kt.`,
      "Pick two points on the ground and fly a circle around each one, the same distance all the way, one each way.",
      `With wind, change the bank: steeper with a tailwind, shallower with a headwind. Never more than ${INCLINACION_MAX_OCHO}°.`,
      `Between the two pylons, wings level for at least ${CRUCE_SEG} s.`,
      `The instructor takes the center of the circle you fly as the pylon; the distance can change ±${T.radioPct}%.`,
    ];
  }
  return [
    "Hoy vas a practicar la «8» alrededor de pilones en el Cessna 172.",
    `Vuela recto y nivelado entre ${MIN} y ${MAX} ft sobre el terreno. Esa altitud y esa velocidad son las que mantienes: ±${T.altitudFt} ft y ±${T.velocidadKt} kt.`,
    "Escoge dos puntos en el suelo y vuela un círculo alrededor de cada uno, a la misma distancia todo el tiempo, uno en cada sentido.",
    `Con viento cambia la inclinación: más con viento de cola, menos con viento de frente. Nunca más de ${INCLINACION_MAX_OCHO}°.`,
    `Entre los dos pilones, alas niveladas al menos ${CRUCE_SEG} s.`,
    `El instructor toma como pilón el centro del círculo que vuelas; la distancia puede cambiar ±${T.radioPct}%.`,
  ];
}

const PASOS = ["estabiliza", "listo", "vuelta1", "cruce", "vuelta2"] as const;
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Recto y nivelado", "Entre los pilones", "Primer pilón", "Cruce", "Segundo pilón"],
  en: ["Straight and level", "Between the pylons", "First pylon", "Crossing", "Second pylon"],
};

export function listaPasosAlrededor(paso: PasoAlrededor | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "altura" ? 0 : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerAlrededor(paso: PasoAlrededor | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "altura" || paso === "estabiliza") return en ? "Cruise power and trim; pick two pylons below." : "Potencia de crucero y compensa; escoge abajo dos pilones.";
  if (paso === "listo" || paso === "cruce") return en ? "Fly between the pylons and turn around the next one." : "Vuela entre los pilones y vira alrededor del siguiente.";
  if (paso === "vuelta1" || paso === "vuelta2") return en ? "Watch the pylon, not the instruments: bank changes keep the distance." : "Mira el pilón, no los instrumentos: con la inclinación mantienes la distancia.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoAlrededor, string>> = {
  es: { altitud: "altitud", velocidad: "velocidad", radio: "distancia al pilón", cruce: "cruce entre pilones", inclinacion: "inclinación" },
  en: { altitud: "altitude", velocidad: "airspeed", radio: "distance to the pylon", cruce: "crossing between pylons", inclinacion: "bank" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarAlrededor(r: ResultadoAlrededor, idioma: Idioma): Linea[] {
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
  if (r.fuera.radio.length) {
    const k = r.vueltas.reduce((a, v, i) => (v.variacionPct > r.vueltas[a].variacionPct ? i : a), 0);
    const v = r.vueltas[k];
    const cual = k === 0 ? (en ? "first" : "primera") : en ? "second" : "segunda";
    mal(en
      ? `The distance to the pylon wasn't constant: on the ${cual} turn it went from ${pies(v.minFt)} to ${pies(v.maxFt)} ft (${Math.round(v.variacionPct)}%). With wind, steeper bank downwind, shallower upwind.`
      : `La distancia al pilón no fue constante: en la ${cual} vuelta fue de ${pies(v.minFt)} a ${pies(v.maxFt)} ft (${Math.round(v.variacionPct)}%). Con viento, inclina más con viento de cola y menos con viento de frente.`);
  }
  if (r.fuera.cruce.length) {
    const s = Math.round(r.cruceSeg);
    mal(en
      ? `Between the pylons you flew ${s} s wings level: you need at least ${CRUCE_SEG} s.`
      : `Entre los pilones volaste ${s} s con alas niveladas: necesitas al menos ${CRUCE_SEG} s.`);
  }
  if (r.fuera.inclinacion.length) {
    const g = Math.round(INCLINACION_MAX_OCHO + r.peor.inclinacion);
    mal(en ? `You banked up to ${g}°: ${INCLINACION_MAX_OCHO}° is the most.` : `Inclinaste hasta ${g}°: el máximo es ${INCLINACION_MAX_OCHO}°.`);
  }
  const limpios = CAMPOS_ALREDEDOR.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good." : ", bien."}` });
  }
  return lineas;
}

export function repetirAlrededor(r: ResultadoAlrededor, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: eights around pylons" : "Repite: «8» alrededor de pilones";
}

export function masFalladoAlrededor(rs: ResultadoAlrededor[], idioma: Idioma): string | null {
  let peor: CampoAlrededor | null = null;
  let max = 0;
  for (const k of CAMPOS_ALREDEDOR) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio + 1, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most: ${ETIQUETA.en[peor]}.` : `Lo que más se te salió: ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las demás lecciones nuevas. */
export function paraGuardarAlrededor(r: ResultadoAlrededor): Omit<ResultadoAlrededor, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
