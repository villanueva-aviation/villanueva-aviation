import type { Muestra } from "./evaluador.ts";
import { GRUPOS, TAREAS, type EvaluacionFamiliarizacion, type Grupo, type IdTarea, type ResultadoFamiliarizacion } from "./evaluadorFamiliarizacion.ts";
import type { Linea } from "./explicacion.ts";
import { traducirMotivo, type Idioma } from "./idiomaInstructor.ts";
import { ANULADO, type Aviso, type Luz } from "./voz.ts";

// Qué dice el instructor en la familiarización, el briefing y el resumen. Puro.

export type PasoFamiliarizacion = "estabiliza" | `${IdTarea}:${0 | 1}` | "terminado" | "invalido";

export function pasoFamiliarizacion(ev: EvaluacionFamiliarizacion | null, _m: Muestra | null): PasoFamiliarizacion | null {
  if (!ev) return null;
  if (ev.fase === "armado") return "estabiliza";
  if (ev.fase === "tareas") return `${TAREAS[ev.k].id}:${ev.parte}`;
  return ev.fase;
}

const ORDEN: Record<Idioma, Record<`${IdTarea}:${0 | 1}`, string>> = {
  es: {
    "alabeo-izq:0": "Alabeo: con los alerones, inclina unos 20 grados a la izquierda.",
    "alabeo-izq:1": "Bien. Ahora nivela las alas.",
    "alabeo-der:0": "Ahora a la derecha: inclina unos 20 grados.",
    "alabeo-der:1": "Nivela las alas.",
    "cabeceo-arriba:0": "Cabeceo: con el elevador, jala un poco y sube la nariz unos 5 grados.",
    "cabeceo-arriba:1": "Regresa la nariz a donde estaba.",
    "cabeceo-abajo:0": "Ahora empuja un poco y baja la nariz unos 5 grados.",
    "cabeceo-abajo:1": "Regresa la nariz a donde estaba.",
    "guinada-izq:0": "Guiñada: pisa el pedal izquierdo y mira cómo la nariz se va a la izquierda y la bola se sale del centro.",
    "guinada-izq:1": "Suelta el pedal: la bola regresa al centro.",
    "guinada-der:0": "Ahora el pedal derecho.",
    "guinada-der:1": "Suelta el pedal.",
    "acelera:0": "Potencia: mete potencia y mira cómo sube la velocidad.",
    "acelera:1": "",
    "reduce:0": "Ahora reduce la potencia y mira cómo baja la velocidad.",
    "reduce:1": "",
  },
  en: {
    "alabeo-izq:0": "Roll: with the ailerons, bank about 20 degrees to the left.",
    "alabeo-izq:1": "Good. Now level the wings.",
    "alabeo-der:0": "Now to the right: bank about 20 degrees.",
    "alabeo-der:1": "Level the wings.",
    "cabeceo-arriba:0": "Pitch: with the elevator, pull a little and raise the nose about 5 degrees.",
    "cabeceo-arriba:1": "Bring the nose back to where it was.",
    "cabeceo-abajo:0": "Now push a little and lower the nose about 5 degrees.",
    "cabeceo-abajo:1": "Bring the nose back to where it was.",
    "guinada-izq:0": "Yaw: press the left pedal and watch the nose go left and the ball leave the center.",
    "guinada-izq:1": "Release the pedal: the ball comes back to the center.",
    "guinada-der:0": "Now the right pedal.",
    "guinada-der:1": "Release the pedal.",
    "acelera:0": "Power: add power and watch the airspeed go up.",
    "acelera:1": "",
    "reduce:0": "Now reduce power and watch the airspeed go down.",
    "reduce:1": "",
  },
};

function texto(paso: PasoFamiliarizacion, ev: EvaluacionFamiliarizacion | null, idioma: Idioma): string {
  const en = idioma === "en";
  if (paso === "estabiliza") return en ? "Straight and level: constant altitude and airspeed. We start from there." : "Recto y nivelado: altitud y velocidad constantes. De ahí empezamos.";
  if (paso === "terminado") return en ? "That's all the controls. Well done." : "Ya conoces todos los controles. Bien hecho.";
  if (paso === "invalido") return `${ANULADO[idioma]} ${traducirMotivo(ev?.motivo ?? "", idioma)}`.trim();
  return ORDEN[idioma][paso];
}

export function ordenFamiliarizacion(antes: PasoFamiliarizacion | null, ahora: PasoFamiliarizacion | null, ev: EvaluacionFamiliarizacion | null, idioma: Idioma): string | null {
  if (!ahora || ahora === antes || ahora === "terminado") return null;
  return texto(ahora, ev, idioma) || null;
}

export function textoPasoFamiliarizacion(paso: PasoFamiliarizacion | null, ev: EvaluacionFamiliarizacion | null, idioma: Idioma): string {
  return !paso || paso === "invalido" ? "" : texto(paso, ev, idioma);
}

const grupoDe = (paso: PasoFamiliarizacion | null): number => {
  if (paso === "terminado") return GRUPOS.length;
  if (!paso || paso === "estabiliza" || paso === "invalido") return -1;
  return GRUPOS.indexOf(TAREAS.find((x) => paso.startsWith(`${x.id}:`))!.grupo);
};

/** Celdas: gris pendiente, ámbar el control de ahora, verde ya hecho. */
export function semaforoFamiliarizacion(ev: EvaluacionFamiliarizacion | null, m: Muestra | null): Record<Grupo, Luz> {
  const g = grupoDe(pasoFamiliarizacion(ev, m));
  return Object.fromEntries(GRUPOS.map((x, i) => [x, g < 0 ? "gris" : i < g ? "verde" : i === g ? "ambar" : "gris"])) as Record<Grupo, Luz>;
}

