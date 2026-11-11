import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMisIntentosManiobra, guardarIntento, mandarARevision } from "./intentos";
import type { Muestra } from "./evaluador.ts";
import type { ContextoArmado, DefManiobra, ResultadoComun } from "./maniobras.ts";
import type { IntentoManiobra } from "./reglasIntentos.ts";
import type { IntentoSesion, Modo } from "./sesion.ts";
import { useLector } from "./useLector.ts";
import { sugerirNivel, type Nivel } from "./nivel.ts";

const CLAVE_NIVEL = "instructor-nivel";
/** El último nivel que escogió el cadete; la primera vez, Fácil. */
function leerNivel(): Nivel {
  try {
    const n = Number(localStorage.getItem(CLAVE_NIVEL));
    return n === 2 || n === 3 ? n : 1;
  } catch {
    return 1;
  }
}

export type Opciones = {
  sesionId?: string;
  /** La sesión pone el modo; manda sobre el selector. */
  modoFijo?: Modo;
  /** false apaga el armado solo (briefing, debriefing...). */
  arma?: boolean;
  /** Una vez por resultado calificado, ya guardado (id null si no se pudo). */
  alTerminar?: (i: IntentoSesion) => void;
  /** Cada lote del lector, después de pasarlo a la maniobra (el repaso sigue el vuelo completo con él). */
  alLote?: (lote: Muestra[]) => void;
  /** Con qué armar cada intento (el programa IFR elige el ejercicio con él). */
  contexto?: () => ContextoArmado;
};

