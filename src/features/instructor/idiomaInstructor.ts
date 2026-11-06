export type Idioma = "es" | "en";

// ponytail: tabla español→inglés de los textos que arma el evaluador; si gana más, pasar el evaluador a códigos.
const MOTIVOS_EN: Record<string, string> = {
  "Despega primero: la maniobra se arma en el aire.": "Take off first: the maneuver starts in the air.",
  "Se perdió la conexión con el simulador por más de 2 segundos.": "The connection to the simulator dropped for more than 2 seconds.",
  "Pausaste el simulador: el intento no se califica.": "You paused the simulator: this attempt won't be graded.",
  "Usaste el modo slew: el intento no se califica.": "You used slew mode: this attempt won't be graded.",
  "La velocidad de simulación no estaba en 1×: el intento no se califica.": "Simulation rate wasn't 1×: this attempt won't be graded.",
};

const AVISOS_EN: Record<string, string> = {
  "Bajaste de 1500 ft sobre el terreno: haz la maniobra más alto.": "You went below 1500 ft above the ground: fly the maneuver higher.",
};

export function traducirMotivo(motivo: string, idioma: Idioma = "es"): string {
  if (idioma === "es") return motivo;
  const avion = /^Esta maniobra es para el C172 y tu avión es «(.*)»\.$/.exec(motivo);
  if (avion) return `This maneuver is for the C172 and your aircraft is «${avion[1]}».`;
  return MOTIVOS_EN[motivo] ?? motivo;
}

export function traducirAviso(aviso: string, idioma: Idioma = "es"): string {
  return idioma === "es" ? aviso : (AVISOS_EN[aviso] ?? aviso);
}
