import { analizar, difRumbo, invalidez, lectorViejo, type Lado, type Muestra, type Tramo } from "./evaluador.ts";
import { ESTABLE } from "./rectoNivelado.ts";
import { ALTURA_SEGURA_AGL, BOLA_TOLERANCIA, INCLINACION_NIVELADO } from "./virajeEscarpado.ts";
import { ENTRADA_SEG, GIRO_GRADOS, INCLINACION_VIRAJE, OBJETIVO_KT, RECTO_SEG, SALIDA, TOLERANCIAS_LENTO } from "./vueloLento.ts";

export type CampoLento = "altitud" | "rumbo" | "velocidad" | "inclinacion" | "bola";
export type CodigoLento = "PA.VII.A.S2" | "PA.VII.A.S3" | "PA.VII.A.S4" | "PA.VII.A.S5";
export type FaseLento = "armado" | "recto" | "viraje1" | "viraje2" | "salida" | "terminado" | "invalido";

export interface ResultadoLento {
  maniobra: "vuelo-lento";
  aprobado: boolean;
  calificacion: number;
  elementos: Record<CodigoLento, "S" | "NS">;
  objetivo: { t: number; altitud: number; rumbo: number; velocidad: number };
  /** Peor desviación con signo; la velocidad, contra OBJETIVO_KT (−3 = 3 kt abajo). */
  peor: Record<CampoLento, number>;
  fuera: Record<CampoLento, Tramo[]>;
  ns: Record<CampoLento, boolean>;
  perdidas: number[]; // t en que empezó a sonar cada aviso de pérdida
  bajo: boolean; // pasó por debajo de ALTURA_SEGURA_AGL
  salio: boolean; // salió con potencia antes de SALIDA.maxSeg
  primerLado: Lado;
  flaps: number; // palanca al tomar el objetivo
  avisos: string[];
  muestras: Muestra[]; // desde el objetivo hasta el final
}

/** Fase y giro de cada muestra calificada, en paralelo a `tramo`. */
export type Marca = { fase: FaseLento; giro: number };

export interface EvaluacionLento {
  fase: FaseLento;
  motivo?: string;
  resultado?: ResultadoLento;
  previo: Muestra | null;
  ventana: Muestra[]; // últimos ENTRADA_SEG mientras espera
  objetivo: Muestra | null;
  inicioFase: Muestra | null;
  giro: number; // grados girados con signo desde el inicio de la fase
  primerLado: Lado | null;
  tramo: Muestra[];
  marcas: Marca[];
}

export const CAMPOS_LENTO: CampoLento[] = ["altitud", "rumbo", "velocidad", "inclinacion", "bola"];
/** La velocidad se califica corrida al centro de la banda +10/−0: ±5. */
export const TOLERANCIA_LENTO: Record<CampoLento, number> = {
  altitud: TOLERANCIAS_LENTO.altitudFt,
  rumbo: TOLERANCIAS_LENTO.rumboGrados,
  velocidad: TOLERANCIAS_LENTO.velocidadMasKt / 2,
  inclinacion: TOLERANCIAS_LENTO.inclinacionGrados,
  bola: BOLA_TOLERANCIA,
};
const MITAD_BANDA = TOLERANCIAS_LENTO.velocidadMasKt / 2;
const MOTIVO_VIEJO = "Tu lector es de una versión anterior: baja el nuevo de Descargas para el vuelo lento.";
export const AVISO_SIN_SALIDA = "No saliste del vuelo lento con potencia.";

export function desvioLento(m: Muestra, o: Pick<Muestra, "altitud" | "rumbo">, c: CampoLento): number {
  if (c === "rumbo") return difRumbo(m.rumbo, o.rumbo);
  if (c === "velocidad") return m.velocidad - OBJETIVO_KT - MITAD_BANDA;
  if (c === "inclinacion") return Math.abs(m.inclinacion) - INCLINACION_VIRAJE;
  if (c === "bola") return m.bola;
  return m.altitud - o.altitud;
}

const enBanda = (v: number) => v >= OBJETIVO_KT && v <= OBJETIVO_KT + TOLERANCIAS_LENTO.velocidadMasKt;
const rango = (v: number[]) => Math.max(...v) - Math.min(...v);

/** En la banda, estable (no solo pasando por ella), alas niveladas, alto y sin aviso de pérdida. */
function entrada(v: Muestra[]): boolean {
  if (v.length < 2 || v[v.length - 1].t - v[0].t < 0.9 * ENTRADA_SEG) return false;
  return (
    v.every((m) => enBanda(m.velocidad) && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && m.agl >= ALTURA_SEGURA_AGL && !m.perdida) &&
    rango(v.map((m) => m.velocidad)) <= ESTABLE.velocidadKt
  );
}

export function armarLento(m: Muestra): EvaluacionLento {
  const vacia = { previo: m, ventana: [m], objetivo: null, inicioFase: null, giro: 0, primerLado: null, tramo: [], marcas: [] };
  if (lectorViejo(m)) return { fase: "invalido", motivo: MOTIVO_VIEJO, ...vacia };
  if (m.enTierra) return { fase: "invalido", motivo: "Despega primero: la maniobra se arma en el aire.", ...vacia };
  const motivo = invalidez(m, null);
  if (motivo) return { fase: "invalido", motivo, ...vacia };
  return { fase: "armado", ...vacia };
}

export function armarSoloLento(ev: EvaluacionLento | null, m: Muestra): boolean {
  if (ev && ev.fase !== "invalido") return false;
  return !lectorViejo(m) && !m.enTierra && Math.abs(m.inclinacion) < INCLINACION_NIVELADO && invalidez(m, null) === null;
}

