import { useCallback, useEffect, useRef, useState } from "react";
import { encolar, escogerVoz, RITMO, siguiente, type Detalle, type Pieza, type TipoPieza, type Velocidad } from "./colaVoz";
import type { Idioma } from "./idiomaInstructor";

const CLAVE = "instructor-voz";

type Ajustes = { activa: boolean; volumen: number; velocidad: Velocidad; detalle: Detalle; voz: Partial<Record<Idioma, string>> };
const BASE: Ajustes = { activa: true, volumen: 1, velocidad: "normal", detalle: "detallado", voz: {} };

/** Lee también el formato viejo { activa, volumen }. */
function leer(): Ajustes {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Partial<Ajustes> | null;
    if (!v) return BASE;
    return {
      activa: v.activa !== false,
      volumen: typeof v.volumen === "number" ? v.volumen : 1,
      velocidad: v.velocidad && v.velocidad in RITMO ? v.velocidad : "normal",
      detalle: v.detalle === "necesario" ? "necesario" : "detallado",
      voz: typeof v.voz === "object" && v.voz ? v.voz : {},
    };
  } catch {
    return BASE;
  }
}

/**
 * La voz del instructor: una pieza a la vez, sin cortar frases (ver colaVoz).
 * `avisoVigente` dice la clave del aviso que aplica ahora, para descartar los viejos.
 */
export function useVoz(idioma: Idioma, avisoVigente: () => string | null) {
  const [ajustes, setAjustes] = useState(leer);
  const [voces, setVoces] = useState<SpeechSynthesisVoice[]>([]);
  const [hablando, setHablando] = useState(false);
  const sintesis = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  const cola = useRef<Pieza[]>([]);
  const actual = useRef<SpeechSynthesisUtterance | null>(null);
  const vigente = useRef(avisoVigente);
  vigente.current = avisoVigente;

  useEffect(() => {
    if (!sintesis) return;
    const cargar = () => setVoces(sintesis.getVoices());
    cargar();
    sintesis.addEventListener("voiceschanged", cargar);
    return () => sintesis.removeEventListener("voiceschanged", cargar);
  }, [sintesis]);

  const delIdioma = voces.filter((v) => v.lang.toLowerCase().startsWith(idioma));
  const voz = escogerVoz(voces, idioma, ajustes.voz[idioma] ?? null);
  const reproduccion = useRef({ voz, ajustes, idioma });
  reproduccion.current = { voz, ajustes, idioma };

  const cambiar = (parcial: Partial<Ajustes>) =>
    setAjustes((a) => {
      const nuevo = { ...a, ...parcial };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevo));
      } catch {
        // Sin localStorage se queda solo en esta visita.
      }
      return nuevo;
    });

  const reproducir = useCallback(() => {
    if (!sintesis || actual.current) return;
    const { pieza, cola: resto } = siguiente(cola.current, vigente.current());
    cola.current = resto;
    if (!pieza) {
      setHablando(false);
      return;
    }
    const { voz: v, ajustes: a, idioma: i } = reproduccion.current;
    const u = new SpeechSynthesisUtterance(pieza.texto);
    u.lang = v?.lang ?? (i === "en" ? "en-US" : "es-MX");
    if (v) u.voice = v;
    u.volume = a.volumen;
    u.rate = RITMO[a.velocidad];
    const fin = () => {
      if (actual.current !== u) return; // una pieza cortada termina tarde: ya no manda
      actual.current = null;
      reproducir();
    };
    u.onend = fin;
    u.onerror = fin;
    actual.current = u;
    setHablando(true);
    sintesis.speak(u);
  }, [sintesis]);

  const decir = useCallback(
    (textos: string | string[], tipo: TipoPieza, clave?: string) => {
      if (!sintesis || !ajustes.activa) return;
      const lista = (Array.isArray(textos) ? textos : [textos]).filter(Boolean);
      lista.forEach((texto, k) => {
        // Solo la primera pieza de un anulado o una prueba corta; el resto de la lista va detrás.
        const r = encolar(cola.current, { tipo: k > 0 && (tipo === "anulado" || tipo === "prueba") ? "orden" : tipo, texto, clave });
        cola.current = r.cola;
        if (r.cortar && actual.current) {
          actual.current = null;
          sintesis.cancel();
        }
      });
      reproducir();
    },
    [sintesis, ajustes.activa, reproducir],
  );

  const setActiva = (activa: boolean) => {
    cambiar({ activa });
    if (!activa && sintesis) {
      cola.current = [];
      actual.current = null;
      sintesis.cancel();
      setHablando(false);
    }
  };

  return {
    activa: ajustes.activa,
    setActiva,
    volumen: ajustes.volumen,
    setVolumen: (volumen: number) => cambiar({ volumen }),
    velocidad: ajustes.velocidad,
    setVelocidad: (velocidad: Velocidad) => cambiar({ velocidad }),
    detalle: ajustes.detalle,
    setDetalle: (detalle: Detalle) => cambiar({ detalle }),
    voces: delIdioma,
    nombreVoz: voz?.name ?? null,
    setNombreVoz: (nombre: string) => cambiar({ voz: { ...ajustes.voz, [idioma]: nombre } }),
    hablando,
    decir,
  };
}
