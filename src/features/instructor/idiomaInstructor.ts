export type Idioma = "es" | "en";

// ponytail: tabla español→inglés de los textos que arma el evaluador; si gana más, pasar el evaluador a códigos.
const MOTIVOS_EN: Record<string, string> = {
  "Despega primero: la maniobra se arma en el aire.": "Take off first: the maneuver starts in the air.",
  "Viraste al lado contrario del que pidió el instructor.": "You turned the opposite way from what the instructor asked.",
  "Te fuiste en sentido contrario a la altitud que pidió el instructor.": "You went the opposite way from the altitude the instructor asked for.",
  "Tu lector es de una versión anterior: baja el nuevo de Descargas para el vuelo lento.":
    "Your reader is an older version: download the new one from Downloads for slow flight.",
  "Se perdió la conexión con el simulador por más de 2 segundos.": "The connection to the simulator dropped for more than 2 seconds.",
  "Pausaste el simulador: el intento no se califica.": "You paused the simulator: this attempt won't be graded.",
  "Usaste el modo slew: el intento no se califica.": "You used slew mode: this attempt won't be graded.",
  "La velocidad de simulación no estaba en 1×: el intento no se califica.": "Simulation rate wasn't 1×: this attempt won't be graded.",
  // Las del vuelo completo (fasesVuelo.ts).
  "Tu lector es de una versión anterior: baja el nuevo de Descargas para las lecciones.":
    "Your reader is an older version: download the new one from Downloads for the lessons.",
  "Empieza en tierra, detenido en la plataforma.": "Start on the ground, stopped on the ramp.",
  "Usaste el modo slew: la lección no se califica.": "You used slew mode: this lesson won't be graded.",
  "La velocidad de simulación no estaba en 1×: la lección no se califica.": "Simulation rate wasn't 1×: this lesson won't be graded.",
};

const AVISOS_EN: Record<string, string> = {
  "Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto.": "You went below 1500 ft above the ground: fly the maneuver higher.",
  "No saliste del vuelo lento con potencia.": "You didn't recover from slow flight with power.",
  "No completaste los dos virajes.": "You didn't complete both turns.",
};

export function traducirMotivo(motivo: string, idioma: Idioma = "es"): string {
  if (idioma === "es") return motivo;
  const avion = /^Esta maniobra es para el C172 y tu avión es «(.*)»\.$/.exec(motivo);
  if (avion) return `This maneuver is for the C172 and your aircraft is «${avion[1]}».`;
  const leccion = /^En esta versión las lecciones son en el C172 y tu avión es «(.*)»\.$/.exec(motivo);
  if (leccion) return `For now the lessons are in the C172 and your aircraft is «${leccion[1]}».`;
  return MOTIVOS_EN[motivo] ?? motivo;
}

export const AVISO_REPORTE = "Práctica en simulador. No es un documento oficial ni sustituye un examen ante una autoridad aeronáutica.";

/** Etiquetas del reporte: nuestro formato, sin nombres de formularios oficiales. "intento": maniobras fuera del ACS, sin palabra «checkride». */
export function textosReporte(idioma: Idioma = "es", calificado: "checkride" | "intento" = "checkride") {
  const t = textosCheckride(idioma);
  if (calificado === "checkride") return t;
  return idioma === "en"
    ? { ...t, titulo: (aprobado: boolean) => `GRADED PRACTICE ATTEMPT — ${aprobado ? "PASSED" : "NOT PASSED"}`, subtitulo: "Simulated flight practice", reexaminar: "Items to repeat:" }
    : { ...t, titulo: (aprobado: boolean) => `INTENTO CALIFICADO ${aprobado ? "APROBADO" : "NO APROBADO"}`, subtitulo: "Práctica de vuelo simulada", reexaminar: "Elementos a repetir:" };
}

function textosCheckride(idioma: Idioma) {
  return idioma === "en"
    ? {
        titulo: (aprobado: boolean) => (aprobado ? "PRACTICE CHECKRIDE — PASSED" : "PRACTICE CHECKRIDE — NOT PASSED"),
        subtitulo: "Simulated practical test",
        instructor: "Virtual instructor",
        aspirante: "Applicant",
        fecha: "Date",
        aeronave: "Aircraft",
        intento: "Attempt",
        tarea: "Area V · Task A: Steep turns",
        calificacion: "Score",
        folio: "Verification code",
        sinFolio: "assigned when saved",
        reexaminar: "Areas to re-test:",
        reviso: "Reviewed by: Erik Villanueva",
        pdf: "Download PDF",
        locale: "en-US",
        aviso: "Simulator practice. Not an official document and does not replace an exam before an aviation authority.",
      }
    : {
        titulo: (aprobado: boolean) => (aprobado ? "EXAMEN PRÁCTICO APROBADO" : "AVISO DE NO APROBACIÓN"),
        subtitulo: "Examen práctico simulado",
        instructor: "Instructor virtual",
        aspirante: "Aspirante",
        fecha: "Fecha",
        aeronave: "Aeronave",
        intento: "Intento",
        tarea: "Área V · Tarea A: Virajes escarpados",
        calificacion: "Calificación",
        folio: "Folio de verificación",
        sinFolio: "se asigna al guardar",
        reexaminar: "Áreas a re-examinar:",
        reviso: "Revisó: Erik Villanueva",
        pdf: "Descargar PDF",
        locale: "es-MX",
        aviso: AVISO_REPORTE,
      };
}

export function traducirAviso(aviso: string, idioma: Idioma = "es"): string {
  return idioma === "es" ? aviso : (AVISOS_EN[aviso] ?? aviso);
}
