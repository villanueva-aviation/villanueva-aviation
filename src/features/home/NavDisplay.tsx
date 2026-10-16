import { useEffect, useRef, useState } from "react";
import { aNm, aPantalla, difAngulo, rumbo, type PuntoNm } from "./navGeo";

// Coordenadas copiadas de src/data/rutas.json (Rutas de México): no importamos el archivo entero
// porque el inicio se carga de inmediato y ese JSON pesa ~40 KB.
const AEROPUERTOS: Record<string, { nombre: string; lat: number; lon: number }> = {
  MMGL: { nombre: "Guadalajara", lat: 20.5197, lon: -103.3059 },
  MMPR: { nombre: "Puerto Vallarta", lat: 20.6813, lon: -105.2522 },
  MMZO: { nombre: "Manzanillo", lat: 19.1455, lon: -104.5603 },
  MMAS: { nombre: "Aguascalientes", lat: 21.7017, lon: -102.318 },
  MMLO: { nombre: "Del Bajío", lat: 20.9923, lon: -101.4799 },
};

/** Triángulo del Paquete 1: Guadalajara → Puerto Vallarta → Manzanillo → Guadalajara. */
const RECORRIDO = ["MMGL", "MMPR", "MMZO", "MMGL"];

const LAT0 = 20.3;
const LON0 = -103.8;
const PUNTOS: Record<string, PuntoNm> = Object.fromEntries(
  Object.entries(AEROPUERTOS).map(([icao, a]) => [icao, aNm(a.lat, a.lon, LAT0, LON0)]),
);

const TRAMOS = RECORRIDO.slice(1).map((destino, i) => {
  const a = PUNTOS[RECORRIDO[i]];
  const b = PUNTOS[destino];
  return { origen: RECORRIDO[i], destino, a, b, largo: Math.hypot(b.x - a.x, b.y - a.y), curso: rumbo(a, b) };
});
const TOTAL_NM = TRAMOS.reduce((s, t) => s + t.largo, 0);

const GS_KT = 120; // velocidad que se muestra
const NM_POR_SEG = 7.5; // velocidad de la animación (acelerada)
const GIRO_NM = 9; // distancia en la que el rumbo pasa suavemente al del tramo nuevo

// Pantalla: el avión abajo al centro, el arco de rumbos a RANGO_NM.
const ANCHO = 600;
const ALTO = 470;
const CENTRO = { x: 300, y: 400 };
const RADIO = 320;
const RANGO_NM = 80;
const ESCALA = RADIO / RANGO_NM;

function estado(nm: number) {
  let resto = ((nm % TOTAL_NM) + TOTAL_NM) % TOTAL_NM;
  let i = 0;
  while (resto > TRAMOS[i].largo) {
    resto -= TRAMOS[i].largo;
    i++;
  }
  const t = TRAMOS[i];
  const f = resto / t.largo;
  const avion = { x: t.a.x + (t.b.x - t.a.x) * f, y: t.a.y + (t.b.y - t.a.y) * f };
  const previo = TRAMOS[(i + TRAMOS.length - 1) % TRAMOS.length].curso;
  const mezcla = Math.min(1, resto / GIRO_NM);
  const suave = mezcla * mezcla * (3 - 2 * mezcla);
  const rumboAvion = (previo + difAngulo(previo, t.curso) * suave + 360) % 360;
  return { tramo: t, indice: i, avion, rumbo: rumboAvion, restanteNm: t.largo - resto };
}

function punto(p: PuntoNm) {
  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}

function enArco(gradosRel: number, radio: number): PuntoNm {
  const r = (gradosRel * Math.PI) / 180;
  return { x: CENTRO.x + radio * Math.sin(r), y: CENTRO.y - radio * Math.cos(r) };
}

function etiquetaRumbo(g: number) {
  return ({ 0: "N", 90: "E", 180: "S", 270: "W" } as Record<number, string>)[g] ?? String(g / 10);
}

/**
 * Pantalla de navegación estilo cabina para la portada: un avión recorre una ruta real del
 * Paquete 1 con el mapa girando "track up". Con movimiento reducido se queda en un cuadro fijo.
 */