/** Todo el intento de una maniobra: lector, evaluación, armado solo, guardado y revisión. */
export function useIntento(def: DefManiobra, opciones: Opciones = {}) {
  const defRef = useRef(def);
  defRef.current = def;
  // Cada lote del lector entra a la evaluación; avanzar ignora las muestras repetidas.
  const { estado, muestra, aeropuerto, vors } = useLector((lote) => {
    setEv((e: unknown) => (e ? lote.reduce((x, m) => defRef.current.avanzar(x, m), e) : e));
    op.current.alLote?.(lote);
  });
  const [modoSelector, setModo] = useState<Modo>("practica");
  const modo = opciones.modoFijo ?? modoSelector;
  const [nivelSelector, setNivelSelector] = useState<Nivel>(leerNivel);
  // El checkride es el simulacro del examen: Difícil, salvo que la maniobra diga otra cosa (IFR: medio como mínimo).
  const nivel: Nivel = modo === "checkride" ? (def.nivelExamen?.(nivelSelector) ?? 3) : nivelSelector;
  const cambiarNivel = (n: Nivel) => {
    setNivelSelector(n);
    try {
      localStorage.setItem(CLAVE_NIVEL, String(n));
    } catch {
      /* sin almacenamiento: dura lo que la página */
    }
  };
  const arma = opciones.arma !== false;
  const op = useRef(opciones);
  op.current = opciones;
  const [ev, setEv] = useState<any>(null);
  const [modoIntento, setModoIntento] = useState<Modo>("practica");
  const [intentos, setIntentos] = useState<IntentoManiobra[]>([]);
  const intentosRef = useRef(intentos);
  intentosRef.current = intentos;
  const [guardado, setGuardado] = useState<{ id: string | null; error: string | null; guardando: boolean }>({ id: null, error: null, guardando: false });
  const [envio, setEnvio] = useState<string | null>(null);
  const [anulado, setAnulado] = useState<string | null>(null);
  const guardadoPara = useRef<ResultadoComun | null>(null);

  // Otra maniobra: la evaluación de la anterior no le sirve.
  useEffect(() => setEv(null), [def.id]);

  const cargarIntentos = useCallback(() => {
    fetchMisIntentosManiobra(def.id).then(setIntentos, () => {});
  }, [def.id]);
  useEffect(cargarIntentos, [cargarIntentos]);

  const resultado: ResultadoComun | null = ev && def.fase(ev) === "terminado" ? def.resultado(ev) : null;

  const guardar = useCallback(
    async (r: ResultadoComun, m: Modo): Promise<string | null> => {
      const d = defRef.current;
      setGuardado({ id: null, error: null, guardando: true });
      const res = await guardarIntento({ maniobra: d.id, avion: d.avion, modo: m, resultado: r, detalle: d.paraGuardar(r), sesionId: op.current.sesionId });
      setGuardado({ ...res, guardando: false });
      if (res.id) cargarIntentos();
      return res.id;
    },
    [cargarIntentos],
  );

  useEffect(() => {
    if (!resultado || guardadoPara.current === resultado) return;
    guardadoPara.current = resultado;
    // Con los intentos de antes de este resultado más este: ¿ya van dos aprobadas seguidas?
    const este = { modo: modoIntento, aprobado: resultado.aprobado, detalle: { nivel: resultado.nivel } };
    const subir = modoIntento === "practica" ? sugerirNivel([...intentosRef.current, este], resultado.nivel ?? 3) : null;
    guardar(resultado, modoIntento).then((id) => op.current.alTerminar?.({ modo: modoIntento, resultado, id, subir }));
  }, [resultado, modoIntento, guardar]);

  const iniciar = () => {
    if (!muestra) return;
    setModoIntento(modo);
    setGuardado({ id: null, error: null, guardando: false });
    setEnvio(null);
    setAnulado(null);
    setEv(def.armar(muestra, nivel, op.current.contexto?.()));
  };

  // Se arma sola en el aire y nivelada, también tras un intento anulado (pausa, slew...), nunca encima de un resultado.
  useEffect(() => {
    if (!arma || !muestra || !def.armarSolo(ev, muestra)) return;
    setModoIntento(modo);
    setAnulado(ev && def.fase(ev) === "invalido" ? (def.motivo(ev) ?? null) : null);
    setEv(def.armar(muestra, nivel, op.current.contexto?.()));
  }, [ev, muestra, modo, arma, def, nivel]);

  const fase = ev ? def.fase(ev) : null;
  // Un intento armado que todavía no empieza toma el modo y el nivel nuevos (p. ej. al pasar al checkride); uno empezado conserva los suyos.
  useEffect(() => {
    if (fase !== "armado") return;
    setModoIntento(modo);
    setEv((e: { nivel?: Nivel } | null) => (e && (e.nivel ?? 3) !== nivel ? { ...e, nivel } : e));
  }, [modo, fase, nivel]);

  const cambiarModo = (m: Modo) => setModo(m);

  /** Borra el intento actual para que el armado solo empiece otro (sesión: siguiente intento o sesión nueva). */
  const reiniciar = () => {
    setGuardado({ id: null, error: null, guardando: false });
    setEnvio(null);
    setAnulado(null);
    setEv(null);
  };

  /** Cambia la evaluación en curso desde la página (p. ej. la entrada que el cadete dijo en la espera). */
  const ajustar = (f: (e: any) => any) => setEv((e: any) => (e ? f(e) : e));

  const intento = guardado.id ? (intentos.find((i) => i.id === guardado.id) ?? null) : null;
  const numero = intento ? intentos.findIndex((i) => i.id === intento.id) + 1 : undefined;
  const enCurso = !!fase && fase !== "terminado" && fase !== "invalido";
  // El último intento que Erik aprobó, para verlo e imprimirlo con su firma en otra visita.
  const aprobadoPorErik = [...intentos].reverse().find((i) => i.revision === "aprobado") ?? null;

  const mandar = async () => {
    if (!intento) return;
    const { error } = await mandarARevision(intento.id);
    setEnvio(error ? `No se pudo mandar: ${error}` : null);
    if (!error) cargarIntentos();
  };

  // Dos prácticas aprobadas seguidas en el nivel de ahora: invitar a subir.
  const subir = modo === "practica" ? sugerirNivel(intentos, nivelSelector) : null;

  return { estado, muestra, aeropuerto, vors, modo, cambiarModo, nivel, nivelSelector, cambiarNivel, subir, modoIntento, ev, resultado, anulado, enCurso, iniciar, reiniciar, ajustar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik };
}
