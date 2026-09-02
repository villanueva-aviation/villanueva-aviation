import { useState } from "react";
import { Check, ChevronRight, Volume2 } from "lucide-react";

export interface PhraseologyElement {
  descripcion: string;
  palabrasClave: string[];
}

export interface PhraseologyCard {
  situacion: string;
  callout: string;
  elementos: PhraseologyElement[];
}

const DEFAULT_CARDS: PhraseologyCard[] = [
  {
    situacion: "Estás en la plataforma de MMGL, listo para solicitar rodaje hacia la pista activa.",
    callout: "Guadalajara Torre, XB-VLA, plataforma de aviación general, solicito rodaje, con información Alfa.",
    elementos: [
      { descripcion: "A quién llamas (Torre)", palabrasClave: ["torre"] },
      { descripcion: "Tu identificación (XB-VLA)", palabrasClave: ["xb vla", "xb-vla", "equis be uve ele a"] },
      { descripcion: "Tu posición", palabrasClave: ["plataforma", "aviación general", "aviacion general"] },
      { descripcion: "Qué necesitas (rodaje)", palabrasClave: ["rodaje", "solicito rodaje"] },
    ],
  },
  {
    situacion: "Vas a ingresar a la frecuencia de un aeródromo no controlado para anunciar tu llegada.",
    callout: "Tráfico Manzanillo, XB-VLA, a 10 millas al norte, descendiendo para entrar al circuito de tráfico, Manzanillo.",
    elementos: [
      { descripcion: "A quién llamas (tráfico en la frecuencia)", palabrasClave: ["tráfico", "trafico"] },
      { descripcion: "Tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
      { descripcion: "Posición y altitud", palabrasClave: ["millas", "norte"] },
      { descripcion: "Tu intención", palabrasClave: ["circuito de tráfico", "circuito de trafico", "entrar al circuito"] },
    ],
  },
  {
    situacion: "El controlador te autoriza a despegar. Debes confirmar la instrucción (read-back).",
    callout: "Autorizado a despegar pista 20, XB-VLA.",
    elementos: [
      { descripcion: "Repites la instrucción exacta", palabrasClave: ["autorizado a despegar", "autorizado despegar"] },
      { descripcion: "Confirmas la pista", palabrasClave: ["pista 20", "pista veinte"] },
      { descripcion: "Terminas con tu identificación", palabrasClave: ["xb vla", "xb-vla"] },
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
  const card = cards[index];

  function speak(text: string) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function next() {
    if (index + 1 >= cards.length) {
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
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
        onClick={() => speak(card.callout)}
        disabled={!supported}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Volume2 size={16} /> {L.escuchar}
      </button>
      {!supported && (
        <p className="mt-2 text-xs text-white/40">Tu navegador no soporta síntesis de voz — lee el texto abajo.</p>
      )}

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-5 block text-sm font-medium text-white/60 underline decoration-dotted hover:text-white"
        >
          {L.mostrar}
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="font-display text-sm text-white">"{card.callout}"</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {card.elementos.map((el) => (
              <li key={el.descripcion} className="flex items-center gap-2 text-xs text-white/60">
                <Check size={12} className="shrink-0 text-gold-400" /> {el.descripcion}
              </li>
            ))}
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
