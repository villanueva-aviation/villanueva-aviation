import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { ACCESO_ATIS } from "../features/atis/acceso";
import type { AeropuertoAtis } from "../features/atis/datos";
import { LETRAS } from "../features/atis/frases";
import { armarAtisMx, type Atis } from "../features/atis/generado";
import { cargarAudio, RadioAtis } from "../features/atis/motorAudio";
import { alcanceNm, debeCambiar, mezclaPorDistancia, offsetLoop, sintonizado, type Mezcla } from "../features/atis/radio";
import { useLectorAtis } from "../features/atis/useLectorAtis";
import { consultarMetar, type Metar } from "../lib/clima";
import { FOUNDER_EMAIL } from "../lib/constants";

const METAR_CADA_MS = 60_000;
const COLA_SEG = 2; // cargarAudio deja 2 s de silencio al final del buffer

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
  sonando: boolean;
};
type Vista = { icao: string; distNm: number; senal: Senal; atis: Atis | null; faltantes: string[]; metarViejo: boolean };
type EntradaMetar = { metar: Metar | null; pedidoMs: number; viejo: boolean };

const clave = (a: Atis) => `${a.icao}-${a.letra}`;
const duracion = (b: AudioBuffer) => b.duration - COLA_SEG;
const horaMetar = (a: Atis) => new Date(a.inicioMs).toISOString().slice(11, 16).replace(":", "");

function apagar(c: Canal) {
  if (!c.sonando) return;
  c.radio.detener();
  c.sonando = false;
}

// Sintonía nueva: clic, el loop donde va según la hora del METAR, y la mezcla (detener() dejó la voz en 0).
function tocar(c: Canal, offsetSeg: number, mezcla: Mezcla) {
  c.radio.clic();
  c.radio.reproducir(c.buffer!, offsetSeg);
  c.radio.ajustar(mezcla);
  c.sonando = true;
}

// ponytail: temporal, solo para probar el audio sin el lector. Se borra junto con el botón «Probar MMGL».
const METAR_PRUEBA: Metar = {
  icaoId: "MMGL", rawOb: "METAR MMGL 162240Z 12004KT 7SM FEW120 BKN300 25/09 A3014 RMK 8/078 ISOL SC",
  obsTime: Date.UTC(2026, 10, 16, 22, 40) / 1000, wdir: 120, wspd: 4, wgst: null, visib: 7,
  clouds: [{ cover: "FEW", base: 12000 }, { cover: "BKN", base: 30000 }], wxString: null, temp: 25, dewp: 9, altim: 1020.6, elev: 1529,
};

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
  return <Programa fundador={fundador} />;
}

