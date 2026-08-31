export interface RecursoDescarga {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  version: string;
  fecha: string;
  imagen: string;
}

export const CATEGORIAS_DESCARGAS = [
  "SimHub Dashboards",
  "Checklists",
  "Material de estudio",
  "Guías",
  "Plantillas",
  "Recursos MSFS",
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
  },
  {
    id: "guia-vfr",
    categoria: "Guías",
    nombre: "Guía de planificación VFR",
    descripcion: "Guía paso a paso para planificar un vuelo visual, desde el clima hasta el combustible.",
    version: "v1.0",
    fecha: "2026-04-15",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
  },
  {
    id: "material-meteo",
    categoria: "Material de estudio",
    nombre: "Resumen de Meteorología Aeronáutica",
    descripcion: "Material complementario con los conceptos clave del módulo de Meteorología.",
    version: "v1.1",
    fecha: "2026-03-30",
    imagen: "/images/msfs-volaris-climb.jpg",
  },
  {
    id: "plantilla-plan-vuelo",
    categoria: "Plantillas",
    nombre: "Plantilla de plan de vuelo",
    descripcion: "Formato editable para planificar y documentar tus vuelos de práctica.",
    version: "v1.0",
    fecha: "2026-03-02",
    imagen: "/images/msfs-xbvla-farmland.jpg",
  },
  {
    id: "msfs-livery",
    categoria: "Recursos MSFS",
    nombre: "Pack de configuración MSFS — Academia",
    descripcion: "Ajustes recomendados de Microsoft Flight Simulator para entrenamiento.",
    version: "v1.0",
    fecha: "2026-02-18",
    imagen: "/images/msfs-sunset-wing.jpg",
  },
];
