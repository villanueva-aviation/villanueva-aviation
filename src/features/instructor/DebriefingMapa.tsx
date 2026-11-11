import { useMemo, useRef, useState } from "react";
import type { Idioma } from "./idiomaInstructor";
import { traducirMotivo } from "./idiomaInstructor";
import { MANIOBRAS } from "./maniobras";
import { MapaVuelo } from "./MapaVuelo";
import { RepeticionVuelo, mmss } from "./RepeticionVuelo";
import { nombreManiobra } from "./repaso";
import { CAMPO_PUNTO as C, unidadDe, type ErrorVuelo, type FaseMapa, type Grabacion } from "./recorrido";

type Pestana = "todo" | "checklist" | FaseMapa;

const T = {
  es: {
    pestana: { todo: "Todo el vuelo", checklist: "Checklist", rodaje: "Rodaje", despegue: "Despegue", zona: "Zona", circuitos: "Circuitos", aterrizaje: "Aterrizaje", "rodaje-regreso": "Rodaje" } satisfies Record<Pestana, string>,
    intento: (k: number, m: string, c: number) => `Intento ${k} · ${m} · ${c}/100`,
    tolerancia: "tolerancia",
    ver: "Ver",
    sinErrores: "Sin errores en este vuelo.",
    sinErroresFase: "Sin errores en esta parte del vuelo.",
    errores: "Errores",
    bien: "Bien",
    anulada: "Lección sin calificar:",
    mapa: "Tu recorrido. Toca un número para ver ese error.",
  },
  en: {
    pestana: { todo: "Whole flight", checklist: "Checklist", rodaje: "Taxi", despegue: "Takeoff", zona: "Practice area", circuitos: "Patterns", aterrizaje: "Landing", "rodaje-regreso": "Taxi" } satisfies Record<Pestana, string>,
    intento: (k: number, m: string, c: number) => `Attempt ${k} · ${m} · ${c}/100`,
    tolerancia: "tolerance",
    ver: "Show",
    sinErrores: "No errors on this flight.",
    sinErroresFase: "No errors in this part of the flight.",
    errores: "Errors",
    bien: "Good",
    anulada: "Lesson not graded:",
    mapa: "Your track. Tap a number to see that error.",
  },
};

const signo = (v: number, d = 0) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;
const conUnidad = (v: string, u: string) => (u === "" || u === "°" || u === "%" ? `${v}${u}` : `${v} ${u}`);

/** El renglón medido de un error de maniobra, o el texto del debriefing de la lección. */
function textoError(e: ErrorVuelo, idioma: Idioma): string {
  if (e.texto) return e.texto[idioma];
  if (!e.maniobra || !e.campo || e.peor === undefined) return "";
  const u = unidadDe(e.maniobra, e.campo);
  const nombre = MANIOBRAS[e.maniobra].celdas.find((c) => c.campo === e.campo)?.nombre[idioma] ?? e.campo;
  const d = u === "" ? 2 : 0;
  const tol = e.tol ? ` (${T[idioma].tolerancia} ±${conUnidad(e.tol.toFixed(d), u)})` : "";
  return `${nombre} ${conUnidad(signo(e.peor, d), u)}${tol}`;
}

