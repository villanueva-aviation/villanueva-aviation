import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Check, Pause, Play, RotateCcw, X } from "lucide-react";
import { SALIDAS_USA } from "../../data/autorizacionesUsa";
import { registrarUsoGimnasio } from "../rutaRed/fuente";
import {
  CAMPOS,
  VELOCIDADES,
  generarAutorizacion,
  readback,
  respuestas,
  revisar,
  textoAutorizacion,
  type Autorizacion,
  type Campo,
} from "./autorizaciones";

const INPUT =
  "w-full rounded-lg border bg-white/[0.04] px-3 py-2 font-mono text-sm uppercase text-white placeholder:normal-case placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60";

const CAMPO: Record<Campo, { letra: string; etiqueta: string; ejemplo: string }> = {
  limite: { letra: "C", etiqueta: "Límite", ejemplo: "ej. MMMX" },
  sid: { letra: "R", etiqueta: "SID", ejemplo: "ej. RITAA7" },
  transicion: { letra: "R", etiqueta: "Transición", ejemplo: "ej. TCATE" },
  altitud: { letra: "A", etiqueta: "Altitud", ejemplo: "CVS o 5000" },
  esperar: { letra: "A", etiqueta: "Expect", ejemplo: "ej. FL350" },
  frecuencia: { letra: "F", etiqueta: "Departure", ejemplo: "ej. 124.3" },
  squawk: { letra: "T", etiqueta: "Squawk", ejemplo: "ej. 4521" },
};

const VACIA = Object.fromEntries(CAMPOS.map((c) => [c, ""])) as Record<Campo, string>;
type IdVelocidad = (typeof VELOCIDADES)[number]["id"];

/** La mejor voz en inglés de EE. UU. que tenga el navegador (las "Natural" de Edge y la de Google suenan mejor). */
function vozEnIngles(): SpeechSynthesisVoice | null {
  const voces = window.speechSynthesis.getVoices().filter((v) => v.lang.replace("_", "-").toLowerCase() === "en-us");
  return voces.find((v) => /natural|google/i.test(v.name)) ?? voces[0] ?? null;
}

