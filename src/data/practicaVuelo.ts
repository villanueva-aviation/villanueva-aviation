export interface Maniobra {
  id: string;
  titulo: string;
  descripcion: string;
}

export const MANIOBRAS_VUELO: Maniobra[] = [
  {
    id: "familiarizacion",
    titulo: "Familiarización con la aeronave y el entorno de vuelo",
    descripcion:
      "Primer vuelo con tu instructor: controles, instrumentos, efectos de los mandos y reconocimiento del área de práctica.",
  },
  {
    id: "recto-nivelado",
    titulo: "Vuelo recto y nivelado",
    descripcion: "Mantener rumbo, altitud y velocidad constantes usando referencias visuales e instrumentos.",
  },
  {
    id: "virajes-rumbo",
    titulo: "Virajes a rumbos determinados",
    descripcion: "Girar con precisión a un rumbo asignado, controlando alabeo, altitud y coordinación.",
  },
  {
    id: "ascensos-descensos",
    titulo: "Ascensos y descensos",
    descripcion: "Cambios de altitud a velocidad y actitud constantes, incluyendo nivelación en la altitud objetivo.",
  },
  {
    id: "virajes-asc-desc",
    titulo: "Virajes ascendentes y descendentes",
    descripcion: "Combinar viraje con cambio de altitud simultáneo, manteniendo coordinación y velocidad.",
  },
  {
    id: "vuelo-lento",
    titulo: "Vuelo lento",
    descripcion: "Volar cerca de la velocidad de pérdida con control total de la aeronave, reconociendo sus señales de alerta.",
  },
  {
    id: "s-sobre-camino",
    titulo: '"S" sobre un camino',
    descripcion: "Maniobra de referencia terrestre para practicar corrección de deriva por viento en ambos sentidos de giro.",
  },
  {
    id: "ocho-pilones-1",
    titulo: 'Ochos por encima de pilones — primera fase',
    descripcion: "Introducción a la maniobra: mantener un radio de giro constante alrededor de dos puntos de referencia.",
  },
  {
    id: "ocho-pilones-2",
    titulo: 'Ochos por encima de pilones — segunda fase',
    descripcion: "Refinamiento de la maniobra anterior, ajustando el radio de giro a distintas condiciones de viento.",
  },
  {
    id: "emergencias-vuelo",
    titulo: "Prácticas de procedimientos de emergencia",
    descripcion: "Simulacros de falla de motor, aterrizajes forzosos y otras emergencias, aplicando los flujos de memoria aprendidos.",
  },
  {
    id: "repaso-general",
    titulo: "Repaso general de maniobras",
    descripcion: "Sesión de repaso combinando todas las maniobras anteriores antes de avanzar a tomas y despegues.",
  },
  {
    id: "tomas-despegues",
    titulo: "Tomas y despegues (TyD)",
    descripcion: "Ciclos de despegue y aterrizaje en el circuito de tráfico, la maniobra que más se repite antes del vuelo solo.",
  },
];
