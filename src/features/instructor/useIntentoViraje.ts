import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { armar, armarSolo, avanzarLote, crearEvaluacion, type Evaluacion, type Resultado } from "./evaluador.ts";
import { fetchMisIntentosManiobra, guardarIntento, mandarARevision } from "./intentos";
import { paraGuardar, type IntentoManiobra } from "./reglasIntentos.ts";
import { useLector } from "./useLector.ts";
import { ALTURA_SEGURA_AGL } from "./virajeEscarpado.ts";

const MANIOBRA = "viraje-escarpado";
export type Modo = "practica" | "checkride";

/** Todo el intento del viraje escarpado: lector, evaluación, armado solo, guardado y revisión. Lo usan la página y el programa. */
export function useIntentoViraje() {
  // Cada lote del lector entra a la evaluación; avanzar ignora las muestras repetidas.
  const { estado, muestra } = useLector((lote) => setEv((e) => (e ? avanzarLote(e, lote) : e)));
  const [modo, setModo] = useState<Modo>("practica");
  const [ev, setEv] = useState<Evaluacion | null>(null);
  const [modoIntento, setModoIntento] = useState<Modo>("practica");
  const [intentos, setIntentos] = useState<IntentoManiobra[]>([]);
  const [guardado, setGuardado] = useState<{ id: string | null; error: string | null; guardando: boolean }>({ id: null, error: null, guardando: false });
  const [envio, setEnvio] = useState<string | null>(null);
  const [anulado, setAnulado] = useState<string | null>(null);
  const guardadoPara = useRef<Resultado | null>(null);

  const cargarIntentos = useCallback(() => {
    fetchMisIntentosManiobra(MANIOBRA).then(setIntentos, () => {});
  }, []);
  useEffect(cargarIntentos, [cargarIntentos]);

  const resultado = ev?.fase === "terminado" ? ev.resultado! : null;
  const series = useMemo(() => (resultado ? paraGuardar(resultado).series : []), [resultado]);

  const guardar = useCallback(
    async (r: Resultado, m: Modo) => {
      setGuardado({ id: null, error: null, guardando: true });
      const res = await guardarIntento({ maniobra: MANIOBRA, avion: "C172", modo: m, resultado: r });
      setGuardado({ ...res, guardando: false });
      if (res.id) cargarIntentos();
    },
    [cargarIntentos],
  );

  useEffect(() => {
    if (!resultado || guardadoPara.current === resultado) return;
    guardadoPara.current = resultado;
    guardar(resultado, modoIntento);
  }, [resultado, modoIntento, guardar]);

  const iniciar = () => {
    if (!muestra) return;
    setModoIntento(modo);
    setGuardado({ id: null, error: null, guardando: false });
    setEnvio(null);
    setAnulado(null);
    setEv(armar(crearEvaluacion(), muestra));
  };

  // Se arma sola en el aire y nivelada, también tras un intento anulado (pausa, slew...), nunca encima de un resultado.
  useEffect(() => {
    if (!muestra || !armarSolo(ev, muestra)) return;
    setModoIntento(modo);
    setAnulado(ev?.fase === "invalido" ? (ev.motivo ?? null) : null);
    setEv(armar(crearEvaluacion(), muestra));
  }, [ev, muestra, modo]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    if (ev?.fase === "armado") setModoIntento(m);
  };

  const intento = guardado.id ? (intentos.find((i) => i.id === guardado.id) ?? null) : null;
  const numero = intento ? intentos.findIndex((i) => i.id === intento.id) + 1 : undefined;
  const enCurso = !!ev && ev.fase !== "terminado" && ev.fase !== "invalido";
  // Recién armado en el ascenso: primero que suba, luego los virajes.
  const bajo = ev?.fase === "armado" && !!muestra && muestra.agl < ALTURA_SEGURA_AGL;
  // El último checkride que Erik aprobó, para verlo e imprimirlo con su firma en otra visita.
  const aprobadoPorErik = [...intentos].reverse().find((i) => i.revision === "aprobado") ?? null;

  const mandar = async () => {
    if (!intento) return;
    const { error } = await mandarARevision(intento.id);
    setEnvio(error ? `No se pudo mandar: ${error}` : null);
    if (!error) cargarIntentos();
  };

  return { estado, muestra, modo, cambiarModo, modoIntento, ev, resultado, series, anulado, bajo, enCurso, iniciar, guardado, guardar, intento, numero, intentos, mandar, envio, aprobadoPorErik };
}
