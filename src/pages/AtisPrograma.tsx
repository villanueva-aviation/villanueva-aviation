import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { ACCESO_ATIS } from "../features/atis/acceso";
import { conNombres, type AeropuertoAtis, type Nombres } from "../features/atis/datos";
import { armarDatis, armarVatsim, datisVigente, nombreFrecuencia, type EntradaDatis, type PreguntaReal } from "../features/atis/datis";
import { formatoDe } from "../features/atis/formato";
import { LETRAS } from "../features/atis/frases";
import { armarAtis, type Atis } from "../features/atis/generado";
import { cargarAudio, RadioAtis } from "../features/atis/motorAudio";
import { datosDeRed, estacionPara, estadoVigente, fuente, type EntradaRed, type EstadoRed, type Fuente, type Red } from "../features/atis/red";
import { alcanceNm, debeCambiar, entraSiguiente, mezclaPorDistancia, offsetLoop, PAUSA_LOOP_SEG, sintonizado, type Mezcla } from "../features/atis/radio";
import { useLectorAtis } from "../features/atis/useLectorAtis";
import { consultarMetar, type Metar } from "../lib/clima";
import { FOUNDER_EMAIL } from "../lib/constants";

const METAR_CADA_MS = 60_000;
const RED_CADA_MS = 60_000;
const REAL_CADA_MS = 60_000;
const REINTENTO_MS = 15_000; // reintento de la voz en vivo que no llegó
const CLAVE_RED = "atis-red";
const CLAVE_LEER = "atis-leer-red";
const REDES: Red[] = ["ivao", "vatsim", "ninguna"];
const NOMBRE_RED: Record<Red, string> = { ivao: "IVAO", vatsim: "VATSIM", ninguna: "" };

function leerRed(): Red {
  try {
    const r = localStorage.getItem(CLAVE_RED);
    return r === "ivao" || r === "vatsim" ? r : "ninguna";
  } catch {
    return "ninguna";
  }
}

// Leer en voz el ATIS de texto de la red: apagado de inicio (con Altitude o vPilot se oirían dos ATIS a la vez).
function leerVozGuardado(): boolean {
  try {
    return localStorage.getItem(CLAVE_LEER) === "1";
  } catch {
    return false;
  }
}

type Senal = "buena" | "debil" | "fuera";
// Mismo corte que mezclaPorDistancia: sin trémolo es señal limpia.
const senalDe = (m: Mezcla | null): Senal => (!m ? "fuera" : m.tremolo > 0 ? "debil" : "buena");
const COLOR_SENAL: Record<Senal, string> = { buena: "text-emerald-300", debil: "text-gold-300", fuera: "text-red-300" };

// La pantalla sigue el idioma del navegador; el texto del ATIS sigue el formato del aeropuerto.
const en = !navigator.language.toLowerCase().startsWith("es");
const TEXTOS = {
  es: {
    "sin-lector": "Abre el lector ATIS", "sin-simulador": "Esperando a MSFS", conectado: "Sintoniza la frecuencia ATIS de un aeropuerto",
    buscando: "Buscando aeropuertos…", red: "Red", ninguna: "Sin red", empezar: "Empezar", silenciar: "Silenciar", quitarSilencio: "Quitar silencio",
    senal: "Señal", buena: "buena", debil: "débil", fuera: "fuera de alcance",
    sinMetar: "Sin METAR", metarViejo: "METAR sin actualizar", sinDatosRed: "Sin datos de la red", consultando: "Consultando la red…",
    atisDe: (n: string) => `ATIS de ${n}`, sinLetraAviso: "Generado sin letra: hay controlador en línea",
    generado: (h: string) => `Generado con el METAR de las ${h}Z`, cliente: "Escúchalo en tu cliente", soloTexto: "Solo en texto",
    faltaAudio: "Falta audio:", informacion: "Información", sinLetra: "Sin letra", soloSim: "Solo para simulación",
    leerVoz: "Leer en voz el ATIS de la red", leido: "Leído con la voz del programa",
    real: "ATIS real (D-ATIS)", consultandoReal: "Consultando el D-ATIS…",
  },
  en: {
    "sin-lector": "Open the ATIS reader", "sin-simulador": "Waiting for MSFS", conectado: "Tune an airport's ATIS frequency",
    buscando: "Finding airports…", red: "Network", ninguna: "No network", empezar: "Start", silenciar: "Mute", quitarSilencio: "Unmute",
    senal: "Signal", buena: "good", debil: "weak", fuera: "out of range",
    sinMetar: "No METAR", metarViejo: "METAR not updated", sinDatosRed: "No network data", consultando: "Checking the network…",
    atisDe: (n: string) => `${n} ATIS`, sinLetraAviso: "Generated without letter: a controller is online",
    generado: (h: string) => `Generated from the ${h}Z METAR`, cliente: "Listen in your client", soloTexto: "Text only",
    faltaAudio: "Missing audio:", informacion: "Information", sinLetra: "No letter", soloSim: "For simulation only",
    leerVoz: "Read the network ATIS aloud", leido: "Read aloud by the program",
    real: "Real ATIS (D-ATIS)", consultandoReal: "Checking the D-ATIS…",
  },
};
const T = en ? TEXTOS.en : TEXTOS.es;

