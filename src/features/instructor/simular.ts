import type { Lado, Muestra } from "./evaluador.ts";
import { DURACION_SEG, ESTABLE } from "./rectoNivelado.ts";

const norm = (r: number) => ((r % 360) + 360) % 360;

/**
 * Recto y nivelado a 10 Hz: 3,500 ft, 95 kt, alas niveladas. `subidaSeg` sube antes a 300 ft/min;
 * `deriva` y `pausaEn` cuentan segundos desde que el avión queda estable (subida + ESTABLE.seg).
 */
export function simularRecto(
  op: {
    rumbo?: number;
    subidaSeg?: number;
    deriva?: { campo: "altitud" | "rumbo" | "velocidad"; valor: number; desde: number; segundos: number };
    pausaEn?: number;
  } = {},
): Muestra[] {
  const subida = op.subidaSeg ?? 0;
  const total = subida + ESTABLE.seg + DURACION_SEG + 5;
  const out: Muestra[] = [];
  for (let n = 0; n < Math.round(total * 10); n++) {
    const t = Math.round(n * 100) / 1000;
    const s = t - subida - ESTABLE.seg;
    const m: Muestra = {
      t, inclinacion: 0, altitud: t < subida ? 3500 - 5 * (subida - t) : 3500, velocidad: 95, rumbo: op.rumbo ?? 90,
      bola: 0, agl: 2500, peso: 2550, enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
    };
    const d = op.deriva;
    if (d && s >= d.desde && s < d.desde + d.segundos) m[d.campo] += d.valor;
    m.rumbo = norm(m.rumbo);
    if (op.pausaEn !== undefined && s >= op.pausaEn) m.pausa = true;
    out.push(m);
  }
  return out;
}

/**
 * Vuelo lento a 10 Hz, igual que `--simulado-lento` del lector: flaps completos, 3,500 ft, de 95 kt a 58 kt
 * (2 kt/s), 35 s recto, 90° a la izquierda y 90° al otro lado a 15°, y salida a 2,450 RPM hasta 80 kt.
 * `perdidaEn`, `aglDesde` y `caidaKt` cuentan segundos de la simulación.
 */
export function simularLento(
  op: {
    segundoLado?: Lado;
    perdidaEn?: number;
    aglDesde?: { t: number; agl: number };
    sinSalida?: boolean;
    velocidadKt?: number;
    caidaKt?: { desde: number; segundos: number; kt: number };
    viejo?: boolean;
    sinSegundo?: boolean;
    rpmSalida?: number;
    giro1?: number;
    colaSeg?: number;
  } = {},
): Muestra[] {
  const lenta = op.velocidadKt ?? 58;
  const out: Muestra[] = [];
  let v = 95;
  let rumbo = 90;
  let rpm = 1700;
  const emitir = (incl: number) => {
    const t = Math.round(out.length * 100) / 1000;
    const c = op.caidaKt;
    const m: Muestra = {
      t, inclinacion: incl, altitud: 3500, velocidad: c && t >= c.desde && t < c.desde + c.segundos ? c.kt : v, rumbo: norm(rumbo),
      bola: 0, agl: op.aglDesde && t >= op.aglDesde.t ? op.aglDesde.agl : 2500, peso: 2550, enTierra: false, slew: false, tasa: 1,
      pausa: false, titulo: "Cessna Skyhawk 172SP",
    };
    if (!op.viejo) Object.assign(m, { cabeceo: 0, vs: 0, perdida: op.perdidaEn !== undefined && Math.abs(t - op.perdidaEn) < 0.05, flaps: 3, rpm });
    out.push(m);
  };
  const quieto = (seg: number) => {
    for (let i = 0; i < seg * 10; i++) emitir(0);
  };
  const virar = (sentido: 1 | -1, angulo = 90) => {
    let girado = 0;
    let tl = 0;
    for (;;) {
      const restante = angulo - girado;
      const incl = Math.min(15, 9 * tl, Math.max(5, restante / 2));
      const paso = ((1091 * Math.tan((incl * Math.PI) / 180)) / v) * 0.1;
      if (paso >= restante) {
        rumbo += sentido * restante;
        emitir(0);
        return;
      }
      emitir(sentido * incl);
      rumbo += sentido * paso;
      girado += paso;
      tl += 0.1;
    }
  };
  while (v > lenta) {
    emitir(0);
    v = Math.max(lenta, v - 0.2);
  }
  quieto(35);
  virar(-1, op.giro1 ?? 90);
  quieto(2);
  if (op.sinSegundo) quieto(70);
  else virar(op.segundoLado === "izquierda" ? -1 : 1);
  quieto(3);
  if (op.sinSalida) quieto(35);
  else {
    rpm = op.rpmSalida ?? 2450;
    while (v < 80) {
      emitir(0);
      v = Math.min(80, v + 0.2);
    }
  }
  quieto(op.colaSeg ?? 10);
  return out;
}