/** Sin tolerancias, sin avisos. */
export const avisoFamiliarizacion = (_e: EvaluacionFamiliarizacion | null, _m: Muestra | null, _modo: "practica" | "checkride", _i: Idioma): Aviso | null => null;

export function briefingFamiliarizacion(idioma: Idioma): string[] {
  if (idioma === "en") {
    return [
      "Today is your first flight: you'll get to know the controls of the Cessna 172.",
      "No tolerances: you pass with 100 by doing every movement. The instructor asks for each one and waits to see it.",
      "Roll (ailerons): bank 20° to each side and level the wings.",
      "Pitch (elevator): raise the nose 5° and bring it back; then lower it and bring it back.",
      "Yaw (pedals): press each pedal and watch the nose and the ball move.",
      "Power (throttle): add power and watch the airspeed go up; reduce it and watch it go down.",
      "Use the trim to take the pressure off the yoke; the instructor can't see it.",
    ];
  }
  return [
    "Hoy es tu primer vuelo: vas a conocer los controles del Cessna 172.",
    "Sin tolerancias: apruebas con 100 al hacer todos los movimientos. El instructor pide cada uno y espera a verlo.",
    "Alabeo (alerones): inclina 20° a cada lado y nivela las alas.",
    "Cabeceo (elevador): sube la nariz 5° y regrésala; luego bájala y regrésala.",
    "Guiñada (pedales): pisa cada pedal y mira cómo se mueven la nariz y la bola.",
    "Potencia (acelerador): mete potencia y mira subir la velocidad; redúcela y mira cómo baja.",
    "Usa el compensador para quitarle presión al control; el instructor no lo puede ver.",
  ];
}

const NOMBRE_GRUPO: Record<Idioma, Record<Grupo, string>> = {
  es: { alabeo: "Alabeo", cabeceo: "Cabeceo", guinada: "Guiñada", potencia: "Potencia" },
  en: { alabeo: "Roll", cabeceo: "Pitch", guinada: "Yaw", potencia: "Power" },
};

export function listaPasosFamiliarizacion(paso: PasoFamiliarizacion | null, idioma: Idioma): { nombre: string; estado: "hecho" | "actual" | "pendiente" }[] {
  const g = grupoDe(paso);
  return GRUPOS.map((x, i) => ({ nombre: NOMBRE_GRUPO[idioma][x], estado: g < 0 ? "pendiente" : i < g ? "hecho" : i === g ? "actual" : "pendiente" }));
}

const CONTROL: Record<Idioma, Record<Grupo, string>> = {
  es: { alabeo: "Gira el control a los lados: los alerones inclinan el avión.", cabeceo: "Jala o empuja el control: el elevador sube o baja la nariz.", guinada: "Los pedales mueven el timón: la nariz va a los lados.", potencia: "El acelerador cambia la potencia del motor." },
  en: { alabeo: "Turn the yoke: the ailerons bank the airplane.", cabeceo: "Pull or push the yoke: the elevator raises or lowers the nose.", guinada: "The pedals move the rudder: the nose goes side to side.", potencia: "The throttle changes engine power." },
};

export function queHacerFamiliarizacion(paso: PasoFamiliarizacion | null, idioma: Idioma): string {
  const g = grupoDe(paso);
  if (paso === "estabiliza") return idioma === "en" ? "Cruise power and trim." : "Potencia de crucero y compensa.";
  return g >= 0 && g < GRUPOS.length ? CONTROL[idioma][GRUPOS[g]] : "";
}

const NOMBRE_TAREA: Record<Idioma, Record<IdTarea, string>> = {
  es: {
    "alabeo-izq": "alabeo a la izquierda", "alabeo-der": "alabeo a la derecha", "cabeceo-arriba": "nariz arriba", "cabeceo-abajo": "nariz abajo",
    "guinada-izq": "pedal izquierdo", "guinada-der": "pedal derecho", acelera: "meter potencia", reduce: "reducir potencia",
  },
  en: {
    "alabeo-izq": "roll left", "alabeo-der": "roll right", "cabeceo-arriba": "nose up", "cabeceo-abajo": "nose down",
    "guinada-izq": "left pedal", "guinada-der": "right pedal", acelera: "adding power", reduce: "reducing power",
  },
};
export const nombreTarea = (id: IdTarea, idioma: Idioma) => NOMBRE_TAREA[idioma][id];

export function explicarFamiliarizacion(r: ResultadoFamiliarizacion, idioma: Idioma): Linea[] {
  const en = idioma === "en";
  const lineas: Linea[] = [{ tipo: "bien", texto: en ? "You did all 8 movements: roll, pitch, yaw and power." : "Hiciste los 8 movimientos: alabeo, cabeceo, guiñada y potencia." }];
  const lento = r.tareas.reduce((a, x) => (x.seg > a.seg ? x : a), r.tareas[0]);
  if (lento) {
    const s = Math.round(lento.seg);
    lineas.push({ tipo: "bien", texto: en ? `What took you longest: ${nombreTarea(lento.id, "en")} (${s} s). Fly it again until it comes naturally.` : `Lo que más te tardó: ${nombreTarea(lento.id, "es")} (${s} s). Vuélvelo a hacer hasta que salga solo.` });
  }
  return lineas;
}

export const repetirFamiliarizacion = (_r: ResultadoFamiliarizacion, _i: Idioma): string | null => null;
export const masFalladoFamiliarizacion = (_rs: ResultadoFamiliarizacion[], _i: Idioma): string | null => null;

/** ponytail: sin series para la gráfica, como las demás lecciones nuevas. */
export function paraGuardarFamiliarizacion(r: ResultadoFamiliarizacion): Omit<ResultadoFamiliarizacion, "muestras"> {
  const { muestras: _, ...resto } = r;
  return resto;
}
