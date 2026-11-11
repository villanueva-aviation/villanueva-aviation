import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { AVIONES_VOZ } from "../data/checklistVozAviones";
import type { SeccionId } from "../data/checklistVozC172";
import { useAuth } from "../features/auth/AuthContext";
import { avanzarChecklist, crearChecklist, oir, porDecir, type Checklist, type EstadoPunto } from "../features/instructor/checklistVoz";
import { debriefingRepaso, esperaApagado, paraGuardarRepaso } from "../features/instructor/debriefingRepaso";
import type { Muestra } from "../features/instructor/evaluador";
import { textosReporte, type Idioma } from "../features/instructor/idiomaInstructor";
import { guardarIntento, guardarRecorrido } from "../features/instructor/intentos";
import { cerrarGrabacion, crearGrabador, grabarMuestra, grabarVoz } from "../features/instructor/recorrido";
import { DebriefingMapa } from "../features/instructor/DebriefingMapa";
import type { ManiobraId, ResultadoComun } from "../features/instructor/maniobras";
import { claveLeccion, estadoLeccion, leccionDe, leccionIfrDe } from "../features/instructor/lecciones";
import { casosExamen, type CasoInterceptacion } from "../features/instructor/navIfr";
import { elegirVor, vorsCercanos, type VorSim } from "../features/instructor/vorSim";
import { lecturaFinalDe, MANIOBRAS } from "../features/instructor/maniobras";
import {
  alMuestrearRepaso, alResultado, armaManiobra, crearRepaso, maniobraActual, maniobrasDe, nombreManiobra, pisoZona, ponerVor, siguienteManiobra,
  type EstadoRepaso, type EtapaRepaso,
} from "../features/instructor/repaso";
import type { IntentoSesion, Modo } from "../features/instructor/sesion";
import { useChecklistVoz } from "../features/instructor/useChecklistVoz";
import { useIntento } from "../features/instructor/useIntento";
import { SelectorNivel } from "../features/instructor/SelectorNivel";
import { Explicacion } from "../features/instructor/ExplicacionInstructor";
import { NOMBRE_NIVEL } from "../features/instructor/nivel";
import { useVoz } from "../features/instructor/useVoz";
import { HOJA } from "../features/instructor/vistasManiobra";
import { filtrarAviso, MEMORIA_VACIA, paraVoz, type MemoriaAviso } from "../features/instructor/voz";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const CLAVE_IDIOMA = "instructor-idioma";
const SECCIONES = AVIONES_VOZ.c172.secciones;

