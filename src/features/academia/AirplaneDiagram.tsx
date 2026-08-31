import { useState } from "react";

interface Hotspot {
  id: string;
  label: string;
  description: string;
  cx: number;
  cy: number;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "ala",
    label: "Ala",
    description: "Genera la mayor parte de la sustentación gracias a su perfil aerodinámico.",
    cx: 260,
    cy: 150,
  },
  {
    id: "aleron",
    label: "Alerón",
    description: "Superficie móvil en el borde de salida del ala que controla el alabeo (roll).",
    cx: 410,
    cy: 160,
  },
  {
    id: "fuselaje",
    label: "Fuselaje",
    description: "Estructura principal que aloja la cabina, pasajeros y carga.",
    cx: 260,
    cy: 100,
  },
  {
    id: "estabilizador-vertical",
    label: "Estabilizador vertical",
    description: "Aloja el timón de dirección y da estabilidad direccional a la aeronave.",
    cx: 470,
    cy: 55,
  },
  {
    id: "estabilizador-horizontal",
    label: "Estabilizador horizontal",
    description: "Aloja el elevador y da estabilidad de cabeceo (pitch) a la aeronave.",
    cx: 450,
    cy: 100,
  },
  {
    id: "tren",
    label: "Tren de aterrizaje",
    description: "Soporta el peso de la aeronave en tierra y absorbe el impacto del aterrizaje.",
    cx: 260,
    cy: 190,
  },
];

export function AirplaneDiagram() {
  const [active, setActive] = useState<string>(HOTSPOTS[0].id);
  const activeHotspot = HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 p-4">
        <svg viewBox="0 0 560 220" className="h-full w-full">
          <g stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none">
            <path d="M120 100 L440 100 L470 90 L470 100 L440 108 L120 108 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M180 78 L340 130 L340 145 L200 108 Z" fill="rgba(255,255,255,0.08)" />
            <path d="M180 132 L340 78 L340 92 L200 108 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M420 60 L470 55 L470 100 L430 95 Z" fill="rgba(255,255,255,0.08)" />
            <path d="M440 40 L472 52 L448 95 Z" fill="rgba(255,255,255,0.1)" />
            <line x1="255" y1="108" x2="240" y2="200" strokeWidth="2" />
            <line x1="270" y1="108" x2="285" y2="200" strokeWidth="2" />
            <circle cx="240" cy="200" r="6" fill="rgba(255,255,255,0.15)" />
            <circle cx="285" cy="200" r="6" fill="rgba(255,255,255,0.15)" />
          </g>

          {HOTSPOTS.map((h) => (
            <g key={h.id} onClick={() => setActive(h.id)} className="cursor-pointer">
              <circle
                cx={h.cx}
                cy={h.cy}
                r={active === h.id ? 12 : 9}
                className={`transition-all duration-300 ${
                  active === h.id ? "fill-gold-500" : "fill-gold-500/40 hover:fill-gold-500/70"
                }`}
              />
              {active === h.id && (
                <circle cx={h.cx} cy={h.cy} r="18" className="fill-none stroke-gold-500/50 animate-glow-pulse" strokeWidth="2" />
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5">
          <h4 className="font-display text-base font-semibold text-white">{activeHotspot.label}</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{activeHotspot.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {HOTSPOTS.map((h) => (
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
