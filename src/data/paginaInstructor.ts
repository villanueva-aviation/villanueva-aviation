import { LECCIONES, LECCIONES_IFR, REPASO } from "../features/instructor/lecciones.ts";
import { ROUTES } from "../lib/routes.ts";

// Textos de la página pública /instructor (spec 2026-11-23). Todo va como beta y nada de lo
// que es «solo fundador» se presenta como abierto.

/** El botón principal: sin sesión pasa por el registro y vuelve a la maniobra gratis. */
export function botonInstructor(conSesion: boolean): { texto: string; to: string } {
  return conSesion
    ? { texto: "Prueba el viraje escarpado", to: ROUTES.instructorVirajeEscarpado }
    : { texto: "Crea tu cuenta y prueba el viraje escarpado gratis", to: `${ROUTES.ingresar}?from=${encodeURIComponent(ROUTES.instructorVirajeEscarpado)}` };
}

/** Lo que viene, leído de las lecciones reales (la 2 = 3 y la 11 = 12 salen una vez; sin el repaso ni el checkride IFR). */
export const PROXIMAMENTE = {
  vfr: [...new Set(LECCIONES.filter((l) => l.numero !== REPASO).map((l) => l.nombre.es))],
  ifr: LECCIONES_IFR.filter((l) => l.disponible).map((l) => l.nombre.es),
};

export const PAGINA_INSTRUCTOR = {
  eyebrow: "Instructor virtual · beta",
  titulo: "Un instructor que te califica mientras vuelas",
  subtitulo:
    "Lee tu avión en MSFS 2020, te guía con voz en español o inglés y al aterrizar te dice qué hiciste bien y qué corregir, con las tolerancias de un checkride.",
  pasos: [
    { titulo: "Abre el lector", texto: "Un programa chico y gratis que lee tu avión en MSFS 2020. Solo funciona dentro de tu PC." },
    { titulo: "Vuela el C172", texto: "El instructor te habla mientras vuelas: te dice cuándo empezar, qué cuidar y cuándo te sales de las tolerancias." },
    { titulo: "Recibe tu debriefing", texto: "Al terminar ves tu calificación, cada error con su explicación y en qué parte del vuelo pasó." },
  ],
  debriefing: {
    titulo: "Tu vuelo, revisado punto por punto",
    texto: "Así se ve el debriefing: tu ruta sobre el mapa satelital, cada error numerado justo donde ocurrió y el vuelo separado por fases.",
    img: "/images/instructor-debriefing.jpg",
    alt: "Debriefing de un vuelo de demostración: la ruta sobre un mapa satelital con los errores numerados",
  },
  funciones: [
    {
      titulo: "Un programa de lecciones",
      texto: "Las maniobras de la escuela en orden, de familiarización a toques y despegues, con práctica y checkride en cada una.",
      img: "/images/instructor-programa.jpg",
      alt: "Menú de lecciones del instructor virtual",
    },
    {
      titulo: "Checklist por voz",
      texto: "Lee el checklist en voz alta y el instructor revisa en el simulador que de verdad lo hiciste. C172, C152 y Arrow.",
      img: "/images/instructor-checklist.jpg",
      alt: "Pantalla del checklist por voz del instructor virtual",
    },
    {
      titulo: "Hojas para imprimir",
      texto: "Los briefings de cada maniobra y los checklists por voz en PDF, gratis, para tenerlos junto al simulador.",
      img: "/images/instructor-hojas.jpg",
      alt: "Hojas imprimibles de briefings y checklists",
    },
  ],
  gratis: ["El viraje escarpado en el C172, en práctica y en checkride, con tres niveles de dificultad", "Las hojas imprimibles de briefings y checklists"],
  beta: "El instructor virtual está en beta: lo mejoramos cada semana. Si algo falla o tienes una idea, cuéntanos en el Discord.",
  requisitos: "Necesitas Windows, MSFS 2020 y el lector gratis de Descargas.",
};
