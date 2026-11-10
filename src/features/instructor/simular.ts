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
    /** Grados (+ derecha) que se va y regresa a la mitad del tramo recto. */
    derivaRecto?: number;
    /** Grados (+ derecha) que se va mientras mete potencia en la salida. */
    derivaSalida?: number;
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
  for (let i = 0, n = 350, d = op.derivaRecto ?? 0; i < n; i++) {
    emitir(0);
    rumbo += (i < n / 2 ? 1 : -1) * ((2 * d) / n);
  }
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
      rumbo += (op.derivaSalida ?? 0) / 110;
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

/**
 * Ascensos y descensos a 10 Hz: 5 s recto en 090 a 7,000 ft (o 7,500 si `baja`) y 95 kt, terreno a 4,500 ft.
 * Cambia a 700 ft/min (500 al bajar) a `kt` (72 o 92), nivela de golpe en la asignada + `pasarse` y sigue 15 s a 95 kt.
 */
export function simularAltitud(op: { baja?: boolean; kt?: number; pasarse?: number; contrario?: boolean } = {}): Muestra[] {
  const s = op.baja ? -1 : 1;
  const inicio = op.baja ? 7500 : 7000;
  const meta = inicio + s * 500 + s * (op.pasarse ?? 0);
  const kt = op.kt ?? (op.baja ? 92 : 72);
  const fpm = (op.baja ? 500 : 700) * (op.contrario ? -1 : 1);
  const out: Muestra[] = [];
  let alt = inicio;
  let v = 95;
  let fin: number | null = null;
  for (let n = 0; fin === null || n / 10 < fin + 15; n++) {
    const t = n / 10;
    const cambiando = t >= 5 && fin === null;
    out.push({
      t, inclinacion: 0, altitud: alt, velocidad: v, rumbo: 90, vs: cambiando ? s * fpm : 0,
      bola: 0, agl: alt - 4500, peso: 2550, enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
    });
    if (cambiando) {
      alt += (s * fpm) / 600;
      v += Math.sign(kt - v) * Math.min(Math.abs(kt - v), 0.5);
      if (s * (alt - meta) >= 0 || (op.contrario && Math.abs(alt - inicio) > 300)) [alt, fin] = [op.contrario ? alt : meta, t];
    } else if (fin !== null) v += Math.sign(95 - v) * Math.min(Math.abs(95 - v), 0.5);
  }
  return out;
}

/**
 * Virajes a rumbos a 10 Hz: 5 s recto en 090 a 3,500 ft y 95 kt, entrada en 3 s a `incl` (30°), viraje por la derecha
 * hasta el rumbo asignado (240) + `pasarse`, salida en 3 s que empieza justo a tiempo, y 15 s recto.
 * El ritmo de viraje crece con la inclinación (lineal, basta para probar). `perdidaFt`: altitud perdida mientras está inclinado.
 */
export function simularRumbos(op: { incl?: number; pasarse?: number; perdidaFt?: number; ladoContrario?: boolean } = {}): Muestra[] {
  const incl = op.incl ?? 30;
  const w = (1091 * Math.tan((incl * Math.PI) / 180)) / 95; // °/s con la inclinación completa
  const s = op.ladoContrario ? -1 : 1;
  const meta = 150 + (op.pasarse ?? 0); // giro total
  const out: Muestra[] = [];
  let t = 0;
  let rumbo = 90;
  let girado = 0;
  let banco = 0;
  let saliendo = false;
  let fin: number | null = null;
  while (fin === null || t < fin + 15) {
    out.push({
      t: Math.round(t * 10) / 10, inclinacion: s * banco, altitud: 3500 - (banco > 5 ? (op.perdidaFt ?? 0) : 0), velocidad: 95, rumbo: norm(rumbo),
      bola: 0, agl: 2500, peso: 2550, enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
    });
    t += 0.1;
    if (t < 5) continue;
    // La salida dura 3 s y gira w·1.5°: empieza a esa distancia de la meta.
    if (!saliendo && meta - girado <= w * 1.5) saliendo = true;
    banco = saliendo ? Math.max(0, banco - (incl / 3) * 0.1) : Math.min(incl, banco + (incl / 3) * 0.1);
    if (saliendo && banco === 0 && fin === null) fin = t;
    const d = w * (banco / incl) * 0.1;
    girado += d;
    rumbo += s * d;
    if (op.ladoContrario && girado > 60 && fin === null) fin = t;
  }
  return out;
}

