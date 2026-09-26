import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import {
  COMO_SE_VUELA,
  NOMBRE_ENTRADA,
  SECTORES,
  diferencia,
  entradaEspera,
  generarSituacion,
  norm,
  type Entrada,
  type Situacion,
} from "./esperas";

const ORO = "#d4af37";
const COLOR_SECTOR: Record<Entrada, string> = {
  directa: "rgba(255,255,255,0.10)",
  gota: "rgba(212,175,55,0.30)",
  paralela: "rgba(127,179,255,0.22)",
};
const R = 150;
const LARGO = 78; // del patrón, en unidades del SVG
const ANCHO = 54; // diámetro del giro: el viraje estándar es más ancho que el tramo de un minuto
const META_SEGUNDOS = 15;

const rad = (g: number) => (g * Math.PI) / 180;
/** Punto a `r` del centro en la dirección `rumbo` (0° arriba, sentido de las agujas del reloj). */
const punto = (rumbo: number, r: number): [number, number] => [r * Math.sin(rad(rumbo)), -r * Math.cos(rad(rumbo))];
const suma = (a: [number, number], b: [number, number]): [number, number] => [a[0] + b[0], a[1] + b[1]];
const p = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

function flecha(desde: [number, number], rumbo: number, tam: number) {
  const punta = suma(desde, punto(rumbo, tam));
  const a = suma(desde, punto(rumbo + 140, tam * 0.7));
  const b = suma(desde, punto(rumbo - 140, tam * 0.7));
  return `M ${p(punta)} L ${p(a)} L ${p(b)} Z`;
}

/** Sector en el mapa: la llegada viene desde el rumbo contrario al que llevas. */
function trazoSector(s: Situacion, desde: number, hasta: number) {
  const derecha = s.giros === "derecha";
  const aRumbo = (d: number) => norm((derecha ? s.alejamiento + d : s.alejamiento - d) + 180);
  const [ini, fin] = derecha ? [aRumbo(desde), aRumbo(hasta)] : [aRumbo(hasta), aRumbo(desde)];
  const ancho = hasta - desde;
  return { ini, fin, medio: norm(ini + ancho / 2), grande: ancho > 180 ? 1 : 0, ancho };
}

function Diagrama({ s, revelar }: { s: Situacion; revelar: boolean }) {
  const acercamiento = norm(s.alejamiento + 180);
  const ladoEspera = s.giros === "derecha" ? acercamiento + 90 : acercamiento - 90;
  const A: [number, number] = [0, 0];
  const B = punto(s.alejamiento, LARGO);
  const D = punto(ladoEspera, ANCHO);
  const C = suma(D, B);
  // Los dos giros de 180° van en el sentido de la espera (1 = horario, como el rumbo).
  const sentido = s.giros === "derecha" ? 1 : 0;
  const llegada = norm(s.rumbo + 180); // de dónde vienes
  const origen = punto(llegada, R - 8);
  const cercano = punto(llegada, 34);

  return (
    <svg viewBox="-170 -170 340 340" className="h-auto w-full max-w-sm" role="img"
      aria-label={`Espera con curso de alejamiento ${s.alejamiento} grados y giros a la ${s.giros}. Llegas con rumbo ${s.rumbo} grados.`}>
      <circle r={R} fill="rgba(11,29,52,0.6)" stroke="rgba(255,255,255,0.18)" />
      {[0, 90, 180, 270].map((g) => (
        <g key={g}>
          <line x1={punto(g, R - 8)[0]} y1={punto(g, R - 8)[1]} x2={punto(g, R)[0]} y2={punto(g, R)[1]} stroke="rgba(255,255,255,0.4)" />
          <text x={punto(g, R + 12)[0]} y={punto(g, R + 12)[1] + 4} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)">
            {g === 0 ? "N" : g}
          </text>
        </g>
      ))}

      {revelar &&
        SECTORES.map((sec) => {
          const t = trazoSector(s, sec.desde, sec.hasta);
          const correcto = sec.entrada === entradaEspera(s.rumbo, s.alejamiento, s.giros);
          const etiqueta = punto(t.medio, R * 0.8);
          return (
            <g key={sec.entrada}>
              <path d={`M 0 0 L ${p(punto(t.ini, R))} A ${R} ${R} 0 ${t.grande} 1 ${p(punto(t.fin, R))} Z`}
                fill={COLOR_SECTOR[sec.entrada]} stroke={correcto ? ORO : "rgba(255,255,255,0.15)"} strokeWidth={correcto ? 2 : 1} />
              <text x={etiqueta[0]} y={etiqueta[1] + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="white">
                {NOMBRE_ENTRADA[sec.entrada]}
              </text>
            </g>
          );
        })}

      {/* Patrón: inbound sobre el radial, alejamiento desplazado hacia el lado de la espera */}
      <path
        d={`M ${p(B)} L ${p(A)} A ${ANCHO / 2} ${ANCHO / 2} 0 0 ${sentido} ${p(D)} L ${p(C)} A ${ANCHO / 2} ${ANCHO / 2} 0 0 ${sentido} ${p(B)} Z`}
        fill="none"
        stroke={ORO}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d={flecha(punto(s.alejamiento, LARGO / 2), acercamiento, 7)} fill={ORO} />
      <circle r="4.5" fill="white" />
      <text x="9" y="-8" fontSize="11" fontWeight="600" fill="white">VOR</text>
      <text x={punto(s.alejamiento, LARGO + 16)[0]} y={punto(s.alejamiento, LARGO + 16)[1] + 4} textAnchor="middle" fontSize="10" fill={ORO}>
        {String(s.alejamiento).padStart(3, "0")}°
      </text>

      {/* Tu avión llega al fijo con ese rumbo */}
      <line x1={origen[0]} y1={origen[1]} x2={cercano[0]} y2={cercano[1]} stroke="white" strokeWidth="2" strokeDasharray="5 4" />
      <path d={flecha(cercano, s.rumbo, 9)} fill="white" />
    </svg>
  );
}

