import type { Serie } from "./reglasIntentos.ts";

const W = 300;
const H = 120;

/** Desviación contra el tiempo: banda verde = tolerancia, rojo = fuera, peor punto marcado. SVG simple, sin librería. */
export function Grafica({ puntos, tol, titulo, unidad }: { puntos: Serie; tol: number; titulo: string; unidad: string }) {
  if (puntos.length < 2) return null;
  const t0 = puntos[0].t;
  const dur = puntos[puntos.length - 1].t - t0 || 1;
  const peor = puntos.reduce((a, b) => (Math.abs(b.v) > Math.abs(a.v) ? b : a));
  const rango = Math.max(tol * 1.6, Math.abs(peor.v) * 1.15);
  const x = (t: number) => ((t - t0) / dur) * W;
  const y = (v: number) => H / 2 - (v / rango) * (H / 2 - 8);
  const pts = (ps: Serie) => ps.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");

  // Tramos fuera de tolerancia, con un punto de cada lado para que el rojo empalme con la línea.
  const fuera: Serie[] = [];
  puntos.forEach((p, i) => {
    if (Math.abs(p.v) <= tol) return;
    const ultimo = fuera[fuera.length - 1];
    if (ultimo && ultimo[ultimo.length - 1] === puntos[i - 1]) ultimo.push(p);
    else fuera.push(i > 0 ? [puntos[i - 1], p] : [p]);
    if (puntos[i + 1] && Math.abs(puntos[i + 1].v) <= tol) fuera[fuera.length - 1].push(puntos[i + 1]);
  });
  const segundosFuera = fuera.reduce((s, tr) => s + tr[tr.length - 1].t - tr[0].t, 0);
  const malo = Math.abs(peor.v) > tol;
  // La bola no tiene unidad y va de −1 a 1: dos decimales. Lo demás, entero.
  const fmt = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${unidad ? Math.round(Math.abs(v)) : Math.abs(v).toFixed(2)}${unidad ? ` ${unidad}` : ""}`;
  const etiquetaX = Math.min(Math.max(x(peor.t), 40), W - 40);

  return (
    <figure className="rounded-xl border border-white/10 bg-navy-900/60 p-4">
      <figcaption className="text-sm font-semibold text-white">{titulo}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`${titulo}: peor desviación ${fmt(peor.v)}, tolerancia ±${tol} ${unidad}`}>
        <rect x="0" y={y(tol)} width={W} height={y(-tol) - y(tol)} fill="#2a3a2e" />
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#55606c" strokeDasharray="3 3" />
        <text x="4" y={y(tol) - 3} fill="#8c929c" fontSize="9">+{tol} {unidad}</text>
        <text x="4" y={y(-tol) + 10} fill="#8c929c" fontSize="9">−{tol} {unidad}</text>
        <polyline fill="none" stroke="#e6e8eb" strokeWidth="1.5" points={pts(puntos)} />
        {fuera.map((tr, i) => (
          <polyline key={i} fill="none" stroke="#ff7a66" strokeWidth="2.5" points={pts(tr)} />
        ))}
        <circle cx={x(peor.t)} cy={y(peor.v)} r="3.5" fill={malo ? "#ff7a66" : "#7fd49a"} />
        <text x={etiquetaX} y={peor.v < 0 ? Math.min(y(peor.v) + 13, H - 2) : Math.max(y(peor.v) - 6, 9)} textAnchor="middle" fill={malo ? "#ff9b8a" : "#7fd49a"} fontSize="10">
          {fmt(peor.v)}
        </text>
      </svg>
      <p className="mt-1 text-xs text-white/50">
        {malo ? `Fuera de tolerancia unos ${Math.max(1, Math.round(segundosFuera))} s.` : "Siempre dentro de la banda verde."}
      </p>
    </figure>
  );
}
