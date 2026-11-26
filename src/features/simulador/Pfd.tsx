// Pantalla de vuelo principal encima de la vista 3D: escala de cabeceo e inclinación, cintas de
// velocidad y altitud, VS, rumbo y modos del piloto automático. Dibujo propio.
import type { Estado } from "./modelo.ts";
import type { EstadoAp, Selecciones } from "./piloto.ts";

const W = 600;
const H = 338;
const CX = W / 2;
const CY = H / 2;
const FOCAL = CY / Math.tan((25 * Math.PI) / 180); // mismo campo de visión vertical (50°) que la cámara 3D
const RAD = Math.PI / 180;
const CIAN = "#4cc9f0";
const VERDE = "#3ddc84";
const AMBAR = "#f5b301";

const yCabeceo = (g: number) => FOCAL * Math.tan(g * RAD);
const tres = (n: number) => String(Math.round(((n % 360) + 360) % 360) || 360).padStart(3, "0");

function Cinta({ x, valor, sel, paso, px, lado, unidad }: { x: number; valor: number; sel: number | null; paso: number; px: number; lado: "izq" | "der"; unidad: string }) {
  const ancho = 66;
  const marcas = [];
  const inicio = Math.floor((valor - (CY / px)) / paso) * paso;
  for (let v = inicio; v <= valor + CY / px; v += paso) {
    if (v < 0 && unidad === "KT") continue;
    const y = CY - (v - valor) * px;
    const mayor = Math.round(v / paso) % 2 === 0;
    const x1 = lado === "izq" ? x + ancho - (mayor ? 12 : 6) : x;
    marcas.push(<line key={v} x1={x1} x2={x1 + (mayor ? 12 : 6)} y1={y} y2={y} stroke="#fff" strokeWidth="1.5" />);
    if (mayor)
      marcas.push(
        <text key={`t${v}`} x={lado === "izq" ? x + ancho - 16 : x + 16} y={y + 4} textAnchor={lado === "izq" ? "end" : "start"} className="fill-white text-[12px] tabular-nums">
          {v}
        </text>,
      );
  }
  const ySel = sel === null ? null : Math.max(30, Math.min(H - 30, CY - (sel - valor) * px));
  return (
    <g>
      <rect x={x} y={24} width={ancho} height={H - 48} fill="#0a1220" opacity="0.55" />
      <clipPath id={`c${unidad}`}><rect x={x} y={24} width={ancho} height={H - 48} /></clipPath>
      <g clipPath={`url(#c${unidad})`}>{marcas}</g>
      {ySel !== null && <path d={lado === "izq" ? `M${x + ancho} ${ySel - 7} h-6 l-5 7 l5 7 h6 Z` : `M${x} ${ySel - 7} h6 l5 7 l-5 7 h-6 Z`} fill={CIAN} />}
      <rect x={x + 2} y={CY - 14} width={ancho - 4} height="28" fill="#000" stroke="#fff" />
      <text x={x + ancho / 2} y={CY + 6} textAnchor="middle" className="fill-white font-display text-[16px] font-bold tabular-nums">
        {Math.round(valor)}
      </text>
      {sel !== null && (
        <text x={x + ancho / 2} y={18} textAnchor="middle" className="text-[12px] font-bold tabular-nums" fill={CIAN}>
          {Math.round(sel)}
        </text>
      )}
      <text x={x + ancho / 2} y={H - 10} textAnchor="middle" className="fill-[#7d8da3] text-[10px]">{unidad}</text>
    </g>
  );
}

function modos(ap: EstadoAp) {
  if (!ap.ap) return { lat: "", armado: "", vert: "", ias: "" };
  return { lat: ap.lat === "ATT" ? "" : ap.lat, armado: ap.armado ?? "", vert: ap.vert === "ATT" ? "" : ap.vert === "ALTA" ? "ALT.A" : ap.vert, ias: ap.ias ? "IAS" : "" };
}