function Programa({ fundador }: { fundador: boolean }) {
  const { estado, muestra } = useLectorAtis();
  const [aeropuertos, setAeropuertos] = useState<AeropuertoAtis[] | null>(null);
  const [iniciado, setIniciado] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [prueba, setPrueba] = useState(false);
  const [vistas, setVistas] = useState<(Vista | null)[]>([null, null]);
  const ctxRef = useRef<AudioContext | null>(null);
  const canales = useRef<Canal[]>([]);
  const metares = useRef(new Map<string, EntradaMetar>());

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
    if (!iniciado || !ctx || !aeropuertos || prueba) return;
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
        return { ...base, atis: actual, faltantes: actual ? c.faltantes! : [], metarViejo: false };
      }

      const e = metarDe(s.ap.icao);
      if (e.metar) {
        const nuevo = armarAtisMx(e.metar, s.ap);
        if (debeCambiar(c.atis ?? null, nuevo)) cargar(ctx, aeropuertos, c, nuevo);
      }
      // El ATIS nuevo entra al momento si no suena nada, o en la pausa del final del loop si ya suena otro.
      const sig = c.siguiente;
      if (sig && (!c.sonando || offsetLoop(Date.now(), c.atis!.inicioMs, duracion(c.buffer!)) >= duracion(c.buffer!))) {
        Object.assign(c, sig, { siguiente: null });
        if (c.sonando) c.radio.reproducir(c.buffer!, offsetLoop(Date.now(), c.atis!.inicioMs, duracion(c.buffer!)));
      }
      if (silenciado) apagar(c);
      else if (c.atis?.icao === s.ap.icao) {
        if (c.sonando) c.radio.ajustar(mezcla);
        else tocar(c, offsetLoop(Date.now(), c.atis.inicioMs, duracion(c.buffer!)), mezcla);
      }
      const atis = c.atis?.icao === s.ap.icao ? c.atis : null;
      return { ...base, atis, faltantes: atis ? c.faltantes! : [], metarViejo: e.viejo && !!e.metar };
    }));
    // metarDe y cargar solo tocan refs; la muestra llega cada segundo.
  }, [muestra, iniciado, aeropuertos, prueba, silenciado]);

  const empezar = () => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    canales.current = [0, 1].map(() => ({ radio: new RadioAtis(ctx), cargando: null, siguiente: null, sonando: false }));
    setIniciado(true);
    return ctx;
  };

  const probar = async () => {
    const ctx = empezar();
    const c = canales.current[0];
    const ap = aeropuertos?.find((a) => a.icao === "MMGL");
    if (!ap) return;
    setPrueba(true);
    const atis = armarAtisMx(METAR_PRUEBA, ap);
    const r = await cargarAudio(ctx, atis, aeropuertos!);
    for (const x of canales.current) apagar(x);
    Object.assign(c, { atis, ...r, cargando: null, siguiente: null });
    const mezcla = mezclaPorDistancia(10, 100, null)!;
    if (!silenciado) tocar(c, 0, mezcla);
    setVistas([{ icao: "MMGL", distNm: 10, senal: senalDe(mezcla), atis, faltantes: r.faltantes, metarViejo: false }, null]);
  };

  const terminarPrueba = () => {
    const c = canales.current[0];
    apagar(c);
    Object.assign(c, { atis: undefined, buffer: undefined, faltantes: undefined });
    setVistas([null, null]);
    setPrueba(false);
  };

  // Lo en vivo lo apaga y lo vuelve a sintonizar el efecto de la muestra; la prueba no pasa por ahí.
  const alternarSilencio = () => {
    const c = canales.current[0];
    if (prueba && c.buffer) {
      if (silenciado) tocar(c, 0, mezclaPorDistancia(10, 100, null)!);
      else apagar(c);
    }
    setSilenciado(!silenciado);
  };

  const sintonizados = vistas.filter((v): v is Vista => v !== null);

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 py-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-base font-bold text-white">ATIS</h1>
        {sintonizados.length === 0 && <span className="text-xs text-white/60">{ESTADO[estado]}</span>}
      </header>

      {!iniciado && <Button onClick={empezar} className="w-full">Empezar</Button>}

      {sintonizados.length > 0 && vistas.map((v, i) => v && (
        <section key={i} className="space-y-2 rounded-lg border border-white/10 bg-navy-900/60 p-3 text-sm">
          <p className="text-xs font-semibold text-white/50">COM{i + 1}</p>
          <h2 className="font-display font-bold text-white">
            {v.atis ? `${v.icao} · Información ${LETRAS[v.atis.letra.charCodeAt(0) - 65]} · METAR ${horaMetar(v.atis)}Z` : v.icao}
          </h2>
          <p className="text-white/70">
            {v.distNm.toFixed(1)} NM · Señal: <span className={COLOR_SENAL[v.senal]}>{v.senal}</span>
          </p>
          {v.metarViejo && <p className="text-gold-300">METAR sin actualizar</p>}
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
        <Button variant="secondary" onClick={alternarSilencio} className="w-full">
          {silenciado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {silenciado ? "Quitar silencio" : "Silenciar"}
        </Button>
      )}
      {fundador && aeropuertos && (
        <Button variant="ghost" onClick={prueba ? terminarPrueba : probar} className="w-full">
          {prueba ? "Terminar prueba" : "Probar MMGL"}
        </Button>
      )}

      <footer className="text-center text-xs text-white/40">Solo para simulación</footer>
    </div>
  );
}