/** Grados girados en la fase, contando la muestra m. */
export function giroDe(ev: EvaluacionLento, m: Muestra): number {
  return ev.previo ? ev.giro + difRumbo(m.rumbo, ev.previo.rumbo) : ev.giro;
}

const ladoDe = (giro: number): Lado => (giro < 0 ? "izquierda" : "derecha");
/** El viraje cierra con el giro hecho y las alas casi niveladas (más estricto que INCLINACION_NIVELADO para no cortar el final). */
const cerro = (giro: number, m: Muestra) => Math.abs(giro) >= GIRO_GRADOS - 10 && Math.abs(m.inclinacion) < ESTABLE.inclinacion;

function resultado(ev: EvaluacionLento, salio: boolean): ResultadoLento {
  const o = ev.objetivo!;
  const { tramo, marcas } = ev;
  const cuenta: Record<CampoLento, (k: Marca) => boolean> = {
    altitud: () => true,
    rumbo: (k) => k.fase === "recto",
    velocidad: (k) => k.fase === "recto" || k.fase === "viraje1" || k.fase === "viraje2",
    inclinacion: (k) => (k.fase === "viraje1" || k.fase === "viraje2") && Math.abs(k.giro) > 15 && Math.abs(k.giro) < GIRO_GRADOS - 15,
    bola: () => true,
  };
  const peor = {} as Record<CampoLento, number>;
  const fuera = {} as Record<CampoLento, Tramo[]>;
  const ns = {} as Record<CampoLento, boolean>;
  let puntos = 100;
  for (const c of CAMPOS_LENTO) {
    const pts = tramo.filter((_, i) => cuenta[c](marcas[i])).map((m) => ({ t: m.t, v: desvioLento(m, o, c) }));
    const a = analizar(pts, TOLERANCIA_LENTO[c]);
    peor[c] = c === "velocidad" ? a.peor + MITAD_BANDA : a.peor;
    fuera[c] = a.tramos;
    ns[c] = a.ns;
    const segundos = a.tramos.reduce((s, tr) => s + tr.fin - tr.inicio, 0);
    puntos -= Math.min(25, 2 * segundos + 10 * Math.max(0, Math.abs(a.peor) / TOLERANCIA_LENTO[c] - 1));
  }
  const perdidas = tramo.filter((m, i) => m.perdida && !(i > 0 ? tramo[i - 1].perdida : false)).map((m) => m.t);
  const bajo = tramo.some((m) => m.agl < ALTURA_SEGURA_AGL);
  const elementos: Record<CodigoLento, "S" | "NS"> = {
    "PA.VII.A.S2": bajo ? "NS" : "S",
    "PA.VII.A.S3": ns.velocidad ? "NS" : "S",
    "PA.VII.A.S4": perdidas.length || ns.bola ? "NS" : "S",
    "PA.VII.A.S5": ns.altitud || ns.rumbo || ns.inclinacion ? "NS" : "S",
  };
  puntos -= (perdidas.length ? 30 : 0) + (bajo ? 20 : 0) + (salio ? 0 : 20);
  return {
    maniobra: "vuelo-lento",
    aprobado: salio && Object.values(elementos).every((e) => e === "S"),
    calificacion: Math.max(0, Math.round(puntos)),
    elementos,
    objetivo: { t: o.t, altitud: o.altitud, rumbo: o.rumbo, velocidad: OBJETIVO_KT },
    peor,
    fuera,
    ns,
    perdidas,
    bajo,
    salio,
    primerLado: ev.primerLado!,
    flaps: o.flaps ?? 0,
    avisos: salio ? [] : [AVISO_SIN_SALIDA],
    muestras: tramo,
  };
}

/** Pura, como `avanzarRecto`: ignora muestras repetidas o viejas. */
export function avanzarLento(ev: EvaluacionLento, m: Muestra): EvaluacionLento {
  if (ev.fase === "terminado" || ev.fase === "invalido") return ev;
  if (ev.previo && m.t <= ev.previo.t) return ev;
  if (lectorViejo(m)) return { ...ev, fase: "invalido", motivo: MOTIVO_VIEJO, previo: m };
  const motivo = invalidez(m, ev.previo);
  if (motivo) return { ...ev, fase: "invalido", motivo, previo: m };

  if (ev.fase === "armado") {
    const ventana = [...ev.ventana, m].filter((x) => x.t >= m.t - ENTRADA_SEG);
    if (!entrada(ventana)) return { ...ev, ventana, previo: m };
    return { ...ev, fase: "recto", ventana, objetivo: m, inicioFase: m, giro: 0, tramo: [m], marcas: [{ fase: "recto", giro: 0 }], previo: m };
  }

  const giro = giroDe(ev, m);
  const sigue = { ...ev, giro, previo: m, tramo: [...ev.tramo, m], marcas: [...ev.marcas, { fase: ev.fase, giro }] };
  const nueva = (fase: FaseLento, extra: Partial<EvaluacionLento> = {}): EvaluacionLento => ({ ...sigue, fase, inicioFase: m, giro: 0, ...extra });

  switch (ev.fase) {
    case "recto":
      return m.t - ev.objetivo!.t >= RECTO_SEG ? nueva("viraje1") : sigue;
    case "viraje1":
      return cerro(giro, m) ? nueva("viraje2", { primerLado: ladoDe(giro) }) : sigue;
    case "viraje2":
      return cerro(giro, m) && ladoDe(giro) !== ev.primerLado ? nueva("salida") : sigue;
    case "salida": {
      const salio = (m.rpm ?? 0) >= SALIDA.rpm && m.velocidad >= SALIDA.kt;
      if (!salio && m.t - ev.inicioFase!.t < SALIDA.maxSeg) return sigue;
      return { ...sigue, fase: "terminado", resultado: resultado(sigue, salio) };
    }
    default:
      return sigue;
  }
}
