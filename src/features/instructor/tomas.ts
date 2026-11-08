// Despegue y aterrizaje del vuelo completo: rotación, ascenso a Vy y velocidad en final. Puro.
import type { Muestra } from "./evaluador.ts";
import type { FaseVuelo } from "./fasesVuelo.ts";

/** POH del C172S, en KIAS. Erik las revisa antes de publicar. */
export const VEL_C172 = { vr: 55, vy: 74, aprox: 65 };
/** ACS: −5/+10 kt sobre la velocidad objetivo. */
const MENOS = 5;
const MAS = 10;

export interface Tomas {
  rotacionKt: number | null;
  vy: { suma: number; n: number };
  /** Ya pasó 1000 ft AGL una vez: el ascenso inicial terminó. */
  pasoMil: boolean;
  final: { min: number; max: number; n: number };
  tocoEnPista: boolean | null;
}

export const crearTomas = (): Tomas => ({ rotacionKt: null, vy: { suma: 0, n: 0 }, pasoMil: false, final: { min: Infinity, max: -Infinity, n: 0 }, tocoEnPista: null });

export function medirTomas(t: Tomas, previo: Muestra | null, m: Muestra, fase: FaseVuelo, regreso: boolean): Tomas {
  let { rotacionKt, vy, pasoMil, final } = t;
  if (rotacionKt === null && fase === "carrera-despegue" && previo?.enTierra && !m.enTierra) rotacionKt = m.velocidad;
  if (fase === "vuelo" && !pasoMil) {
    if (m.agl > 1000) pasoMil = true;
    else if ((m.vs ?? 0) > 0 && m.agl >= 200) vy = { suma: vy.suma + m.velocidad, n: vy.n + 1 };
  }
  if (regreso && fase === "vuelo" && m.agl >= 50 && m.agl <= 500 && (m.vs ?? 0) < 0) {
    final = { min: Math.min(final.min, m.velocidad), max: Math.max(final.max, m.velocidad), n: final.n + 1 };
  }
  return { ...t, rotacionKt, vy, pasoMil, final };
}

const dentro = (kt: number, objetivo: number) => kt >= objetivo - MENOS && kt <= objetivo + MAS;

/** null = no se midió. */
export function calificarTomas(t: Tomas, v = VEL_C172) {
  return {
    despegue: {
      rotacion: t.rotacionKt === null ? null : dentro(t.rotacionKt, v.vr),
      vy: t.vy.n === 0 ? null : dentro(t.vy.suma / t.vy.n, v.vy),
    },
    aterrizaje: {
      final: t.final.n === 0 ? null : t.final.min >= v.aprox - MENOS && t.final.max <= v.aprox + MAS,
      enPista: t.tocoEnPista,
    },
  };
}