type Cargado = { atis: Atis; buffer: AudioBuffer; faltantes: string[] };
type Canal = Partial<Cargado> & {
  radio: RadioAtis;
  cargando: string | null; // clave del ATIS que se está cargando
  siguiente: Cargado | null; // ATIS nuevo esperando el fin del loop
  faseMs: number; // hora de la fase 0 del loop que suena
  sonando: boolean;
  reintentoMs: number; // hora del último intento de cargar
  mhz?: number; // frecuencia que oía en la muestra anterior
};
// origen: de dónde sale lo que se ve («real»: D-ATIS); null mientras llega la primera respuesta de la red.
type Vista = {
  icao: string; titulo: string; distNm: number; senal: Senal; atis: Atis | null; faltantes: string[]; avisoMetar: string | null;
  origen: Fuente | "real" | null; atisRed: EstadoRed["atis"]; avisoRed: string | null;
};
type PreguntaRed = EntradaRed & { pedidoMs: number };
type EntradaMetar = { metar: Metar | null; pedidoMs: number; viejo: boolean };
type PreguntaRealPagina = PreguntaReal & { pedidoMs: number };

const clave = (a: Atis) => `${a.icao}-${a.letra}-${a.conControlador ? "atc" : a.deRed ? `red-${a.cs ?? ""}-${a.huella ?? ""}` : a.real ? `real-${a.huella}` : "gen"}`;
const nombreLetra = (l: string) => (/^[A-Z]$/.test(l) ? LETRAS[l.charCodeAt(0) - 65] : l);
const duracion = (b: AudioBuffer) => b.duration - PAUSA_LOOP_SEG;
const horaMetar = (a: Atis) => new Date(a.inicioMs).toISOString().slice(11, 16).replace(":", "");

function apagar(c: Canal) {
  if (!c.sonando) return;
  c.radio.detener();
  c.sonando = false;
}

// Corte total del canal: lo que suena, lo que carga y lo que esperaba el fin del loop.
function vaciar(c: Canal) {
  apagar(c);
  Object.assign(c, { atis: undefined, buffer: undefined, faltantes: undefined, cargando: null, siguiente: null });
}

// Sintonía nueva: clic, el loop donde va según faseMs (la hora del METAR), y la mezcla (detener() dejó la voz en 0).
function tocar(c: Canal, faseMs: number, mezcla: Mezcla) {
  c.faseMs = faseMs;
  c.radio.clic();
  c.radio.reproducir(c.buffer!, offsetLoop(Date.now(), faseMs, duracion(c.buffer!)));
  c.radio.ajustar(mezcla);
  c.sonando = true;
}

export function AtisPrograma() {
  const { user } = useAuth();
  const fundador = user?.email === FOUNDER_EMAIL;
  if (ACCESO_ATIS === "fundador" && !fundador) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[480px] items-center justify-center px-4 text-center">
        <h1 className="font-display text-xl font-bold text-white">Próximamente</h1>
      </div>
    );
  }
  return <Programa />;
}

