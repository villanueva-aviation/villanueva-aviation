// Sigue un vuelo completo de rampa a rampa con las muestras del lector v1.4. Puro, para poder probarlo.
import { esC172, lectorViejoVuelo, type Muestra } from "./evaluador.ts";
import { pistaBajo, type Aeropuerto } from "./aeropuertoSim.ts";
import { aNm } from "../home/navGeo.ts";

export type FaseVuelo = "rampa" | "rodaje" | "carrera-despegue" | "vuelo" | "carrera-aterrizaje" | "rodaje-regreso" | "terminado" | "invalido";
export type EventoVuelo = {
  t: number;
  tipo: "motor-encendido" | "motor-apagado" | "inicio-rodaje" | "despegue" | "aterrizaje" | "toque-y-despegue" | "sin-conexion";
  pista?: string | null;
  seg?: number;
};
export interface EvaluacionVuelo {
  fase: FaseVuelo;
  motivo?: string;
  previo: Muestra | null;
  aeropuerto: Aeropuerto | null;
  eventos: EventoVuelo[];
  aireDesde: number | null; // t del primer cuadro de la racha actual en el aire
  tierraDesde: number | null; // t del primer cuadro de la racha actual en tierra
  pistaCarrera: string | null; // pista de la última carrera (despegue o aterrizaje)
  maxDistNm: number;
}

export const RODAJE_KT = 3;
export const CARRERA_KT = 30;
export const QUIETO_KT = 1;
export const AIRE_SEG = 2;
export const HUECO_SEG = 2;

const invalido = (ev: EvaluacionVuelo, motivo: string): EvaluacionVuelo => ({ ...ev, fase: "invalido", motivo });

export function armarVuelo(m: Muestra, a: Aeropuerto | null): EvaluacionVuelo {
  const ev: EvaluacionVuelo = {
    fase: "rampa", previo: m, aeropuerto: a, eventos: [], aireDesde: null, tierraDesde: m.enTierra ? m.t : null, pistaCarrera: null, maxDistNm: 0,
  };
  if (lectorViejoVuelo(m)) return invalido(ev, "Tu lector es de una versión anterior: baja el nuevo de Descargas para las lecciones.");
  if (!esC172(m.titulo)) return invalido(ev, `En esta versión las lecciones son en el C172 y tu avión es «${m.titulo}».`);
  if (!m.enTierra || (m.gs ?? 0) >= QUIETO_KT) return invalido(ev, "Empieza en tierra, detenido en la plataforma.");
  if (m.motor) ev.eventos.push({ t: m.t, tipo: "motor-encendido" });
  return ev;
}

export function avanzarVuelo(ev: EvaluacionVuelo, m: Muestra, a: Aeropuerto | null): EvaluacionVuelo {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  const p = ev.previo;
  if (p && m.t <= p.t) return ev;
  // En pausa no cuenta nada, pero se guarda la muestra para que la pausa no parezca un hueco.
  if (m.pausa) return { ...ev, previo: m };
  if (m.slew) return invalido(ev, "Usaste el modo slew: la lección no se califica.");
  if (m.tasa !== 1) return invalido(ev, "La velocidad de simulación no estaba en 1×: la lección no se califica.");

  const eventos = [...ev.eventos];
  if (p && m.t - p.t > HUECO_SEG) eventos.push({ t: m.t, tipo: "sin-conexion", seg: m.t - p.t });
  const aeropuerto = ev.aeropuerto ?? a;
  if (p && !!m.motor !== !!p.motor) eventos.push({ t: m.t, tipo: m.motor ? "motor-encendido" : "motor-apagado" });

  const aireDesde = m.enTierra ? null : ev.aireDesde ?? m.t;
  const tierraDesde = m.enTierra ? ev.tierraDesde ?? m.t : null;
  const gs = m.gs ?? 0;
  const pista = aeropuerto ? pistaBajo(m, aeropuerto) : null;
  let fase: FaseVuelo = ev.fase;
  let { pistaCarrera, maxDistNm } = ev;
  if (aeropuerto && m.lat !== undefined && m.lon !== undefined) {
    const d = aNm(m.lat, m.lon, aeropuerto.lat, aeropuerto.lon);
    maxDistNm = Math.max(maxDistNm, Math.hypot(d.x, d.y));
  }

  switch (fase) {
    case "rampa":
      if (gs >= RODAJE_KT) { fase = "rodaje"; eventos.push({ t: m.t, tipo: "inicio-rodaje" }); }
      break;
    case "rodaje":
      if (gs >= CARRERA_KT) { fase = "carrera-despegue"; pistaCarrera = pista; }
      break;
    case "carrera-despegue":
      if (aireDesde !== null && m.t - aireDesde >= AIRE_SEG) { fase = "vuelo"; eventos.push({ t: aireDesde, tipo: "despegue", pista: pistaCarrera }); }
      else if (m.enTierra && gs < CARRERA_KT) fase = "rodaje";
      break;
    case "vuelo":
      if (m.enTierra && ev.tierraDesde === null) pistaCarrera = pista; // primer cuadro en tierra
      if (tierraDesde !== null && m.t - tierraDesde >= AIRE_SEG) { fase = "carrera-aterrizaje"; eventos.push({ t: tierraDesde, tipo: "aterrizaje", pista: pistaCarrera }); }
      break;
    case "carrera-aterrizaje":
      if (aireDesde !== null && m.t - aireDesde >= AIRE_SEG) { fase = "vuelo"; eventos.push({ t: aireDesde, tipo: "toque-y-despegue", pista: pistaCarrera }); }
      else if (m.enTierra && gs < CARRERA_KT) fase = "rodaje-regreso";
      break;
    case "rodaje-regreso":
      if (!m.motor && gs < QUIETO_KT && pista === null) fase = "terminado";
      break;
  }
  return { ...ev, fase, previo: m, aeropuerto, eventos, aireDesde, tierraDesde, pistaCarrera, maxDistNm };
}
