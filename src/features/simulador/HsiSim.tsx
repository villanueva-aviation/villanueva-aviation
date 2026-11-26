// HSI grande del simulador: la rosa de RosaHSI con fuente VOR1 o GPS, segunda aguja (NAV2) y datos en las esquinas.
import { MAGENTA, RosaHSI, VERDE } from "../landing/HSI";
import type { Estado, Viento } from "./modelo.ts";
import { puntos, type Guia, type LecturaNav } from "./radios.ts";

const tres = (n: number) => String(Math.round(((n % 360) + 360) % 360) || 360).padStart(3, "0");

export function HsiSim(props: {
  e: Estado;
  decl: number;
  fuente: "vor" | "gps";
  crs: number;
  hdg: number;
  nav1: LecturaNav | null;
  nav2: LecturaNav | null;
  gps: { ident: string; guia: Guia } | null;
  viento: Viento;
  onFuente: () => void;
}) {
  const { e, decl, fuente, crs, hdg, nav1, nav2, gps, viento, onFuente } = props;
  const rumbo = (((e.rumboV - decl) % 360) + 360) % 360;
  const enGps = fuente === "gps";
  const curso = enGps ? (gps ? gps.guia.curso - decl : crs) : crs;
  const desviacion = enGps ? (gps ? puntos(gps.guia, "gps") : 0) : nav1 ? puntos({ curso: 0, xtkNm: 0, distNm: 0 }, "vor", nav1.desvGrados) : 0;
  const desde = enGps ? (gps ? false : null) : nav1 ? nav1.desde : null;
  const brg2 = nav2 ? (nav2.radial + 180) % 360 : null;
  const color = enGps ? MAGENTA : VERDE;
  const dist = enGps ? gps?.guia.distNm : nav1?.dmeNm;

  return (
    <svg viewBox="0 0 600 340" className="h-full w-full" role="img" aria-label={`HSI: rumbo ${tres(rumbo)}, curso ${tres(curso)}`}>
      <rect width="600" height="340" rx="10" fill="#000" />
      <g transform="translate(300 178) scale(1.1) translate(-160 -160)">
        <RosaHSI rumbo={rumbo} desviacion={desviacion} curso={curso} marcador={hdg} desde={desde} brg2={brg2} colorCurso={color} />
      </g>
      <rect x="262" y="4" width="76" height="28" rx="4" fill="#000" stroke="#fff8" />
      <text x="300" y="25" textAnchor="middle" className="fill-white font-display text-[18px] font-bold tabular-nums">{tres(rumbo)}°</text>
      <path d="M293 33 h14 l-7 9 Z" fill="#fff" />

      <g className="text-[14px] font-bold tabular-nums">
        <text x="16" y="26" fill={color}>{enGps ? `GPS ${gps?.ident ?? "----"}` : `VOR1 ${nav1?.vor.ident ?? "----"}`}</text>
        <text x="16" y="46" fill={color}>CRS {tres(curso)}</text>
        <text x="16" y="66" fill="#fff">{enGps ? "DIS" : "DME"} {dist != null ? dist.toFixed(1) : "---.-"} NM</text>
        <text x="584" y="26" textAnchor="end" fill="#4cc9f0">HDG {tres(hdg)}</text>
        <text x="584" y="46" textAnchor="end" fill={MAGENTA}>BRG2 {nav2 ? `${nav2.vor.ident} ${tres(brg2!)}` : "---"}</text>
        <text x="16" y="330" fill="#7d8da3">GS {Math.round(e.gs)} KT</text>
        <text x="584" y="330" textAnchor="end" fill="#7d8da3">{viento.kt > 0 ? `Viento ${tres(viento.dir)}/${Math.round(viento.kt)}` : "Viento calma"}</text>
      </g>
      <g className="pointer-events-auto cursor-pointer" onClick={onFuente} role="button" aria-label="Cambiar la fuente de navegación entre VOR1 y GPS">
        <rect x="16" y="78" width="96" height="26" rx="4" fill="#16233a" stroke="#2b3a52" />
        <text x="64" y="96" textAnchor="middle" className="fill-white text-[12px] font-bold">VOR1 ⇄ GPS</text>
      </g>
    </svg>
  );
}
