import type { SliderMetric } from "./DragSlider";

/** Valor de la métrica con el control en t (0 a 1). `inversa` para lo que va como 1/velocidad (tiempo, combustible). */
export function valorMetrica(m: SliderMetric, t: number): number {
  if (m.inversa) return 1 / (1 / m.from + (1 / m.to - 1 / m.from) * t);
  return m.from + (m.to - m.from) * t;
}
