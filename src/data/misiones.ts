// Misiones: un módulo organizado en pasos cortos que mezclan formatos (gancho, video, lectura,
// interactivo, práctica en el simulador y comprobación) en lugar de todas las lecturas seguidas
// y los interactivos al final. Reutiliza las mismas actividades del módulo (mismos ids), así que
// el avance que ya tenían los cadetes se conserva.
import type { QuizPregunta } from "../features/academia/quizData";

export interface Mision {
  id: string;
  titulo: string;
  minutos: number;
  /** Qué vas a lograr en tu simulador: el gancho de la misión. */
  gancho: string;
  /** Video de YouTube grabado por Erik; null mientras no exista. */
  videoId: string | null;
  /** Ids de las actividades "leccion" del módulo que se leen en esta misión. */
  temas: string[];
  /** Ids de las actividades "interactividad" del módulo que van en esta misión. */
  interactivos: string[];
  /** Pasos concretos para hacer en el simulador. */
  enSimulador: string[];
  /** Comprobación rápida: no cuenta para el avance, solo para repasar. */
  preguntas: QuizPregunta[];
}

const FUNDAMENTOS: Mision[] = [
  {
    id: "conoce-tu-avion",
    titulo: "Conoce tu avión",
    minutos: 12,
    gancho:
      "Antes de volar, un piloto recorre su avión por fuera. Vas a aprender el nombre de cada parte y a encontrarla en tu Cessna 172 dentro del simulador.",
    videoId: null,
    temas: ["fundamentos-tema1", "fundamentos-tema4"],
    interactivos: ["interactividad-1", "interactividad-2"],
    enSimulador: [
      "Carga un Cessna 172 en plataforma, con el motor apagado.",
      "Cambia a la vista exterior y rodea el avión con la cámara.",
      "Encuentra el fuselaje, las alas, el empenaje, el tren de aterrizaje y la hélice.",
      "En la cola, ubica el estabilizador horizontal y el vertical.",
    ],
    preguntas: [
      { id: "mis-fun-1a", pregunta: "La estructura central del avión, donde van la cabina y los pasajeros, se llama:", opciones: ["Empenaje", "Fuselaje", "Ala", "Tren de aterrizaje"], correcta: 1 },
      { id: "mis-fun-1b", pregunta: "¿Qué parte del avión incluye el estabilizador horizontal y el vertical?", opciones: ["Fuselaje", "Empenaje (cola)", "Alas", "Tren de aterrizaje"], correcta: 1 },
    ],
  },
  {
    id: "cuatro-fuerzas",
    titulo: "Las 4 fuerzas en tu vuelo",
    minutos: 10,
    gancho:
      "Vas a sentir en tu avión el equilibrio de las 4 fuerzas: qué pasa cuando cambias la potencia y nada más.",
    videoId: null,
    temas: ["fundamentos-tema2"],
    interactivos: ["interactividad-4"],
    enSimulador: [
      "Despega y nivela a una altura segura, por ejemplo 3,000 ft sobre el terreno.",
      "Deja que la velocidad se estabilice y vuela recto y nivelado.",
      "Reduce un poco la potencia sin mover el yugo: la velocidad baja y el avión empieza a descender.",
      "Regresa la potencia a donde estaba y recupera tu altura.",
    ],
    preguntas: [
      { id: "mis-fun-2a", pregunta: "En vuelo recto y nivelado a velocidad constante, la sustentación es igual a:", opciones: ["El empuje", "El peso", "La resistencia", "La potencia"], correcta: 1 },
      { id: "mis-fun-2b", pregunta: "Si reduces la potencia y no mueves el yugo, el avión:", opciones: ["Acelera y sube", "Se queda igual", "Pierde velocidad y empieza a descender", "Gira a la izquierda"], correcta: 2 },
    ],
  },
  {
    id: "por-que-vuela",
    titulo: "Por qué vuela un avión",
    minutos: 10,
    gancho:
      "Bernoulli y Newton explicados en corto, y luego lo compruebas tú: qué pasa con la velocidad cuando levantas la nariz.",
    videoId: null,
    temas: ["fundamentos-tema3"],
    interactivos: [],
    enSimulador: [
      "En vuelo recto y nivelado, sin tocar la potencia, levanta la nariz despacio unos grados.",
      "Mira el indicador de velocidad: baja, porque al aumentar el ángulo de ataque también aumenta la resistencia.",
      "Si suena la bocina de pérdida, baja la nariz de inmediato: es el aviso de que el ala está cerca de dejar de sustentar.",
      "Regresa a vuelo nivelado y deja que la velocidad se recupere.",
    ],
    preguntas: [
      { id: "mis-fun-3a", pregunta: "¿Qué principio explica la sustentación por diferencia de presión sobre el ala?", opciones: ["Principio de Bernoulli", "Principio de Arquímedes", "Ley de Pascal", "Ley de Ohm"], correcta: 0 },
      { id: "mis-fun-3b", pregunta: "Si levantas la nariz sin añadir potencia, la velocidad:", opciones: ["Sube", "Baja", "No cambia", "Se duplica"], correcta: 1 },
    ],
  },
  {
    id: "superficies-y-ejes",
    titulo: "Superficies de control y ejes",
    minutos: 12,
    gancho:
      "Vas a mover cada control y ver desde fuera qué superficie se mueve y en qué eje gira el avión.",
    videoId: null,
    temas: ["fundamentos-tema5", "fundamentos-tema6"],
    interactivos: ["interactividad-3"],
    enSimulador: [
      "En tierra y con el motor apagado, cambia a la vista exterior.",
      "Gira el yugo a un lado: un alerón sube y el otro baja. Eso es el alabeo.",
      "Lleva el yugo atrás y adelante: el elevador sube y baja. Eso es el cabeceo.",
      "Pisa cada pedal: el timón de dirección se mueve hacia ese lado. Eso es la guiñada.",
      "Baja los flaps y míralos extenderse en el borde de salida del ala.",
    ],
    preguntas: [
      { id: "mis-fun-4a", pregunta: "¿Qué movimiento controlan los alerones?", opciones: ["Cabeceo", "Guiñada", "Alabeo", "Potencia"], correcta: 2 },
      { id: "mis-fun-4b", pregunta: "Al pisar el pedal derecho en vuelo, la nariz del avión:", opciones: ["Sube", "Se mueve a la derecha", "Se mueve a la izquierda", "Baja"], correcta: 1 },
    ],
  },
  {
    id: "tus-controles",
    titulo: "Tus controles de vuelo",
    minutos: 10,
    gancho:
      "Vas a dejar tus mandos listos para que el avión haga exactamente lo que le pides, y a probarlos en tierra.",
    videoId: null,
    temas: ["fundamentos-tema7"],
    interactivos: [],
    enSimulador: [
      "Abre la configuración de controles de tu simulador y revisa que el yugo, los pedales y el acelerador se muevan en la dirección correcta.",
      "Si el avión se va solo de lado, ajusta la zona muerta. Tienes la guía paso a paso en la sección Controles del sitio.",
      "Arranca el motor y prueba en tierra el acelerador y la mezcla.",
      "Rueda despacio y dirige el avión con los pedales; frena con ellos para detenerte.",
    ],
    preguntas: [
      { id: "mis-fun-5a", pregunta: "¿Qué control regula la potencia del motor?", opciones: ["La mezcla", "El acelerador (throttle)", "Los pedales", "El compensador"], correcta: 1 },
      { id: "mis-fun-5b", pregunta: "Si giras el yugo a la izquierda en vuelo, el avión:", opciones: ["Se inclina a la izquierda", "Sube la nariz", "Se inclina a la derecha", "Acelera"], correcta: 0 },
    ],
  },
  {
    id: "seis-instrumentos",
    titulo: "Los 6 instrumentos básicos",
    minutos: 10,
    gancho:
      "Vas a leer el panel clásico: con estos 6 instrumentos sabes qué está haciendo tu avión en todo momento.",
    videoId: null,
    temas: ["fundamentos-tema8"],
    interactivos: [],
    enSimulador: [
      "Carga un Cessna 172 con instrumentos analógicos. Si el tuyo trae G1000, busca los mismos datos en la pantalla principal.",
      "En la fila de arriba, ubica la velocidad, el horizonte artificial y el altímetro.",
      "En la fila de abajo, ubica el coordinador de viraje, el indicador de rumbo y el variómetro.",
      "En vuelo, haz un viraje suave y observa cómo cambian el horizonte, el rumbo y el coordinador de viraje.",
    ],
    preguntas: [
      { id: "mis-fun-6a", pregunta: "¿Qué instrumento te dice si estás subiendo o bajando, y qué tan rápido?", opciones: ["Altímetro", "Variómetro", "Indicador de rumbo", "Horizonte artificial"], correcta: 1 },
      { id: "mis-fun-6b", pregunta: "¿Qué instrumento muestra la altitud?", opciones: ["Altímetro", "Variómetro", "Indicador de velocidad", "Coordinador de viraje"], correcta: 0 },
    ],
  },
];

/** Módulos que ya se presentan como misiones. */
export const MISIONES: Record<string, Mision[]> = {
  fundamentos: FUNDAMENTOS,
};

/** La misión está completa cuando sus lecturas e interactivos lo están. */
export function misionCompleta(mision: Mision, completada: (actividadId: string) => boolean): boolean {
  return [...mision.temas, ...mision.interactivos].every(completada);
}

/** La primera misión sin terminar (o la última, si todas están completas). */
export function misionInicial(misiones: Mision[], completada: (actividadId: string) => boolean): number {
  const i = misiones.findIndex((m) => !misionCompleta(m, completada));
  return i === -1 ? misiones.length - 1 : i;
}
