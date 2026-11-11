import type { Muestra } from "./evaluador.ts";
import {
  CAMPOS_OCHO, CRUCE_SEG, desvioOcho, enPivote, INCLINACION_MAX_OCHO, pivote, toleranciaOcho, type CampoOcho, type EvaluacionOcho, type ResultadoOcho,
} from "./evaluadorOcho.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { tolOcho, type Nivel } from "./nivel.ts";
import { ANULADO, avisoDe, luz, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la «8» sobre pilones, el briefing y la explicación. Puro.

export type PasoOcho = "altura" | "estabiliza" | "listo" | "vuelta1" | "cruce" | "vuelta2" | "terminado" | "invalido";

export function pasoOcho(ev: EvaluacionOcho | null, m: Muestra | null): PasoOcho | null {
  if (!ev) return null;
  if (ev.fase === "armado") return m && !enPivote(m) ? "altura" : "estabiliza";
  return ev.fase;
}

const pies = (ft: number) => Math.round(ft).toLocaleString("en-US");

function texto(paso: PasoOcho, ev: EvaluacionOcho | null, idioma: Idioma): string {
  const en = idioma === "en";
  switch (paso) {
    case "altura": {
      if (!ev?.pivote) return en ? "Fly at your pivotal altitude, straight and level." : "Vuela a tu altura pivote, recto y nivelado.";
      const gs = Math.round(Math.sqrt(ev.pivote * 11.3));
      return en
        ? `Fly at your pivotal altitude: at ${gs} kt over the ground it's about ${pies(ev.pivote)} feet above the ground.`
        : `Vuela a tu altura pivote: con ${gs} kt sobre el suelo son unos ${pies(ev.pivote)} pies sobre el terreno.`;
    }
    case "estabiliza": return en ? "Straight and level: constant altitude and airspeed." : "Recto y nivelado: altitud y velocidad constantes.";
    case "listo":
      return en
        ? "Fly between the two pylons. When the first one is right off your wingtip, turn and keep it there."
        : "Vuela entre los dos pilones. Cuando el primero quede justo en la punta del ala, vira y mantenlo ahí.";
    case "vuelta1":
      return en
        ? "First pylon: keep it on the wing line. If it moves ahead, descend a little; if it falls behind, climb."
        : "Primer pilón: mantenlo en la línea del ala. Si se adelanta, baja un poco; si se queda atrás, sube.";
    case "cruce": return en ? "Wings level between the pylons and get ready for the second one, the other way." : "Alas niveladas entre los pilones y prepárate para el segundo, al otro lado.";
    case "vuelta2": return en ? "Second pylon, the other way: same job, keep it on the wing line." : "Segundo pilón, al otro lado: lo mismo, el pilón en la línea del ala.";
    case "terminado": return en ? "Maneuver complete." : "Maniobra terminada.";
    case "invalido": return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  }
}

export function ordenOcho(antes: PasoOcho | null, ahora: PasoOcho | null, ev: EvaluacionOcho | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma);
}

