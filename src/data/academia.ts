import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CloudSun,
  Wind,
  Compass,
  Radio,
  Eye,
  CloudFog,
  Map,
  Gauge,
  Scale,
  ClipboardList,
  Layers,
  Gavel,
} from "lucide-react";
import { flattenTemas } from "./moduleContent";

export type ActividadTipo = "leccion" | "interactividad" | "practica" | "evaluacion";

export type InteractividadTipo = "diagrama" | "dragdrop" | "escenario" | "slider" | "audio" | "terminos" | "circuito";

export interface ModuloActividad {
  id: string;
  tipo: ActividadTipo;
  titulo: string;
  /** Solo para tipo "interactividad": qué widget renderizar. */
  widget?: InteractividadTipo;
  /** Solo para widget "terminos": qué set de términos usar (por defecto, el slug del módulo). */
  termSetId?: string;
}

export interface AcademiaModulo {
  slug: string;
  titulo: string;
  resumen: string;
  icon: LucideIcon;
  nivel: "Básico" | "Intermedio" | "Avanzado";
  actividades: ModuloActividad[];
  /** Infografía de la lección, cuando el módulo aún no tiene lecciones de texto en moduleContent.ts. */
  imagenLeccion?: string;
}

/** Cada subtema de un módulo se convierte en su propia actividad de tipo "leccion". */
function leccionesDeTemas(slug: string): ModuloActividad[] {
  return (flattenTemas(slug) ?? []).map((t) => ({ id: t.id, tipo: "leccion", titulo: t.titulo }));
}

export const ACADEMIA_MODULOS: AcademiaModulo[] = [
  {
    slug: "fundamentos",
    titulo: "Fundamentos de Aviación",
    resumen:
      "Bases teóricas y conceptos esenciales para comenzar en el mundo de la aviación.",
    icon: BookOpen,
    nivel: "Básico",
    actividades: [
      ...leccionesDeTemas("fundamentos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Diagrama interactivo del avión", widget: "diagrama" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Arrastra las etiquetas", widget: "dragdrop" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: identifica los componentes" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Fundamentos" },
    ],
  },
  {
    slug: "meteorologia",
    titulo: "Meteorología",
    resumen:
      "Interpretación de condiciones meteorológicas aplicadas a la operación de vuelo.",
    icon: CloudSun,
    nivel: "Básico",
    imagenLeccion: "/images/infografia-metar-rmk.jpg",
    actividades: [
      ...leccionesDeTemas("meteorologia"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: tormenta en ruta", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: interpretar reportes" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Meteorología" },
    ],
  },
  {
    slug: "aerodinamica",
    titulo: "Aerodinámica",
    resumen: "Principios físicos que permiten el vuelo y el control de la aeronave.",
    icon: Wind,
    nivel: "Intermedio",
    imagenLeccion: "/images/infografia-4fuerzas.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Las cuatro fuerzas del vuelo" },
      { id: "leccion-2", tipo: "leccion", titulo: "Superficies de control" },
      { id: "interactividad-1", tipo: "interactividad", titulo: "Simulador de configuración vs. resistencia", widget: "slider" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: efectos de control" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Aerodinámica" },
    ],
  },
  {
    slug: "navegacion",
    titulo: "Navegación",
    resumen: "Radionavegación VOR/DME/HSI, cartas VFR y planificación de rutas.",
    icon: Compass,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("navegacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de viento en contra", widget: "slider" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: planificación de ruta" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Navegación" },
    ],
  },
  {
    slug: "cartografia",
    titulo: "Cartografía Aeronáutica",
    resumen: "Símbolos, espacios aéreos, elevaciones y lectura completa de cartas VFR.",
    icon: Map,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("cartografia"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona símbolos y espacios aéreos", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona elevaciones y frecuencias", widget: "terminos", termSetId: "cartografia-2" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: lectura de cartas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Cartografía" },
    ],
  },
  {
    slug: "comunicaciones",
    titulo: "Comunicaciones",
    resumen: "Estándares de comunicación radiofónica entre piloto y controlador.",
    icon: Radio,
    nivel: "Básico",
    imagenLeccion: "/images/infografia-fraseologia.jpg",
    actividades: [
      ...leccionesDeTemas("comunicaciones"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Práctica de fraseología con audio", widget: "audio" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-3", tipo: "interactividad", titulo: "Circuito de tráfico: recorrido y práctica", widget: "circuito" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: simulacro de llamadas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Comunicaciones" },
    ],
  },
  {
    slug: "instrumentos",
    titulo: "Instrumentos de Vuelo",
    resumen: "El Six Pack, radionavegación en cabina y equipo de vigilancia.",
    icon: Gauge,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("instrumentos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: falla de vacío", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: lectura de instrumentos" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Instrumentos" },
    ],
  },
  {
    slug: "rendimiento",
    titulo: "Peso y Rendimiento",
    resumen: "Peso, balance, distancias de despegue/aterrizaje y V-speeds.",
    icon: Scale,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("rendimiento"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de altitud de densidad", widget: "slider" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: cálculos de rendimiento" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Rendimiento" },
    ],
  },
  {
    slug: "vfr",
    titulo: "VFR",
    resumen: "Reglas de vuelo visual: mínimos, procedimientos y planificación.",
    icon: Eye,
    nivel: "Intermedio",
    imagenLeccion: "/images/infografia-vfr.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Mínimos meteorológicos VFR" },
      { id: "leccion-2", tipo: "leccion", titulo: "Procedimientos de patrón de tráfico" },
      { id: "interactividad-1", tipo: "interactividad", titulo: "Simulador de decisión: clima cambiante", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: planificación VFR" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de VFR" },
    ],
  },
  {
    slug: "operacion",
    titulo: "Operación de Aeronave",
    resumen: "Del walk-around al apagado: procedimientos completos de cada fase de vuelo.",
    icon: ClipboardList,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("operacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: fuego en el arranque", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: secuencia de procedimientos" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Operación" },
    ],
  },
  {
    slug: "espacios-aereos",
    titulo: "Espacios Aéreos",
    resumen: "Clasificación del espacio aéreo controlado y no controlado, y áreas especiales.",
    icon: Layers,
    nivel: "Intermedio",
    actividades: [
      ...leccionesDeTemas("espacios-aereos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: cruce de espacio Clase C", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: clasificación de espacios" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Espacios Aéreos" },
    ],
  },
  {
    slug: "reglamentacion",
    titulo: "Reglamentación",
    resumen: "Reglas VFR/IFR, licencias, requisitos y mínimos regulatorios.",
    icon: Gavel,
    nivel: "Básico",
    actividades: [
      ...leccionesDeTemas("reglamentacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona requisitos y mínimos", widget: "terminos", termSetId: "reglamentacion-2" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: marco regulatorio" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Reglamentación" },
    ],
  },
  {
    slug: "ifr",
    titulo: "IFR",
    resumen: "Reglas de vuelo por instrumentos: procedimientos y navegación avanzada.",
    icon: CloudFog,
    nivel: "Avanzado",
    actividades: [
      ...leccionesDeTemas("ifr"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: aproximación frustrada", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: interpretación de cartas IFR" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de IFR" },
    ],
  },
];
