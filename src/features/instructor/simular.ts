import type { Lado, Muestra } from "./evaluador.ts";

const norm = (r: number) => ((r % 360) + 360) % 360;

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
    virar(lado === "izquierda" ? -1 : 1, 360, 45, i as 0 | 1);
  });
  recto(5);
  return out;
}
