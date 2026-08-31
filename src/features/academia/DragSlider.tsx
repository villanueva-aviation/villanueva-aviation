import { useState } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function DragSlider() {
  const [config, setConfig] = useState(0); // 0 = limpia, 100 = aterrizaje

  const t = config / 100;
  const velocidad = Math.round(lerp(110, 90, t));
  const consumo = lerp(9.5, 13.2, t).toFixed(1);
  const dragPct = Math.round(lerp(15, 90, t));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h4 className="font-display text-base font-semibold text-white">
        Configuración de tren y flaps vs. resistencia (drag)
      </h4>
      <p className="mt-2 text-sm text-white/60">
        Mueve el control de configuración limpia a configuración de aterrizaje y observa cómo cambia la
        resistencia al avance, la velocidad y el consumo.
      </p>

      <div className="mt-8">
        <input
          type="range"
          min={0}
          max={100}
          value={config}
          onChange={(e) => setConfig(Number(e.target.value))}
          className="w-full accent-gold-500"
        />
        <div className="mt-2 flex justify-between text-xs text-white/45">
          <span>Configuración limpia (tren y flaps arriba)</span>
          <span>Configuración de aterrizaje (tren y flaps abajo)</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/45">Velocidad</p>
          <p className="mt-1 font-display text-2xl font-semibold text-white">{velocidad} kt</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/45">Consumo</p>
          <p className="mt-1 font-display text-2xl font-semibold text-white">{consumo} gph</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/45">Resistencia (drag)</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-200 ${dragPct > 60 ? "bg-red-400" : "bg-gold-500"}`}
              style={{ width: `${dragPct}%` }}
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/55">
        Extender el tren de aterrizaje y los flaps <span className="text-gold-400">aumenta la resistencia al avance</span>,
        lo que <span className="text-gold-400">reduce la velocidad</span> y <span className="text-gold-400">aumenta el consumo</span>
        {" "}de combustible — por eso solo se usa esta configuración cerca del aterrizaje.
      </p>
    </div>
  );
}
