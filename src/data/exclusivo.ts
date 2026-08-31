export interface ContenidoExclusivo {
  id: string;
  tipo: "Video" | "Guía" | "Procedimiento";
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
];