export function EntrenadorEsperas() {
  const idTitulo = useId();
  const [s, setS] = useState<Situacion>(() => generarSituacion());
  const [respuesta, setRespuesta] = useState<Entrada | null>(null);
  const [segundos, setSegundos] = useState(0);
  const [stats, setStats] = useState({ intentos: 0, aciertos: 0, rapidos: 0, suma: 0 });
  const inicio = useRef(0);

  useEffect(() => {
    inicio.current = performance.now();
  }, [s]);

  const correcta = entradaEspera(s.rumbo, s.alejamiento, s.giros);
  const d = diferencia(s.rumbo, s.alejamiento, s.giros);

  function responder(e: Entrada, marca: number) {
    if (respuesta) return;
    const seg = (marca - inicio.current) / 1000;
    const acierto = e === correcta;
    setRespuesta(e);
    setSegundos(seg);
    setStats((t) => ({
      intentos: t.intentos + 1,
      aciertos: t.aciertos + (acierto ? 1 : 0),
      rapidos: t.rapidos + (acierto && seg <= META_SEGUNDOS ? 1 : 0),
      suma: t.suma + seg,
    }));
  }

  function siguiente() {
    setS(generarSituacion());
    setRespuesta(null);
  }

  const acerto = respuesta === correcta;

  return (
    <section aria-labelledby={idTitulo} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="mx-auto w-full max-w-sm">
        <Diagrama s={s} revelar={respuesta !== null} />
      </div>

      <div>
        <h2 id={idTitulo} className="font-display text-xl font-semibold text-white">
          Espera con giros a la {s.giros}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-white/80">
          Curso de alejamiento <b className="text-white">{String(s.alejamiento).padStart(3, "0")}°</b> (acercamiento{" "}
          {String(norm(s.alejamiento + 180)).padStart(3, "0")}°). Llegas al fijo con rumbo{" "}
          <b className="text-gold-400">{String(s.rumbo).padStart(3, "0")}°</b>.
        </p>
        <p className="mt-3 font-display text-sm font-semibold text-white">¿Qué entrada haces?</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="¿Qué entrada haces?">
          {(["directa", "gota", "paralela"] as Entrada[]).map((e) => {
            const elegida = respuesta === e;
            const esLaCorrecta = respuesta !== null && e === correcta;
            return (
              <button
                key={e}
                type="button"
                aria-pressed={elegida}
                disabled={respuesta !== null}
                onClick={(ev) => responder(e, ev.timeStamp)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                  esLaCorrecta
                    ? "border-gold-500/70 bg-gold-500/15 text-white"
                    : elegida
                      ? "border-white/40 bg-white/[0.08] text-white"
                      : "border-white/10 bg-white/[0.03] text-white/85 [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:border-gold-500/40"
                }`}
              >
                {NOMBRE_ENTRADA[e]}
              </button>
            );
          })}
        </div>

        <div role="status" aria-live="polite">
          {respuesta && (
            <div className="animate-fade-up mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className={`font-display text-sm font-semibold ${acerto ? "text-gold-400" : "text-white"}`}>
                {acerto ? "Correcto" : `No: era entrada ${NOMBRE_ENTRADA[correcta].toLowerCase()}`}
                <span className="font-normal text-white/60">
                  {" "}
                  · {segundos.toFixed(1)} s {segundos <= META_SEGUNDOS ? "(dentro de la meta)" : `(la meta es ${META_SEGUNDOS} s)`}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                Diferencia = rumbo de llegada − curso de alejamiento
                {s.giros === "izquierda" ? " (invertida, porque la espera es a la izquierda)" : ""} = <b className="text-white">{d}°</b>. Directa de −70° a
                110°, gota de 110° a 180°, paralela de 180° a 290°.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                <b className="text-white">Cómo se vuela:</b> {COMO_SE_VUELA[correcta]}
              </p>
              <button
                type="button"
                onClick={siguiente}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 font-display text-sm font-semibold text-navy-950 transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-gold-400"
              >
                Otra espera <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            [`${stats.aciertos}/${stats.intentos}`, "Aciertos"],
            [stats.intentos ? `${(stats.suma / stats.intentos).toFixed(1)} s` : "—", "Tiempo medio"],
            [`${stats.rapidos}`, `Correctas en ≤ ${META_SEGUNDOS} s`],
          ].map(([valor, etiqueta]) => (
            <div key={etiqueta} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <dd className="font-display text-xl font-bold text-white">{valor}</dd>
              <dt className="mt-0.5 text-[11px] leading-tight text-white/50">{etiqueta}</dt>
            </div>
          ))}
        </dl>
        {stats.intentos > 0 && (
          <button
            type="button"
            onClick={() => setStats({ intentos: 0, aciertos: 0, rapidos: 0, suma: 0 })}
            className="mt-3 inline-flex items-center gap-1.5 rounded text-xs text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white"
          >
            <RotateCcw size={12} /> Reiniciar contadores
          </button>
        )}
      </div>
    </section>
  );
}
