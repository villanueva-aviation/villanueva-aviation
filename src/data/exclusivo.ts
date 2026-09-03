export interface ContenidoExclusivo {
  id: string;
  tipo: "Video" | "Guía" | "Procedimiento" | "Checklist" | "Examen" | "Agenda" | "Audio";
  titulo: string;
  descripcion: string;
  duracion: string;
  imagen: string;
  interactivoHref?: string;
}

export const CONTENIDO_EXCLUSIVO: ContenidoExclusivo[] = [
  {
    id: "clase-actitudes",
    tipo: "Video",
    titulo: "Clase especial: vuelo por actitudes",
    descripcion: "Sesión grabada con un instructor sobre control de actitud sin depender del horizonte artificial.",
    duracion: "38 min",
    imagen: "/images/msfs-sunset-wing.jpg",
  },
  {
    id: "guia-emergencias",
    tipo: "Guía",
    titulo: "Guía avanzada de procedimientos de emergencia",
    descripcion: "Procedimientos detallados para fallas de motor, incendios y descompresión.",
    duracion: "24 páginas",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
  },
  {
    id: "procedimiento-ifr",
    tipo: "Procedimiento",
    titulo: "Briefing de aproximación ILS paso a paso",
    descripcion: "Desglose completo de un briefing de aproximación por instrumentos.",
    duracion: "12 min",
    imagen: "/images/msfs-xbvla-farmland.jpg",
  },
  {
    id: "clase-crm",
    tipo: "Video",
    titulo: "Clase especial: gestión de recursos de cabina (CRM)",
    descripcion: "Principios de CRM aplicados a operaciones de una sola tripulación.",
    duracion: "45 min",
    imagen: "/images/msfs-volaris-climb.jpg",
  },
  {
    id: "checklist-premium-c172",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cessna 172",
    descripcion: "Checklist completo, flujos de memoria para emergencias y V-speeds de referencia, todo en un solo lugar.",
    duracion: "3 secciones",
    imagen: "/images/msfs-xbvla-farmland.jpg",
    interactivoHref: "/premium/checklist-c172",
  },
  {
    id: "checklist-premium-c152",
    tipo: "Checklist",
    titulo: "Checklist Premium — Cessna 152",
    descripcion: "Versión análoga a la del C172: checklist completo, flujos de memoria y V-speeds propias del C152.",
    duracion: "3 secciones",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
    interactivoHref: "/premium/checklist-c152",
  },
  {
    id: "agendar-cita",
    tipo: "Agenda",
    titulo: "Agenda tu sesión con un instructor",
    descripcion: "Solicita una hora de revisión de un tema específico, o agenda un día para tu examen práctico.",
    duracion: "A tu ritmo",
    imagen: "/images/msfs-sunset-wing.jpg",
    interactivoHref: "/agendar-cita",
  },
  {
    id: "checkride-oral",
    tipo: "Examen",
    titulo: "Simulacro de examen oral PPL",
    descripcion: "Preguntas reales de examinador con retroalimentación grabada, al nivel de exigencia de un checkride.",
    duracion: "50 min",
    imagen: "/images/msfs-sunset-wing.jpg",
    interactivoHref: "/premium/simulacro-oral",
  },
  {
    id: "checkride-vuelo",
    tipo: "Examen",
    titulo: "Simulacro de checkride: maniobras en vuelo",
    descripcion: "Estándares de tolerancia por maniobra para autoevaluar tus vuelos de práctica antes del examen.",
    duracion: "40 min",
    imagen: "/images/msfs-volaris-climb.jpg",
    interactivoHref: "/premium/simulacro-vuelo",
  },
  {
    id: "audio-atc-rodaje",
    tipo: "Audio",
    titulo: "Fraseología ATC: rodaje y despegue",
    descripcion: "Audio de práctica con llamadas reales de rodaje, autorización y despegue para escuchar en cualquier momento.",
    duracion: "5 situaciones",
    imagen: "/images/msfs-volaris-climb.jpg",
    interactivoHref: "/premium/audio-rodaje-despegue",
  },
  {
    id: "audio-atc-emergencias",
    tipo: "Audio",
    titulo: "Fraseología ATC: emergencias y aproximación",
    descripcion: "Audio de práctica con llamadas de aproximación, tránsito y procedimientos de emergencia.",
    duracion: "5 situaciones",
    imagen: "/images/msfs-sunset-wing.jpg",
    interactivoHref: "/premium/audio-emergencias-aproximacion",
  },
];
