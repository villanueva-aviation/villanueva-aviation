import { useEffect, useState } from "react";

// Instrumento redondo de aguja (dibujo propio): escala de 240°, bandas de color y aguja que barre
// hasta su valor al aparecer. Sirve para el resultado por área y para el nivel general.

const ABRE = 120; // grados a cada lado del cero vertical

export interface Banda {
  desde: number;
  hasta: number;
  color: string;
}

function polar(cx: number, cy: number, r: number, grados: number) {
  const a = ((grados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arco(cx: number, cy: number, r: number, g1: number, g2: number) {
  const a = polar(cx, cy, r, g1);
  const b = polar(cx, cy, r, g2);
  return `M${a.x} ${a.y} A${r} ${r} 0 ${g2 - g1 > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

export function Medidor({
  valor,
  maximo,
  bandas,
  marcas,
  etiquetas,
  centro,
  sub,
  retraso = 0,
  oscilar = false,
  className = "",
  titulo,
}: {
  valor: number;
  maximo: number;
  bandas: Banda[];
  /** Cada cuántas unidades va una marca. */
  marcas: number;
  /** Texto en ciertas posiciones de la escala (valor -> texto). */
  etiquetas?: Record<number, string>;
  centro?: string;
  sub?: string;
  /** ms antes de que la aguja empiece a barrer. */
  retraso?: number;
  /** Aguja en espera, moviéndose un poco (portada). */
  oscilar?: boolean;
  className?: string;
  titulo: string;
}) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setListo(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const angulo = (v: number) => -ABRE + (Math.max(0, Math.min(maximo, v)) / maximo) * ABRE * 2;
  const C = 100;
  const R = 78;

  const ticks = [];
  for (let v = 0; v <= maximo + 1e-9; v += marcas) {
    const g = angulo(v);
    const a = polar(C, C, R, g);
    const b = polar(C, C, R - 10, g);
    ticks.push(<line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.75)" strokeWidth="2" />);
  }

  return (
    <svg viewBox="0 0 200 200" className={`h-auto w-full ${className}`} role="img" aria-label={titulo}>
      <circle cx={C} cy={C} r="96" fill="#05090f" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
      <circle cx={C} cy={C} r="90" fill="#0a1220" />
      {bandas.map((b) => (
        <path key={`${b.desde}-${b.hasta}`} d={arco(C, C, R + 4, angulo(b.desde), angulo(b.hasta))} fill="none" stroke={b.color} strokeWidth="7" />
      ))}
      {ticks}
      {etiquetas &&
        Object.entries(etiquetas).map(([v, texto]) => {
          const p = polar(C, C, R - 24, angulo(Number(v)));
          return (
            <text key={v} x={p.x} y={p.y + 4} textAnchor="middle" className="fill-white/70 font-display text-[12px] font-bold">
              {texto}
            </text>
          );
        })}
      {centro && (
        <text x={C} y={C + 42} textAnchor="middle" className="fill-white font-display text-[22px] font-bold tabular-nums">
          {centro}
        </text>
      )}
      {sub && (
        <text x={C} y={C + 60} textAnchor="middle" className="fill-white/55 text-[11px] font-semibold uppercase tracking-wider">
          {sub}
        </text>
      )}
      {/* Aguja: parte del mínimo y barre hasta el valor */}
      <g
        className={`${oscilar ? "motion-safe:animate-[medidor-espera_3.2s_ease-in-out_infinite]" : "transition-transform duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"}`}
        style={{
          transform: `rotate(${listo || oscilar ? angulo(valor) : -ABRE}deg)`,
          transformBox: "view-box",
          transformOrigin: `${C}px ${C}px`,
          transitionDelay: `${retraso}ms`,
          ["--giro" as string]: `${angulo(valor)}deg`,
        }}
      >
        <path d={`M${C - 3.5} ${C + 12} L${C} ${C - R + 6} L${C + 3.5} ${C + 12} Z`} fill="#d4af37" />
      </g>
      <circle cx={C} cy={C} r="7" fill="#1a2433" stroke="#d4af37" strokeWidth="2" />
    </svg>
  );
}
