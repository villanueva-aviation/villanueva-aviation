import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Mic, Volume2, X } from "lucide-react";
import { evaluarRespuesta, type EvaluationResult } from "./phraseologyEvaluator";
import { useSpeechRecognition } from "./useSpeechRecognition";

export interface PhraseologyElement {
  descripcion: string;
  palabrasClave: string[];
}

export interface PhraseologyCard {
  situacion: string;
  callout: string;
  elementos: PhraseologyElement[];
  /** Ruta a una grabación real (ej. "/audio/fraseologia/rodaje-1.mp3"). Si no se define, se usa voz sintetizada. */
  audioUrl?: string;
}

const DEFAULT_CARDS: PhraseologyCard[] = [
  {
    situacion: "Estás en la plataforma de MMGL, listo para solicitar rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    audioUrl: "/audio/fraseologia/academia-1.mp3",
    elementos: [
      { descripcion: "A quién llamas (Torre)", palabrasClave: ["torre"] },
      {
        descripcion: "Tu identificación (XB-VLA)",
        palabrasClave: ["xb vla", "xb-vla", "equis be uve ele a", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel"],
      },
      { descripcion: "Tu posición", palabrasClave: ["plataforma", "aviación general", "aviacion general"] },
      { descripcion: "Qué necesitas (rodaje)", palabrasClave: ["rodaje", "solicito rodaje"] },
    ],
  },
  {
    situacion: "Vas a ingresar a la frecuencia de un aeródromo no controlado para anunciar tu llegada.",
    callout: "Tráfico Manzanillo, XB-VLA, a 10 millas al norte, descendiendo para entrar al circuito de tráfico, Manzanillo.",
    audioUrl: "/audio/fraseologia/academia-2.mp3",
    elementos: [
      { descripcion: "A quién llamas (tráfico en la frecuencia)", palabrasClave: ["tráfico", "trafico"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas", "norte"] },
      { descripcion: "Tu intención", palabrasClave: ["circuito de tráfico", "circuito de trafico", "entrar al circuito"] },
    ],
  },
  {
    situacion: "El controlador te autoriza a despegar. Debes confirmar la instrucción (read-back).",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    audioUrl: "/audio/fraseologia/academia-3.mp3",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a despegar", "autorizado despegar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla", "x-ray bravo", "x ray bravo", "xray bravo", "ex rey bravo", "ex ray bravo", "torre eiffel", "extreme", "victor lima alfa", "lima alfa", "excre", "extremo", "excel"] },
    ],
  },
];

export function AudioPhraseology({
  cards = DEFAULT_CARDS,
  onComplete,
  labels,
}: {
  cards?: PhraseologyCard[];
  onComplete?: () => void;
  labels?: { unidad?: string; escuchar?: string; mostrar?: string; siguiente?: string; terminar?: string };
}) {
  const L = {
    unidad: "Situación",
    escuchar: "Escuchar fraseología correcta",
    mostrar: "Mostrar texto y elementos clave",
    siguiente: "Siguiente situación",
    terminar: "Terminar práctica",
    ...labels,
  };
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [vozEspanolDisponible, setVozEspanolDisponible] = useState<boolean | null>(null);
  const card = cards[index];

  useEffect(() => {
    if (!supported) return;
    function revisarVoces() {
      const voces = window.speechSynthesis.getVoices();
      if (voces.length === 0) return;
      setVozEspanolDisponible(voces.some((v) => v.lang.toLowerCase().startsWith("es")));
    }
    revisarVoces();
    window.speechSynthesis.addEventListener("voiceschanged", revisarVoces);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", revisarVoces);
  }, [supported]);

  const speech = useSpeechRecognition();
  const [resultado, setResultado] = useState<{ transcript: string; items: EvaluationResult[] } | null>(null);

  useEffect(() => {
    if (!speech.listening && speech.transcript && !resultado) {
      setResultado({ transcript: speech.transcript, items: evaluarRespuesta(speech.transcript, card.elementos) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening, speech.transcript]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  function speak(text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function escucharFraseologia() {
    if (!card.audioUrl) {
      speak(card.callout);
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onerror = () => speak(card.callout);
    }
    audioRef.current.src = card.audioUrl;
    audioRef.current.play().catch(() => speak(card.callout));
  }

  function next() {
    if (index + 1 >= cards.length) {
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
    setResultado(null);
    speech.reset();
  }

  function handleStart() {
    setResultado(null);
    speech.start();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>
          {L.unidad} {index + 1} de {cards.length}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/80">{card.situacion}</p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-500">
        Piensa tu respuesta, luego escucha o revisa la correcta
      </p>

      <button
        onClick={escucharFraseologia}
        disabled={!supported && !card.audioUrl}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Volume2 size={16} /> {L.escuchar}
      </button>
      {!supported && !card.audioUrl && (
        <p className="mt-2 text-xs text-white/40">Tu navegador no soporta síntesis de voz — lee el texto abajo.</p>
      )}
      {!card.audioUrl && vozEspanolDisponible === false && (
        <p className="mt-2 text-xs text-amber-400">
          Tu navegador no tiene una voz en español instalada — el audio podría sonar en otro idioma.
        </p>
      )}

      {speech.supported && (
        <button
          onClick={speech.listening ? speech.stop : handleStart}
          className="mt-3 ml-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
        >
          <Mic size={16} className={speech.listening ? "animate-pulse text-red-400" : undefined} />
          {speech.listening ? "Detener" : "Practica hablando"}
        </button>
      )}

      {speech.listening && (
        <p className="mt-2 text-xs text-white/50">Escuchando… {speech.transcript}</p>
      )}

      {speech.error && <p className="mt-2 text-xs text-red-400">{speech.error}</p>}

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-5 block text-sm font-medium text-white/60 underline decoration-dotted hover:text-white"
        >
          {L.mostrar}
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {resultado && (
            <>
              <p className="text-xs text-white/50">Dijiste: "{resultado.transcript}"</p>
              <p className="mt-1 text-xs font-semibold text-gold-400">
                {resultado.items.filter((r) => r.dicho).length} de {resultado.items.length} elementos correctos
              </p>
            </>
          )}
          <p className="mt-3 font-display text-sm text-white">"{card.callout}"</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el, i) => {
              const dicho = resultado?.items[i]?.dicho;
              return (
                <li key={el.descripcion} className="flex items-center gap-2 text-xs text-white/60">
                  {resultado ? (
                    dicho ? (
                      <Check size={12} className="shrink-0 text-emerald-400" />
                    ) : (
                      <X size={12} className="shrink-0 text-red-400" />
                    )
                  ) : (
                    <Check size={12} className="shrink-0 text-gold-400" />
                  )}
                  {el.descripcion}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!revealed}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index + 1 >= cards.length ? L.terminar : L.siguiente}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
