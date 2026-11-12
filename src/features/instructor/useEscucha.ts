import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../academia/useSpeechRecognition";
import type { TipoPieza } from "./colaVoz";
import type { Idioma } from "./idiomaInstructor";
import type { useVoz } from "./useVoz";

const ESCUCHA_MS = 8000;
/** Tope duro: si el micrófono nunca arranca o nunca avisa que terminó, la voz vuelve (Erik, 2026-11-11: se quedó callada). */
const TOPE_MS = ESCUCHA_MS + 3000;

export type AlTerminar = (texto: string, error: string | null) => void;

/**
 * Dice algo, espera a que la voz calle, escucha hasta 8 s sin que la voz hable encima y entrega lo oído.
 * Lo usan la prueba del micrófono y las preguntas en vuelo.
 */
export function useEscucha(idioma: Idioma, voz: ReturnType<typeof useVoz>) {
  const mic = useSpeechRecognition(idioma === "en" ? "en-US" : "es-MX");
  const [fase, setFase] = useState<"inactivo" | "diciendo" | "escuchando">("inactivo");
  const fin = useRef<AlTerminar>(() => {});
  const hablo = useRef(false);
  const escucho = useRef(false);
  const { decir, retener, hablando, activa } = voz;
  const { start, stop, listening, transcript, errorCode } = mic;
  const oido = useRef({ transcript, errorCode });
  oido.current = { transcript, errorCode };

  const cerrar = useCallback(
    (texto: string, error: string | null) => {
      retener(false);
      setFase("inactivo");
      fin.current(texto, error);
    },
    [retener],
  );

  const escuchar = useCallback(
    (texto: string, tipo: TipoPieza, clave: string | undefined, alTerminar: AlTerminar) => {
      fin.current = alTerminar;
      hablo.current = false;
      setFase("diciendo");
      decir(texto, tipo, clave);
    },
    [decir],
  );

  // Escucha cuando la voz termina (o de inmediato si la voz está apagada).
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
    cerrar(transcript.trim(), errorCode);
  }, [fase, listening, errorCode, transcript, cerrar]);

  useEffect(() => {
    if (fase !== "escuchando") return;
    const id = window.setTimeout(() => {
      stop();
      const texto = oido.current.transcript.trim();
      cerrar(texto, texto ? null : (oido.current.errorCode ?? "sin-respuesta"));
    }, TOPE_MS);
    return () => window.clearTimeout(id);
  }, [fase, stop, cerrar]);

  return { fase, escuchar, supported: mic.supported };
}
