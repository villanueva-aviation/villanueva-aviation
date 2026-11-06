import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/Button";
import { MATERIAL_VIRAJE } from "../data/materialInstructor";
import { useAuth } from "../features/auth/AuthContext";
import { briefing, debriefing, listaPasos, queHacer, vozDebriefing } from "../features/instructor/briefing";
import { Explicacion } from "../features/instructor/ExplicacionInstructor";
import { HojaCheckride } from "../features/instructor/HojaCheckride";
import { PruebaMicrofono } from "../features/instructor/PruebaMicrofono";
import type { Idioma } from "../features/instructor/idiomaInstructor";
import { puedeMandar } from "../features/instructor/reglasIntentos";
import { ReporteExamen } from "../features/instructor/ReporteExamen";
import {
  armaEnBloque,
  avanzarSesion,
  comentarioIntento,
  crearSesion,
  GUIA_MIN,
  modoDelBloque,
  type Bloque,
  type EventoSesion,
  type IntentoSesion,
  type Sesion,
} from "../features/instructor/sesion";
import { useIntentoViraje } from "../features/instructor/useIntentoViraje";
import { useVoz } from "../features/instructor/useVoz";
import {
  avisoVoz,
  filtrarAviso,
  lecturaFinal,
  MEMORIA_VACIA,
  ordenVoz,
  paraVoz,
  pasoVoz,
  semaforo,
  textoEspera,
  textoPaso,
  type CampoAviso,
  type Luz,
  type MemoriaAviso,
  type PasoVoz,
} from "../features/instructor/voz";

const CLAVE_IDIOMA = "instructor-idioma";

const T = {
  es: {
    titulo: "Instructor virtual · Viraje escarpado C172",
    elegir: "¿En qué idioma quieres tu sesión?",
    bloques: { briefing: "Briefing", preparacion: "Preparación", practica: "Práctica", checkride: "Checkride", debriefing: "Debriefing", cierre: "Cierre" },
    min: "min",
    estado: { conectado: "Conectado a MSFS", "sin-simulador": "Abre MSFS 2020 con el C172", "sin-lector": "No encuentro el lector: ábrelo otra vez" },
    celdas: { altitud: "Altitud", velocidad: "Velocidad", inclinacion: "Inclinación", bola: "Bola" },
    listo: "Listo, empiezo",
    pasar: "Pasar al checkride",
    otro: "Otro intento",
    unoMas: "Un intento más",
    siguiente: "Siguiente",
    nueva: "Nueva sesión",
    anuladoAntes: (m: string) => `El intento anterior no se calificó: ${m} Ya empezó otro.`,
    sinCalificar: (m: string) => `Intento sin calificar: ${m}`,
    material: "Para practicar",
    exclusivo: "Exclusivo",
    guardando: "Guardando tu intento…",
    noGuardo: (e: string) => `No se pudo guardar: ${e}`,
    reintentar: "Reintentar guardar",
    mandar: "Mandar a revisión",
    mandado: "Mandado. Erik lo revisa para tu insignia.",
    sinCheckride: "Esta sesión no tuvo checkride.",
    voz: "Voz",
    vozNombre: "Voz del instructor",
    velocidad: "Velocidad",
    velocidades: { lenta: "Lenta", normal: "Normal", rapida: "Rápida" },
    detalle: "Cuánto habla",
    detalles: { detallado: "Detallado", necesario: "Solo lo necesario" },
    probar: "Probar voz",
    prueba: "Hola, soy tu instructor. Así me vas a escuchar.",
    sinVoz: "Tu PC no tiene una voz en español: sigue en texto.",
  },
  en: {
    titulo: "Virtual instructor · C172 steep turn",
    elegir: "Which language do you want for your session?",
    bloques: { briefing: "Briefing", preparacion: "Preparation", practica: "Practice", checkride: "Checkride", debriefing: "Debriefing", cierre: "Wrap-up" },
    min: "min",
    estado: { conectado: "Connected to MSFS", "sin-simulador": "Open MSFS 2020 with the C172", "sin-lector": "Can't find the reader: open it again" },
    celdas: { altitud: "Altitude", velocidad: "Airspeed", inclinacion: "Bank", bola: "Ball" },
    listo: "Ready, let's start",
    pasar: "Move on to the checkride",
    otro: "Another attempt",
    unoMas: "One more attempt",
    siguiente: "Next",
    nueva: "New session",
    anuladoAntes: (m: string) => `The last attempt wasn't graded: ${m} A new one has started.`,
    sinCalificar: (m: string) => `Attempt not graded: ${m}`,
    material: "To practice",
    exclusivo: "Exclusive",
    guardando: "Saving your attempt…",
    noGuardo: (e: string) => `Couldn't save: ${e}`,
    reintentar: "Retry saving",
    mandar: "Send for review",
    mandado: "Sent. Erik reviews it for your badge.",
    sinCheckride: "This session had no checkride.",
    voz: "Voice",
    vozNombre: "Instructor voice",
    velocidad: "Speed",
    velocidades: { lenta: "Slow", normal: "Normal", rapida: "Fast" },
    detalle: "How much it talks",
    detalles: { detallado: "Detailed", necesario: "Only what's needed" },
    probar: "Test voice",
    prueba: "Hi, I'm your instructor. This is how I'll sound.",
    sinVoz: "Your PC has no English voice: text only.",
  },
};