export function NavDisplay() {
  const [nm, setNm] = useState(52);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    let cuadro = 0;
    let previo = performance.now();
    const observador = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    if (raiz.current) observador.observe(raiz.current);
    const paso = (ahora: number) => {
      const dt = Math.min(0.1, (ahora - previo) / 1000);
      previo = ahora;
      if (visible) setNm((v) => v + dt * NM_POR_SEG);
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
    };
  }, []);

  const { tramo, indice, avion, rumbo: hdg, restanteNm } = estado(nm);
  const pantalla = (p: PuntoNm) => aPantalla(p, avion, hdg, CENTRO, ESCALA);
  const rutaPantalla = RECORRIDO.map((icao) => pantalla(PUNTOS[icao]));

  const marcas = [];
  for (let g = 0; g < 360; g += 5) {
    const rel = difAngulo(hdg, g);
    if (Math.abs(rel) > 58) continue;
    const mayor = g % 10 === 0;
    const a = enArco(rel, RADIO);
    const b = enArco(rel, RADIO - (mayor ? 14 : 8));
    marcas.push(<line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.55)" strokeWidth={mayor ? 1.6 : 1} />);
    if (g % 30 === 0) {
      const t = enArco(rel, RADIO - 30);
      marcas.push(
        <text key={`t${g}`} x={t.x} y={t.y} transform={`rotate(${rel} ${t.x} ${t.y})`} textAnchor="middle" dominantBaseline="middle" className="fill-white/75 font-display text-[15px] font-semibold">
          {etiquetaRumbo(g)}
        </text>,
      );
    }
  }

  const arco = (radio: number, abre: number) => {
    const a = enArco(-abre, radio);
    const b = enArco(abre, radio);
    return `M${punto(a)} A${radio} ${radio} 0 0 1 ${punto(b)}`;
  };

  return (
    <figure ref={raiz} className="relative">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#03080f] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:p-3">
        <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]" />
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="block h-auto w-full" role="img" aria-label={`Pantalla de navegación: vuelo de ${AEROPUERTOS[tramo.origen].nombre} a ${AEROPUERTOS[tramo.destino].nombre}`}>
          <defs>
            <clipPath id="nd-mapa">
              <circle cx={CENTRO.x} cy={CENTRO.y} r={RADIO - 2} />
            </clipPath>
            <radialGradient id="nd-brillo" cx="50%" cy="85%" r="75%">
              <stop offset="0%" stopColor="rgba(212,175,55,0.10)" />
              <stop offset="100%" stopColor="rgba(212,175,55,0)" />
            </radialGradient>
          </defs>

          <rect width={ANCHO} height={ALTO} fill="url(#nd-brillo)" />

          {/* Anillos de distancia */}
          {[20, 40, 60].map((nmAnillo) => {
            const r = nmAnillo * ESCALA;
            const etiqueta = enArco(-62, r);
            return (
              <g key={nmAnillo}>
                <path d={arco(r, 70)} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 6" />
                <text x={etiqueta.x - 6} y={etiqueta.y} textAnchor="end" className="fill-white/40 text-[11px] tabular-nums">
                  {nmAnillo}
                </text>
              </g>
            );
          })}

          {/* Mapa: ruta y aeropuertos */}
          <g clipPath="url(#nd-mapa)">
            {TRAMOS.map((_, i) => {
              const a = rutaPantalla[i];
              const b = rutaPantalla[i + 1];
              const activo = i === indice;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={activo ? "#d4af37" : "rgba(212,175,55,0.35)"}
                  strokeWidth={activo ? 2.5 : 1.5}
                  strokeDasharray={activo ? undefined : "6 6"}
                />
              );
            })}
            {Object.entries(PUNTOS).map(([icao, p]) => {
              const s = pantalla(p);
              const destino = icao === tramo.destino;
              const enRuta = RECORRIDO.includes(icao);
              return (
                <g key={icao}>
                  <circle cx={s.x} cy={s.y} r={destino ? 6 : 4.5} fill="#03080f" stroke={enRuta ? "#d4af37" : "rgba(255,255,255,0.5)"} strokeWidth={destino ? 2.2 : 1.4} />
                  <text x={s.x + 11} y={s.y + 4} className={`font-display text-[13px] font-semibold ${destino ? "fill-gold-400" : "fill-white/60"}`}>
                    {icao}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Arco de rumbos */}
          <path d={arco(RADIO, 58)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
          {marcas}

          {/* Línea de referencia y lectura del rumbo */}
          <path d={`M${CENTRO.x - 7} ${CENTRO.y - RADIO - 12} L${CENTRO.x + 7} ${CENTRO.y - RADIO - 12} L${CENTRO.x} ${CENTRO.y - RADIO - 1} Z`} fill="#d4af37" />
          <rect x={CENTRO.x - 34} y={CENTRO.y - RADIO - 46} width="68" height="28" rx="6" fill="#03080f" stroke="rgba(255,255,255,0.35)" />
          <text x={CENTRO.x} y={CENTRO.y - RADIO - 27} textAnchor="middle" className="fill-white font-display text-[17px] font-bold tabular-nums">
            {String(Math.round(hdg) % 360).padStart(3, "0")}°
          </text>

          {/* Avión */}
          <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
            <line x1={CENTRO.x} y1={CENTRO.y - 16} x2={CENTRO.x} y2={CENTRO.y + 16} />
            <line x1={CENTRO.x - 15} y1={CENTRO.y - 3} x2={CENTRO.x + 15} y2={CENTRO.y - 3} />
            <line x1={CENTRO.x - 7} y1={CENTRO.y + 13} x2={CENTRO.x + 7} y2={CENTRO.y + 13} />
          </g>

          {/* Datos de vuelo */}
          <g className="tabular-nums">
            <text x="22" y="34" className="fill-white/45 text-[12px] font-semibold tracking-wider">GS</text>
            <text x="48" y="34" className="fill-white font-display text-[17px] font-bold">{GS_KT}</text>
            <text x="22" y="58" className="fill-white/45 text-[12px]">KT · RANGO {RANGO_NM} NM</text>
            <text x={ANCHO - 22} y="34" textAnchor="end" className="fill-gold-400 font-display text-[17px] font-bold">{tramo.destino}</text>
            <text x={ANCHO - 22} y="58" textAnchor="end" className="fill-white text-[14px] font-semibold">
              {Math.round(restanteNm)} NM · {Math.round((restanteNm / GS_KT) * 60)} MIN
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 text-xs text-white/50">
        <span>
          <span className="text-white/80">{AEROPUERTOS[tramo.origen].nombre}</span> → <span className="text-white/80">{AEROPUERTOS[tramo.destino].nombre}</span>
        </span>
        <span>Pantalla ilustrativa con aeropuertos reales de las Rutas de México</span>
      </figcaption>
    </figure>
  );
}
