// Navegador: mapa con rumbo arriba, escala 5/10/20/40 NM, VOR, aeropuertos, radial seleccionado,
// línea GPS y un buscador para «Directo a».
import { useState } from "react";
import { aNm, aPantalla } from "../home/navGeo.ts";
import { MAGENTA } from "../landing/HSI";
import { buscar, type AeropuertoSim, type DatosPais } from "./datos.ts";
import type { Estado } from "./modelo.ts";
import type { LecturaNav } from "./radios.ts";

const ESCALAS = [5, 10, 20, 40];
const W = 300;
const H = 260;
const CENTRO = { x: W / 2, y: H * 0.62 };

export type Destino = { lat: number; lon: number; ident: string };

export function Navegador(props: {
  e: Estado;
  datos: DatosPais;
  nav1: LecturaNav | null;
  obs: number;
  gps: Destino | null;
  onDirecto: (d: Destino | null) => void;
}) {
  const { e, datos, nav1, obs, gps, onDirecto } = props;
  const [escala, setEscala] = useState(1);
  const [buscando, setBuscando] = useState(false);
  const [q, setQ] = useState("");
  const rango = ESCALAS[escala];
  const pxPorNm = (H * 0.58) / rango;
  const yo = { x: 0, y: 0 };
  const pantalla = (lat: number, lon: number) => aPantalla(aNm(lat, lon, e.lat, e.lon), yo, e.track, CENTRO, pxPorNm);
  const visible = (p: { x: number; y: number }) => p.x > -10 && p.x < W + 10 && p.y > -10 && p.y < H + 10;

  const vors = datos.vors.map((v) => ({ v, p: pantalla(v.lat, v.lon) })).filter(({ p }) => visible(p));
  const aeropuertos = datos.aeropuertos.map((a) => ({ a, p: pantalla(a.lat, a.lon) })).filter(({ p }) => visible(p)).slice(0, 80);

  // Radial seleccionado: línea por el VOR sintonizado con el curso verdadero (OBS + declinación).
  let radial = null;
  if (nav1) {
    const c = pantalla(nav1.vor.lat, nav1.vor.lon);
    const ang = ((obs + nav1.vor.decl - e.track) * Math.PI) / 180;
    const L = 2000;
    radial = <line x1={c.x - Math.sin(ang) * L} y1={c.y + Math.cos(ang) * L} x2={c.x + Math.sin(ang) * L} y2={c.y - Math.cos(ang) * L} stroke="#3ddc84" strokeWidth="1.5" strokeDasharray="6 4" />;
  }
  const destino = gps ? pantalla(gps.lat, gps.lon) : null;
  const res = buscando ? buscar(datos, q) : null;
  const elegir = (d: { lat: number; lon: number; ident: string }) => {
    onDirecto(d);
    setBuscando(false);
    setQ("");
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#1f2b3d] bg-[#0b1a14]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full lg:h-[32vh]" role="img" aria-label="Mapa de navegación con el rumbo hacia arriba">
        <rect width={W} height={H} fill="#0b1a14" />
        <circle cx={CENTRO.x} cy={CENTRO.y} r={pxPorNm * rango} fill="none" stroke="#ffffff22" />
        <circle cx={CENTRO.x} cy={CENTRO.y} r={(pxPorNm * rango) / 2} fill="none" stroke="#ffffff14" />
        <text x={CENTRO.x + 4} y={CENTRO.y - pxPorNm * rango + 12} className="fill-[#7d8da3] text-[10px]">{rango} NM</text>
        {radial}
        {destino && <line x1={CENTRO.x} y1={CENTRO.y} x2={destino.x} y2={destino.y} stroke={MAGENTA} strokeWidth="2" />}
        {aeropuertos.map(({ a, p }) => (
          <g key={a.icao}>
            <circle cx={p.x} cy={p.y} r={a.helipuerto ? 2.5 : 4} fill="none" stroke={a.helipuerto ? "#9fb0c6" : "#4cc9f0"} strokeWidth="1.5" />
            {rango <= 20 && !a.helipuerto && <text x={p.x + 6} y={p.y + 3} className="fill-[#4cc9f0] text-[9px]">{a.icao}</text>}
          </g>
        ))}
        {vors.map(({ v, p }) => (
          <g key={v.ident + v.mhz}>
            <path d={`M${p.x - 6} ${p.y} l3 -5 h6 l3 5 l-3 5 h-6 Z`} fill="none" stroke="#3ddc84" strokeWidth="1.5" />
            <text x={p.x + 9} y={p.y + 4} className="fill-[#3ddc84] text-[10px] font-bold">{v.ident} {v.mhz.toFixed(2)}</text>
          </g>
        ))}
        <path d={`M${CENTRO.x} ${CENTRO.y - 9} l6 15 l-6 -4 l-6 4 Z`} fill="#fff" />
        <text x="6" y="14" className="fill-[#7d8da3] text-[10px]">TRK {String(Math.round(e.track) % 360 || 360).padStart(3, "0")}° V</text>
      </svg>
      <div className="absolute right-1 top-1 flex gap-1">
        <button type="button" aria-label="Acercar el mapa" onClick={() => setEscala((s) => Math.max(0, s - 1))} className="h-7 w-7 rounded bg-[#16233a] text-white">−</button>
        <button type="button" aria-label="Alejar el mapa" onClick={() => setEscala((s) => Math.min(ESCALAS.length - 1, s + 1))} className="h-7 w-7 rounded bg-[#16233a] text-white">+</button>
      </div>
      <div className="flex items-center gap-1 border-t border-[#1f2b3d] p-1.5">
        <button type="button" onClick={() => setBuscando((b) => !b)} className="rounded bg-[#16233a] px-2 py-1 text-xs font-bold text-white">Directo a</button>
        {gps && (
          <>
            <span className="text-xs font-bold" style={{ color: MAGENTA }}>{gps.ident}</span>
            <button type="button" onClick={() => onDirecto(null)} className="ml-auto rounded px-2 py-1 text-xs text-[#9fb0c6]">Cancelar</button>
          </>
        )}
      </div>
      {res && (
        <div className="border-t border-[#1f2b3d] p-1.5">
          <input autoFocus value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="VOR o aeropuerto (GDL, MMGL, León…)" className="w-full rounded bg-[#05090f] px-2 py-1 text-sm text-white outline-none" />
          <ul className="mt-1 max-h-40 overflow-auto text-xs">
            {res.vors.slice(0, 8).map((v) => (
              <li key={`v${v.ident}${v.mhz}`}><button type="button" onClick={() => elegir({ lat: v.lat, lon: v.lon, ident: v.ident })} className="w-full px-1 py-1 text-left text-[#3ddc84] hover:bg-[#16233a]">{v.ident} · {v.nombre} (VOR)</button></li>
            ))}
            {res.aeropuertos.slice(0, 8).map((a: AeropuertoSim) => (
              <li key={`a${a.icao}`}><button type="button" onClick={() => elegir({ lat: a.lat, lon: a.lon, ident: a.icao })} className="w-full px-1 py-1 text-left text-[#4cc9f0] hover:bg-[#16233a]">{a.icao} · {a.nombre}</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
