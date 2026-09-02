export interface ContenidoExclusivo {
  id: string;
  tipo: "Video" | "Guía" | "Procedimiento" | "Checklist" | "Examen";
  titulo: string;
  descripcion: string;
  duracion: string;
  imagen: string;
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
    id: "checklist-arranque-frio",
    tipo: "Checklist",
    titulo: "Checklist premium: arranque en frío y clima adverso",
    descripcion: "Flujo detallado de cabina para arranques en frío, altitud de densidad alta y condiciones de viento cruzado fuerte.",
    duracion: "6 páginas",
    imagen: "/images/msfs-xbvla-farmland.jpg",
  },
  {
    id: "checklist-emergencias-completo",
    tipo: "Checklist",
    titulo: "Checklist premium: emergencias completas del Cessna 172",
    descripcion: "Versión ampliada de las checklists de emergencia, con notas de instructor sobre errores comunes de cadetes.",
    duracion: "10 páginas",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
  },
  {
    id: "checkride-oral",
    tipo: "Examen",
    titulo: "Simulacro de examen oral PPL",
    descripcion: "Preguntas reales de examinador con retroalimentación grabada, al nivel de exigencia de un checkride.",
    duracion: "50 min",
    imagen: "/images/msfs-sunset-wing.jpg",
  },
  {
    id: "checkride-vuelo",
    tipo: "Examen",
    titulo: "Simulacro de checkride: maniobras en vuelo",
    descripcion: "Sesión de simulador evaluando maniobras de vuelo bajo los criterios de tolerancia de un examen práctico real.",
    duracion: "40 min",
    imagen: "/images/msfs-volaris-climb.jpg",
  },
];