/**
 * Virajes ascendiendo y descendiendo a 10 Hz: 5 s recto en 090 a 7,000 ft (7,500 si `baja`) y 95 kt, terreno a 4,500 ft.
 * Viraje por la derecha a `incl` (15°) hasta 240 + `pasarse`, y a la vez cambio de altitud a `fpm` (700 o 500) hasta la
 * asignada + `pasarseFt`, a `kt` (72 o 92). Cada uno termina por su lado; luego 15 s recto y nivelado.
 */
export function simularCombinado(
  op: { baja?: boolean; kt?: number; incl?: number; pasarse?: number; pasarseFt?: number; fpm?: number; ladoContrario?: boolean; contrario?: boolean } = {},
): Muestra[] {
  const incl = op.incl ?? 15;
  const lado = op.ladoContrario ? -1 : 1;
  const metaGiro = 150 + (op.pasarse ?? 0);
  const s = op.baja ? -1 : 1;
  const inicio = op.baja ? 7500 : 7000;
  const metaAlt = inicio + s * (500 + (op.pasarseFt ?? 0));
  const kt = op.kt ?? (op.baja ? 92 : 72);
  const fpm = (op.fpm ?? (op.baja ? 500 : 700)) * (op.contrario ? -1 : 1);
  const out: Muestra[] = [];
  let [rumbo, girado, banco, alt, v] = [90, 0, 0, inicio, 95];
  let saliendo = false;
  let giroFin: number | null = null;
  let altFin: number | null = null;
  for (let n = 0; ; n++) {
    const t = n / 10;
    if (giroFin !== null && altFin !== null && t > Math.max(giroFin, altFin) + 15) break;
    const cambiando = t >= 5 && altFin === null;
    out.push({
      t, inclinacion: lado * banco, altitud: alt, velocidad: v, rumbo: norm(rumbo), vs: cambiando ? s * fpm : 0,
      bola: 0, agl: alt - 4500, peso: 2550, enTierra: false, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
    });
    if (t < 5) continue;
    if (giroFin === null) {
      const w = (1091 * Math.tan((incl * Math.PI) / 180)) / v; // °/s con la inclinación completa
      // La salida dura 2 s y gira w·1°: empieza a esa distancia de la meta.
      if (!saliendo && metaGiro - girado <= w) saliendo = true;
      banco = saliendo ? Math.max(0, banco - (incl / 2) * 0.1) : Math.min(incl, banco + (incl / 2) * 0.1);
      const d = w * (banco / incl) * 0.1;
      girado += d;
      rumbo += lado * d;
      if ((saliendo && banco === 0) || (op.ladoContrario && girado > 60)) giroFin = t;
    }
    if (cambiando) {
      alt += (s * fpm) / 600;
      v += Math.sign(kt - v) * Math.min(Math.abs(kt - v), 0.5);
      if (s * (alt - metaAlt) >= 0 || (op.contrario && Math.abs(alt - inicio) > 300)) [alt, altFin] = [op.contrario ? alt : metaAlt, t];
    } else if (altFin !== null) v += Math.sign(95 - v) * Math.min(Math.abs(95 - v), 0.5);
  }
  return out;
}

/**
 * Un circuito de tránsito por la izquierda desde la carrera de despegue (30 kt, pista 200, campo a 5,000 ft) hasta
 * 5 s después del toque. Virajes de 90° a `incl` (20°) con régimen constante; nivela en 1,000 ft AGL + `pasarseFt`;
 * en viento en cola baja a los 50 s. `toqueFpm`: régimen al tocar.
 */
