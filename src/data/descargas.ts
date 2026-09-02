export interface RecursoDescarga {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  version: string;
  fecha: string;
  imagen: string;
  /** Ruta a una versión interactiva en el sitio, cuando el recurso la tiene además del PDF. */
  interactivoHref?: string;
  /** Ruta al archivo descargable en public/, cuando ya está disponible. */
  archivoHref?: string;
}

export const CATEGORIAS_DESCARGAS = [
  "SimHub Dashboards",
  "Checklists",
  "Material de estudio",
  "Guías",
  "Plantillas",
  "Formularios oficiales",
  "Audio ATC",
] as const;

export const RECURSOS_DESCARGAS: RecursoDescarga[] = [
  {
    id: "simhub-c172",
    categoria: "SimHub Dashboards",
    nombre: "Dashboard SimHub — Cessna 172",
    descripcion: "Panel de instrumentos personalizado para SimHub compatible con el C172 de MSFS.",
    version: "v1.2",
    fecha: "2026-06-10",
    imagen: "/images/msfs-xbvla-farmland.jpg",
  },
  {
    id: "checklist-c172",
    categoria: "Checklists",
    nombre: "Checklist Cessna 172 — Normal y emergencia",
    descripcion: "Lista de verificación completa para operaciones normales y procedimientos de emergencia.",
    version: "v2.0",
    fecha: "2026-05-28",
    imagen: "/images/msfs-sunset-wing.jpg",
    interactivoHref: "/checklist-c172",
    archivoHref: "/downloads/checklist-cessna-172.pdf",
  },
  {
    id: "guia-vfr",
    categoria: "Guías",
    nombre: "Guía de planificación VFR",
    descripcion: "Guía paso a paso para planificar un vuelo visual, desde el clima hasta el combustible.",
    version: "v1.0",
    fecha: "2026-04-15",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
    interactivoHref: "/guia-vfr",
    archivoHref: "/downloads/guia-planificacion-vfr.pdf",
  },
  {
    id: "material-meteo",
    categoria: "Material de estudio",
    nombre: "Resumen de Meteorología Aeronáutica",
    descripcion: "Material complementario con los conceptos clave del módulo de Meteorología.",
    version: "v1.1",
    fecha: "2026-03-30",
    imagen: "/images/msfs-volaris-climb.jpg",
    interactivoHref: "/resumen-meteorologia",
    archivoHref: "/downloads/resumen-meteorologia.pdf",
  },
  {
    id: "plantilla-plan-vuelo",
    categoria: "Plantillas",
    nombre: "Plantilla de plan de vuelo",
    descripcion: "Formato editable para planificar y documentar tus vuelos de práctica.",
    version: "v1.0",
    fecha: "2026-03-02",
    imagen: "/images/msfs-xbvla-farmland.jpg",
    interactivoHref: "/plan-de-vuelo",
  },
  {
    id: "checklist-c152",
    categoria: "Checklists",
    nombre: "Checklist Cessna 152 — Normal y emergencia",
    descripcion: "Lista de verificación completa, análoga a la del C172, para operaciones normales y procedimientos de emergencia.",
    version: "v1.0",
    fecha: "2026-08-01",
    imagen: "/images/msfs-sunset-wing.jpg",
    interactivoHref: "/checklist-c152",
    archivoHref: "/downloads/checklist-cessna-152.pdf",
  },
  {
    id: "formulario-bitacora",
    categoria: "Formularios oficiales",
    nombre: "Bitácora de vuelo editable",
    descripcion: "Formato oficial de bitácora de vuelo en versión editable, listo para llenar e imprimir.",
    version: "v1.0",
    fecha: "2026-07-05",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
  },
  {
    id: "formulario-peso-balance",
    categoria: "Formularios oficiales",
    nombre: "Hoja de peso y balance editable",
    descripcion: "Formato editable para calcular y documentar peso y balance antes de cada vuelo.",
    version: "v1.0",
    fecha: "2026-07-05",
    imagen: "/images/msfs-xbvla-farmland.jpg",
  },
  {
    id: "audio-atc-rodaje",
    categoria: "Audio ATC",
    nombre: "Fraseología ATC: rodaje y despegue",
    descripcion: "Audio de práctica con llamadas reales de rodaje, autorización y despegue para escuchar en cualquier momento.",
    version: "v1.0",
    fecha: "2026-07-12",
    imagen: "/images/msfs-volaris-climb.jpg",
  },
  {
    id: "audio-atc-emergencias",
    categoria: "Audio ATC",
    nombre: "Fraseología ATC: emergencias y aproximación",
    descripcion: "Audio de práctica con llamadas de aproximación, tránsito y procedimientos de emergencia.",
    version: "v1.0",
    fecha: "2026-07-12",
    imagen: "/images/msfs-sunset-wing.jpg",
  },
];
