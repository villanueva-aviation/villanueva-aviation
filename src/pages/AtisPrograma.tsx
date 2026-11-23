import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { ACCESO_ATIS } from "../features/atis/acceso";
import type { AeropuertoAtis } from "../features/atis/datos";
import { LETRAS } from "../features/atis/frases";
import { armarAtisMx, type Atis } from "../features/atis/generado";
import { cargarAudio, RadioAtis } from "../features/atis/motorAudio";
import { estadoVigente, fuente, type EntradaRed, type EstadoRed, type Fuente, type Red } from "../features/atis/red";
import { alcanceNm, debeCambiar, entraSiguiente, mezclaPorDistancia, offsetLoop, PAUSA_LOOP_SEG, sintonizado, type Mezcla } from "../features/atis/radio";
import { useLectorAtis } from "../features/atis/useLectorAtis";
import { consultarMetar, type Metar } from "../lib/clima";
import { FOUNDER_EMAIL } from "../lib/constants";

const METAR_CADA_MS = 60_000;
const RED_CADA_MS = 60_000;
const CLAVE_RED = "atis-red";
const REDES: { red: Red; nombre: string }[] = [{ red: "ivao", nombre: "IVAO" }, { red: "vatsim", nombre: "VATSIM" }, { red: "ninguna", nombre: "Sin red" }];
const NOMBRE_RED: Record<Red, string> = { ivao: "IVAO", vatsim: "VATSIM", ninguna: "" };

function leerRed(): Red {
  try {
    const r = localStorage.getItem(CLAVE_RED);
    return r === "ivao" || r === "vatsim" ? r : "ninguna";
  } catch {
    return "ninguna";
  }
}

type Senal = "buena" | "débil" | "fuera de alcance";
// Mismo corte que mezclaPorDistancia: sin trémolo es señal limpia.
const senalDe = (m: Mezcla | null): Senal => (!m ? "fuera de alcance" : m.tremolo > 0 ? "débil" : "buena");
const COLOR_SENAL: Record<Senal, string> = { buena: "text-emerald-300", "débil": "text-gold-300", "fuera de alcance": "text-red-300" };

const ESTADO = {
  "sin-lector": "Abre el lector ATIS",
  "sin-simulador": "Esperando a MSFS",
  conectado: "Sintoniza la frecuencia ATIS de un aeropuerto",
} as const;

type Cargado = { atis: Atis; buffer: AudioBuffer; faltantes: string[] };
type Canal = Partial<Cargado> & {
  radio: RadioAtis;
  cargando: string | null; // clave del ATIS que se está cargando
  siguiente: Cargado | null; // ATIS nuevo esperando el fin del loop
  faseMs: number; // hora de la fase 0 del loop que suena
  sonando: boolean;
};
// origen: de dónde sale lo que se ve; null mientras llega la primera respuesta de la red.
type Vista = {
  icao: string; distNm: number; senal: Senal; atis: Atis | null; faltantes: string[]; avisoMetar: string | null;
  origen: Fuente | null; atisRed: EstadoRed["atis"]; avisoRed: string | null;
};
type PreguntaRed = EntradaRed & { pedidoMs: number };
type EntradaMetar = { metar: Metar | null; pedidoMs: number; viejo: boolean };

const clave = (a: Atis) => `${a.icao}-${a.letra}-${a.conControlador ? "atc" : "gen"}`;
const nombreLetra = (l: string) => (/^[A-Z]$/.test(l) ? LETRAS[l.charCodeAt(0) - 65] : l);
const duracion = (b: AudioBuffer) => b.duration - PAUSA_LOOP_SEG;
const horaMetar = (a: Atis) => new Date(a.inicioMs).toISOString().slice(11, 16).replace(":", "");