const COLOR: Record<Luz, string> = {
  gris: "border-white/10 bg-white/5 text-white/40",
  verde: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  ambar: "border-gold-500/50 bg-gold-500/20 text-gold-200",
  rojo: "border-red-500/50 bg-red-500/20 text-red-200",
};
const COLOR_ESTADO = { conectado: "text-emerald-300", "sin-simulador": "text-gold-300", "sin-lector": "text-red-300" } as const;
const CAMPOS: CampoAviso[] = ["altitud", "velocidad", "inclinacion", "bola"];
const EN_VUELO: Bloque[] = ["preparacion", "practica", "checkride"];

function leerIdioma(): Idioma {
  try {
    return localStorage.getItem(CLAVE_IDIOMA) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

const reloj = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** El instructor en su propia ventana: una sesión de una hora en bloques, en español o inglés. */
export function InstructorPrograma() {
  const { user } = useAuth();
  const [idioma, setIdioma] = useState<Idioma>(leerIdioma);
  const t = T[idioma];
  const [sesion, setSesion] = useState<Sesion>(() => crearSesion(crypto.randomUUID()));
  const [ahora, setAhora] = useState(() => Date.now());
  const sesionRef = useRef(sesion);
  sesionRef.current = sesion;
  const dichoRef = useRef<(textos: string[], tipo: "orden" | "final") => void>(() => {});
  const vozRef = useRef<{ detalle: "detallado" | "necesario" }>({ detalle: "detallado" });

  /** Avanza la sesión y dice lo que la sesión pide decir. */
  const evento = useCallback(
    (e: EventoSesion) => {
      const r = avanzarSesion(sesionRef.current, e, idioma);
      if (r.sesion === sesionRef.current) return;
      sesionRef.current = r.sesion;
      setSesion(r.sesion);
      if (r.decir.length) dichoRef.current(r.decir.map((x) => paraVoz(x, idioma)), "orden");
    },
    [idioma],
  );

  const alTerminar = useCallback(
    (i: IntentoSesion) => {
      const antes = sesionRef.current;
      evento({ tipo: "intento", intento: i });
      const despues = sesionRef.current;
      if (despues.intentos.length === antes.intentos.length) return; // no contó (modo de otro bloque)
      const detallado = vozRef.current.detalle === "detallado";
      if (i.modo === "practica") {
        const n = despues.intentos.filter((x) => x.modo === "practica").length;
        const comentario = comentarioIntento(i, n, idioma);
        dichoRef.current([paraVoz(detallado ? comentario : comentario.split(". ")[0] + ".", idioma)], "orden");
      } else {
        const lectura = lecturaFinal(i.resultado, idioma);
        dichoRef.current(detallado ? lectura : lectura.slice(0, 1), "final");
      }
    },
    [evento, idioma],
  );

  const enVuelo = EN_VUELO.includes(sesion.bloque);
  const {
    estado, muestra, modoIntento, ev, resultado, anulado, reiniciar, guardado, guardar, intento, numero, mandar, envio,
  } = useIntentoViraje({ sesionId: sesion.id, modoFijo: modoDelBloque(sesion.bloque), arma: armaEnBloque(sesion.bloque), alTerminar });

  const pasoAntes = useRef<PasoVoz | null>(null);
  const memoria = useRef<MemoriaAviso>(MEMORIA_VACIA);
  const paso = enVuelo ? pasoVoz(ev, muestra) : null;
  const luces = semaforo(enVuelo ? ev : null, muestra);
  const avisoCrudo = enVuelo ? avisoVoz(ev, muestra, modoIntento, idioma) : null;
  const avisoActual = useRef(avisoCrudo);
  avisoActual.current = avisoCrudo;
  const voz = useVoz(idioma, () => avisoActual.current?.clave ?? null);
  vozRef.current = { detalle: voz.detalle };
  // En "Solo lo necesario" solo se dicen los avisos fuera de tolerancia.
  const aviso = avisoCrudo && (voz.detalle === "detallado" || avisoCrudo.nivel === "rojo") ? avisoCrudo : null;
  const { decir } = voz;
  dichoRef.current = (textos, tipo) => decir(textos, tipo);

  // Reloj de la sesión y la sugerencia de los 35 minutos.
  useEffect(() => {
    const id = window.setInterval(() => {
      const n = Date.now();
      setAhora(n);
      evento({ tipo: "reloj", ahoraMs: n });
    }, 1000);
    return () => window.clearInterval(id);
  }, [evento]);

  // El primer armado en la preparación abre la práctica.
  useEffect(() => {
    if (sesion.bloque === "preparacion" && ev?.fase === "armado") evento({ tipo: "armado" });
  }, [sesion.bloque, ev?.fase, evento]);

  // Lo que se lee al entrar a cada bloque.
  const deb = debriefing(sesion.intentos, MATERIAL_VIRAJE, idioma);
  const bloqueAntes = useRef<Bloque | null>(null);
  const debriefEmpezo = useRef(false);
  useEffect(() => {
    if (bloqueAntes.current === sesion.bloque) return;
    bloqueAntes.current = sesion.bloque;
    if (sesion.bloque === "briefing") decir(briefing(idioma).map((x) => paraVoz(x, idioma)), "orden");
    if (sesion.bloque === "debriefing") {
      debriefEmpezo.current = false;
      decir(vozDebriefing(deb.lineas, sesion.intentos, voz.detalle).map((x) => paraVoz(x, idioma)), "final");
    }
  }, [sesion.bloque, decir, idioma, deb.lineas, sesion.intentos, voz.detalle]);

  // Al terminar la lectura del debriefing pasa al cierre.
  useEffect(() => {
    if (sesion.bloque !== "debriefing") return;
    if (voz.hablando) debriefEmpezo.current = true;
    else if (debriefEmpezo.current) evento({ tipo: "fin-debriefing" });
  }, [sesion.bloque, voz.hablando, evento]);

  // Órdenes al cambiar de paso y avisos sin repetir.
  useEffect(() => {
    const antes = pasoAntes.current;
    pasoAntes.current = paso;
    if (!enVuelo || paso === "terminado") return;
    const orden = ordenVoz(antes, paso, ev, idioma);
    if (orden) decir(paraVoz(orden, idioma), paso === "invalido" ? "anulado" : "orden", "paso");
    if (!muestra) return;
    const filtrado = filtrarAviso(memoria.current, aviso, muestra.t);
    memoria.current = filtrado.mem;
    if (filtrado.decir && aviso) decir(paraVoz(filtrado.decir, idioma), "aviso", aviso.clave);
  }, [enVuelo, paso, ev, muestra, aviso, decir, idioma]);

  const elegirIdioma = (i: Idioma) => {
    setIdioma(i);
    try {
      localStorage.setItem(CLAVE_IDIOMA, i);
    } catch {
      // Sin localStorage se elige otra vez la próxima.
    }
    const r = avanzarSesion(sesionRef.current, { tipo: "idioma" }, i);
    sesionRef.current = r.sesion;
    setSesion(r.sesion);
  };

  const nuevaSesion = () => {
    reiniciar();
    const s = avanzarSesion(crearSesion(crypto.randomUUID()), { tipo: "idioma" }, idioma).sesion;
    sesionRef.current = s;
    setSesion(s);
  };

  const pasarCheckride = () => {
    evento({ tipo: "pasar-checkride" });
    if (ev?.fase !== "armado") reiniciar();
  };

  const practicas = sesion.intentos.filter((i) => i.modo === "practica").length;
  const checkride = sesion.intentos.find((i) => i.modo === "checkride") ?? null;
  const transcurrido = sesion.inicioMs === null ? 0 : ahora - sesion.inicioMs;

  if (sesion.bloque === "idioma") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <h1 className="font-display text-xl font-bold text-white">{T.es.elegir}<br /><span className="text-white/60">{T.en.elegir}</span></h1>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          {(["es", "en"] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => elegirIdioma(i)}
              className={`flex-1 rounded-2xl border px-6 py-5 font-display text-2xl font-bold ${idioma === i ? "border-gold-500 bg-gold-500/15 text-gold-200" : "border-white/15 text-white"}`}
            >
              {i === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const guia = GUIA_MIN[sesion.bloque];

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
      <header className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-display text-base font-bold text-white">{t.titulo}</h1>
          <span className={`text-xs ${COLOR_ESTADO[estado]}`}>{t.estado[estado]}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-mono text-lg font-bold text-gold-300">{reloj(transcurrido)}</span>
          <span className="text-white/80">
            {t.bloques[sesion.bloque]} · {t.min} {guia[0]}–{guia[1]}
          </span>
        </div>
        <details className="rounded-lg border border-white/10 bg-navy-900/60 px-3 py-2 text-sm text-white/70">
          <summary className="cursor-pointer select-none font-semibold text-white/80">
            {voz.activa ? <Volume2 className="mr-1 inline h-4 w-4" /> : <VolumeX className="mr-1 inline h-4 w-4" />}
            {t.voz} · {voz.nombreVoz ?? "—"}
          </summary>
          <div className="mt-3 grid gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={voz.activa} onChange={(e) => voz.setActiva(e.target.checked)} className="accent-gold-500" />
              {t.voz}
            </label>
            <input
              type="range" min={0} max={1} step={0.1} value={voz.volumen}
              onChange={(e) => voz.setVolumen(Number(e.target.value))}
              aria-label={t.voz} className="w-full accent-gold-500"
            />
            {voz.voces.length ? (
              <label className="flex flex-col gap-1">
                {t.vozNombre}
                <select value={voz.nombreVoz ?? ""} onChange={(e) => voz.setNombreVoz(e.target.value)} className="rounded-md border border-white/15 bg-navy-950 px-2 py-1.5 text-white">
                  {voz.voces.map((v) => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-gold-300">{t.sinVoz}</p>
            )}
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.velocidad}>
              <span className="w-full">{t.velocidad}</span>
              {(["lenta", "normal", "rapida"] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={voz.velocidad === v} onClick={() => voz.setVelocidad(v)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${voz.velocidad === v ? "bg-gold-500 text-navy-950" : "border border-white/20"}`}>
                  {t.velocidades[v]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.detalle}>
              <span className="w-full">{t.detalle}</span>
              {(["detallado", "necesario"] as const).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={voz.detalle === d} onClick={() => voz.setDetalle(d)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${voz.detalle === d ? "bg-gold-500 text-navy-950" : "border border-white/20"}`}>
                  {t.detalles[d]}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => voz.decir(t.prueba, "prueba")} className="justify-self-start rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              {t.probar}
            </button>
            <PruebaMicrofono idioma={idioma} voz={voz} />
          </div>
        </details>
      </header>

      {sesion.bloque === "briefing" && (
        <section className="space-y-4 rounded-xl border border-white/10 bg-navy-950/60 p-5">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/85">
            {briefing(idioma).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ol>
          <Button
            className="w-full"
            onClick={() => {
              voz.vaciar(); // el cadete ya leyó: termina la frase y no sigue con el briefing
              evento({ tipo: "listo", ahoraMs: Date.now() });
            }}
          >
            {t.listo}
          </Button>
        </section>
      )}

      {enVuelo && (
        <>
          <ol className="flex flex-wrap gap-1.5 text-xs">
            {listaPasos(paso, idioma).map((p, k) => (
              <li
                key={k}
                className={`rounded-full border px-2.5 py-1 ${p.estado === "actual" ? "border-gold-500 bg-gold-500/20 font-semibold text-gold-100" : p.estado === "hecho" ? "border-emerald-500/40 text-emerald-200" : "border-white/10 text-white/40"}`}
              >
                {p.estado === "hecho" && <Check className="mr-0.5 inline h-3 w-3" />}
                {p.nombre}
              </li>
            ))}
          </ol>

          <section className="rounded-xl border border-white/10 bg-navy-950/60 p-5" aria-live="polite">
            <p className="font-display text-2xl font-bold leading-snug text-white">
              {ev && ev.fase !== "invalido" ? textoPaso(paso, idioma) : estado === "conectado" ? textoEspera(muestra, idioma) : t.estado[estado]}
            </p>
            {queHacer(paso, idioma) && <p className="mt-2 text-sm text-white/70">{queHacer(paso, idioma)}</p>}
            {anulado && ev?.fase === "armado" && <p className="mt-3 text-sm text-red-200">{t.anuladoAntes(anulado)}</p>}
            {ev?.fase === "invalido" && <p className="mt-3 text-sm text-red-200">{t.sinCalificar(ev.motivo ?? "")}</p>}
          </section>

          <section>
            <div className="grid grid-cols-4 gap-2">
              {CAMPOS.map((c) => (
                <div key={c} className={`rounded-lg border px-1 py-3 text-center text-xs font-semibold ${COLOR[luces[c]]}`}>
                  {t.celdas[c]}
                </div>
              ))}
            </div>
            {aviso && (
              <p className={`mt-3 flex items-center gap-2 font-display text-lg font-bold ${aviso.nivel === "rojo" ? "text-red-300" : "text-gold-300"}`}>
                <AlertTriangle className="h-5 w-5 shrink-0" /> {aviso.texto}
              </p>
            )}
          </section>

          {sesion.bloque === "practica" && (
            <div className="flex flex-wrap gap-2">
              {resultado && <Button variant="secondary" onClick={reiniciar}>{practicas >= 3 ? t.unoMas : t.otro}</Button>}
              <Button onClick={pasarCheckride}>{t.pasar}</Button>
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <HojaCheckride resultado={resultado} idioma={idioma} />
              <Explicacion resultado={resultado} idioma={idioma} />
              <Guardado guardado={guardado} t={t} reintentar={() => guardar(resultado, modoIntento)} />
            </div>
          )}
        </>
      )}

      {sesion.bloque === "debriefing" && (
        <section className="space-y-4 rounded-xl border border-white/10 bg-navy-950/60 p-5">
          <ul className="space-y-2 text-sm leading-relaxed text-white/85">
            {deb.lineas.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <Material deb={deb} t={t} />
          <Button className="w-full" onClick={() => evento({ tipo: "fin-debriefing" })}>
            {t.siguiente}
          </Button>
        </section>
      )}

      {sesion.bloque === "cierre" && (
        <section className="space-y-4">
          {checkride ? (
            <>
              <ReporteExamen resultado={checkride.resultado} intento={intento} nombre={user?.nombre ?? "Cadete"} numero={numero} idioma={idioma} />
              <div className="text-center text-sm">
                {intento?.revision === "mandado" ? (
                  <p className="text-emerald-300">{t.mandado}</p>
                ) : (
                  intento && puedeMandar(intento) && <Button onClick={mandar}>{t.mandar}</Button>
                )}
                {envio && <p className="mt-2 text-red-300">{envio}</p>}
              </div>
            </>
          ) : (
            <p className="text-sm text-white/60">{t.sinCheckride}</p>
          )}
          <Material deb={deb} t={t} />
          <Button className="w-full" onClick={nuevaSesion}>
            {t.nueva}
          </Button>
        </section>
      )}
    </div>
  );
}

type Textos = (typeof T)["es"] | (typeof T)["en"];

function Material({ deb, t }: { deb: ReturnType<typeof debriefing>; t: Textos }) {
  return (
    <div className="text-sm">
      <p className="font-semibold text-white/80">{t.material}</p>
      <ul className="mt-1 space-y-1">
        {deb.material.map((m) => (
          <li key={m.to}>
            <Link to={m.to} className="text-gold-300 underline underline-offset-2">{m.titulo}</Link>
            {m.exclusivo && <span className="ml-2 rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-200">{t.exclusivo}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Guardado({
  guardado,
  t,
  reintentar,
}: {
  guardado: { guardando: boolean; error: string | null };
  t: Textos;
  reintentar: () => void;
}) {
  return (
    <div className="text-center text-sm">
      {guardado.guardando && <p className="text-white/60">{t.guardando}</p>}
      {guardado.error && (
        <div className="space-y-2">
          <p className="text-red-300">{t.noGuardo(guardado.error)}</p>
          <Button variant="secondary" onClick={reintentar}>{t.reintentar}</Button>
        </div>
      )}
    </div>
  );
}