function Programa() {
  const { estado, muestra, aeropuertos: delLector } = useLectorAtis();
  const [nombres, setNombres] = useState<Nombres | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [red, setRed] = useState<Red>(leerRed);
  const [leerVoz, setLeerVoz] = useState(leerVozGuardado);
  const [vistas, setVistas] = useState<(Vista | null)[]>([null, null]);
  const ctxRef = useRef<AudioContext | null>(null);
  const canales = useRef<Canal[]>([]);
  const metares = useRef(new Map<string, EntradaMetar>());
  const redes = useRef(new Map<string, PreguntaRed>());
  const reales = useRef(new Map<string, PreguntaRealPagina>());

  useEffect(() => {
    fetch("/data/atis/nombres.json").then((r) => r.json()).then(setNombres).catch(() => setNombres({}));
  }, []);

  // Aeropuertos del lector con sus nombres; sin nombre, el encabezado dice el nombre de MSFS y el ATIS abre en fonética.
  const aeropuertos = useMemo<AeropuertoAtis[] | null>(
    () => (delLector && nombres ? conNombres(delLector.map(({ nombre, ...a }) => ({ ...a, nombreSim: nombre })), nombres) : null),
    [delLector, nombres],
  );

  useEffect(() => () => {
    for (const c of canales.current) c.radio.cerrar();
    ctxRef.current?.close();
  }, []);

  // Pide el METAR la primera vez y cada 60 s; si falla, se queda el último.
  const metarDe = (icao: string): EntradaMetar => {
    let e = metares.current.get(icao);
    if (!e) metares.current.set(icao, (e = { metar: null, pedidoMs: 0, viejo: false }));
    if (Date.now() - e.pedidoMs >= METAR_CADA_MS) {
      const entrada = e;
      entrada.pedidoMs = Date.now();
      consultarMetar(icao).then(
        (m) => Object.assign(entrada, m ? { metar: m, viejo: false } : { viejo: true }),
        () => { entrada.viejo = true; },
      );
    }
    return e;
  };

  // Pregunta a la red la primera vez y cada 60 s; si falla, se queda la última respuesta y avisa.
  const redDe = (r: Red, ap: AeropuertoAtis): PreguntaRed => {
    const { icao } = ap;
    const k = `${r}-${icao}`;
    let e = redes.current.get(k);
    if (!e) redes.current.set(k, (e = { estado: null, recibidoMs: 0, pedidoMs: 0, fallo: false }));
    if (Date.now() - e.pedidoMs >= RED_CADA_MS) {
      const entrada = e;
      entrada.pedidoMs = Date.now();
      fetch(`/api/atis/red?icao=${icao}&red=${r}&lat=${ap.lat}&lon=${ap.lon}`)
        .then((res) => (res.ok ? (res.json() as Promise<EstadoRed>) : Promise.reject(new Error(String(res.status)))))
        .then((estado) => Object.assign(entrada, { estado, recibidoMs: Date.now(), fallo: false }), () => { entrada.fallo = true; });
    }
    return e;
  };

  // El D-ATIS de EE. UU., igual que la red: la primera vez y cada 60 s; guarda la última respuesta buena (una falla no la borra) y si falló.
  const realDe = (icao: string): PreguntaRealPagina => {
    let e = reales.current.get(icao);
    if (!e) reales.current.set(icao, (e = { entradas: null, pedidoMs: 0, fallo: false }));
    if (Date.now() - e.pedidoMs >= REAL_CADA_MS) {
      const entrada = e;
      entrada.pedidoMs = Date.now();
      fetch(`/api/atis/real?icao=${icao}`, { signal: AbortSignal.timeout(10_000) }) // colgada cuenta como falla
        .then((res) => (res.ok ? (res.json() as Promise<EntradaDatis[]>) : Promise.reject(new Error(String(res.status)))))
        .then((entradas) => Object.assign(entrada, { entradas, fallo: false }), () => { entrada.fallo = true; });
    }
    return e;
  };

  // Cambiar de red a mano corta al momento, como cambiar de frecuencia; sin esto la regla nueva esperaría el fin del loop.
  const cortar = () => {
    for (const c of canales.current) vaciar(c);
  };
  const guardar = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      // Sin localStorage se elige otra vez la próxima.
    }
  };
  const elegirRed = (r: Red) => {
    if (r === red) return;
    cortar();
    setRed(r);
    guardar(CLAVE_RED, r);
  };
  const cambiarLeerVoz = (v: boolean) => {
    cortar();
    setLeerVoz(v);
    guardar(CLAVE_LEER, v ? "1" : "0");
  };

  const cargar = (ctx: AudioContext, aps: AeropuertoAtis[], c: Canal, atis: Atis) => {
    const k = clave(atis);
    if (c.cargando === k || (c.siguiente && clave(c.siguiente.atis) === k)) return;
    c.cargando = k;
    c.reintentoMs = Date.now();
    cargarAudio(ctx, atis, aps).then(
      (r) => {
        if (c.cargando !== k) return; // ya se sintonizó otra cosa
        c.cargando = null;
        // Un reintento que no consiguió más voz en vivo no se cambia: dejaría el mismo audio y recortaría la pausa del loop.
        if (c.atis && clave(c.atis) === k && r.faltantes.length >= c.faltantes!.length) return;
        c.siguiente = { atis, ...r };
      },
      () => { if (c.cargando === k) c.cargando = null; },
    );
  };

  // Cada muestra del lector: qué oye cada COM y cómo suena.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!iniciado || !ctx) return;
    const aps = aeropuertos ?? []; // sin lista todavía: ningún canal suena (apagar), no se congela lo último
    const m = muestra;
    const pos = m && m.lat !== null && m.lon !== null && m.aglFt !== null ? { lat: m.lat, lon: m.lon, aglFt: m.aglFt } : null;
    setVistas(canales.current.map((c, i): Vista | null => {
      const com = m?.com[i];
      // Altura infinita: el aeropuerto más cercano en esa frecuencia, sin importar el alcance. El alcance lo decide la mezcla.
      const s = com && pos ? sintonizado(com, { ...pos, aglFt: Infinity }, aps) : null;
      if (!com || !pos || !s) {
        apagar(c);
        return null;
      }
      const mezcla = mezclaPorDistancia(s.distNm, alcanceNm(pos.aglFt), com.volumen);
      if (c.atis && c.atis.icao !== s.ap.icao) apagar(c); // otra frecuencia: corte
      // Otra frecuencia del mismo aeropuerto (KATL 119.65 llegadas → 125.55 salidas): corte al momento, como en el radio.
      else if (c.mhz !== undefined && c.mhz !== com.mhz) vaciar(c);
      c.mhz = com.mhz;
      const titulo = s.ap.nombreEs === null && s.ap.nombreEn === null ? `${s.ap.icao} · ${s.ap.nombreSim}` : s.ap.icao;
      const base = { icao: s.ap.icao, titulo, distNm: s.distNm, senal: senalDe(mezcla) };
      const actual = c.atis?.icao === s.ap.icao ? c.atis : null;
      if (!mezcla) {
        apagar(c);
        return { ...base, atis: actual, faltantes: actual ? c.faltantes! : [], avisoMetar: null, origen: null, atisRed: null, avisoRed: null };
      }

      // De dónde sale el ATIS: la red manda. Mientras llega su primera respuesta no suena nada.
      const r = red === "ninguna" ? null : redDe(red, s.ap);
      const avisoRed = r?.fallo ? T.sinDatosRed : null;
      // Una respuesta vieja (volver a un aeropuerto, falla larga) no vale: anunciaría la pista sin controlador.
      const vigente = r ? estadoVigente(r, Date.now()) : null;
      if (vigente === "esperando") {
        apagar(c);
        return { ...base, atis: null, faltantes: [], avisoMetar: null, origen: null, atisRed: null, avisoRed: T.consultando };
      }
      const origen = fuente(red, vigente);
      // La estación de la red de la frecuencia sintonizada (VATSIM: llegadas o salidas aparte); IVAO solo da una.
      const estacion = origen === "cliente" ? estacionPara(vigente!.estaciones, s.ap.icao, com.mhz, nombreFrecuencia(s.ap, com.mhz)) : null;
      // Con lista de estaciones (VATSIM) solo vale la de esa frecuencia: sin ella se calla como con vPilot, nunca la otra.
      // Sin lista (IVAO, o una respuesta vieja) se usa su único ATIS.
      const est = origen !== "cliente" ? null : vigente!.estaciones?.length ? estacion : vigente!.atis;
      // Con el interruptor, en EE. UU. el ATIS de VATSIM se lee palabra por palabra como el D-ATIS; si no se puede leer,
      // como en los demás: su letra y su pista con las piezas, el METAR de aviationweather. Nunca el de otra estación.
      const textual = origen === "cliente" && leerVoz && red === "vatsim" && formatoDe(s.ap.icao) === "faa" && estacion
        ? armarVatsim(s.ap.icao, estacion, s.ap, Date.now()) : null;
      const deRed = est && leerVoz && !textual ? datosDeRed(est) : null;
      if (origen === "cliente" && !deRed && !textual) {
        apagar(c); // la red ya da su ATIS por voz en el cliente del piloto
        return { ...base, atis: null, faltantes: [], avisoMetar: null, origen, atisRed: est, avisoRed };
      }
      const conControlador = origen === "sin-letra";
      // Donde sonaría el generado, en EE. UU. suena el D-ATIS vigente de esa frecuencia; mientras llega su primera respuesta, silencio.
      const datis = origen === "generado" && formatoDe(s.ap.icao) === "faa"
        ? datisVigente(realDe(s.ap.icao), nombreFrecuencia(s.ap, com.mhz), Date.now(), com.mhz) : null;
      if (datis === "esperando") {
        apagar(c);
        return { ...base, atis: null, faltantes: [], avisoMetar: null, origen: null, atisRed: null, avisoRed: T.consultandoReal };
      }
      const real = !!datis;

      const e = metarDe(s.ap.icao);
      const armado = textual ?? (datis ? armarDatis(datis, s.ap, Date.now())
        : e.metar ? armarAtis(e.metar, s.ap, { conControlador, deRed: deRed ?? undefined }) : null);
      // Llegadas y salidas de VATSIM pueden tener la misma letra: el callsign las distingue (clave de carga y cambio).
      const nuevo = armado && (deRed || textual) && estacion ? { ...armado, cs: estacion.callsign } : armado;
      if (nuevo && debeCambiar(c.atis ?? null, nuevo)) cargar(ctx, aps, c, nuevo);
      // Suena este mismo ATIS sin parte de su voz en vivo: cada 15 s se vuelve a cargar; entra en la pausa del loop como siguiente.
      else if (nuevo && !c.cargando && !c.siguiente && c.faltantes?.some((f) => f.startsWith("vivo-"))
        && Date.now() - c.reintentoMs >= REINTENTO_MS) cargar(ctx, aps, c, nuevo);
      // El ATIS nuevo entra al momento si no suena nada, o en la pausa del final del loop si ya suena otro.
      // Uno que llegó tarde de otro aeropuerto (A→B→A rápido) no entra.
      // Uno que llegó tarde con la regla vieja de la red (se conectó o se fue un controlador) tampoco.
      if (c.siguiente && (c.siguiente.atis.icao !== s.ap.icao || c.siguiente.atis.conControlador !== conControlador
        || !!c.siguiente.atis.deRed !== !!(deRed || textual) || !!c.siguiente.atis.real !== real
        || c.siguiente.atis.cs !== nuevo?.cs)) c.siguiente = null; // ni el de la otra estación (llegadas/salidas)
      const sig = c.siguiente;
      if (sig && entraSiguiente(c.sonando, Date.now(), c.faseMs, duracion(c.buffer ?? sig.buffer))) {
        Object.assign(c, sig, { siguiente: null });
        // Cambio de letra en la pausa: la nueva empieza desde el principio, no a media palabra, y su fase 0 es ahora.
        if (c.sonando) {
          c.faseMs = Date.now();
          c.radio.reproducir(c.buffer!, 0);
        }
      }
      if (silenciado) apagar(c);
      // Si ya suena, el cambio de regla entra en la pausa del loop; si no, solo arranca el ATIS de la regla actual.
      else if (c.atis?.icao === s.ap.icao && (c.sonando || (c.atis.conControlador === conControlador && !!c.atis.deRed === !!(deRed || textual) && !!c.atis.real === real))) {
        if (c.sonando) c.radio.ajustar(mezcla);
        else tocar(c, c.atis.inicioMs, mezcla);
      }
      const atis = c.atis?.icao === s.ap.icao ? c.atis : null;
      const avisoMetar = real || textual || !e.viejo ? null : e.metar ? T.metarViejo : T.sinMetar;
      return { ...base, atis, faltantes: atis ? c.faltantes! : [], avisoMetar, origen: real ? "real" : origen, atisRed: deRed || textual ? est : null, avisoRed };
    }));
    // metarDe y cargar solo tocan refs; la muestra llega cada segundo.
  }, [muestra, iniciado, aeropuertos, silenciado, red, leerVoz]);

  const empezar = () => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    canales.current = [0, 1].map(() => ({ radio: new RadioAtis(ctx), cargando: null, siguiente: null, faseMs: 0, sonando: false, reintentoMs: 0 }));
    setIniciado(true);
    return ctx;
  };

  const sintonizados = vistas.filter((v): v is Vista => v !== null);

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 py-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-base font-bold text-white">ATIS</h1>
        {sintonizados.length === 0 && <span className="text-xs text-white/60">{estado === "conectado" && !delLector?.length ? T.buscando : T[estado]}</span>}
      </header>

      <div className="flex gap-2" role="group" aria-label={T.red}>
        {REDES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={red === r}
            onClick={() => elegirRed(r)}
            className={`flex-1 rounded-full border px-3 py-1.5 font-display text-xs font-semibold ${red === r ? "border-gold-500 bg-gold-500/15 text-gold-200" : "border-white/15 text-white/70"}`}
          >
            {r === "ninguna" ? T.ninguna : NOMBRE_RED[r]}
          </button>
        ))}
      </div>

      {red !== "ninguna" && (
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input type="checkbox" checked={leerVoz} onChange={(e) => cambiarLeerVoz(e.target.checked)} className="accent-gold-500" />
          {T.leerVoz}
        </label>
      )}

      {!iniciado && <Button onClick={empezar} className="w-full">{T.empezar}</Button>}

      {sintonizados.length > 0 && vistas.map((v, i) => v && (
        <section key={i} className="space-y-2 rounded-lg border border-white/10 bg-navy-900/60 p-3 text-sm">
          <p className="text-xs font-semibold text-white/50">COM{i + 1}</p>
          <h2 className="font-display font-bold text-white">
            {v.origen === "cliente" && v.atisRed?.letra ? `${v.titulo} · ${T.informacion} ${nombreLetra(v.atisRed.letra)}`
              : v.atis?.conControlador ? `${v.titulo} · ${T.sinLetra} · METAR ${horaMetar(v.atis)}Z`
              : v.atis ? `${v.titulo} · ${T.informacion} ${nombreLetra(v.atis.letra)} · METAR ${horaMetar(v.atis)}Z` : v.titulo}
          </h2>
          {v.origen === "cliente" ? <p className="text-xs text-white/50">{T.atisDe(NOMBRE_RED[red])}</p>
            : v.atis?.conControlador ? <p className="text-xs text-white/50">{T.sinLetraAviso}</p>
            : v.atis?.real ? <p className="text-xs text-white/50">{T.real}</p>
            : v.atis && <p className="text-xs text-white/50">{T.generado(horaMetar(v.atis))}</p>}
          <p className="text-white/70">
            {v.distNm.toFixed(1)} NM · {T.senal}: <span className={COLOR_SENAL[v.senal]}>{T[v.senal]}</span>
          </p>
          {v.avisoMetar && <p className="text-gold-300">{v.avisoMetar}</p>}
          {v.avisoRed && <p className="text-gold-300">{v.avisoRed}</p>}
          {v.origen === "cliente" && v.atisRed && (
            <div className="space-y-1 rounded border border-white/10 p-2">
              {v.atisRed.lineas.map((l, j) => <p key={j} className="text-white/85">{l}</p>)}
              <span className="inline-block rounded border border-gold-500/40 px-1 text-[10px] uppercase tracking-wide text-gold-200">{v.atis?.deRed ? T.leido : T.cliente}</span>
            </div>
          )}
          {v.atis && (["es", "en"] as const).map((idioma) => (
            <div key={idioma} className="space-y-1 rounded border border-white/10 p-2">
              {v.atis!.partes.filter((p) => p.idioma === idioma).map((p, j) => {
                // La voz en vivo que no llegó se ve como «Solo en texto».
                const mudo = p.soloTexto || (!!p.vivo && p.piezas.some((x) => v.faltantes.includes(x.clave)));
                return (
                  <p key={j} className={mudo ? "text-white/40" : "text-white/85"}>
                    {p.texto}
                    {mudo && <span className="ml-2 rounded border border-white/15 px-1 text-[10px] uppercase tracking-wide">{T.soloTexto}</span>}
                  </p>
                );
              })}
            </div>
          ))}
          {v.faltantes.some((f) => !f.startsWith("vivo-")) && (
            <p className="text-gold-300">{T.faltaAudio} {v.faltantes.filter((f) => !f.startsWith("vivo-")).join(", ")}</p>
          )}
        </section>
      ))}

      {iniciado && (
        <Button variant="secondary" onClick={() => setSilenciado(!silenciado)} className="w-full">
          {silenciado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {silenciado ? T.quitarSilencio : T.silenciar}
        </Button>
      )}

      <footer className="text-center text-xs text-white/40">{T.soloSim}</footer>
    </div>
  );
}
