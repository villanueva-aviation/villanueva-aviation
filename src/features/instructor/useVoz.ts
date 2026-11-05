import { useCallback, useEffect, useRef, useState } from "react";

const CLAVE = "instructor-voz";

function leer(): { activa: boolean; volumen: number } {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as { activa?: unknown; volumen?: unknown } | null;
    return { activa: v?.activa !== false, volumen: typeof v?.volumen === "number" ? v.volumen : 1 };
  } catch {
    return { activa: true, volumen: 1 };
  }
}

/** Natural de Edge en es-MX, si no cualquier es-MX, si no cualquier español. */
function escoger(voces: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const mx = voces.filter((v) => v.lang.toLowerCase() === "es-mx");
  return mx.find((v) => /natural|online/i.test(v.name)) ?? mx[0] ?? voces.find((v) => v.lang.toLowerCase().startsWith("es")) ?? null;
}

/**
 * La voz del instructor. Lo nuevo corta lo que se estaba diciendo; la lectura final no se corta
 * y lo que llegue mientras se lee se descarta.
 */
export function useVoz() {
  const inicial = useRef(leer()).current;
  const [activa, setActivaEstado] = useState(inicial.activa);
  const [volumen, setVolumenEstado] = useState(inicial.volumen);
  const [voz, setVoz] = useState<SpeechSynthesisVoice | null>(null);
  const leyendoFinal = useRef(false);
  const sintesis = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

  useEffect(() => {
    if (!sintesis) return;
    const cargar = () => setVoz(escoger(sintesis.getVoices()));
    cargar();
    sintesis.addEventListener("voiceschanged", cargar);
    return () => sintesis.removeEventListener("voiceschanged", cargar);
  }, [sintesis]);

  const guardar = (a: boolean, v: number) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ activa: a, volumen: v }));
    } catch {
      // Sin localStorage se queda solo en esta visita.
    }
  };
  const setActiva = (a: boolean) => {
    setActivaEstado(a);
    guardar(a, volumen);
    if (!a && sintesis) {
      sintesis.cancel();
      leyendoFinal.current = false;
    }
  };
  const setVolumen = (v: number) => {
    setVolumenEstado(v);
    guardar(activa, v);
  };

  const decir = useCallback(
    (textos: string | string[], opciones?: { final?: boolean }) => {
      if (!sintesis || !activa) return;
      const lista = (Array.isArray(textos) ? textos : [textos]).filter(Boolean);
      if (!lista.length) return;
      if (!opciones?.final && leyendoFinal.current) return;
      sintesis.cancel();
      leyendoFinal.current = !!opciones?.final;
      lista.forEach((texto, k) => {
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = "es-MX";
        u.volume = volumen;
        if (voz) u.voice = voz;
        if (opciones?.final && k === lista.length - 1) {
          u.onend = () => (leyendoFinal.current = false);
          u.onerror = () => (leyendoFinal.current = false);
        }
        sintesis.speak(u);
      });
    },
    [sintesis, activa, volumen, voz],
  );

  return { activa, setActiva, volumen, setVolumen, nombreVoz: voz?.name ?? null, decir };
}
