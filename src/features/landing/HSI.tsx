import { useEffect, useRef, useState } from "react";
import { difAngulo } from "../home/navGeo";

/** Lleva un número hacia `objetivo` en `ms` con aceleración suave. `angular` toma el camino corto (355 → 005). */
export function useTransicion(objetivo: number, ms: number, angular = false) {
  const [valor, setValor] = useState(objetivo);
  const actual = useRef(objetivo);

  useEffect(() => {
    const desde = actual.current;
    const delta = angular ? difAngulo(desde, objetivo) : objetivo - desde;
    if (delta === 0) return;
    if (ms <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      actual.current = objetivo;
      setValor(objetivo);
      return;
    }
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      let v = desde + delta * e;
      if (angular) v = (v + 360) % 360;
      actual.current = v;
      setValor(v);
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [objetivo, ms, angular]);

  return valor;
}

const C = 160; // centro del instrumento
const R = 118; // radio de la rosa
const PASO_PUNTO = 15; // px por punto de desviación
export const VERDE = "#3ddc84"; // en cabina de cristal la aguja de VOR es verde (la de GPS, magenta)

const ETIQUETAS: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" };

interface PropsRosa {
  rumbo: number;
  desviacion: number;
  curso?: number;
  marcador: number;
}

/** El interior del HSI dibujado alrededor de (160, 160): rosa, marcador, aguja de curso y avión. Lo reusa el PFD. */
export function RosaHSI({ rumbo, desviacion, curso = 360, marcador }: PropsRosa) {
  const marcas = [];
  for (let g = 0; g < 360; g += 5) {
    const mayor = g % 10 === 0;
    marcas.push(
      <line key={g} x1={C} y1={C - R} x2={C} y2={C - R + (mayor ? 13 : 7)} stroke="rgba(255,255,255,0.75)" strokeWidth={mayor ? 2 : 1.2} transform={`rotate(${g} ${C} ${C})`} />,
    );
    if (g % 30 === 0) {
      marcas.push(
        <text key={`t${g}`} x={C} y={C - R + 32} textAnchor="middle" transform={`rotate(${g} ${C} ${C})`} className="fill-white font-display text-[17px] font-bold">
          {ETIQUETAS[g] ?? g / 10}
        </text>,
      );
    }
  }

  return (
    <g>
      <circle cx={C} cy={C} r={R + 4} fill="#0a1220" stroke="rgba(255,255,255,0.12)" />

      {/* Rosa: gira para que el rumbo actual quede arriba */}
      <g transform={`rotate(${-rumbo} ${C} ${C})`}>
        {marcas}
        {/* Marcador de rumbo seleccionado */}
        <path d={`M${C - 10} ${C - R - 3} h20 v-7 h-6 l-4 5 l-4 -5 h-6 Z`} fill="#d4af37" transform={`rotate(${marcador} ${C} ${C})`} />
      </g>

      {/* Aguja de curso VOR1 con barra de desviación */}
      <g transform={`rotate(${curso - rumbo} ${C} ${C})`}>
        {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((k) => (
          <circle key={k} cx={C + k * PASO_PUNTO} cy={C} r="3.4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        ))}
        {/* Punta (de -80 a -58), barra de desviación (-50 a 50) y cola (58 a 82), sin tapar las letras de la rosa */}
        <path d={`M${C} ${C - 80} l-11 15 h7 v7 h8 v-7 h7 Z`} fill={VERDE} />
        <rect x={C - 4} y={C + 58} width="8" height="24" fill={VERDE} />
        <rect x={C - 4 + desviacion * PASO_PUNTO} y={C - 50} width="8" height="100" rx="2" fill={VERDE} />
        {/* Indicador TO */}
        <path d={`M${C + 30} ${C - 40} l9 13 h-18 Z`} fill={VERDE} />
      </g>

      {/* Avión fijo al centro */}
      <path
        d={`M${C} ${C - 20} l3 12 l17 9 v5 l-17 -4 l-1 10 l6 5 v4 l-8 -2 l-8 2 v-4 l6 -5 l-1 -10 l-17 4 v-5 l17 -9 Z`}
        fill="#ffffff"
      />
    </g>
  );
}

export function textoRumbo(rumbo: number) {
  return String(Math.round(rumbo) % 360 || 360).padStart(3, "0");
}

/**
 * HSI de cabina de cristal (dibujo propio, sin marca): rosa que gira con el rumbo, aguja de curso
 * VOR1 con su barra de desviación, indicador TO y marcador de rumbo.
 */
export function HSI({ rumbo, desviacion, curso = 360, marcador }: PropsRosa) {
  const rumboTexto = textoRumbo(rumbo);

  return (
    <svg
      viewBox="0 0 320 340"
      className="h-auto w-full"
      role="img"
      aria-label={`HSI: rumbo ${rumboTexto} grados, curso ${curso}, aguja desviada ${Math.abs(desviacion).toFixed(0)} puntos ${desviacion >= 0 ? "a la derecha" : "a la izquierda"}`}
    >
      <rect x="0" y="0" width="320" height="340" rx="22" fill="#05090f" />

      {/* Lectura del rumbo */}
      <rect x={C - 34} y="6" width="68" height="26" rx="5" fill="#05090f" stroke="rgba(255,255,255,0.45)" />
      <text x={C} y="25" textAnchor="middle" className="fill-white font-display text-[16px] font-bold tabular-nums">
        {rumboTexto}°
      </text>
      <path d={`M${C - 7} 34 L${C + 7} 34 L${C} 44 Z`} fill="#ffffff" />

      <g transform="translate(0 16)">
        <RosaHSI rumbo={rumbo} desviacion={desviacion} curso={curso} marcador={marcador} />
      </g>

      {/* Datos */}
      <text x="16" y="324" className="font-display text-[13px] font-bold" fill={VERDE}>
        VOR1
      </text>
      <text x="304" y="324" textAnchor="end" className="text-[13px] font-semibold tabular-nums" fill={VERDE}>
        CRS {String(curso).padStart(3, "0")}°
      </text>
    </svg>
  );
}
