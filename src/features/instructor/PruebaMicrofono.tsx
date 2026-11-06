import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../academia/useSpeechRecognition";
import type { Idioma } from "./idiomaInstructor";
import type { useVoz } from "./useVoz";

const TEXTO = {
  es: {
    preguntas: "Preguntas por micrófono",
    probar: "Probar micrófono en 10 s",
    en: (s: number) => `Empieza en ${s} s: cambia a MSFS si quieres.`,
    pide: "Di la matrícula de tu avión.",
    escuchando: "Escuchando…",
    escuche: (x: string) => `Escuché: ${x}`,
    nada: "No escuché nada.",
    error: "No se pudo usar el micrófono.",
    sinMic: "Este navegador no reconoce voz.",
  },
  en: {
    preguntas: "Spoken questions",
    probar: "Test microphone in 10 s",
    en: (s: number) => `Starting in ${s} s: switch to MSFS if you like.`,
    pide: "Say your aircraft's registration.",
    escuchando: "Listening…",
    escuche: (x: string) => `I heard: ${x}`,
    nada: "I didn't hear anything.",
    error: "The microphone couldn't be used.",
    sinMic: "This browser can't recognize speech.",
  },
};

const ESPERA_S = 10;
const ESCUCHA_MS = 8000;

/**
 * El interruptor de preguntas y la prueba del micrófono: cuenta 10 s (para cambiar a MSFS en pantalla
 * completa), pide la matrícula, escucha hasta 8 s sin que la voz hable encima y repite lo que oyó.
 */
export function PruebaMicrofono({ idioma, voz }: { idioma: Idioma; voz: ReturnType<typeof useVoz> }) {
  const t = TEXTO[idioma];
  const mic = useSpeechRecognition(idioma === "en" ? "en-US" : "es-MX");
  const [fase, setFase] = useState<"inactivo" | "cuenta" | "diciendo" | "escuchando">("inactivo");
  const [cuenta, setCuenta] = useState(ESPERA_S);
  const [resultado, setResultado] = useState<string | null>(null);
  const hablo = useRef(false);
  const escucho = useRef(false);
  const { decir, retener, hablando, activa } = voz;
  const { start, stop, listening, transcript, errorCode } = mic;

  useEffect(() => {
    if (fase !== "cuenta") return;
    if (cuenta === 0) {
      hablo.current = false;
      setFase("diciendo");
      decir(t.pide, "prueba");
      return;
    }
    const id = window.setTimeout(() => setCuenta((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [fase, cuenta, decir, t.pide]);

  // Escucha cuando el instructor termina de pedir la matrícula (o de inmediato si la voz está apagada).
  useEffect(() => {
    if (fase !== "diciendo") return;
    if (hablando) {
      hablo.current = true;
      return;
    }
    if (!hablo.current && activa) return;
    escucho.current = false;
    retener(true);
    start();
    setFase("escuchando");
  }, [fase, hablando, activa, retener, start]);

  // Tope de escucha: cuenta desde que empieza, no desde la última palabra.
  useEffect(() => {
    if (fase !== "escuchando" || !listening) return;
    const id = window.setTimeout(stop, ESCUCHA_MS);
    return () => window.clearTimeout(id);
  }, [fase, listening, stop]);

  useEffect(() => {
    if (fase !== "escuchando") return;
    if (listening) {
      escucho.current = true;
      return;
    }
    if (!escucho.current && !errorCode) return; // todavía no arranca
    const texto = transcript.trim();
    const dicho = texto ? t.escuche(texto) : errorCode && errorCode !== "no-speech" ? t.error : t.nada;
    setResultado(dicho);
    retener(false);
    decir(dicho, "orden");
    setFase("inactivo");
  }, [fase, listening, errorCode, transcript, retener, decir, t]);

  const estado =
    fase === "cuenta" ? t.en(cuenta) : fase === "escuchando" ? t.escuchando : fase === "diciendo" ? t.pide : resultado;

  return (
    <div className="grid gap-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={voz.preguntas} onChange={(e) => voz.setPreguntas(e.target.checked)} className="accent-gold-500" />
        {t.preguntas}
      </label>
      {mic.supported ? (
        <button
          type="button"
          disabled={fase !== "inactivo"}
          onClick={() => {
            setResultado(null);
            setCuenta(ESPERA_S);
            setFase("cuenta");
          }}
          className="justify-self-start rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 disabled:opacity-50"
        >
          {t.probar}
        </button>
      ) : (
        <p className="text-gold-300">{t.sinMic}</p>
      )}
      {estado && (
        <p aria-live="polite" className={fase === "escuchando" ? "font-semibold text-gold-300" : "text-white/80"}>
          {estado}
        </p>
      )}
    </div>
  );
}