export function textoPasoOcho(paso: PasoOcho | null, ev: EvaluacionOcho | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

type CampoAviso = "velocidad" | "ala" | "inclinacion";
const AVISOS: CampoAviso[] = ["inclinacion", "ala", "velocidad"];
const desviaciones = (ev: EvaluacionOcho | null, m: Muestra | null) =>
  Object.fromEntries(AVISOS.map((c) => [c, ev && m ? desvioOcho(m, ev, c) : null])) as Record<CampoAviso, number | null>;

export function semaforoOcho(ev: EvaluacionOcho | null, m: Muestra | null): Record<CampoAviso, Luz> {
  const d = desviaciones(ev, m);
  const tol = toleranciaOcho(ev?.nivel);
  return Object.fromEntries(AVISOS.map((c) => [c, luz(d[c], tol[c])])) as Record<CampoAviso, Luz>;
}

const AVISO_TEXTOS: Record<Idioma, { corto: Record<CampoAviso, string>; nombre: Record<CampoAviso, string>; correccion: Record<CampoAviso, { mas: string; menos: string }> }> = {
  es: {
    corto: { velocidad: "Cuida la velocidad", ala: "Cuida el pilón", inclinacion: "Cuida la inclinación" },
    nombre: { velocidad: "velocidad", ala: "pilón", inclinacion: "inclinación" },
    correccion: {
      velocidad: { mas: "Vas rápido: reduce un poco la potencia", menos: "Vas lento: agrega potencia" },
      ala: { mas: "El pilón se adelanta: baja un poco", menos: "El pilón se queda atrás: sube un poco" },
      inclinacion: { mas: `Te pasas de ${INCLINACION_MAX_OCHO} grados: afloja la inclinación`, menos: `Te pasas de ${INCLINACION_MAX_OCHO} grados: afloja la inclinación` },
    },
  },
  en: {
    corto: { velocidad: "Watch your airspeed", ala: "Watch the pylon", inclinacion: "Watch your bank" },
    nombre: { velocidad: "airspeed", ala: "pylon", inclinacion: "bank" },
    correccion: {
      velocidad: { mas: "Fast: reduce power a little", menos: "Slow: add power" },
      ala: { mas: "The pylon is moving ahead: descend a little", menos: "The pylon is falling behind: climb a little" },
      inclinacion: { mas: `Past ${INCLINACION_MAX_OCHO} degrees: shallow the bank`, menos: `Past ${INCLINACION_MAX_OCHO} degrees: shallow the bank` },
    },
  },
};

export function avisoOcho(ev: EvaluacionOcho | null, m: Muestra | null, modo: "practica" | "checkride", idioma: Idioma): Aviso | null {
  return avisoDe(desviaciones(ev, m), toleranciaOcho(ev?.nivel), AVISOS, AVISO_TEXTOS[idioma], modo, idioma);
}

export function briefingOcho(idioma: Idioma, nivel: Nivel = 3): string[] {
  const T = tolOcho(nivel);
  const [p90, p100] = [pies(pivote(90)), pies(pivote(100))];
  if (idioma === "en") {
    return [
      "Today you'll practice eights on pylons in the Cessna 172.",
      "Pick two points on the ground, far enough apart to fly a few seconds straight between them.",
      `Fly at your pivotal altitude: at 90 kt over the ground it's about ${p90} ft above the ground; at 100 kt, about ${p100} ft. The instructor works it out from your groundspeed.`,
      "When the first pylon is off your wingtip, turn and keep it on the wing line. If it moves ahead, descend a little; if it falls behind, climb. Don't chase it with the rudder.",
      `After the turn, wings level between the pylons for at least ${CRUCE_SEG} s, then turn around the second one the other way.`,
      `Airspeed ±${T.velocidadKt} kt, the pylon within ±${T.alaGrados}° of the wing line, never more than ${INCLINACION_MAX_OCHO}° of bank.`,
      "The instructor takes the pylon your wing points at as you start each turn.",
    ];
  }
  return [
    "Hoy vas a practicar la «8» sobre pilones en el Cessna 172.",
    "Escoge dos puntos en el suelo, separados lo suficiente para volar unos segundos recto entre los dos.",
    `Vuela a tu altura pivote: con 90 kt sobre el suelo son unos ${p90} ft sobre el terreno; con 100 kt, unos ${p100} ft. El instructor la calcula con tu velocidad sobre el suelo.`,
    "Cuando el primer pilón quede en la punta del ala, vira y mantenlo en la línea del ala. Si se adelanta, baja un poco; si se queda atrás, sube. No lo persigas con el pedal.",
    `Al terminar la vuelta, alas niveladas entre los pilones al menos ${CRUCE_SEG} s, y vira alrededor del segundo, al otro lado.`,
    `Velocidad ±${T.velocidadKt} kt, el pilón a ±${T.alaGrados}° de la línea del ala, nunca más de ${INCLINACION_MAX_OCHO}° de inclinación.`,
    "El instructor toma el pilón al que apunta tu ala cuando empiezas cada vuelta.",
  ];
}

const PASOS = ["estabiliza", "listo", "vuelta1", "cruce", "vuelta2"] as const;
const NOMBRE_PASO: Record<Idioma, string[]> = {
  es: ["Altura pivote", "Entre los pilones", "Primer pilón", "Cruce", "Segundo pilón"],
  en: ["Pivotal altitude", "Between the pylons", "First pylon", "Crossing", "Second pylon"],
};

export function listaPasosOcho(paso: PasoOcho | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const actual = paso === "terminado" ? PASOS.length : paso === "altura" ? 0 : paso && paso !== "invalido" ? PASOS.indexOf(paso) : -1;
  return PASOS.map((_, k) => ({ nombre: NOMBRE_PASO[idioma][k], estado: actual < 0 ? "pendiente" : k < actual ? "hecho" : k === actual ? "actual" : "pendiente" }));
}

export function queHacerOcho(paso: PasoOcho | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "altura" || paso === "estabiliza") return en ? "Cruise power and trim; pick two pylons below." : "Potencia de crucero y compensa; escoge abajo dos pilones.";
  if (paso === "listo" || paso === "cruce") return en ? "Fly between the pylons and turn when one is off your wingtip." : "Vuela entre los pilones y vira cuando uno quede en la punta del ala.";
  if (paso === "vuelta1" || paso === "vuelta2") return en ? "Look at the pylon, not the instruments: elevator holds it on the wing." : "Mira el pilón, no los instrumentos: con el elevador lo mantienes en el ala.";
  return "";
}

