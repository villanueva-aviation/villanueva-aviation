import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMisIntentosManiobra, guardarIntento, mandarARevision } from "./intentos";
import type { DefManiobra, ResultadoComun } from "./maniobras.ts";
import type { IntentoManiobra } from "./reglasIntentos.ts";
import type { IntentoSesion, Modo } from "./sesion.ts";
import { useLector } from "./useLector.ts";

export type Opciones = {
  sesionId?: string;
  /** La sesión pone el modo; manda sobre el selector. */
  modoFijo?: Modo;
  /** false apaga el armado solo (briefing, debriefing...). */
  arma?: boolean;
  /** Una vez por resultado calificado, ya guardado (id null si no se pudo). */
  alTerminar?: (i: IntentoSesion) => void;
};

/** Todo el intento de una maniobra: lector, evaluación, armado solo, guardado y revisión. */
export function useIntento(def: DefManiobra, opciones: Opciones = {}) {
  const defRef = useRef(def);
  defRef.current = def;
  // Cada lote del lector entra a la evaluación; avanzar ignora las muestras repetidas.
  const { estado, muestra } = useLector((lote) => setEv((e: unknown) => (e ? lote.reduce((x, m) => defRef.current.avanzar(x, m), e) : e)));
  const [modoSelector, setModo] = useState<Modo>("practica");
  const modo = opciones.modoFijo ?? modoSelector;
  const arma = opciones.arma !== false;
  const op = useRef(opciones);
  op.current = opciones;
  const [ev, setEv] = useState<any>(null);
  const [modoIntento, setModoIntento] = useState<Modo>("practica");
  const [intentos, setIntentos] = useState<IntentoManiobra[]>([]);
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
    guardar(resultado, modoIntento).then((id) => op.current.alTerminar?.({ modo: modoIntento, resultado, id }));
  }, [resultado, modoIntento, guardar]);

  const iniciar = () => {
    if (!muestra) return;
    setModoIntento(modo);
    setGuardado({ id: null, error: null, guardando: false });
    setEnvio(null);
    setAnulado(null);
    setEv(def.armar(muestra));
  };

  // Se arma sola en el aire y nivelada, también tras un intento anulado (pausa, slew...), nunca encima de un resultado.
  useEffect(() => {
    if (!arma || !muestra || !def.armarSolo(ev, muestra)) return;
    setModoIntento(modo);
    setAnulado(ev && def.fase(ev) === "invalido" ? (def.motivo(ev) ?? null) : null);
    setEv(def.armar(muestra));
  }, [ev, muestra, modo, arma, def]);

  const fase = ev ? def.fase(ev) : null;
  // Un intento armado que todavía no empieza toma el modo nuevo (p. ej. al pasar al checkride).
  useEffect(() => {
    if (fase === "armado") setModoIntento(modo);
  }, [modo, fase]);

  const cambiarModo = (m: Modo) => setModo(m);

  /** Borra el intento actual para que el armado solo empiece otro (sesión: siguiente intento o sesión nueva). */
  const reiniciar = () => {
    setGuardado({ id: null, error: null, guardando: false });
    setEnvio(null);
    setAnulado(null);
    setEv(null);
  };

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

  return { estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, anulado, enCurso, iniciar, reiniciar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik };
}
