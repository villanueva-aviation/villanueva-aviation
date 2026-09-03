import type { ExplorerTema } from "../components/ui/TopicExplorer";

/**
 * Estándares de tolerancia estilo ACS para las maniobras más evaluadas en un
 * checkride de PPL — referencia genérica para autoevaluarte en tus vuelos de
 * práctica, no un sustituto de los estándares oficiales vigentes.
 */
export const CHECKRIDE_VUELO: ExplorerTema[] = [
  {
    id: "virajes-pronunciados",
    titulo: "Virajes pronunciados (steep turns)",
    texto:
      "360° de viraje a 45° de inclinación, alternando izquierda y derecha. Tolerancias típicas: altitud ±100 pies, velocidad ±10 nudos, inclinación ±5°, rumbo de reingreso ±10°. El error más común es perder altitud al iniciar el viraje por no compensar con elevador la pérdida de sustentación vertical.",
  },
  {
    id: "vuelo-lento",
    titulo: "Vuelo lento (slow flight)",
    texto:
      "Vuelo controlado justo por encima de la velocidad de pérdida, con configuración de aterrizaje. Tolerancias típicas: altitud ±100 pies, rumbo ±10°, velocidad +10/-0 nudos sobre la velocidad objetivo. Se evalúa el control coordinado con potencia y actitud, no solo mantener la velocidad.",
  },
  {
    id: "perdidas",
    titulo: "Pérdidas (power-off y power-on stalls)",
    texto:
      "Pérdida en configuración de aproximación (power-off) y en configuración de despegue/ascenso (power-on), con recuperación al primer indicio de pérdida. Se evalúa reconocimiento oportuno, recuperación con pérdida mínima de altitud, y coordinación (sin entrar en barrena).",
  },
  {
    id: "descenso-emergencia",
    titulo: "Descenso de emergencia",
    texto:
      "Configuración y actitud para perder altitud lo más rápido posible de forma segura (simulando humo o fuego en cabina). Se evalúa la ejecución inmediata del procedimiento memorizado y el mantenimiento de una velocidad segura durante todo el descenso.",
  },
  {
    id: "aterrizajes-normales",
    titulo: "Aterrizajes normales y con viento cruzado",
    texto:
      "Aproximación estabilizada, touchdown en o cerca del punto señalado, control direccional mantenido durante todo el rodaje. Tolerancias típicas: tocar dentro de 200 pies del punto especificado, sin deriva lateral no corregida al tocar.",
  },
  {
    id: "aproximaciones-frustradas",
    titulo: "Aproximación frustrada (go-around)",
    texto:
      "Decisión y ejecución de abortar el aterrizaje: potencia máxima, actitud de ascenso, retracción progresiva de flaps y tren (si aplica) según el POH. Se evalúa la prontitud de la decisión tanto como la ejecución técnica.",
  },
  {
    id: "navegacion-estimada",
    titulo: "Navegación por estima (dead reckoning)",
    texto:
      "Vuelo de un tramo de ruta planeado previamente, manteniendo rumbo y tiempo calculados. Tolerancias típicas: altitud ±200 pies, rumbo ±15°, identificación correcta de checkpoints dentro de un margen razonable de tiempo.",
  },
  {
    id: "curso-rectangular",
    titulo: "Curso rectangular (rectangular course)",
    texto:
      "Vuelo alrededor de un terreno rectangular (como un campo) manteniendo una distancia constante de los bordes, ajustando la inclinación en cada lado para compensar la deriva del viento. Tolerancias típicas: altitud ±100 pies, velocidad ±10 nudos, distancia visualmente constante al terreno sin describir un óvalo irregular. El error más común es no anticipar la corrección de viento antes de llegar a cada esquina.",
  },
  {
    id: "ochos-carreteras",
    titulo: "Ochos sobre carreteras (S-turns)",
    texto:
      "Vuelo en forma de 'S' cruzando perpendicularmente una carretera o línea recta en tierra, manteniendo radios de giro iguales a ambos lados pese al viento — mayor inclinación con viento en cola, menor con viento de frente. Tolerancias típicas: altitud ±100 pies, velocidad ±10 nudos, radios simétricos y cruces perpendiculares a la referencia. Se evalúa la división de atención entre pilotaje y referencia visual en tierra.",
  },
  {
    id: "virajes-alrededor-punto",
    titulo: "Virajes alrededor de un punto (turns around a point)",
    texto:
      "Vuelo en círculo alrededor de un punto fijo en tierra, manteniendo un radio constante y ajustando la inclinación según la posición relativa al viento — mayor inclinación con viento en cola, menor contra el viento. Tolerancias típicas: altitud ±100 pies, velocidad ±10 nudos, radio visualmente constante durante las 2 vueltas completas.",
  },
];