const ETIQUETA: Record<Idioma, Record<CampoOcho, string>> = {
  es: { velocidad: "velocidad", ala: "pilón en el ala", cruce: "cruce entre pilones", inclinacion: "inclinación" },
  en: { velocidad: "airspeed", ala: "pylon on the wing", cruce: "crossing between pylons", inclinacion: "bank" },
};
const mayus = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

export function explicarOcho(r: ResultadoOcho, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const o = r.objetivo;
  const lineas: Linea[] = [];
  const mal = (texto: string) => lineas.push({ tipo: "mal", texto });
  if (r.fuera.velocidad.length) {
    const kt = Math.round(o.velocidad + r.peor.velocidad);
    mal(en ? `Airspeed went to ${kt} kt and you started at ${Math.round(o.velocidad)}: adjust power.` : `La velocidad se fue a ${kt} kt y entraste a ${Math.round(o.velocidad)}: ajusta la potencia.`);
  }
  if (r.fuera.ala.length) {
    // La primera vez que se salió dice la causa: más adelante en la vuelta el pilón puede irse al otro lado.
    const primero = r.fuera.ala[0].peor;
    const g = Math.round(Math.abs(primero));
    const piv = pies(o.pivote);
    if (primero > 0) {
      mal(en
        ? `The pylon moved ${g}° ahead of your wing: you were above pivotal altitude (about ${piv} ft); descend a little.`
        : `El pilón se te adelantó ${g}° del ala: estabas arriba de la altura pivote (unos ${piv} ft); baja un poco.`);
    } else {
      mal(en
        ? `The pylon fell ${g}° behind your wing: you were below pivotal altitude (about ${piv} ft); climb a little.`
        : `El pilón se te quedó ${g}° atrás del ala: estabas abajo de la altura pivote (unos ${piv} ft); sube un poco.`);
    }
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
  const limpios = CAMPOS_OCHO.filter((k) => r.fuera[k].length === 0).map((k) => ETIQUETA[idioma][k]);
  if (limpios.length) {
    const y = en ? "and" : "y";
    const lista = limpios.length === 1 ? limpios[0] : `${limpios.slice(0, -1).join(", ")} ${y} ${limpios[limpios.length - 1]}`;
    lineas.push({ tipo: "bien", texto: `${mayus(lista)}${en ? ", good." : ", bien."}` });
  }
  return lineas;
}

export function repetirOcho(r: ResultadoOcho, idioma: Idioma): string | null {
  if (r.aprobado) return null;
  return idioma === "en" ? "Repeat: eights on pylons" : "Repite: «8» sobre pilones";
}

export function masFalladoOcho(rs: ResultadoOcho[], idioma: Idioma): string | null {
  let peor: CampoOcho | null = null;
  let max = 0;
  for (const k of CAMPOS_OCHO) {
    const s = rs.reduce((acc, r) => acc + r.fuera[k].reduce((x, tr) => x + tr.fin - tr.inicio + 1, 0), 0);
    if (s > max) [peor, max] = [k, s];
  }
  if (!peor) return null;
  return idioma === "en" ? `What slipped the most: ${ETIQUETA.en[peor]}.` : `Lo que más se te salió: ${ETIQUETA.es[peor]}.`;
}

/** ponytail: sin series para la gráfica, como las demás lecciones nuevas. */
export function paraGuardarOcho(r: ResultadoOcho): Omit<ResultadoOcho, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
