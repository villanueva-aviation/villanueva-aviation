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

export type ActividadTipo = "leccion" | "interactividad" | "practica" | "evaluacion" | "proyecto";

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
  /** Consigna del proyecto final (nivel Crear), cuando el módulo tiene una actividad tipo "proyecto". */
  proyectoPrompt?: string;
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
    proyectoPrompt:
      "Elige una fase de vuelo (despegue, crucero o aterrizaje) y describe con tus propias palabras las 4 fuerzas actuando sobre el avión en ese momento: cuál domina, cuál está en desventaja, y qué pasaría si una de ellas cambiara bruscamente. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("fundamentos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Diagrama interactivo del avión", widget: "diagrama" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Arrastra las etiquetas", widget: "dragdrop" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: identifica los componentes" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Fundamentos" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: las 4 fuerzas en tu propia fase de vuelo" },
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
    proyectoPrompt:
      "Consigue el METAR y TAF reales de un aeropuerto de hoy y escribe el briefing de 'go/no-go' que le darías a tu instructor: decodifica el reporte, identifica cualquier riesgo (viento, nubes, visibilidad, fenómenos) y justifica tu decisión de volar o no. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("meteorologia"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: tormenta en ruta", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: interpretar reportes" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Meteorología" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propio briefing go/no-go" },
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
    proyectoPrompt:
      "Planifica de cero una ruta VFR real entre dos aeropuertos que elijas (sin usar ninguna plantilla): traza los checkpoints, calcula el rumbo magnético y la distancia de cada tramo, estima el tiempo y el combustible necesarios considerando un viento hipotético, y define tu aeropuerto alterno. Envía tu plan completo para que un instructor lo revise.",
    actividades: [
      ...leccionesDeTemas("navegacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de viento en contra", widget: "slider" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: planificación de ruta" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Navegación" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: planifica tu propia ruta VFR" },
    ],
  },
  {
    slug: "cartografia",
    titulo: "Cartografía Aeronáutica",
    resumen: "Símbolos, espacios aéreos, elevaciones y lectura completa de cartas VFR.",
    icon: Map,
    nivel: "Intermedio",
    proyectoPrompt:
      "Elige dos aeropuertos reales y traza en tus palabras una ruta completa entre ellos: identifica los espacios aéreos que cruzas, dos puntos de notificación VFR que usarías, y cualquier obstáculo o MEF relevante en el camino. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("cartografia"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona símbolos y espacios aéreos", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona elevaciones y frecuencias", widget: "terminos", termSetId: "cartografia-2" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: lectura de cartas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Cartografía" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: traza tu propia ruta en carta" },
    ],
  },
  {
    slug: "comunicaciones",
    titulo: "Comunicaciones",
    resumen: "Estándares de comunicación radiofónica entre piloto y controlador.",
    icon: Radio,
    nivel: "Básico",
    imagenLeccion: "/images/infografia-fraseologia.jpg",
    proyectoPrompt:
      "Usando el modo de práctica de voz, graba una secuencia completa de llamadas de un vuelo imaginario que inventes: desde el primer contacto con Torre, pasando por rodaje y despegue, hasta tu primer reporte en crucero. Envía un resumen escrito de tu secuencia para revisión.",
    actividades: [
      ...leccionesDeTemas("comunicaciones"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Práctica de fraseología con audio", widget: "audio" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-3", tipo: "interactividad", titulo: "Circuito de tráfico: recorrido y práctica", widget: "circuito" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: simulacro de llamadas" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Comunicaciones" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propia secuencia de llamadas" },
    ],
  },
  {
    slug: "instrumentos",
    titulo: "Instrumentos de Vuelo",
    resumen: "El Six Pack, radionavegación en cabina y equipo de vigilancia.",
    icon: Gauge,
    nivel: "Intermedio",
    proyectoPrompt:
      "Inventa un escenario de falla de instrumentos (por ejemplo, falla eléctrica parcial o de vacío) durante un tramo específico de un vuelo, y explica paso a paso qué instrumentos usarías y en qué orden para mantener control seguro del avión. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("instrumentos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: falla de vacío", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: lectura de instrumentos" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Instrumentos" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propio escenario de falla" },
    ],
  },
  {
    slug: "rendimiento",
    titulo: "Peso y Rendimiento",
    resumen: "Peso, balance, distancias de despegue/aterrizaje y V-speeds.",
    icon: Scale,
    nivel: "Intermedio",
    proyectoPrompt:
      "Calcula el peso y balance, y estima la distancia de despegue/aterrizaje, para un vuelo hipotético que inventes: define el avión, el peso de pasajeros y equipaje, el combustible, y las condiciones de elevación/temperatura del aeródromo. Envía tus cálculos completos para revisión.",
    actividades: [
      ...leccionesDeTemas("rendimiento"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de altitud de densidad", widget: "slider" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: cálculos de rendimiento" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Rendimiento" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propio cálculo de peso y balance" },
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
    proyectoPrompt:
      "Diseña el briefing de emergencia pre-despegue completo (qué harías si falla el motor en distintas fases) para una aeronave y aeródromo reales que elijas, considerando la longitud de pista y el terreno circundante. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("operacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: fuego en el arranque", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: secuencia de procedimientos" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Operación" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propio briefing de emergencia" },
    ],
  },
  {
    slug: "espacios-aereos",
    titulo: "Espacios Aéreos",
    resumen: "Clasificación del espacio aéreo controlado y no controlado, y áreas especiales.",
    icon: Layers,
    nivel: "Intermedio",
    proyectoPrompt:
      "Elige una ruta VFR real que cruce al menos dos clases distintas de espacio aéreo, y describe qué equipo, comunicaciones y autorizaciones necesitarías en cada tramo, tramo por tramo. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("espacios-aereos"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: cruce de espacio Clase C", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: clasificación de espacios" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Espacios Aéreos" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propia ruta multi-espacio aéreo" },
    ],
  },
  {
    slug: "reglamentacion",
    titulo: "Reglamentación",
    resumen: "Reglas VFR/IFR, licencias, requisitos y mínimos regulatorios.",
    icon: Gavel,
    nivel: "Básico",
    proyectoPrompt:
      "Investiga los requisitos reales de la autoridad aeronáutica de tu país (AFAC/RAC 61 u otra) para obtener el PPL, y escribe tu propio plan de progresión personal: horas, exámenes y calificaciones que necesitas, en el orden correcto. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("reglamentacion"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Relaciona requisitos y mínimos", widget: "terminos", termSetId: "reglamentacion-2" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: marco regulatorio" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de Reglamentación" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu plan de progresión de licencias" },
    ],
  },
  {
    slug: "ifr",
    titulo: "IFR",
    resumen: "Reglas de vuelo por instrumentos: procedimientos y navegación avanzada.",
    icon: CloudFog,
    nivel: "Avanzado",
    proyectoPrompt:
      "Planifica un vuelo IFR hipotético entre dos aeropuertos reales: elige una SID, una aerovía o ruta RNAV, una STAR y un tipo de aproximación para el destino, justificando cada elección. Envíalo para revisión.",
    actividades: [
      ...leccionesDeTemas("ifr"),
      { id: "interactividad-1", tipo: "interactividad", titulo: "Relaciona los términos clave", widget: "terminos" },
      { id: "interactividad-2", tipo: "interactividad", titulo: "Simulador de decisión: aproximación frustrada", widget: "escenario" },
      { id: "practica-1", tipo: "practica", titulo: "Práctica: interpretación de cartas IFR" },
      { id: "evaluacion-1", tipo: "evaluacion", titulo: "Evaluación de IFR" },
      { id: "proyecto-1", tipo: "proyecto", titulo: "Proyecto final: tu propio vuelo IFR planificado" },
    ],
  },
];