function apagar(c: Canal) {
  if (!c.sonando) return;
  c.radio.detener();
  c.sonando = false;
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
  const { estado, muestra } = useLectorAtis();
  const [aeropuertos, setAeropuertos] = useState<AeropuertoAtis[] | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [red, setRed] = useState<Red>(leerRed);
  const [vistas, setVistas] = useState<(Vista | null)[]>([null, null]);
  const ctxRef = useRef<AudioContext | null>(null);
  const canales = useRef<Canal[]>([]);
  const metares = useRef(new Map<string, EntradaMetar>());
  const redes = useRef(new Map<string, PreguntaRed>());

  useEffect(() => {
    fetch("/data/atis/MX.json").then((r) => r.json()).then(setAeropuertos).catch(() => setAeropuertos([]));
  }, []);

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
  const redDe = (r: Red, icao: string): PreguntaRed => {
    const k = `${r}-${icao}`;
    let e = redes.current.get(k);
    if (!e) redes.current.set(k, (e = { estado: null, recibidoMs: 0, pedidoMs: 0, fallo: false }));
    if (Date.now() - e.pedidoMs >= RED_CADA_MS) {
      const entrada = e;
      entrada.pedidoMs = Date.now();
      fetch(`/api/atis/red?icao=${icao}&red=${r}`)
        .then((res) => (res.ok ? (res.json() as Promise<EstadoRed>) : Promise.reject(new Error(String(res.status)))))
        .then((estado) => Object.assign(entrada, { estado, recibidoMs: Date.now(), fallo: false }), () => { entrada.fallo = true; });
    }
    return e;
  };

  // Cambiar de red a mano corta al momento, como cambiar de frecuencia; sin esto la regla nueva esperaría el fin del loop.
  const elegirRed = (r: Red) => {
    if (r === red) return;
    for (const c of canales.current) {
      apagar(c);
      Object.assign(c, { atis: undefined, buffer: undefined, faltantes: undefined, cargando: null, siguiente: null });
    }
    setRed(r);
    try {
      localStorage.setItem(CLAVE_RED, r);
    } catch {
      // Sin localStorage se elige otra vez la próxima.
    }
  };

  const cargar = (ctx: AudioContext, aps: AeropuertoAtis[], c: Canal, atis: Atis) => {
    const k = clave(atis);
    if (c.cargando === k || (c.siguiente && clave(c.siguiente.atis) === k)) return;
    c.cargando = k;
    cargarAudio(ctx, atis, aps).then(
      (r) => {
        if (c.cargando !== k) return; // ya se sintonizó otra cosa
        c.cargando = null;
        c.siguiente = { atis, ...r };
      },
      () => { if (c.cargando === k) c.cargando = null; },
    );
  };

  // Cada muestra del lector: qué oye cada COM y cómo suena.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!iniciado || !ctx || !aeropuertos) return;
    const m = muestra;
    const pos = m && m.lat !== null && m.lon !== null && m.aglFt !== null ? { lat: m.lat, lon: m.lon, aglFt: m.aglFt } : null;
    setVistas(canales.current.map((c, i): Vista | null => {
      const com = m?.com[i];
      // Altura infinita: el aeropuerto más cercano en esa frecuencia, sin importar el alcance. El alcance lo decide la mezcla.
      const s = com && pos ? sintonizado(com, { ...pos, aglFt: Infinity }, aeropuertos) : null;
      if (!com || !pos || !s) {
        apagar(c);
        return null;
      }
      const mezcla = mezclaPorDistancia(s.distNm, alcanceNm(pos.aglFt), com.volumen);
      if (c.atis && c.atis.icao !== s.ap.icao) apagar(c); // otra frecuencia: corte
      const base = { icao: s.ap.icao, distNm: s.distNm, senal: senalDe(mezcla) };
      const actual = c.atis?.icao === s.ap.icao ? c.atis : null;
      if (!mezcla) {
        apagar(c);
        return { ...base, atis: actual, faltantes: actual ? c.faltantes! : [], avisoMetar: null, origen: null, atisRed: null, avisoRed: null };
      }

      // De dónde sale el ATIS: la red manda. Mientras llega su primera respuesta no suena nada.
      const r = red === "ninguna" ? null : redDe(red, s.ap.icao);
      const avisoRed = r?.fallo ? "Sin datos de la red" : null;
      // Una respuesta vieja (volver a un aeropuerto, falla larga) no vale: anunciaría la pista sin controlador.
      const vigente = r ? estadoVigente(r, Date.now()) : null;
      if (vigente === "esperando") {
        apagar(c);
        return { ...base, atis: null, faltantes: [], avisoMetar: null, origen: null, atisRed: null, avisoRed: "Consultando la red…" };
      }
      const origen = fuente(red, vigente);
      if (origen === "cliente") {
        apagar(c); // la red ya da su ATIS por voz en el cliente del piloto
        return { ...base, atis: null, faltantes: [], avisoMetar: null, origen, atisRed: vigente!.atis, avisoRed };
      }
      const conControlador = origen === "sin-letra";

      const e = metarDe(s.ap.icao);
      if (e.metar) {
        const nuevo = armarAtisMx(e.metar, s.ap, { conControlador });
        if (debeCambiar(c.atis ?? null, nuevo)) cargar(ctx, aeropuertos, c, nuevo);
      }
      // El ATIS nuevo entra al momento si no suena nada, o en la pausa del final del loop si ya suena otro.
      // Uno que llegó tarde de otro aeropuerto (A→B→A rápido) no entra.
      // Uno que llegó tarde con la regla vieja de la red (se conectó o se fue un controlador) tampoco.
      if (c.siguiente && (c.siguiente.atis.icao !== s.ap.icao || c.siguiente.atis.conControlador !== conControlador)) c.siguiente = null;
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
      else if (c.atis?.icao === s.ap.icao && (c.sonando || c.atis.conControlador === conControlador)) {
        if (c.sonando) c.radio.ajustar(mezcla);
        else tocar(c, c.atis.inicioMs, mezcla);
      }
      const atis = c.atis?.icao === s.ap.icao ? c.atis : null;
      const avisoMetar = !e.viejo ? null : e.metar ? "METAR sin actualizar" : "Sin METAR";
      return { ...base, atis, faltantes: atis ? c.faltantes! : [], avisoMetar, origen, atisRed: null, avisoRed };
    }));
    // metarDe y cargar solo tocan refs; la muestra llega cada segundo.
  }, [muestra, iniciado, aeropuertos, silenciado, red]);

  const empezar = () => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    canales.current = [0, 1].map(() => ({ radio: new RadioAtis(ctx), cargando: null, siguiente: null, faseMs: 0, sonando: false }));
    setIniciado(true);
    return ctx;
  };

  const sintonizados = vistas.filter((v): v is Vista => v !== null);

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 py-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-base font-bold text-white">ATIS</h1>
        {sintonizados.length === 0 && <span className="text-xs text-white/60">{ESTADO[estado]}</span>}
      </header>

      <div className="flex gap-2" role="group" aria-label="Red">
        {REDES.map(({ red: r, nombre }) => (
          <button
            key={r}
            type="button"
            aria-pressed={red === r}
            onClick={() => elegirRed(r)}
            className={`flex-1 rounded-full border px-3 py-1.5 font-display text-xs font-semibold ${red === r ? "border-gold-500 bg-gold-500/15 text-gold-200" : "border-white/15 text-white/70"}`}
          >
            {nombre}
          </button>
        ))}
      </div>

      {!iniciado && <Button onClick={empezar} className="w-full">Empezar</Button>}

      {sintonizados.length > 0 && vistas.map((v, i) => v && (
        <section key={i} className="space-y-2 rounded-lg border border-white/10 bg-navy-900/60 p-3 text-sm">
          <p className="text-xs font-semibold text-white/50">COM{i + 1}</p>
          <h2 className="font-display font-bold text-white">
            {v.origen === "cliente" && v.atisRed?.letra ? `${v.icao} · Información ${nombreLetra(v.atisRed.letra)}`
              : v.atis?.conControlador ? `${v.icao} · Sin letra · METAR ${horaMetar(v.atis)}Z`
              : v.atis ? `${v.icao} · Información ${nombreLetra(v.atis.letra)} · METAR ${horaMetar(v.atis)}Z` : v.icao}
          </h2>
          {v.origen === "cliente" ? <p className="text-xs text-white/50">ATIS de {NOMBRE_RED[red]}</p>
            : v.atis?.conControlador ? <p className="text-xs text-white/50">Generado sin letra: hay controlador en línea</p>
            : v.atis && <p className="text-xs text-white/50">Generado con el METAR de las {horaMetar(v.atis)}Z</p>}
          <p className="text-white/70">
            {v.distNm.toFixed(1)} NM · Señal: <span className={COLOR_SENAL[v.senal]}>{v.senal}</span>
          </p>
          {v.avisoMetar && <p className="text-gold-300">{v.avisoMetar}</p>}
          {v.avisoRed && <p className="text-gold-300">{v.avisoRed}</p>}
          {v.origen === "cliente" && v.atisRed && (
            <div className="space-y-1 rounded border border-white/10 p-2">
              {v.atisRed.lineas.map((l, j) => <p key={j} className="text-white/85">{l}</p>)}
              <span className="inline-block rounded border border-gold-500/40 px-1 text-[10px] uppercase tracking-wide text-gold-200">Escúchalo en tu cliente</span>
            </div>
          )}
          {v.atis && (["es", "en"] as const).map((idioma) => (
            <div key={idioma} className="space-y-1 rounded border border-white/10 p-2">
              {v.atis!.partes.filter((p) => p.idioma === idioma).map((p, j) => (
                <p key={j} className={p.soloTexto ? "text-white/40" : "text-white/85"}>
                  {p.texto}
                  {p.soloTexto && <span className="ml-2 rounded border border-white/15 px-1 text-[10px] uppercase tracking-wide">Solo en texto</span>}
                </p>
              ))}
            </div>
          ))}
          {v.faltantes.length > 0 && <p className="text-gold-300">Falta audio: {v.faltantes.join(", ")}</p>}
        </section>
      ))}

      {iniciado && (
        <Button variant="secondary" onClick={() => setSilenciado(!silenciado)} className="w-full">
          {silenciado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {silenciado ? "Quitar silencio" : "Silenciar"}
        </Button>
      )}

      <footer className="text-center text-xs text-white/40">Solo para simulación</footer>
    </div>
  );
}
