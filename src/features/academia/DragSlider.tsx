import { useState } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export interface SliderMetric {
  label: string;
  unit: string;
  from: number;
  to: number;
  decimals?: number;
  warnAbove?: number;
}

export interface SliderConfig {
  title: string;
  description: string;
  minLabel: string;
  maxLabel: string;
  metrics: SliderMetric[];
  footnote: string;
}

const DEFAULT_CONFIG: SliderConfig = {
  title: "Configuración de tren y flaps vs. resistencia (drag)",
  description:
    "Mueve el control de configuración limpia a configuración de aterrizaje y observa cómo cambia la resistencia al avance, la velocidad y el consumo.",
  minLabel: "Configuración limpia (tren y flaps arriba)",
  maxLabel: "Configuración de aterrizaje (tren y flaps abajo)",
  metrics: [
    { label: "Velocidad", unit: "kt", from: 110, to: 90 },
    { label: "Consumo", unit: "gph", from: 9.5, to: 13.2, decimals: 1 },
    { label: "Resistencia (drag)", unit: "%", from: 15, to: 90, warnAbove: 60 },
  ],
  footnote:
    "Extender el tren de aterrizaje y los flaps aumenta la resistencia al avance, lo que reduce la velocidad y aumenta el consumo de combustible — por eso solo se usa esta configuración cerca del aterrizaje.",
};

export function DragSlider({ config = DEFAULT_CONFIG }: { config?: SliderConfig }) {
  const [value, setValue] = useState(0);
  const t = value / 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h4 className="font-display text-base font-semibold text-white">{config.title}</h4>
      <p className="mt-2 text-sm text-white/60">{config.description}</p>

      <div className="mt-8">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-gold-500"
        />
        <div className="mt-2 flex justify-between text-xs text-white/45">
          <span>{config.minLabel}</span>
          <span>{config.maxLabel}</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {config.metrics.map((m) => {
          const raw = lerp(m.from, m.to, t);
          const display = m.decimals !== undefined ? raw.toFixed(m.decimals) : Math.round(raw);
          const isDrag = m.warnAbove !== undefined;
          return (
            <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">{m.label}</p>
              {isDrag ? (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${raw > (m.warnAbove ?? 100) ? "bg-red-400" : "bg-gold-500"}`}
                    style={{ width: `${raw}%` }}
                  />
                </div>
              ) : (
                <p className="mt-1 font-display text-2xl font-semibold text-white">
                  {display} {m.unit}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-white/55">{config.footnote}</p>
    </div>
  );
}