/** Fases, mapa satelital, repetición sobre el perfil y lista de errores: el debriefing que se ve. */
export function DebriefingMapa({ grabacion: g, idioma }: { grabacion: Grabacion; idioma: Idioma }) {
  const t = T[idioma];
  const t0 = g.puntos[0]?.[C.t] ?? 0;
  const [cursorT, setCursorT] = useState(t0);
  const [foco, setFoco] = useState<{ inicio: number; fin: number } | null>(null);
  const [pestana, setPestana] = useState<Pestana>("todo");
  const mapaRef = useRef<HTMLDivElement>(null);

  // Rodaje de salida y de regreso son dos pestañas aunque compartan nombre.
  const pestanas = useMemo(() => {
    const vistas: Pestana[] = ["todo", "checklist"];
    for (const f of g.fases) if (!vistas.includes(f.fase)) vistas.push(f.fase);
    return vistas;
  }, [g]);
  const rango = (p: Pestana) => {
    const fs = g.fases.filter((f) => f.fase === p);
    return fs.length ? { inicio: Math.min(...fs.map((f) => f.inicio)), fin: Math.max(...fs.map((f) => f.fin)) } : null;
  };
  const dePestana = (p: Pestana) => g.errores.filter((e) => p === "todo" || e.fase === p);

  const elegir = (p: Pestana) => {
    setPestana(p);
    const r = p === "todo" || p === "checklist" ? null : rango(p);
    setFoco(r);
    if (r) setCursorT(r.inicio);
  };
  const ver = (n: number) => {
    const e = g.errores.find((x) => x.n === n);
    if (!e || e.inicio === null) return;
    const intento = g.intentos.find((i) => i.n === e.intento);
    // Un error de un solo instante no tiene tramo: se ve con su intento, o 30 s alrededor.
    const corto = (e.fin ?? e.inicio) - e.inicio < 5;
    setFoco(corto ? (intento ? { inicio: intento.inicio, fin: intento.fin } : { inicio: e.inicio - 30, fin: e.inicio + 30 }) : { inicio: e.inicio, fin: e.fin! });
    setCursorT(e.inicio);
    mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // La lista agrupada: por intento, o por fase los errores de la lección.
  const lista = dePestana(pestana);
  const grupos: { clave: string; titulo: string; errores: ErrorVuelo[]; explicacion: string[] }[] = [];
  for (const e of lista) {
    const clave = e.intento ? `i${e.intento}` : `f${e.fase}`;
    let gr = grupos.find((x) => x.clave === clave);
    if (!gr) {
      const i = g.intentos.find((x) => x.n === e.intento);
      gr = {
        clave,
        titulo: i ? t.intento(i.n, nombreManiobra(i.maniobra, idioma), i.calificacion) : t.pestana[e.fase],
        errores: [],
        explicacion: g.explicaciones.find((x) => x.intento === e.intento)?.lineas[idioma] ?? [],
      };
      grupos.push(gr);
    }
    gr.errores.push(e);
  }

  return (
    <section className="space-y-4">
      {g.anulada && (
        <p className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {t.anulada} {traducirMotivo(g.anulada.motivo, idioma)}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {pestanas.map((p) => {
          const n = p === "todo" ? 0 : dePestana(p).length;
          return (
            <button
              key={p}
              type="button"
              onClick={() => elegir(p)}
              className={`rounded-full px-3 py-1.5 text-sm ${pestana === p ? "bg-gold-400 font-semibold text-navy-950" : "bg-navy-800 text-white/70 hover:text-white"}`}
            >
              {t.pestana[p]}
              {p !== "todo" && (n ? <span className={pestana === p ? "" : "text-red-300"}> · {n}</span> : " ✓")}
            </button>
          );
        })}
      </div>

      <div ref={mapaRef}>
        <MapaVuelo grabacion={g} cursorT={cursorT} foco={foco} alTocarError={ver} />
        <p className="mt-1 text-xs text-white/40">{t.mapa}</p>
      </div>

      <RepeticionVuelo grabacion={g} cursorT={cursorT} alMover={setCursorT} idioma={idioma} />

      <div>
        <h3 className="mb-2 font-display text-lg font-bold text-white">{t.errores}</h3>
        {lista.length === 0 && (
          <p className="rounded-lg border-l-2 border-emerald-400 bg-navy-800/50 px-3 py-2 text-sm text-emerald-200">
            {pestana === "todo" ? t.sinErrores : t.sinErroresFase}
          </p>
        )}
        <div className="space-y-4">
          {grupos.map((gr) => (
            <div key={gr.clave}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/50">{gr.titulo}</p>
              <ul className="space-y-1.5">
                {gr.errores.map((e) => (
                  <li key={e.n} className="flex items-start justify-between gap-3 rounded-lg border-l-2 border-red-400 bg-navy-800/60 px-3 py-2 text-sm">
                    <span className="text-white/85">
                      <b className="text-red-300">{e.n}</b> · {textoError(e, idioma)}
                      {e.inicio !== null && <span className="text-white/45"> · {mmss(e.inicio - t0)}</span>}
                    </span>
                    {e.inicio !== null && (
                      <button type="button" onClick={() => ver(e.n)} className="shrink-0 text-gold-400 hover:underline">
                        {t.ver} ▸
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {gr.explicacion.length > 0 && (
                <ul className="mt-1.5 space-y-1 pl-3 text-sm text-white/60">
                  {gr.explicacion.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {g.bien[idioma].length > 0 && (
        <div className="rounded-lg border-l-2 border-emerald-400 bg-navy-800/50 px-3 py-2 text-sm text-white/80">
          <span className="font-semibold text-emerald-300">{t.bien}:</span> {g.bien[idioma].join(" · ")}
        </div>
      )}
    </section>
  );
}