export function GimnasioAutorizaciones() {
  const idTitulo = useId();
  const [salidaElegida, setSalidaElegida] = useState("");
  const [a, setA] = useState<Autorizacion>(() => generarAutorizacion(SALIDAS_USA));
  const [velocidad, setVelocidad] = useState<IdVelocidad>("despacio");
  const [copia, setCopia] = useState(VACIA);
  const [resultado, setResultado] = useState<Record<Campo, boolean> | null>(null);
  const [veces, setVeces] = useState(0);
  const [hablando, setHablando] = useState(false);
  const [marcador, setMarcador] = useState({ completas: 0, total: 0, racha: 0 });
  const [hayVoz] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [sinVozIngles, setSinVozIngles] = useState(false);
  const primerCampo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hayVoz) return;
    const revisarVoces = () => {
      if (window.speechSynthesis.getVoices().length) setSinVozIngles(!vozEnIngles());
    };
    revisarVoces();
    window.speechSynthesis.addEventListener("voiceschanged", revisarVoces);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", revisarVoces);
      window.speechSynthesis.cancel();
    };
  }, [hayVoz]);

  function escuchar() {
    const s = window.speechSynthesis;
    if (hablando) {
      s.cancel();
      setHablando(false);
      return;
    }
    s.cancel();
    const u = new SpeechSynthesisUtterance(textoAutorizacion(a));
    u.lang = "en-US";
    u.voice = vozEnIngles();
    u.rate = VELOCIDADES.find((v) => v.id === velocidad)!.rate;
    u.onend = u.onerror = () => setHablando(false);
    setHablando(true);
    setVeces((n) => n + 1);
    s.speak(u);
  }

  function otra() {
    window.speechSynthesis?.cancel();
    setHablando(false);
    setA(generarAutorizacion(SALIDAS_USA, Math.random, salidaElegida || undefined));
    setCopia(VACIA);
    setResultado(null);
    setVeces(0);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (resultado) return otra();
    const r = revisar(a, copia);
    const completa = CAMPOS.every((c) => r[c]);
    setResultado(r);
    setMarcador((m) => ({ completas: m.completas + Number(completa), total: m.total + 1, racha: completa ? m.racha + 1 : 0 }));
    registrarUsoGimnasio();
  }

  const correctas = resultado ? CAMPOS.filter((c) => resultado[c]).length : 0;
  const iVel = VELOCIDADES.findIndex((v) => v.id === velocidad);
  const siguienteVel = marcador.racha >= 3 && resultado ? VELOCIDADES[iVel + 1] : undefined;
  const ok = respuestas(a);

  return (
    <section aria-labelledby={idTitulo} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
      <h2 id={idTitulo} className="sr-only">
        Práctica de autorización
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div role="radiogroup" aria-label="Velocidad del controlador" className="inline-flex rounded-full border border-white/15 p-1">
          {VELOCIDADES.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={velocidad === v.id}
              onClick={() => setVelocidad(v.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                velocidad === v.id ? "bg-gold-500 text-navy-950" : "text-white/65 hover:text-white"
              }`}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 sm:w-56">
          <span className="text-xs text-white/60">Aeropuerto de salida</span>
          <select
            value={salidaElegida}
            onChange={(e) => setSalidaElegida(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-navy-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          >
            <option value="">Cualquiera</option>
            {SALIDAS_USA.map((s) => (
              <option key={s.icao} value={s.icao}>
                {s.icao} · {s.ciudad}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-gold-500/25 bg-gold-500/[0.05] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Tu vuelo</p>
        <p className="mt-2 font-display text-xl font-bold text-white tabular-nums sm:text-2xl">
          {a.indicativo.codigo} <span className="font-normal text-white/50">desde</span> {a.salida.icao}
        </p>
        <p className="mt-1 text-sm text-white/60">
          Pediste tu autorización IFR en Clearance Delivery de {a.salida.ciudad}. Escucha y copia.
        </p>
        <button
          type="button"
          onClick={() => {
            escuchar();
            primerCampo.current?.focus({ preventScroll: true });
          }}
          disabled={!hayVoz}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 font-display text-sm font-semibold text-navy-950 transition-[transform,background-color] duration-150 hover:bg-gold-400 active:scale-[0.97] disabled:opacity-40"
        >
          {hablando ? <Pause size={16} /> : <Play size={16} />}
          {hablando ? "Detener" : veces ? "Say again (otra vez)" : "Escuchar autorización"}
        </button>
        {veces > 1 && !resultado && (
          <p className="mt-2 text-xs text-white/50 tabular-nums">La escuchaste {veces} veces. En la frecuencia también puedes pedir "say again".</p>
        )}
        {!hayVoz && <p className="mt-2 text-xs text-amber-400">Tu navegador no puede leer en voz alta. Prueba en Chrome o Edge.</p>}
        {sinVozIngles && (
          <p className="mt-2 text-xs text-amber-400">No encontramos una voz en inglés en tu navegador; puede sonar con acento. En Chrome o Edge suena mejor.</p>
        )}
      </div>

      <form onSubmit={enviar} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CAMPOS.map((c, i) => {
            const bien = resultado?.[c];
            return (
              <label key={c} className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="font-display font-bold text-gold-400">{CAMPO[c].letra}</span>
                  {CAMPO[c].etiqueta}
                </span>
                <input
                  ref={i === 0 ? primerCampo : undefined}
                  value={copia[c]}
                  onChange={(e) => setCopia((v) => ({ ...v, [c]: e.target.value }))}
                  readOnly={!!resultado}
                  placeholder={CAMPO[c].ejemplo}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  inputMode={c === "frecuencia" ? "decimal" : c === "squawk" ? "numeric" : undefined}
                  aria-invalid={resultado ? !bien : undefined}
                  className={`${INPUT} ${resultado ? (bien ? "border-emerald-400/60" : "border-red-400/60") : "border-white/15"}`}
                />
                {resultado && (
                  <span className={`flex items-center gap-1 text-xs ${bien ? "text-emerald-400" : "text-red-300"}`}>
                    {bien ? <Check size={12} /> : <X size={12} />}
                    {bien ? "Bien" : ok[c]}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-display text-sm font-semibold text-white transition-[transform,background-color] duration-150 hover:bg-white/10 active:scale-[0.97]"
          >
            {resultado ? (
              <>
                <RotateCcw size={15} /> Otra autorización
              </>
            ) : (
              "Revisar mi copia"
            )}
          </button>
          {marcador.total > 0 && (
            <p className="text-sm text-white/55 tabular-nums">
              Completas: {marcador.completas} de {marcador.total}
            </p>
          )}
        </div>
      </form>

      {resultado && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
              Lo que dijo el controlador · {correctas} de {CAMPOS.length}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{textoAutorizacion(a)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Tu readback, en voz alta</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-white/80">{readback(a)}</p>
            <p className="mt-3 text-xs text-white/45">Termina siempre con tu indicativo. Así te llamará: {a.indicativo.dicho}.</p>
          </div>
        </div>
      )}

      {siguienteVel && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4 text-sm text-white/80">
          {marcador.racha} completas seguidas.
          <button type="button" onClick={() => setVelocidad(siguienteVel.id)} className="font-semibold text-emerald-300 underline-offset-4 hover:underline">
            Sube a "{siguienteVel.etiqueta}"
          </button>
        </div>
      )}
    </section>
  );
}
