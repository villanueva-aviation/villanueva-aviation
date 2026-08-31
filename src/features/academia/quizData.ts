export interface QuizPregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  correcta: number;
}

export const PRACTICA_FUNDAMENTOS: QuizPregunta[] = [
  {
    id: "p1",
    pregunta: "¿Cuál superficie de control permite el movimiento de alabeo (roll)?",
    opciones: ["Alerones", "Timón de dirección", "Elevador", "Flaps"],
    correcta: 0,
  },
  {
    id: "p2",
    pregunta: "¿Qué parte de la aeronave genera la mayor parte de la sustentación?",
    opciones: ["El fuselaje", "El ala", "El estabilizador vertical", "El tren de aterrizaje"],
    correcta: 1,
  },
  {
    id: "p3",
    pregunta: "¿Cuál es la función principal del timón de dirección (rudder)?",
    opciones: [
      "Controlar el cabeceo (pitch)",
      "Aumentar la sustentación en despegue",
      "Controlar la guiñada (yaw)",
      "Reducir la velocidad en aproximación",
    ],
    correcta: 2,
  },
];

export const EVALUACION_FUNDAMENTOS: QuizPregunta[] = [
  {
    id: "e1",
    pregunta: "¿Qué fuerza se opone directamente a la sustentación?",
    opciones: ["El empuje", "El peso", "La resistencia", "La fricción"],
    correcta: 1,
  },
  {
    id: "e2",
    pregunta: "¿Qué instrumento indica la altitud de la aeronave?",
    opciones: ["Altímetro", "Anemómetro", "Horizonte artificial", "Indicador de rumbo"],
    correcta: 0,
  },
  {
    id: "e3",
    pregunta: "¿Cuál superficie se encuentra en el borde de salida del ala y se usa para el despegue y aterrizaje?",
    opciones: ["Alerones", "Flaps", "Spoilers", "Slats"],
    correcta: 1,
  },
  {
    id: "e4",
    pregunta: "¿Qué fuerza es generada por los motores para impulsar la aeronave hacia adelante?",
    opciones: ["Sustentación", "Resistencia", "Empuje", "Peso"],
    correcta: 2,
  },
  {
    id: "e5",
    pregunta: "El elevador controla principalmente:",
    opciones: ["El alabeo", "El cabeceo (pitch)", "La guiñada", "La velocidad del motor"],
    correcta: 1,
  },
];
