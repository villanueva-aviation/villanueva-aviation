import { useState } from "react";
import { CESSNA_HOTSPOTS } from "./hotspots";

export function AirplaneDiagram() {
  const [active, setActive] = useState(CESSNA_HOTSPOTS[0].id);
  const activeHotspot = CESSNA_HOTSPOTS.find((h) => h.id === active) ?? CESSNA_HOTSPOTS[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
        <img src="/images/cessna-topview.png" alt="Cessna 172 de Villanueva Aviation, vista superior" className="w-full" />
        {CESSNA_HOTSPOTS.map((h) => (
          <button
            key={h.id}
            onClick={() => setActive(h.id)}
            aria-label={h.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.xPct}%`, top: `${h.yPct}%` }}
          >
            {active === h.id && (
              <span className="absolute inset-0 -m-2 animate-ping rounded-full bg-gold-500/50" />
            )}
            <span
              className={`relative block rounded-full border-2 border-navy-950 transition-all duration-200 ${
                active === h.id ? "h-5 w-5 bg-gold-500" : "h-3.5 w-3.5 bg-gold-500/70 hover:bg-gold-400"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5">
          <h4 className="font-display text-base font-semibold text-white">{activeHotspot.label}</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{activeHotspot.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CESSNA_HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => setActive(h.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors duration-200 ${
                active === h.id
                  ? "border-gold-500/50 bg-gold-500/10 text-gold-400"
                  : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
