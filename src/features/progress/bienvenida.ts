import { readStorage, writeStorage } from "../../lib/storage";

const CLAVE = "bienvenida-vista";

// Si el navegador no deja escribir (modo privado), localStorage nunca recuerda
// nada. Esta bandera evita al menos que el cadete rebote en bucle dentro de
// la misma visita; a lo sumo ve la bienvenida una vez por carga de página.
let vistaEnEstaVisita = false;

/** ¿Ya se le llevó a este navegador directo a su primera lección? */
export function bienvenidaVista(): boolean {
  return vistaEnEstaVisita || readStorage<boolean>(CLAVE, false);
}

export function marcarBienvenidaVista(): void {
  vistaEnEstaVisita = true;
  writeStorage(CLAVE, true);
}