export function simularCircuito(
  op: { vr?: number; ascenso?: number; cola?: number; final?: number; incl?: number; pasarseFt?: number; toqueFpm?: number; derecha?: boolean } = {},
): Muestra[] {
  const ELEV = 5000;
  const DT = 0.1;
  const vr = op.vr ?? 55;
  const incl = op.incl ?? 20;
  const lado = op.derecha ? 1 : -1;
  const patron = ELEV + 1000 + (op.pasarseFt ?? 0);
  const out: Muestra[] = [];
  let [v, alt, rumbo, cabeceo, vs] = [30, ELEV, 200, 0, 0];
  let tierra = true;
  let pierna = 0; // 0 despegue, 1 cruzado, 2 viento en cola, 3 base, 4 final
  let girando = 0;
  let desde = 0;
  let bajar = false;
  let toque: number | null = null;
  for (let n = 0; ; n++) {
    const t = n * DT;
    out.push({
      t, inclinacion: girando > 0 ? lado * incl : 0, altitud: alt, velocidad: v, rumbo: norm(rumbo), vs: tierra ? 0 : vs, cabeceo, gs: v,
      bola: 0, agl: alt - ELEV, peso: 2400, enTierra: tierra, slew: false, tasa: 1, pausa: false, titulo: "Cessna Skyhawk 172SP",
    });
    if (toque !== null) {
      if (t - toque > 5) break;
      v -= 0.1;
      continue;
    }
    if (tierra) {
      v += 0.3;
      if (v >= vr) cabeceo = 5;
      if (v >= vr + 8) [tierra, vs] = [false, 700];
      continue;
    }
    // Vertical: sube a 700 ft/min hasta el circuito; baja a 500 desde la mitad del viento en cola; enderezada a 20 ft.
    if (!bajar && vs > 0 && alt + (vs * DT) / 60 >= patron) [alt, vs] = [patron, 0];
    if (!bajar && pierna === 2 && girando === 0 && t - desde >= 50) [bajar, vs] = [true, -500];
    if (bajar && alt - ELEV <= 20) vs = -(op.toqueFpm ?? 300);
    alt += (vs * DT) / 60;
    if (alt <= ELEV) {
      [alt, tierra, toque, cabeceo] = [ELEV, true, t, 3];
      continue;
    }
    const meta = vs > 0 ? (op.ascenso ?? 72) : bajar ? (pierna >= 4 ? (op.final ?? 67) : 75) : (op.cola ?? 90);
    v += Math.sign(meta - v) * Math.min(Math.abs(meta - v), 0.2);
    // Horizontal: cada pierna recta dura lo suyo y luego vira 90°.
    if (girando > 0) {
      const d = ((1091 * Math.tan((incl * Math.PI) / 180)) / v) * DT;
      rumbo += lado * Math.min(d, girando);
      girando = Math.max(0, girando - d);
      if (girando === 0) [pierna, desde] = [pierna + 1, t];
    } else if (pierna < 4) {
      const listo = pierna === 0 ? alt - ELEV >= 500 : t - desde >= [0, 20, 60, 15][pierna];
      if (listo) girando = 90;
    }
  }
  return out;
}

/**
 * Falla de motor simulada en el C172: 6,600 ft (2,100 AGL), 95 kt, recto y nivelado. Hacia los 5 s el instructor dice
 * «falla»; ralentí `reaccion` s después de los 6 s, planeo a `kt` (68) y el checklist a los 18 s, salvo `sinChecklist`
 * (los magnetos «sin hacer» dejan el derecho apagado). Recupera `retraso` s después de llegar a 1,000 AGL + `recuperaAgl`
 * y asciende a `ascenso` (72) 25 s.
 */
export function simularFalla(
  op: { reaccion?: number; kt?: number; sinChecklist?: ("mezcla" | "selector" | "bomba" | "magnetos")[]; recuperaAgl?: number; retraso?: number; ascenso?: number; sinRalenti?: boolean } = {},
): Muestra[] {
  const SUELO = 4500;
  const sin = new Set(op.sinChecklist ?? []);
  const out: Muestra[] = [];
  let [v, alt, vs, acel] = [95, SUELO + 2100, 0, 65];
  let recupera: number | null = null;
  for (let n = 0; ; n++) {
    const t = n / 10;
    if (op.sinRalenti && t > 40) break;
    if (recupera !== null && t > recupera + 25) break;
    if (!op.sinRalenti && recupera === null && t >= 6 + (op.reaccion ?? 1)) acel = 0;
    if (recupera !== null && t >= recupera - 1e-9) acel = 100;
    const ck = t >= 18;
    const hecho = (x: "mezcla" | "selector" | "bomba" | "magnetos") => ck && !sin.has(x);
    out.push({
      t, inclinacion: 0, altitud: alt, velocidad: v, rumbo: 90, vs, bola: 0, agl: alt - SUELO, peso: 2400, enTierra: false, slew: false, tasa: 1, pausa: false,
      titulo: "Cessna Skyhawk 172SP", acelerador: acel, mezcla: hecho("mezcla") ? 100 : 70, selector: hecho("selector") ? 1 : 2, bomba: hecho("bomba"),
      magIzq: true, magDer: !(ck && sin.has("magnetos")), lat: 20.5, lon: -103.3,
    });
    if (recupera === null && acel === 0 && alt - SUELO <= 1000 + (op.recuperaAgl ?? 0)) recupera = t + (op.retraso ?? 1);
    const meta = acel === 100 ? (op.ascenso ?? 72) : acel === 0 ? (op.kt ?? 68) : 95;
    v += Math.sign(meta - v) * Math.min(Math.abs(meta - v), 0.3);
    vs = acel === 100 ? 700 : acel === 0 ? -700 : 0;
    alt += vs / 600;
  }
  return out;
}