/**
 * Muestras sintéticas de un C172 a 3500 ft haciendo virajes escarpados, para las
 * pruebas y para ver la página sin MSFS. Virajes de limpieza a 20°, luego cada
 * viraje de 360° a 45° desde alas niveladas hasta el mismo rumbo.
 */
export function simularManiobra(
  op: {
    lados?: Lado[];
    limpieza?: boolean;
    velocidadEntrada?: number;
    rumboInicial?: number;
    caidaAltitud?: { lado: 0 | 1; ft: number; segundos: number; enGrados: number };
    sobreInclinacion?: { lado: 0 | 1; grados: number; segundos: number };
    /** Inclinación y grados de cada viraje de la maniobra (45° y 360° si no se dicen). */
    inclinacion?: number;
    angulo?: number;
    hz?: number;
  } = {},
): Muestra[] {
  const hz = op.hz ?? 10;
  const dt = 1 / hz;
  const v = op.velocidadEntrada ?? 95;
  const base = {
    altitud: 3500, velocidad: v, bola: 0, agl: 2500, peso: 2550,
    enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
  };
  const out: Muestra[] = [];
  let n = 0;
  let rumbo = op.rumboInicial ?? 90;
  const emitir = (inclinacion: number, extra: Partial<Muestra> = {}) => {
    out.push({ ...base, t: Math.round(n * dt * 1000) / 1000, inclinacion, rumbo: norm(rumbo), ...extra });
    n++;
  };
  const recto = (seg: number) => {
    for (let i = 0; i < Math.round(seg * hz); i++) emitir(0);
  };
  // Viraje de `angulo` grados contados desde la última muestra con alas niveladas.
  const virar = (sentido: -1 | 1, angulo: number, maxima: number, idx?: 0 | 1) => {
    let girado = 0;
    let tl = 0;
    let tAlterado = 0;
    let tInclinado = 0;
    for (;;) {
      const restante = angulo - girado;
      let inclinacion = Math.min(maxima, 9 * tl, Math.max(12, 3 * restante));
      const extra: Partial<Muestra> = {};
      const caida = op.caidaAltitud;
      if (caida && caida.lado === idx && girado >= caida.enGrados && tAlterado < caida.segundos - 1e-9) {
        extra.altitud = base.altitud - caida.ft;
        tAlterado += dt;
      }
      const sobre = op.sobreInclinacion;
      if (sobre && sobre.lado === idx && girado >= 90 && tInclinado < sobre.segundos - 1e-9) {
        inclinacion = sobre.grados;
        tInclinado += dt;
      }
      const paso = ((1091 * Math.tan((inclinacion * Math.PI) / 180)) / v) * dt;
      if (paso >= restante) {
        rumbo += sentido * restante;
        emitir(0);
        return;
      }
      emitir(sentido * inclinacion, extra);
      rumbo += sentido * paso;
      // El viraje se mide desde la última muestra nivelada, como el evaluador.
      girado = inclinacion < 10 ? paso : girado + paso;
      tl += dt;
    }
  };

  recto(20);
  if (op.limpieza ?? true) {
    virar(-1, 90, 20);
    virar(1, 90, 20);
    recto(10);
  } else {
    recto(60);
  }
  const lados = op.lados ?? ["izquierda", "derecha"];
  lados.forEach((lado, i) => {
    if (i > 0) recto(3);
    virar(lado === "izquierda" ? -1 : 1, op.angulo ?? 360, op.inclinacion ?? 45, i as 0 | 1);
  });
  recto(5);
  return out;
}
