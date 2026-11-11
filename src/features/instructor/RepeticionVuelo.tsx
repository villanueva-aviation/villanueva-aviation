import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Pause, Play } from "lucide-react";
import type { Idioma } from "./idiomaInstructor";
import { CAMPO_PUNTO as C, puntoEn, type FaseMapa, type Grabacion } from "./recorrido";

const W = 600;
const H = 130;
const ARRIBA = 8;
const ABAJO = 118;
const SOMBRA: Record<FaseMapa, string> = {
  rodaje: "#13233a", despegue: "#18304a", zona: "#13233a", circuitos: "#13233a", aterrizaje: "#18304a", "rodaje-regreso": "#13233a",
};
const VELOCIDADES = [1, 4, 16] as const;
const VOZ_SEG = 20;

const T = {
  es: { altitud: "Altitud", velocidad: "Velocidad", rumbo: "Rumbo", inclinacion: "Inclinación", bola: "Bola", instructor: "Instructor", play: "Reproducir", pausa: "Pausa", perfil: "Perfil del vuelo: altitud en blanco, velocidad en azul. Arrastra para moverte." },
  en: { altitud: "Altitude", velocidad: "Airspeed", rumbo: "Heading", inclinacion: "Bank", bola: "Ball", instructor: "Instructor", play: "Play", pausa: "Pause", perfil: "Flight profile: altitude in white, airspeed in blue. Drag to move." },
};

export const mmss = (seg: number) => `${Math.floor(Math.max(0, seg) / 60)}:${String(Math.floor(Math.max(0, seg) % 60)).padStart(2, "0")}`;

/** El perfil del vuelo es la barra de la repetición: se arrastra o se reproduce, y abajo van los instrumentos de ese instante. */
export function RepeticionVuelo({ grabacion, cursorT, alMover, idioma }: { grabacion: Grabacion; cursorT: number; alMover: (t: number) => void; idioma: Idioma }) {
  const t = T[idioma];
  const ps = grabacion.puntos;
  const t0 = ps[0]?.[C.t] ?? 0;
  const t1 = ps[ps.length - 1]?.[C.t] ?? 1;
  const dur = t1 - t0 || 1;
  const [vel, setVel] = useState<0 | (typeof VELOCIDADES)[number]>(0);
  const [ultimaVel, setUltimaVel] = useState<(typeof VELOCIDADES)[number]>(4);
  const cursor = useRef(cursorT);
  cursor.current = cursorT;
  const mover = useRef(alMover);
  mover.current = alMover;

  useEffect(() => {
    if (!vel) return;
    let antes = performance.now();
    let id = requestAnimationFrame(function paso(ahora) {
      const sig = cursor.current + ((ahora - antes) / 1000) * vel;
      antes = ahora;
      if (sig >= t1) {
        mover.current(t1);
        setVel(0);
        return;
      }
      mover.current(sig);
      id = requestAnimationFrame(paso);
    });
    return () => cancelAnimationFrame(id);
  }, [vel, t1]);

  const x = (tt: number) => ((tt - t0) / dur) * W;
  const escala = (k: number) => {
    const vs = ps.map((p) => p[k]);
    const lo = Math.min(...vs);
    const hi = Math.max(...vs);
    return (v: number) => ABAJO - ((v - lo) / (hi - lo || 1)) * (ABAJO - ARRIBA);
  };
  const yAlt = escala(C.altitud);
  const yVel = escala(C.velocidad);
  const linea = (k: number, y: (v: number) => number) => ps.map((p) => `${x(p[C.t]).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");

  const desdePuntero = (ev: PointerEvent<SVGSVGElement>) => {
    const r = ev.currentTarget.getBoundingClientRect();
    alMover(t0 + Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)) * dur);
  };

  const p = puntoEn(ps, cursorT);
  const voz = [...grabacion.voz].reverse().find((v) => v.t <= cursorT && v.t >= cursorT - VOZ_SEG);
  const lectura = (nombre: string, valor: string) => (
    <div className="flex-1 rounded-lg bg-navy-800/70 px-2 py-1.5 text-center">
      <div className="text-[11px] text-white/50">{nombre}</div>
      <div className="font-semibold tabular-nums text-white">{valor}</div>
    </div>
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-ew-resize touch-none select-none"
        role="slider"
        aria-label={t.perfil}
        aria-valuemin={0}
        aria-valuemax={Math.round(dur)}
        aria-valuenow={Math.round(cursorT - t0)}
        onPointerDown={(ev) => {
          ev.currentTarget.setPointerCapture(ev.pointerId);
          desdePuntero(ev);
        }}
        onPointerMove={(ev) => ev.buttons && desdePuntero(ev)}
      >
        {grabacion.fases.map((f, i) => (
          <rect key={i} x={x(f.inicio)} y={0} width={Math.max(0, x(f.fin) - x(f.inicio))} height={H} fill={i % 2 ? SOMBRA[f.fase] : "#0f1d31"} />
        ))}
        <polyline fill="none" stroke="#5aa9e6" strokeWidth="1.2" opacity="0.8" points={linea(C.velocidad, yVel)} />
        <polyline fill="none" stroke="#e6e8eb" strokeWidth="1.6" points={linea(C.altitud, yAlt)} />
        {grabacion.errores.map((e) =>
          e.inicio === null ? null : <rect key={e.n} x={x(e.inicio) - 1.5} y={ABAJO + 2} width={3} height={H - ABAJO - 2} fill="#ff4d4d" />,
        )}
        <line x1={x(cursorT)} x2={x(cursorT)} y1={0} y2={H} stroke="#d4af37" strokeWidth="2" />
        <circle cx={x(cursorT)} cy={p ? yAlt(p[C.altitud]) : H / 2} r="4" fill="#d4af37" />
      </svg>

      <div className="mt-2 flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => (vel ? setVel(0) : setVel(ultimaVel))}
          className="inline-flex items-center gap-1 rounded-lg bg-gold-400 px-3 py-1.5 font-semibold text-navy-950"
          aria-label={vel ? t.pausa : t.play}
        >
          {vel ? <Pause size={14} /> : <Play size={14} />}
        </button>
        {VELOCIDADES.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={ultimaVel === v}
            onClick={() => {
              setUltimaVel(v);
              if (vel) setVel(v);
            }}
            className={`rounded-lg px-2 py-1 ${ultimaVel === v ? "bg-white/15 text-white" : "text-white/50 hover:text-white"}`}
          >
            ×{v}
          </button>
        ))}
        <span className="ml-auto tabular-nums text-white/60">
          {mmss(cursorT - t0)} / {mmss(dur)}
        </span>
      </div>

      {p && (
        <div className="mt-2 flex flex-wrap gap-2 sm:flex-nowrap">
          {lectura(t.altitud, `${Math.round(p[C.altitud]).toLocaleString("en-US")} ft`)}
          {lectura(t.velocidad, `${Math.round(p[C.velocidad])} kt`)}
          {lectura(t.rumbo, `${String(Math.round(p[C.rumbo]) % 360).padStart(3, "0")}°`)}
          {lectura(t.inclinacion, `${Math.round(Math.abs(p[C.inclinacion]))}°`)}
          {lectura(t.bola, p[C.bola].toFixed(2))}
        </div>
      )}
      <p className="mt-2 min-h-[2.5rem] rounded-lg border-l-2 border-gold-400 bg-navy-800/50 px-3 py-2 text-sm text-white/80">
        {voz ? (
          <>
            <span className="text-white/50">
              {t.instructor} ({mmss(voz.t - t0)}):
            </span>{" "}
            «{voz.texto}»
          </>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </p>
    </div>
  );
}
