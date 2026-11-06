import { useEffect, useState } from "react";
import type { Idioma } from "./idiomaInstructor";
import { useEscucha } from "./useEscucha";
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

/**
 * El interruptor de preguntas y la prueba del micrófono: cuenta 10 s (para cambiar a MSFS en pantalla
 * completa), pide la matrícula, escucha hasta 8 s sin que la voz hable encima y repite lo que oyó.
 */
export function PruebaMicrofono({ idioma, voz }: { idioma: Idioma; voz: ReturnType<typeof useVoz> }) {
  const t = TEXTO[idioma];
  const escucha = useEscucha(idioma, voz);
  const [cuenta, setCuenta] = useState<number | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const { decir } = voz;
  const { escuchar } = escucha;

  useEffect(() => {
    if (cuenta === null) return;
    if (cuenta === 0) {
      setCuenta(null);
      escuchar(t.pide, "prueba", undefined, (texto, error) => {
        const dicho = texto ? t.escuche(texto) : error && error !== "no-speech" ? t.error : t.nada;
        setResultado(dicho);
        decir(dicho, "orden");
      });
      return;
    }
    const id = window.setTimeout(() => setCuenta((c) => (c === null ? null : c - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [cuenta, escuchar, decir, t]);

  const estado =
    cuenta !== null ? t.en(cuenta) : escucha.fase === "escuchando" ? t.escuchando : escucha.fase === "diciendo" ? t.pide : resultado;

  return (
    <div className="grid gap-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={voz.preguntas} onChange={(e) => voz.setPreguntas(e.target.checked)} className="accent-gold-500" />
        {t.preguntas}
      </label>
      {escucha.supported ? (
        <button
          type="button"
          disabled={cuenta !== null || escucha.fase !== "inactivo"}
          onClick={() => {
            setResultado(null);
            setCuenta(ESPERA_S);
          }}
          className="justify-self-start rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 disabled:opacity-50"
        >
          {t.probar}
        </button>
      ) : (
        <p className="text-gold-300">{t.sinMic}</p>
      )}
      {estado && (
        <p aria-live="polite" className={escucha.fase === "escuchando" ? "font-semibold text-gold-300" : "text-white/80"}>
          {estado}
        </p>
      )}
    </div>
  );
}
