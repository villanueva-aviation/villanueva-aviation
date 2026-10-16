import { MODULE_EVALUACION, MODULE_PRACTICA } from "./moduleContent";
import type { QuizPregunta } from "../features/academia/quizData";
import type { AreaTest } from "../features/testNivel/reglas";

// Dos preguntas por área tomadas de los bancos de la Academia: una fácil (de práctica) y una difícil
// (de evaluación). Primero las fáciles y luego las difíciles, para que el test suba de dificultad.
const FACILES: [AreaTest, string][] = [
  ["Fundamentos", "fun-q2"],
  ["Meteorología", "met-q2"],
  ["Navegación", "nav-q2"],
  ["Comunicaciones", "com-q12"],
  ["Instrumentos", "ins-q5"],
  ["IFR", "ifr-q3"],
];
const DIFICILES: [AreaTest, string][] = [
  ["Fundamentos", "fun-q17"],
  ["Meteorología", "met-q16"],
  ["Navegación", "nav-q24"],
  ["Comunicaciones", "com-q16"],
  ["Instrumentos", "ins-q7"],
  ["IFR", "ifr-q15"],
];

const TODAS = [...Object.values(MODULE_PRACTICA), ...Object.values(MODULE_EVALUACION)].flat();

function buscar(id: string): QuizPregunta {
  const p = TODAS.find((q) => q.id === id);
  if (!p) throw new Error(`testNivel: no existe la pregunta ${id}`);
  return p;
}

export interface PreguntaTest extends QuizPregunta {
  area: AreaTest;
}

export const PREGUNTAS_TEST: PreguntaTest[] = [...FACILES, ...DIFICILES].map(([area, id]) => ({ ...buscar(id), area }));