const T = {
  es: {
    titulo: (l: string) => `${l} · C172`,
    briefing: (m: string | null, circuitos: string[] | null, bajo = false) => [
      "Vuelo completo en el C172, de la plataforma a la plataforma.",
      "Lee el checklist en voz alta, en español: el instructor revisa lo que se puede leer del simulador.",
      ...(circuitos ?? [`Despega y ve a la zona de trabajo ${bajo ? "entre 600 y 1,000 pies" : "a 1,500 pies"} sobre el terreno${bajo ? "" : " o más"}.`,
      m
        ? `En la zona vuelas ${m.toLowerCase()} 5 veces: la primera para practicar y 4 más. Entre una y otra, recto y nivelado en otro rumbo.`
        : "En la zona vuelas 4 maniobras sorteadas. Entre una y otra, recto y nivelado.",
      "Regresa, aterriza y apaga en la plataforma."]),
      "Al final escuchas el debriefing por fases.",
    ],
    modo: { practica: "Práctica", checkride: "Checkride" },
    modoDetalle: { practica: "Puedes repetir una maniobra o pasar a la siguiente.", checkride: "Un intento calificado por maniobra." },
    empezar: "Empezar",
    estado: { conectado: "Conectado a MSFS", "sin-simulador": "Abre MSFS 2020 con el C172", "sin-lector": "No encuentro el lector: ábrelo otra vez" },
    etapa: {
      rampa: "En la plataforma: checklist y rodaje", salida: "Hacia la zona de trabajo", maniobra: "Maniobras", "fuera-de-zona": "Fuera de la zona",
      regreso: "Regreso y aterrizaje", terminado: "Terminado", invalido: "Lección sin calificar",
    } satisfies Record<EtapaRepaso, string>,
    maniobra: (n: number, de: number, m: string) => `Maniobra ${n} de ${de}: ${m}`,
    repetir: "Repetir",
    siguiente: "Siguiente maniobra",
    checklist: "Checklist",
    escuchando: "Escuchando…",
    sinMicrofono: "Este navegador no reconoce voz: usa Microsoft Edge o Chrome.",
    aprobado: (a: boolean) => (a ? "Checkride aprobado" : "Checkride no aprobado"),
    practicaFin: "Práctica terminada",
    bien: "Bien",
    aRepetir: "A repetir",
    guardando: "Guardando la lección…",
    guardado: "Lección guardada.",
    noGuardado: (e: string) => `No se pudo guardar: ${e}`,
    reintentar: "Reintentar",
    nueva: "Nueva lección",
    menu: "Volver al menú",
    salir: "Salir de la lección (no se guarda)",
    esperaApagado: "Termina el checklist de apagado. El debriefing empieza al cerrar la sección o en un minuto.",
    terminar: "Terminar y ver el debriefing",
    candado: "Esta lección todavía no está abierta. Muy pronto.",
    mapaGuardando: "Guardando el mapa del vuelo…",
    mapaNoGuardado: (e: string) => `No se pudo guardar el mapa del vuelo: ${e}`,
    verDespues: "Ver este vuelo después",
    briefingIfr: (checkride: boolean) => [
      "Vuelo completo en el C172, de la plataforma a la plataforma.",
      "Lee el checklist en voz alta, en español: el instructor revisa lo que se puede leer del simulador.",
      "En la plataforma elige el VOR y sintonízalo en NAV1, con la barra en NAV, no en GPS.",
      "Despega; arriba de 1,000 pies sobre el terreno y con señal del VOR empiezan los ejercicios.",
      checkride ? "Son 2 interceptaciones calificadas, una alejándote y otra acercándote, sin consejos." : "Son 5 interceptaciones, cada una con otro radial.",
      "Regresa, aterriza y apaga en la plataforma.",
      "Al final escuchas el debriefing por fases.",
    ],
    etapaIfr: { salida: "Subiendo: sintoniza el VOR", maniobra: "Ejercicios", "fuera-de-zona": "Sin señal del VOR" } as Partial<Record<EtapaRepaso, string>>,
    ejercicio: (n: number, de: number) => `Ejercicio ${n} de ${de}`,
    siguienteIfr: "Siguiente ejercicio",
    vors: "VOR cercanos",
    sinVors: "No hay VOR a menos de 60 millas: el lector manda la lista al conectarse con MSFS.",
    conDme: "con DME",
    largo: "vuelo largo",
    menuIfr: "Volver al menú IFR",
  },
  en: {
    titulo: (l: string) => `${l} · C172`,
    briefing: (m: string | null, circuitos: string[] | null, bajo = false) => [
      "A full flight in the C172, from ramp to ramp.",
      "Read the checklist aloud, in Spanish: the instructor checks what the simulator can report.",
      ...(circuitos ?? [`Take off and head to the practice area ${bajo ? "between 600 and 1,000 feet" : "at 1,500 feet"} above the ground${bajo ? "" : " or higher"}.`,
      m
        ? `In the area you fly ${m.toLowerCase()} 5 times: the first one to practice and 4 more. Between them, straight and level on a new heading.`
        : "In the area you fly 4 drawn maneuvers. Between them, straight and level.",
      "Come back, land and shut down on the ramp."]),
      "At the end you hear the debriefing by phase.",
    ],
    modo: { practica: "Practice", checkride: "Checkride" },
    modoDetalle: { practica: "You can repeat a maneuver or move on to the next one.", checkride: "One graded attempt per maneuver." },
    empezar: "Start",
    estado: { conectado: "Connected to MSFS", "sin-simulador": "Open MSFS 2020 with the C172", "sin-lector": "Reader not found: open it again" },
    etapa: {
      rampa: "On the ramp: checklist and taxi", salida: "To the practice area", maniobra: "Maneuvers", "fuera-de-zona": "Outside the area",
      regreso: "Return and landing", terminado: "Done", invalido: "Lesson not graded",
    } satisfies Record<EtapaRepaso, string>,
    maniobra: (n: number, de: number, m: string) => `Maneuver ${n} of ${de}: ${m}`,
    repetir: "Repeat",
    siguiente: "Next maneuver",
    checklist: "Checklist",
    escuchando: "Listening…",
    sinMicrofono: "This browser does not recognize speech: use Microsoft Edge or Chrome.",
    aprobado: (a: boolean) => (a ? "Checkride passed" : "Checkride not passed"),
    practicaFin: "Practice complete",
    bien: "Good",
    aRepetir: "To repeat",
    guardando: "Saving the lesson…",
    guardado: "Lesson saved.",
    noGuardado: (e: string) => `Could not save: ${e}`,
    reintentar: "Retry",
    nueva: "New lesson",
    menu: "Back to the menu",
    salir: "Leave the lesson (not saved)",
    esperaApagado: "Finish the shutdown checklist. The debriefing starts when you close the section or in one minute.",
    terminar: "Finish and see the debriefing",
    candado: "This lesson is not open yet. Coming soon.",
    mapaGuardando: "Saving the flight map…",
    mapaNoGuardado: (e: string) => `Couldn't save the flight map: ${e}`,
    verDespues: "See this flight later",
    briefingIfr: (checkride: boolean) => [
      "A full flight in the C172, from ramp to ramp.",
      "Read the checklist aloud, in Spanish: the instructor checks what the simulator can report.",
      "On the ramp pick the VOR and tune it on NAV1, with the needle on NAV, not GPS.",
      "Take off; the exercises start above 1,000 feet above the ground with the VOR signal.",
      checkride ? "Two graded intercepts, one outbound and one inbound, no tips." : "Five intercepts, each on a different radial.",
      "Come back, land and shut down on the ramp.",
      "At the end you hear the debriefing by phase.",
    ],
    etapaIfr: { salida: "Climbing: tune the VOR", maniobra: "Exercises", "fuera-de-zona": "No VOR signal" } as Partial<Record<EtapaRepaso, string>>,
    ejercicio: (n: number, de: number) => `Exercise ${n} of ${de}`,
    siguienteIfr: "Next exercise",
    vors: "Nearby VORs",
    sinVors: "No VOR within 60 miles: the reader sends the list once it connects to MSFS.",
    conDme: "with DME",
    largo: "long flight",
    menuIfr: "Back to the IFR menu",
  },
};

