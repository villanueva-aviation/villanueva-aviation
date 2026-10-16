import { useEffect, useId, useState } from "react";
import { RosaHSI, VERDE, textoRumbo } from "./HSI";

// Pantalla de vuelo principal de cabina de cristal, dibujo propio (sin marco, botones ni marca).
// Horizonte artificial al centro, cintas de velocidad y altitud a los lados y el HSI abajo.

const ANCHO = 480;
const ALTO = 400;
const AX = 240; // centro del horizonte
const AY = 145;
const PX_POR_GRADO = 5; // cabeceo
const PX_POR_KT = 4;
const PX_POR_FT = 0.4;
const ESCALA_HSI = 0.62;
const HSI_Y = 318;

function horaUtc() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

function enArco(grados: number, radio: number) {
  const r = (grados * Math.PI) / 180;
  return { x: AX + radio * Math.sin(r), y: AY - radio * Math.cos(r) };
}

export function PFD({
  rumbo,
  desviacion,
  marcador,
  alabeo,
  cabeceo = 2.5,
  velocidad = 110,
  altitud = 4500,
  curso = 360,
}: {
  rumbo: number;
  desviacion: number;
  marcador: number;
  alabeo: number;
  cabeceo?: number;
  velocidad?: number;
  altitud?: number;
  curso?: number;
}) {
  const id = useId();
  const [utc, setUtc] = useState(horaUtc);

  useEffect(() => {
    const reloj = window.setInterval(() => setUtc(horaUtc()), 1000);
    return () => window.clearInterval(reloj);
  }, []);

  const peldanos = [-20, -15, -10, -5, 5, 10, 15, 20];
  const marcasVel = [];
  for (let kt = Math.floor((velocidad - 30) / 5) * 5; kt <= velocidad + 30; kt += 5) {
    const y = AY - (kt - velocidad) * PX_POR_KT;
    marcasVel.push(<line key={kt} x1={kt % 10 === 0 ? 72 : 78} y1={y} x2={86} y2={y} stroke="#fff" strokeWidth="1.5" />);
    if (kt % 10 === 0) marcasVel.push(<text key={`t${kt}`} x={66} y={y + 5} textAnchor="end" className="fill-white text-[14px] font-semibold tabular-nums">{kt}</text>);
  }
  const marcasAlt = [];
  for (let ft = Math.floor((altitud - 300) / 100) * 100; ft <= altitud + 300; ft += 100) {
    const y = AY - (ft - altitud) * PX_POR_FT;
    marcasAlt.push(<line key={ft} x1={394} y1={y} x2={406} y2={y} stroke="#fff" strokeWidth="1.5" />);
    marcasAlt.push(<text key={`t${ft}`} x={412} y={y + 5} className="fill-white text-[14px] font-semibold tabular-nums">{ft}</text>);
  }

  const arcoInicio = enArco(-60, 105);
  const arcoFin = enArco(60, 105);
  const rumboTexto = textoRumbo(rumbo);

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`Pantalla de vuelo: rumbo ${rumboTexto}, alabeo ${Math.round(Math.abs(alabeo))} grados ${alabeo >= 0 ? "a la derecha" : "a la izquierda"}, aguja de curso desviada ${Math.abs(desviacion).toFixed(0)} puntos ${desviacion >= 0 ? "a la derecha" : "a la izquierda"}`}
    >
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d3f86" />
          <stop offset="1" stopColor="#3f8ee0" />
        </linearGradient>
        <linearGradient id={`${id}-tierra`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a2b" />
          <stop offset="1" stopColor="#4a2f15" />
        </linearGradient>
        <clipPath id={`${id}-pantalla`}>
          <rect width={ANCHO} height={ALTO} rx="18" />
        </clipPath>
        <clipPath id={`${id}-escalera`}>
          <rect x="130" y="60" width="220" height="150" />
        </clipPath>
        <clipPath id={`${id}-vel`}>
          <rect x="18" y="40" width="68" height="210" />
        </clipPath>
        <clipPath id={`${id}-alt`}>
          <rect x="394" y="40" width="72" height="210" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-pantalla)`}>
        {/* Horizonte artificial */}
        <g transform={`rotate(${-alabeo} ${AX} ${AY}) translate(0 ${cabeceo * PX_POR_GRADO})`}>
          <rect x="-400" y={AY - 900} width="1280" height="900" fill={`url(#${id}-cielo)`} />
          <rect x="-400" y={AY} width="1280" height="900" fill={`url(#${id}-tierra)`} />
          <line x1="-400" y1={AY} x2="880" y2={AY} stroke="#fff" strokeWidth="2" />
          <g clipPath={`url(#${id}-escalera)`}>
            {peldanos.map((p) => {
              const y = AY - p * PX_POR_GRADO;
              const largo = p % 10 === 0 ? 70 : 36;
              return (
                <g key={p}>
                  <line x1={AX - largo / 2} y1={y} x2={AX + largo / 2} y2={y} stroke="#fff" strokeWidth="1.6" />
                  {p % 10 === 0 && (
                    <>
                      <text x={AX - largo / 2 - 6} y={y + 4} textAnchor="end" className="fill-white text-[11px] font-semibold">{Math.abs(p)}</text>
                      <text x={AX + largo / 2 + 6} y={y + 4} className="fill-white text-[11px] font-semibold">{Math.abs(p)}</text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </g>

        {/* Escala de alabeo fija y puntero que gira con el horizonte */}
        <path d={`M${arcoInicio.x} ${arcoInicio.y} A105 105 0 0 1 ${arcoFin.x} ${arcoFin.y}`} fill="none" stroke="#fff" strokeWidth="1.6" />
        {[-60, -45, -30, -20, -10, 10, 20, 30, 45, 60].map((g) => {
          const largo = Math.abs(g) === 30 || Math.abs(g) === 60 ? 14 : 8;
          const a = enArco(g, 105);
          const b = enArco(g, 105 + largo);
          return <line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeWidth="1.8" />;
        })}
        <path d={`M${AX} ${AY - 106} l-7 -11 h14 Z`} fill="#fff" />
        <path d={`M${AX} ${AY - 104} l-8 13 h16 Z`} fill="#fff" stroke="#000" strokeWidth="0.8" transform={`rotate(${-alabeo} ${AX} ${AY})`} />

        {/* Símbolo del avión */}
        <g fill="#d4af37" stroke="#1a1204" strokeWidth="1.2">
          <path d={`M${AX - 92} ${AY - 3} h52 l10 10 h-8 l-6 -4 h-48 Z`} />
          <path d={`M${AX + 92} ${AY - 3} h-52 l-10 10 h8 l6 -4 h48 Z`} />
          <rect x={AX - 4} y={AY - 4} width="8" height="8" />
        </g>

        {/* Cinta de velocidad */}
        <rect x="18" y="40" width="68" height="210" fill="rgba(5,9,15,0.55)" />
        <g clipPath={`url(#${id}-vel)`}>{marcasVel}</g>
        <path d={`M20 ${AY - 15} h54 l10 15 l-10 15 h-54 Z`} fill="#05090f" stroke="#fff" strokeWidth="1.5" />
        <text x="70" y={AY + 7} textAnchor="end" className="fill-white font-display text-[19px] font-bold tabular-nums">{Math.round(velocidad)}</text>
        <text x="52" y="266" textAnchor="middle" className="fill-white/70 text-[11px] font-semibold">KT</text>

        {/* Cinta de altitud */}
        <rect x="394" y="40" width="72" height="210" fill="rgba(5,9,15,0.55)" />
        <g clipPath={`url(#${id}-alt)`}>{marcasAlt}</g>
        <path d={`M466 ${AY - 15} h-62 l-10 15 l10 15 h62 Z`} fill="#05090f" stroke="#fff" strokeWidth="1.5" />
        <text x="460" y={AY + 7} textAnchor="end" className="fill-white font-display text-[19px] font-bold tabular-nums">{Math.round(altitud)}</text>
        <text x="430" y="266" textAnchor="middle" className="fill-white/70 text-[11px] font-semibold">FT</text>

        {/* Barra superior */}
        <rect x="0" y="0" width={ANCHO} height="26" fill="#05090f" />
        <text x="14" y="18" className="font-display text-[13px] font-bold" fill={VERDE}>VOR1</text>
        <text x="60" y="18" className="text-[13px] font-semibold tabular-nums" fill={VERDE}>CRS {String(curso).padStart(3, "0")}°</text>
        <text x={ANCHO - 14} y="18" textAnchor="end" className="fill-white text-[13px] font-semibold tabular-nums">UTC {utc}</text>

        {/* HSI */}
        <rect x={AX - 30} y={HSI_Y - 122 * ESCALA_HSI - 30} width="60" height="22" rx="4" fill="#05090f" stroke="rgba(255,255,255,0.5)" />
        <text x={AX} y={HSI_Y - 122 * ESCALA_HSI - 14} textAnchor="middle" className="fill-white font-display text-[14px] font-bold tabular-nums">{rumboTexto}°</text>
        <g transform={`translate(${AX - 160 * ESCALA_HSI} ${HSI_Y - 160 * ESCALA_HSI}) scale(${ESCALA_HSI})`}>
          <RosaHSI rumbo={rumbo} desviacion={desviacion} curso={curso} marcador={marcador} />
        </g>
        <path d={`M${AX - 6} ${HSI_Y - 122 * ESCALA_HSI - 6} h12 l-6 8 Z`} fill="#fff" />
      </g>
      <rect x="0.5" y="0.5" width={ANCHO - 1} height={ALTO - 1} rx="18" fill="none" stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}
