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
  "Guías",
  "Plantillas",
  "Formularios oficiales",
] as const;

export const RECURSOS_DESCARGAS: RecursoDescarga[] = [
  {
    id: "simhub-c172",
    categoria: "SimHub Dashboards",
    nombre: "Dashboard SimHub — Cessna 172",
    descripcion: "Panel de instrumentos personalizado para SimHub compatible con el C172 de MSFS.",
    version: "v1.2",
    fecha: "2026-06-10",
    imagen: "/images/descargas-simhub-c172.jpg",
  },
  {
    id: "checklist-c172",
    categoria: "Checklists",
    nombre: "Checklist Cessna 172 — Normal y emergencia",
    descripcion: "Lista de verificación completa para operaciones normales y procedimientos de emergencia.",
    version: "v2.0",
    fecha: "2026-05-28",
    imagen: "/images/descargas-checklist-c172.jpg",
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
    imagen: "/images/descargas-guia-vfr-carta.jpg",
    interactivoHref: "/guia-vfr",
    archivoHref: "/downloads/guia-planificacion-vfr.pdf",
  },
  {
    id: "guia-hsi",
    categoria: "Guías",
    nombre: "Guía del HSI — Vuelo, aproximación y esperas",
    descripcion: "Uso del HSI desde la planeación hasta la aproximación, con los patrones de espera y sus tres entradas: directa, paralela y de gota.",
    version: "v1.0",
    fecha: "2026-09-20",
    imagen: "/images/descargas-guia-hsi.jpg",
    archivoHref: "/downloads/guia-hsi.pdf",
  },
  {
    id: "guia-metar-taf",
    categoria: "Guías",
    nombre: "Guía de METAR y TAF — Cómo leer el tiempo aeronáutico",
    descripcion: "Cada grupo del METAR y el TAF explicado con ejemplos, viento cruzado, altitud de densidad, categorías de vuelo y ejercicios con respuestas.",
    version: "v1.0",
    fecha: "2026-09-20",
    imagen: "/images/descargas-guia-metar-taf.jpg",
    archivoHref: "/downloads/guia-metar-taf.pdf",
  },
  {
    id: "plantilla-plan-vuelo",
    categoria: "Plantillas",
    nombre: "Plantilla de plan de vuelo",
    descripcion: "Formato editable para tus vuelos de práctica, más el formato oficial de plan de vuelo OACI en PDF.",
    version: "v1.2",
    fecha: "2026-09-13",
    imagen: "/images/msfs-xbvla-farmland.jpg",
    interactivoHref: "/plan-de-vuelo",
    archivoHref: "/downloads/plan-de-vuelo-oaci.pdf",
  },
  {
    id: "checklist-c152",
    categoria: "Checklists",
    nombre: "Checklist Cessna 152 — Normal y emergencia",
    descripcion: "Lista de verificación completa, análoga a la del C172, para operaciones normales y procedimientos de emergencia.",
    version: "v1.0",
    fecha: "2026-08-01",
    imagen: "/images/descargas-checklist-c152.jpg",
    interactivoHref: "/checklist-c152",
    archivoHref: "/downloads/checklist-cessna-152.pdf",
  },
  {
    id: "formulario-bitacora",
    categoria: "Formularios oficiales",
    nombre: "Bitácora de vuelo editable",
    descripcion: "Bitácora de vuelo con el diseño de Villanueva Aviation — columnas estándar de la industria (PIC, día/noche, instrumentos, aterrizajes). Llénala en línea o descárgala en PDF.",
    version: "v2.2",
    fecha: "2026-09-13",
    imagen: "/images/msfs-aeromexico-clouds.jpg",
    interactivoHref: "/bitacora-de-vuelo",
    archivoHref: "/downloads/bitacora-de-vuelo.pdf",
  },
  {
    id: "formulario-peso-balance",
    categoria: "Formularios oficiales",
    nombre: "Hoja de peso y balance editable",
    descripcion: "Formato editable para calcular y documentar peso y balance antes de cada vuelo.",
    version: "v1.0",
    fecha: "2026-07-05",
    imagen: "/images/msfs-xbvla-farmland.jpg",
    interactivoHref: "/peso-y-balance",
  },
];