const COLOR_ESTADO = { conectado: "text-emerald-300", "sin-simulador": "text-gold-300", "sin-lector": "text-red-300" } as const;
const COLOR_PUNTO: Record<EstadoPunto, string> = {
  pendiente: "text-white/50", revisando: "text-gold-400", hecho: "text-green-400", dicho: "text-white", "no-hecho": "text-red-400", saltado: "text-red-400",
};

function leerIdioma(): Idioma {
  try {
    return localStorage.getItem(CLAVE_IDIOMA) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

/** Una lección del programa: vuelo completo con checklist por voz, sus maniobras (o el sorteo del repaso) y debriefing por fases. */
export function InstructorRepaso({ programa = "vfr" }: { programa?: "vfr" | "ifr" }) {
  const numero = useParams().numero;
  const ifr = programa === "ifr";
  const leccion = ifr ? leccionIfrDe(numero) : leccionDe(numero);
  const menuRuta = ifr ? ROUTES.instructorIfr : ROUTES.instructorPrograma;
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [idioma] = useState<Idioma>(leerIdioma);
  const t = T[idioma];
  const [modo, setModo] = useState<Modo>("practica");
  const [sesionId, setSesionId] = useState(() => crypto.randomUUID());
  const [repaso, setRepaso] = useState<EstadoRepaso | null>(null);
  const repasoRef = useRef(repaso);
  const [cl, setCl] = useState<Checklist>(() => crearChecklist(SECCIONES));
  const clRef = useRef(cl);
  const ultimaT = useRef(0);
  const dichos = useRef(new Set<SeccionId>());
  const [guardado, setGuardado] = useState<{ estado: "no" | "guardando" | "listo" | "error"; error?: string }>({ estado: "no" });
  const enCursoRef = useRef(false);
  const aeroRef = useRef<Parameters<typeof alMuestrearRepaso>[2]>(null);
  const decirRef = useRef<(textos: string[]) => void>(() => {});
  // Lo que se graba para el mapa: el vuelo y cada intento calificado (e.hechas solo guarda el último de cada maniobra).
  const grabador = useRef(crearGrabador(ifr));
  const resultadosVuelo = useRef<{ maniobra: ManiobraId; resultado: ResultadoComun }[]>([]);
  const [mapa, setMapa] = useState<{ estado: "no" | "guardando" | "listo" | "error"; error?: string; id?: string }>({ estado: "no" });
  // IFR: los VOR del lector y, en el examen, los dos casos sorteados al empezar.
  const vorsRef = useRef<VorSim[]>([]);
  const casosRef = useRef<CasoInterceptacion[] | undefined>(undefined);

  const actualId = repaso ? maniobraActual(repaso) : null;
  const def = MANIOBRAS[actualId ?? "recto-nivelado"];

  const poner = (e: EstadoRepaso | null) => {
    repasoRef.current = e;
    setRepaso(e);
  };

  const alLote = (lote: Muestra[]) => {
    let e = repasoRef.current;
    if (!e) return;
    const decir: string[] = [];
    for (const m of lote) {
      // IFR: despega sin elegir VOR → el más cercano.
      if (e.programa === "ifr" && !e.vor && e.etapa === "rampa" && !m.enTierra && m.lat !== undefined && m.lon !== undefined) {
        const cerca = vorsCercanos(vorsRef.current, m.lat, m.lon)[0];
        if (cerca) e = ponerVor(e, elegirVor(cerca, m));
      }
      const antes = e.etapa;
      const r = alMuestrearRepaso(e, m, aeroRef.current, idioma, Math.random, enCursoRef.current);
      e = r.estado;
      // Hasta la muestra que termina o anula la lección; después el avión sigue en rampa y no se graba.
      if (antes !== "terminado" && antes !== "invalido") grabarMuestra(grabador.current, m, e);
      decir.push(...r.decir);
      ultimaT.current = m.t;
      clRef.current = avanzarChecklist(clRef.current, m, { elevacionFt: e.vuelo?.aeropuerto?.elevacionFt ?? null, limites: AVIONES_VOZ.c172.limites });
    }
    if (e !== repasoRef.current) poner(e);
    setCl(clRef.current);
    if (decir.length) decirRef.current(decir);
  };

  const reiniciarRef = useRef<() => void>(() => {});
  const alTerminar = useCallback(
    (i: IntentoSesion) => {
      const e = repasoRef.current;
      if (!e || !e.vuelo) return;
      const id = maniobraActual(e);
      if (!id) return;
      resultadosVuelo.current.push({ maniobra: id, resultado: i.resultado });
      const r = alResultado(e, i.resultado, i.id, idioma);
      poner(r.estado);
      // La calificación y, si algo salió, el primer error con cómo corregirlo; el resto queda en pantalla.
      const error = MANIOBRAS[id].explicar(i.resultado, idioma).find((l) => l.tipo === "mal");
      decirRef.current([...lecturaFinalDe(MANIOBRAS[id], i.resultado, idioma).slice(0, 1), ...(error ? [error.texto] : []), ...r.decir]);
      // Avanzó (o terminó las maniobras): el intento calificado se borra para que la siguiente se arme sola.
      if (r.estado.actual !== e.actual) reiniciarRef.current();
    },
    [idioma],
  );

  const contexto = useCallback(
    () => ({ intento: repasoRef.current?.actual ?? 0, examen: modo === "checkride", casos: casosRef.current, vor: repasoRef.current?.vor?.ident, estacion: repasoRef.current?.vor ?? undefined }),
    [modo],
  );
  const intento = useIntento(def, { sesionId, modoFijo: modo, arma: !!repaso && armaManiobra(repaso), alTerminar, alLote, contexto });
  const { estado, muestra, aeropuerto, vors, ev, resultado, enCurso, reiniciar, nivel, cambiarNivel } = intento;
  aeroRef.current = aeropuerto;
  vorsRef.current = vors;
  // Solo una maniobra ya empezada sigue fuera de la zona; una armada sin empezar se desarma (abajo).
  const fase = ev ? def.fase(ev) : null;
  enCursoRef.current = enCurso && fase === "en-curso";
  reiniciarRef.current = reiniciar;
  useEffect(() => {
    if (repaso?.etapa === "fuera-de-zona" && fase === "armado") reiniciarRef.current();
  }, [repaso?.etapa, fase]);

  // Órdenes de la maniobra al cambiar de paso, y sus avisos sin repetir.
  const enManiobra = !!actualId;
  const paso = enManiobra ? def.paso(ev, muestra) : null;
  const avisoCrudo = enManiobra ? def.aviso(ev, muestra, modo, idioma) : null;
  const avisoActual = useRef(avisoCrudo);
  avisoActual.current = avisoCrudo;
  const vozBase = useVoz(idioma, () => avisoActual.current?.clave ?? null);
  // Todo lo que dice el instructor (órdenes, avisos, checklist, lectura final) queda grabado para la repetición.
  const decirBase = vozBase.decir;
  const decirGrabado = useCallback<typeof decirBase>(
    (textos, ...resto) => {
      grabarVoz(grabador.current, ultimaT.current, Array.isArray(textos) ? textos : [textos]);
      return decirBase(textos, ...resto);
    },
    [decirBase],
  );
  const voz = useMemo(() => ({ ...vozBase, decir: decirGrabado }), [vozBase, decirGrabado]);
  const { decir } = voz;
  decirRef.current = (textos) => decir(textos.map((x) => paraVoz(x, idioma)), "orden");
  const pasoAntes = useRef<string | null>(null);
  const memoria = useRef<MemoriaAviso>(MEMORIA_VACIA);
  useEffect(() => {
    const antes = pasoAntes.current;
    pasoAntes.current = paso;
    if (!enManiobra || paso === "terminado") return;
    const orden = def.orden(antes, paso, ev, idioma);
    if (orden) decir(paraVoz(orden, idioma), paso === "invalido" ? "anulado" : "orden", "paso");
    if (!muestra) return;
    const filtrado = filtrarAviso(memoria.current, avisoCrudo, muestra.t);
    memoria.current = filtrado.mem;
    if (filtrado.decir && avisoCrudo) decir(paraVoz(filtrado.decir, idioma), "aviso", avisoCrudo.clave);
  }, [enManiobra, paso, ev, muestra, avisoCrudo, decir, idioma, def]);

  // Al apagar el motor todavía faltan puntos del «Apagado»: el debriefing espera a que cierre la sección (hasta 60 s).
  const terminado = repaso?.etapa === "terminado";
  const [finEn, setFinEn] = useState<number | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (terminado && finEn === null) setFinEn(Date.now());
  }, [terminado, finEn]);
  useEffect(() => {
    if (!terminado || finEn === null || listo) return;
    const seg = (Date.now() - finEn) / 1000;
    if (!esperaApagado(cl, seg)) return setListo(true);
    const id = window.setTimeout(() => setListo(true), Math.max(0, 60 - seg) * 1000);
    return () => window.clearTimeout(id);
  }, [terminado, finEn, listo, cl]);

  // Checklist por voz, en español, mientras dura la lección. Al cerrar una sección el instructor dice qué faltó.
  const enVuelo = !!repaso && repaso.etapa !== "terminado" && repaso.etapa !== "invalido";
  const escucha = useChecklistVoz(enVuelo || (terminado && !listo), voz, (texto) => {
    clRef.current = oir(clRef.current, texto, ultimaT.current);
    setCl(clRef.current);
  });
  const decirChecklist = escucha.decir;
  useEffect(() => {
    if (cl.abierta) dichos.current.delete(cl.abierta);
    for (const x of porDecir(cl, dichos.current, null)) {
      if (x.tipo === "aviso") dichos.current.add(x.id);
      decirChecklist(x.texto);
    }
  }, [cl, decirChecklist]);

  // Al terminar: debriefing leído y la lección guardada una vez.
  const deb = repaso && terminado && listo ? debriefingRepaso(repaso, cl, idioma) : null;
  // El mapa: al terminar con el debriefing, o al anularse (se ve, pero no se guarda).
  const anulada = repaso?.etapa === "invalido";
  const conDeb = !!deb;
  // Se congela al aparecer: el lector sigue mandando muestras en rampa y el checklist cambia en cada una,
  // y recalcular aquí redibujaría y volvería a centrar el mapa cada 100 ms.
  const grabacion = useMemo(
    () =>
      repasoRef.current && leccion && (conDeb || anulada)
        ? cerrarGrabacion(grabador.current, { leccion: leccion.numero, e: repasoRef.current, cl: clRef.current, resultados: resultadosVuelo.current })
        : null,
    [leccion, conDeb, anulada],
  );
  // Después del renglón de la lección: si falla, la lección ya quedó guardada y solo se reintenta el mapa.
  const guardarMapa = useCallback(
    async (id: string) => {
      const e = repasoRef.current;
      if (!e || !leccion) return;
      setMapa({ estado: "guardando", id });
      const g = cerrarGrabacion(grabador.current, { leccion: leccion.numero, e, cl: clRef.current, resultados: resultadosVuelo.current });
      const r = await guardarRecorrido(id, g);
      setMapa(r.error ? { estado: "error", error: r.error, id } : { estado: "listo", id });
    },
    [leccion],
  );
  const guardarLeccion = useCallback(async () => {
    const e = repasoRef.current;
    if (!e || !leccion) return;
    setGuardado({ estado: "guardando" });
    const g = paraGuardarRepaso(e, clRef.current);
    const res = await guardarIntento({
      maniobra: claveLeccion(leccion), avion: "C172", modo: e.modo,
      resultado: { aprobado: g.aprobado, calificacion: g.calificacion, elementos: g.elementos, avisos: [], muestras: [] },
      detalle: g.detalle, sesionId,
    });
    setGuardado(res.error ? { estado: "error", error: res.error } : { estado: "listo" });
    if (!res.error && res.id) guardarMapa(res.id);
  }, [sesionId, leccion, guardarMapa]);
  const leido = useRef(false);
  useEffect(() => {
    if (!terminado || !deb || leido.current) return;
    leido.current = true;
    const cabeza = deb.aprobado === null ? t.practicaFin : t.aprobado(deb.aprobado);
    const partes = deb.partes.map((p) => `${p.titulo}. ${p.repetir.length ? `${t.aRepetir}: ${p.repetir.join("; ")}.` : `${t.bien}.`}`);
    decir([cabeza + ".", ...partes].map((x) => paraVoz(x, idioma)), "final");
    guardarLeccion();
  }, [terminado, deb, decir, idioma, t, guardarLeccion]);

  const empezar = () => {
    reiniciar();
    clRef.current = crearChecklist(SECCIONES);
    setCl(clRef.current);
    dichos.current.clear();
    leido.current = false;
    setGuardado({ estado: "no" });
    grabador.current = crearGrabador(ifr);
    resultadosVuelo.current = [];
    setMapa({ estado: "no" });
    setFinEn(null);
    setListo(false);
    casosRef.current = ifr && modo === "checkride" ? casosExamen() : undefined;
    if (leccion) poner(crearRepaso(modo, maniobrasDe(leccion, Math.random, modo), nivel, programa));
  };
  const nueva = () => {
    reiniciar();
    grabador.current = crearGrabador(ifr);
    resultadosVuelo.current = [];
    setMapa({ estado: "no" });
    setFinEn(null);
    setListo(false);
    setSesionId(crypto.randomUUID());
    poner(null);
  };
  const pasar = () => {
    if (!repaso) return;
    const r = siguienteManiobra(repaso, idioma);
    poner(r.estado);
    decirRef.current(r.decir);
    reiniciar();
  };

  const acceso = leccion ? estadoLeccion(leccion, { fundador: user?.email === FOUNDER_EMAIL, exclusivo: hasAccess }) : "proximamente";
  if (!leccion || acceso !== "abierta") {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-8 text-white">
        <p>{t.candado}</p>
        <Link to={menuRuta} className="text-gold-300 underline">{ifr ? t.menuIfr : t.menu}</Link>
      </div>
    );
  }

  const cabecera = (
    <header className="flex items-baseline justify-between gap-3">
      <h1 className="font-display text-base font-bold text-white">{t.titulo(leccion.nombre[idioma])}</h1>
      <span className={`text-xs ${COLOR_ESTADO[estado]}`}>{t.estado[estado]}</span>
    </header>
  );

  if (!repaso) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        {cabecera}
        <div className="flex gap-2" role="radiogroup">
          {(["practica", "checkride"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={modo === m} onClick={() => setModo(m)}
              className={`flex-1 rounded-xl border px-4 py-3 text-left ${modo === m ? "border-gold-500 bg-gold-500/15 text-gold-100" : "border-white/15 text-white"}`}>
              <span className="block font-display font-bold">{t.modo[m]}</span>
              <span className="block text-xs text-white/70">{t.modoDetalle[m]}</span>
            </button>
          ))}
        </div>
        <SelectorNivel nivel={nivel} cambiar={cambiarNivel} checkride={modo === "checkride"} idioma={idioma} />
        <ol className="list-decimal space-y-2 rounded-xl border border-white/10 bg-navy-950/60 p-5 pl-9 text-sm leading-relaxed text-white/85">
          {(ifr ? [
            ...t.briefingIfr(modo === "checkride").slice(0, 2),
            // La teoría corta de la maniobra, sin el saludo ni el «Listo, empiezo».
            ...(leccion.maniobra ? MANIOBRAS[leccion.maniobra].briefing(idioma, nivel).slice(1, -1) : []),
            ...t.briefingIfr(modo === "checkride").slice(2),
          ] : t.briefing(
            leccion.maniobra ? nombreManiobra(leccion.maniobra, idioma) : null,
            // Los circuitos se vuelan en el aeropuerto: su briefing sin la primera línea («Hoy vas a practicar…»).
            leccion.maniobra === "toques-despegues" ? [...MANIOBRAS[leccion.maniobra].briefing(idioma, nivel).slice(1), idioma === "en" ? "Then shut down on the ramp." : "Luego apaga en la plataforma."] : null,
            pisoZona(leccion.maniobra) < 1500,
          )).map((l) => <li key={l}>{l}</li>)}
        </ol>
        {!escucha.supported && <p className="text-sm text-gold-300">{t.sinMicrofono}</p>}
        <Button className="w-full" onClick={empezar}>{t.empezar}</Button>
        <Link to={menuRuta} className="block text-center text-sm text-white/60 underline">{ifr ? t.menuIfr : t.menu}</Link>
      </div>
    );
  }

  // IFR: el VOR se elige en la plataforma (o mientras sube); a más de 40 NM es un vuelo largo.
  const cercanos = ifr && muestra?.lat !== undefined && muestra.lon !== undefined ? vorsCercanos(vors, muestra.lat, muestra.lon) : [];
  const eligeVor = ifr && (repaso.etapa === "rampa" || repaso.etapa === "salida");

  const Hoja = HOJA[def.id];
  const seccion = cl.secciones.find((s) => s.id === cl.abierta) ?? null;
  // Los botones salen cuando el resultado ya quedó guardado en su maniobra; antes, «Siguiente» lo pondría en la que sigue.
  const noAprobada = repaso.modo === "practica" && !!resultado && !resultado.aprobado && !!actualId && repaso.hechas[repaso.actual]?.resultado === resultado;

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
      {cabecera}
      <section className="space-y-1 rounded-xl border border-white/10 bg-navy-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">
          {t.modo[repaso.modo]} · {NOMBRE_NIVEL[idioma][repaso.nivel]} · {(ifr && t.etapaIfr[repaso.etapa]) || t.etapa[repaso.etapa]}
        </p>
        {actualId && (
          <p className="font-display text-lg font-bold text-white">
            {ifr ? t.ejercicio(repaso.actual + 1, repaso.sorteo.length) : t.maniobra(repaso.actual + 1, repaso.sorteo.length, nombreManiobra(actualId, idioma))}
          </p>
        )}
        {repaso.vor && <p className="text-white">VOR {repaso.vor.ident} · {repaso.vor.mhz.toFixed(2)}</p>}
        {repaso.zona && !actualId && repaso.etapa === "salida" && <p className="text-white">{repaso.zona.nombre[idioma]}</p>}
        {repaso.motivo && <p className="text-sm text-gold-300">{repaso.motivo}</p>}
      </section>

      {eligeVor && (
        <section className="space-y-2 rounded-xl border border-white/10 p-4 text-sm">
          <p className="font-semibold text-white">{t.vors}</p>
          {cercanos.length === 0 && <p className="text-white/60">{t.sinVors}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {cercanos.slice(0, 8).map((v) => (
              <button
                key={`${v.ident}-${v.mhz}`}
                type="button"
                aria-pressed={repaso.vor?.ident === v.ident && repaso.vor.mhz === v.mhz}
                onClick={() => muestra && poner(ponerVor(repaso, elegirVor(v, muestra)))}
                className={`rounded-lg border px-3 py-2 text-left ${repaso.vor?.ident === v.ident && repaso.vor.mhz === v.mhz ? "border-gold-500 bg-gold-500/15 text-gold-100" : "border-white/15 text-white"}`}
              >
                <span className="block font-display font-bold">{v.ident} · {v.mhz.toFixed(2)}</span>
                <span className="block text-xs text-white/70">
                  {Math.round(v.nm)} NM{v.dme ? ` · ${t.conDme}` : ""}{v.largo ? ` · ${t.largo}` : ""}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {actualId && !resultado && (
        <section className="space-y-2 rounded-xl border border-white/10 p-4 text-sm text-white/85">
          <p className="font-semibold text-white">{def.textoPaso(paso, ev, idioma)}</p>
          <ul className="space-y-1">
            {def.pasos(paso, idioma).map((p) => (
              <li key={p.nombre} className={p.estado === "actual" ? "text-gold-200" : p.estado === "hecho" ? "text-white/50 line-through" : "text-white/70"}>{p.nombre}</li>
            ))}
          </ul>
        </section>
      )}
      {actualId && resultado && (
        <>
          <Hoja resultado={resultado} idioma={idioma} />
          <Explicacion resultado={resultado} idioma={idioma} def={def} />
        </>
      )}
      {noAprobada && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={reiniciar}>{t.repetir}</Button>
          <Button className="flex-1" variant="secondary" onClick={pasar}>{ifr ? t.siguienteIfr : t.siguiente}</Button>
        </div>
      )}
      {repaso.modo === "practica" && actualId && !resultado && (
        <button type="button" onClick={pasar} className="text-sm text-white/60 underline">{ifr ? t.siguienteIfr : t.siguiente}</button>
      )}

      {enVuelo && (
        <section className="rounded-xl border border-white/10 p-4 text-sm">
          <p className="flex justify-between font-semibold text-white">
            <span>{t.checklist}{seccion ? ` · ${seccion.titulo}` : ""}</span>
            {escucha.escuchando && <span className="text-xs text-emerald-300">{t.escuchando}</span>}
          </p>
          {escucha.error && <p className="text-gold-300">{escucha.error}</p>}
          {seccion && (
            <ul className="mt-2 space-y-0.5">
              {seccion.puntos.map((p, k) => (
                <li key={p.id} className={COLOR_PUNTO[cl.puntos[seccion.id][k].estado]}>{p.dicho}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {grabacion && (
        <div className="space-y-2">
          <DebriefingMapa grabacion={grabacion} idioma={idioma} />
          {mapa.estado === "guardando" && <p className="text-sm text-white/70">{t.mapaGuardando}</p>}
          {mapa.estado === "listo" && mapa.id && (
            <Link to={ROUTES.instructorVuelo(mapa.id)} className="text-sm text-gold-300 underline">{t.verDespues}</Link>
          )}
          {mapa.estado === "error" && (
            <p className="text-sm text-red-300">
              {t.mapaNoGuardado(mapa.error ?? "")}{" "}
              <button type="button" onClick={() => mapa.id && guardarMapa(mapa.id)} className="underline">{t.reintentar}</button>
            </p>
          )}
        </div>
      )}

      {deb && (
        <section className="space-y-3 rounded-xl border border-gold-500/40 bg-navy-950/60 p-5">
          <h2 className="font-display text-lg font-bold text-white">{deb.aprobado === null ? t.practicaFin : t.aprobado(deb.aprobado)} · {NOMBRE_NIVEL[idioma][repaso.nivel]}</h2>
          {deb.partes.map((p) => (
            <div key={p.id} className="text-sm">
              <p className="font-semibold text-gold-200">{p.titulo}</p>
              {p.bien.map((x) => <p key={x} className="text-emerald-200">✓ {x}</p>)}
              {p.repetir.map((x) => <p key={x} className="text-red-200">✗ {x}</p>)}
              {p.id === "maniobras" &&
                repaso.hechas.map((h, i) => {
                  if (!h.resultado) return null;
                  const HojaDe = HOJA[h.id];
                  return (
                    <details key={i} className="mt-2 rounded-lg border border-white/10 px-3 py-2">
                      <summary className="cursor-pointer text-white/80">{nombreManiobra(h.id, idioma)} · {h.resultado.calificacion}/100</summary>
                      <div className="mt-2 space-y-3">
                        <HojaDe resultado={h.resultado} idioma={idioma} />
                        <Explicacion resultado={h.resultado} idioma={idioma} def={MANIOBRAS[h.id]} />
                      </div>
                    </details>
                  );
                })}
            </div>
          ))}
          <p className="text-xs text-white/50">{textosReporte(idioma).aviso}</p>
          {guardado.estado === "guardando" && <p className="text-sm text-white/70">{t.guardando}</p>}
          {guardado.estado === "listo" && <p className="text-sm text-emerald-300">{t.guardado}</p>}
          {guardado.estado === "error" && (
            <p className="text-sm text-red-300">
              {t.noGuardado(guardado.error ?? "")} <button type="button" onClick={guardarLeccion} className="underline">{t.reintentar}</button>
            </p>
          )}
        </section>
      )}

      {terminado && !listo && (
        <section className="space-y-2 rounded-xl border border-white/10 p-4 text-sm text-white/85">
          <p>{t.esperaApagado}</p>
          <Button className="w-full" onClick={() => setListo(true)}>{t.terminar}</Button>
        </section>
      )}

      {enVuelo && (
        <button type="button" onClick={nueva} className="text-sm text-white/60 underline">{t.salir}</button>
      )}

      {(terminado || repaso.etapa === "invalido") && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={nueva}>{t.nueva}</Button>
          <Link to={menuRuta} className="flex-1 rounded-full border border-white/20 px-4 py-2 text-center text-white">{ifr ? t.menuIfr : t.menu}</Link>
        </div>
      )}
    </div>
  );
}
