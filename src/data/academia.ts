import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CloudSun,
  Wind,
  Compass,
  Radio,
  Eye,
  CloudFog,
} from "lucide-react";

export type ActividadTipo = "leccion" | "interactividad" | "practica" | "evaluacion";

export interface ModuloActividad {
  id: string;
  tipo: ActividadTipo;
  titulo: string;
}

export interface AcademiaModulo {
  slug: string;
  titulo: string;
  resumen: string;
  icon: LucideIcon;
  nivel: "Básico" | "Intermedio" | "Avanzado";
  /** Solo el módulo de referencia trae la experiencia interactiva completa construida. */
  interactivo: boolean;
  actividades: ModuloActividad[];
  /** Infografía de la lección, cuando el módulo aún no tiene la experiencia interactiva completa. */
  imagenLeccion?: string;
}

export const ACADEMIA_MODULOS: AcademiaModulo[] = [
  {
    slug: "fundamentos",
    titulo: "Fundamentos de Aviación",
    resumen:
      "Bases teóricas y conceptos esenciales para comenzar en el mundo de la aviación.",
    icon: BookOpen,
    nivel: "Básico",
    interactivo: true,
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Partes de la aeronave" },
      { id: "leccion-2", tipo: "leccion", titulo: "Principios de vuelo" },
      { id: "interactividad-1", tipo: "interactividad", titulo: "Diagrama interactivo del avión" },
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
    interactivo: false,
    imagenLeccion: "/images/infografia-metar-rmk.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Masas de aire y frentes" },
      { id: "leccion-2", tipo: "leccion", titulo: "Lectura de METAR y TAF" },
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
    interactivo: false,
    imagenLeccion: "/images/infografia-4fuerzas.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Las cuatro fuerzas del vuelo" },
      { id: "leccion-2", tipo: "leccion", titulo: "Superficies de control" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: efectos de control" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Aerodinámica" },
    ],
  },
  {
    slug: "navegacion",
    titulo: "Navegación",
    resumen: "Planificación de rutas, cartas y técnicas de navegación aérea.",
    icon: Compass,
    nivel: "Intermedio",
    interactivo: false,
    imagenLeccion: "/images/infografia-vor.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Cartas de navegación VFR" },
      { id: "leccion-2", tipo: "leccion", titulo: "Navegación por instrumentos VOR/GPS" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: planificación de ruta" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Navegación" },
    ],
  },
  {
    slug: "comunicaciones",
    titulo: "Comunicaciones",
    resumen: "Estándares de comunicación radiofónica entre piloto y controlador.",
    icon: Radio,
    nivel: "Básico",
    interactivo: false,
    imagenLeccion: "/images/infografia-fraseologia.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Fraseología estándar" },
      { id: "leccion-2", tipo: "leccion", titulo: "Comunicación en emergencias" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: simulacro de llamadas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Comunicaciones" },
    ],
  },
  {
    slug: "vfr",
    titulo: "VFR",
    resumen: "Reglas de vuelo visual: mínimos, procedimientos y planificación.",
    icon: Eye,
    nivel: "Intermedio",
    interactivo: false,
    imagenLeccion: "/images/infografia-vfr.jpg",
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Mínimos meteorológicos VFR" },
      { id: "leccion-2", tipo: "leccion", titulo: "Procedimientos de patrón de tráfico" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: planificación VFR" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de VFR" },
    ],
  },
  {
    slug: "ifr",
    titulo: "IFR",
    resumen: "Reglas de vuelo por instrumentos: procedimientos y navegación avanzada.",
    icon: CloudFog,
    nivel: "Avanzado",
    interactivo: false,
    actividades: [
      { id: "leccion-1", tipo: "leccion", titulo: "Cartas de aproximación por instrumentos" },
      { id: "leccion-2", tipo: "leccion", titulo: "Procedimientos IFR en ruta" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: interpretación de cartas IFR" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de IFR" },
    ],
  },
];
