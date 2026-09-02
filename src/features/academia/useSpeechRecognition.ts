import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "No se pudo acceder al micrófono — revisa los permisos del navegador.",
  "no-speech": "No se detectó audio, intenta de nuevo.",
};

export function useSpeechRecognition(lang = "es-MX"): UseSpeechRecognitionResult {
  const SpeechRecognitionCtor =
    typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const texto = Array.from(event.results)
        .map((resultado) => resultado[0]?.transcript ?? "")
        .join(" ");
      setTranscript(texto);
    };
    recognition.onerror = (event) => {
      setError(ERROR_MESSAGES[event.error] ?? "No se pudo procesar el audio, intenta de nuevo.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionCtor, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setError(null);
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    setListening(false);
  }, []);

  return { supported: !!SpeechRecognitionCtor, listening, transcript, error, start, stop, reset };
}
