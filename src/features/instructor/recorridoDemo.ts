// Un vuelo de demostración para ver la pantalla del mapa sin MSFS: el vuelo simulado de rampa a rampa
// con dos virajes a rumbos en la zona, uno con error y otro limpio. Puro.
import { AEROPUERTO_PRUEBA } from "./aeropuertoSim.ts";
import { crearChecklist } from "./checklistVoz.ts";
import { CHECKLIST_VOZ_C172 } from "../../data/checklistVozC172.ts";
import type { Muestra } from "./evaluador.ts";
import { MANIOBRAS, type ResultadoComun } from "./maniobras.ts";
import { alMuestrearRepaso, crearRepaso } from "./repaso.ts";
import { cerrarGrabacion, crearGrabador, grabarMuestra, grabarVoz, type Grabacion } from "./recorrido.ts";
import { simularRumbos } from "./simular.ts";
import { simularVuelo } from "./simularVuelo.ts";

const calificar = (ms: Muestra[]): ResultadoComun => {
  const d = MANIOBRAS["virajes-rumbos"];
  let ev = d.armar(ms[0], 2);
  for (const m of ms.slice(1)) ev = d.avanzar(ev, m);
  return d.resultado(ev)!;
};
const corrido = (ms: Muestra[], seg: number) => ms.map((m) => ({ ...m, t: m.t + seg }));

export function grabacionDemo(): Grabacion {
  const g = crearGrabador();
  let e = crearRepaso("practica", ["virajes-rumbos", "virajes-rumbos"], 2);
  let entrada: number | null = null;
  for (const m of simularVuelo()) {
    const r = alMuestrearRepaso(e, m, AEROPUERTO_PRUEBA, "es", () => 0);
    e = r.estado;
    grabarVoz(g, m.t, r.decir);
    grabarMuestra(g, m, e);
    if (entrada === null && e.etapa === "maniobra") entrada = m.t;
  }
  // Sin resultados dados al estado, la zona dura hasta el aterrizaje; los intentos caen al principio de ella.
  const t0 = entrada ?? 0;
  const resultados = [
    { maniobra: "virajes-rumbos" as const, resultado: calificar(corrido(simularRumbos({ pasarse: 25 }), t0 + 5)) },
    { maniobra: "virajes-rumbos" as const, resultado: calificar(corrido(simularRumbos(), t0 + 80)) },
  ];
  return cerrarGrabacion(g, { leccion: 4, e, cl: crearChecklist(CHECKLIST_VOZ_C172), resultados });
}
