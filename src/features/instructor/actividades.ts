import type { Idioma } from "./idiomaInstructor.ts";

// El menú después del idioma. Lo que todavía no existe se ve como "Próximamente".

export type ActividadId = "clase" | "recto-nivelado" | "vuelo-lento" | "perdidas" | "viraje-escarpado";

export type Actividad = {
  id: ActividadId;
  nombre: Record<Idioma, string>;
  detalle: Record<Idioma, string>;
  minutos: number;
  acceso: "gratis" | "exclusivo";
  disponible: boolean;
  /** Cómo se llama el intento que se califica: «checkride» o, fuera del ACS, «intento calificado». */
  calificado: Record<Idioma, string>;
};

const CHECKRIDE = { es: "checkride", en: "checkride" };

export const ACTIVIDADES: Actividad[] = [
  {
    id: "clase",
    nombre: { es: "Clase completa", en: "Full lesson" },
    detalle: { es: "Recto y nivelado, vuelo lento y pérdidas, en ese orden.", en: "Straight and level, slow flight and stalls, in that order." },
    minutos: 60,
    acceso: "exclusivo",
    disponible: false,
    calificado: CHECKRIDE,
  },
  {
    id: "recto-nivelado",
    nombre: { es: "Recto y nivelado", en: "Straight and level" },
    detalle: { es: "Mantener altitud, rumbo y velocidad.", en: "Hold altitude, heading and airspeed." },
    minutos: 60,
    acceso: "gratis",
    disponible: true,
    calificado: { es: "intento calificado", en: "graded attempt" },
  },
  {
    id: "vuelo-lento",
    nombre: { es: "Vuelo lento", en: "Slow flight" },
    detalle: { es: "Volar justo arriba de la pérdida con control total.", en: "Fly just above the stall with full control." },
    minutos: 60,
    acceso: "exclusivo",
    disponible: false,
    calificado: CHECKRIDE,
  },
  {
    id: "perdidas",
    nombre: { es: "Pérdidas", en: "Stalls" },
    detalle: { es: "Con y sin potencia: reconocer y recuperar.", en: "Power-on and power-off: recognize and recover." },
    minutos: 60,
    acceso: "exclusivo",
    disponible: false,
    calificado: CHECKRIDE,
  },
  {
    id: "viraje-escarpado",
    nombre: { es: "Viraje escarpado", en: "Steep turn" },
    detalle: { es: "360° a 45° de inclinación a cada lado, como en un checkride.", en: "360° at 45° of bank each way, like on a checkride." },
    minutos: 60,
    acceso: "gratis",
    disponible: true,
    calificado: CHECKRIDE,
  },
];

export function estadoActividad(a: Actividad, tieneExclusivo: boolean): "abierta" | "candado" | "proximamente" {
  if (!a.disponible) return "proximamente";
  return a.acceso === "exclusivo" && !tieneExclusivo ? "candado" : "abierta";
}
