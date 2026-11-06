import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../academia/useSpeechRecognition";
import type { useVoz } from "./useVoz";

const REINICIO_MS = 250;
const VOZ_NO_EMPIEZA_MS = 3000;

/**
 * Escucha el checklist sin botón: el reconocimiento corta en cada pausa y aquí se vuelve a arrancar.
 * Mientras habla el instructor el micrófono se calla, para que no se oiga a sí mismo.
 */
export function useChecklistVoz(activo: boolean, voz: ReturnType<typeof useVoz>, alOir: (texto: string) => void) {
  const { start, stop, listening, transcript, errorCode, error, supported } = useSpeechRecognition("es-MX");
  const [pausa, setPausa] = useState(false);
  const [bloqueado, setBloqueado] = useState<string | null>(null);
  const antes = useRef(false);
  const hablo = useRef(false);
  const alOirRef = useRef(alOir);
  alOirRef.current = alOir;
  const { decir: decirVoz, hablando, activa } = voz;

  // Entrega lo oído al cortar, antes de reiniciar: start() borra el texto.
  useEffect(() => {
    if (antes.current && !listening) {
      const t = transcript.trim();
      if (t) alOirRef.current(t);
      if (errorCode === "not-allowed") setBloqueado(error);
    }
    antes.current = listening;
  }, [listening, transcript, errorCode, error]);

  useEffect(() => {
    if (activo) setBloqueado(null);
    else stop();
  }, [activo, stop]);

  useEffect(() => {
    if (!activo || pausa || bloqueado || listening || hablando || !supported) return;
    const id = window.setTimeout(start, REINICIO_MS);
    return () => window.clearTimeout(id);
  }, [activo, pausa, bloqueado, listening, hablando, supported, start]);

  const decir = useCallback(
    (texto: string) => {
      hablo.current = false;
      setPausa(true);
      stop();
      decirVoz(texto, "aviso");
    },
    [stop, decirVoz],
  );

  // La pausa termina cuando la voz acaba; si la voz está apagada o nunca empieza, en seguida.
  useEffect(() => {
    if (!pausa) return;
    if (hablando) {
      hablo.current = true;
      return;
    }
    if (hablo.current || !activa) {
      setPausa(false);
      return;
    }
    const id = window.setTimeout(() => setPausa(false), VOZ_NO_EMPIEZA_MS);
    return () => window.clearTimeout(id);
  }, [pausa, hablando, activa]);

  return { escuchando: listening, supported, error: bloqueado, decir };
}
