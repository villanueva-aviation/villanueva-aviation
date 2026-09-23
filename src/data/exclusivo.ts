export interface ContenidoExclusivo {
  id: string;
  tipo: "Checklist" | "Examen" | "Agenda" | "Audio" | "Práctica";
  titulo: string;
  descripcion: string;
  duracion: string;
  imagen: string;
  interactivoHref?: string;
}

export const CONTENIDO_EXCLUSIVO: ContenidoExclusivo[] = [
  {
    id: "checklist-premium-c172",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cessna 172",
    descripcion: "Checklist completo, flujos de memoria para emergencias y V-speeds de referencia, todo en un solo lugar.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c172.jpg",
    interactivoHref: "/premium/checklist-c172",
  },
  {
    id: "checklist-premium-c152",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cessna 152",
    descripcion: "Versión análoga a la del C172: checklist completo, flujos de memoria y V-speeds propias del C152.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c152.jpg",
    interactivoHref: "/premium/checklist-c152",
  },
  {
    id: "checklist-premium-da40",
    tipo: "Checklist",
    titulo: "Checklist Premium — Diamond DA40 NG",
    descripcion: "Checklist completo, flujos de memoria y V-speeds de referencia del Diamond DA40 NG.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c172.jpg",
    interactivoHref: "/premium/checklist/da40",
  },
  {
    id: "checklist-premium-sr22",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cirrus SR22",
    descripcion: "Checklist completo, flujos de memoria y V-speeds de referencia del Cirrus SR22.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c172.jpg",
    interactivoHref: "/premium/checklist/sr22",
  },
  {
    id: "checklist-premium-c208",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cessna 208B Caravan",
    descripcion: "Checklist completo, flujos de memoria y V-speeds de referencia del Cessna 208B Caravan.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c172.jpg",
    interactivoHref: "/premium/checklist/c208",
  },
  {
    id: "checklist-premium-pa28",
    tipo: "Checklist",
    titulo: "Checklist Premium — Piper PA-28 Archer",
    descripcion: "Checklist completo, flujos de memoria y V-speeds de referencia del Piper PA-28 Archer.",
    duracion: "3 secciones",
    imagen: "/images/exclusivo-checklist-c172.jpg",
    interactivoHref: "/premium/checklist/pa28",
  },
  {
    id: "agendar-cita",
    tipo: "Agenda",
    titulo: "Agenda tu sesión con el fundador",
    descripcion: "Solicita una hora de revisión de un tema específico con el fundador, o agenda un simulacro de examen práctico. La primera sesión está incluida.",
    duracion: "60 min",
    imagen: "/images/exclusivo-agenda.jpg",
    interactivoHref: "/agendar-cita",
  },
  {
    id: "checkride-oral",
    tipo: "Examen",
    titulo: "Simulacro de examen oral PPL",
    descripcion: "Preguntas reales de examinador con retroalimentación grabada, al nivel de exigencia de un checkride.",
    duracion: "50 min",
    imagen: "/images/exclusivo-checkride-oral.jpg",
    interactivoHref: "/premium/simulacro-oral",
  },
  {
    id: "checkride-vuelo",
    tipo: "Examen",
    titulo: "Simulacro de checkride: maniobras en vuelo",
    descripcion: "Estándares de tolerancia por maniobra para autoevaluar tus vuelos de práctica antes del examen.",
    duracion: "40 min",
    imagen: "/images/exclusivo-checkride-vuelo.jpg",
    interactivoHref: "/premium/simulacro-vuelo",
  },
  {
    id: "audio-atc-rodaje",
    tipo: "Audio",
    titulo: "Fraseología ATC: rodaje y despegue",
    descripcion: "Audio de práctica con llamadas reales de rodaje, autorización y despegue para escuchar en cualquier momento.",
    duracion: "5 situaciones",
    imagen: "/images/exclusivo-audio-rodaje.jpg",
    interactivoHref: "/premium/audio-rodaje-despegue",
  },
  {
    id: "practica-vuelo",
    tipo: "Práctica",
    titulo: "Práctica de vuelo — progresión de maniobras",
    descripcion: "La secuencia real de maniobras que practicarás con tu instructor, del vuelo de familiarización a las tomas y despegues.",
    duracion: "12 maniobras",
    imagen: "/images/msfs-xbvla-farmland.jpg",
    interactivoHref: "/premium/practica-de-vuelo",
  },
  {
    id: "audio-atc-emergencias",
    tipo: "Audio",
    titulo: "Fraseología ATC: emergencias y aproximación",
    descripcion: "Audio de práctica con llamadas de aproximación, tránsito y procedimientos de emergencia.",
    duracion: "5 situaciones",
    imagen: "/images/exclusivo-audio-emergencias.jpg",
    interactivoHref: "/premium/audio-emergencias-aproximacion",
  },
];