export function Pfd({ e, ap, sel, decl }: { e: Estado; ap: EstadoAp; sel: Selecciones; decl: number }) {
  const m = modos(ap);
  const peldanos = [-20, -15, -10, -5, 5, 10, 15, 20];
  const arco = [-30, -20, -10, 10, 20, 30];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      {/* Horizonte y escala de cabeceo: giran con la inclinación */}
      <g transform={`rotate(${-e.inclinacion} ${CX} ${CY})`}>
        <g transform={`translate(0 ${yCabeceo(e.cabeceo)})`}>
          <line x1={-W} x2={2 * W} y1={CY} y2={CY} stroke="#fff" strokeWidth="1.5" opacity="0.9" />
          {peldanos.map((g) => {
            const y = CY - yCabeceo(g);
            const a = g % 10 === 0 ? 34 : 18;
            return (
              <g key={g}>
                <line x1={CX - a} x2={CX + a} y1={y} y2={y} stroke="#fff" strokeWidth="1.5" />
                {g % 10 === 0 && <text x={CX + a + 6} y={y + 4} className="fill-white text-[11px]">{Math.abs(g)}</text>}
              </g>
            );
          })}
        </g>
        {/* Puntero de inclinación */}
        <path d={`M${CX} ${CY - 118} l-7 12 h14 Z`} fill="#fff" />
      </g>
      {/* Arco de inclinación fijo */}
      {arco.map((g) => (
        <line key={g} x1={CX} x2={CX} y1={CY - 132} y2={CY - (Math.abs(g) % 30 === 0 ? 146 : 140)} stroke="#fff" strokeWidth="2" transform={`rotate(${g} ${CX} ${CY})`} />
      ))}
      <path d={`M${CX} ${CY - 132} l-6 -10 h12 Z`} fill="#fff" />
      {/* Símbolo del helicóptero */}
      <path d={`M${CX - 80} ${CY} h52 l12 12 l12 -12 h52`} fill="none" stroke="#d4af37" strokeWidth="5" strokeLinejoin="round" />
      <circle cx={CX} cy={CY} r="3" fill="#d4af37" />

      <Cinta x={8} valor={e.ias} sel={ap.ap && ap.ias ? sel.iasSel : null} paso={10} px={3} lado="izq" unidad="KT" />
      <Cinta x={W - 74 - 34} valor={e.altFt} sel={sel.altSel} paso={100} px={0.35} lado="der" unidad="FT" />
      {/* VS */}
      <g>
        <rect x={W - 38} y={CY - 70} width="32" height="140" fill="#0a1220" opacity="0.55" />
        <line x1={W - 36} x2={W - 8} y1={CY} y2={CY - Math.max(-65, Math.min(65, e.vs * 0.032))} stroke="#fff" strokeWidth="3" />
        <text x={W - 22} y={CY + 88} textAnchor="middle" className="fill-white text-[11px] tabular-nums">{Math.round(e.vs / 10) * 10}</text>
        <text x={W - 22} y={CY - 76} textAnchor="middle" className="fill-[#7d8da3] text-[9px]">VS</text>
      </g>
      {/* Rumbo */}
      <rect x={CX - 32} y={H - 36} width="64" height="26" rx="4" fill="#000" stroke="#fff8" />
      <text x={CX} y={H - 17} textAnchor="middle" className="fill-white font-display text-[16px] font-bold tabular-nums">{tres(e.rumboV - decl)}°</text>
      {/* Modos del AP: verde = capturado, blanco = armado */}
      <rect x={CX - 150} y={4} width="300" height="22" rx="4" fill="#000" opacity="0.6" />
      <g className="font-display text-[13px] font-bold">
        <text x={CX - 110} y={20} textAnchor="middle" fill={VERDE}>{m.lat}</text>
        <text x={CX - 55} y={20} textAnchor="middle" fill="#fff">{m.armado}</text>
        <text x={CX + 10} y={20} textAnchor="middle" fill={VERDE}>{m.vert}</text>
        <text x={CX + 65} y={20} textAnchor="middle" fill={VERDE}>{m.ias}</text>
        <text x={CX + 120} y={20} textAnchor="middle" fill={ap.ap ? VERDE : "#7d8da3"}>{ap.ap ? "AP" : "AP OFF"}</text>
      </g>
      {ap.aviso && (
        <text x={CX} y={46} textAnchor="middle" fill={AMBAR} className="font-display text-[14px] font-bold">{ap.aviso}</text>
      )}
      {e.enTierra && <text x={CX} y={CY + 60} textAnchor="middle" className="fill-white text-[12px]" opacity="0.8">En tierra</text>}
      <text x={CX} y={H - 42} textAnchor="middle" className="fill-white text-[10px]" opacity="0.7">Solo para simulación</text>
    </svg>
  );
}
