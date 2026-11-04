import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy } from "lucide-react";
import { PageHero } from "../../components/layout/PageHero";
import { Button } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { registrarVisitaRuta } from "../rutaRed/fuente";
import { DISCORD_URL } from "../../lib/constants";
import { ROUTES } from "../../lib/routes";
import { nb } from "./texto";

// Plantilla de las guías de aeropuerto. Los datos de cada una viven en src/data/aeropuertos/.
// Los textos van con espacios normales: nb() une las cifras con su unidad al mostrarlos.

export type Linea = { de: "tu" | "atc"; texto: string };
type Nota = { titulo: string; texto: string };

export interface Guia {
  icao: string;
  ruta: string;
  hero: { titulo: string; descripcion: string };
  ficha: { dato: string; valor: string }[];
  frecuencias: { quien: string; mhz: string; para: string }[];
  pasos: { intro: string; items: { titulo: string; frecuencia: string; nota: string; dialogo: Linea[] }[] };
  salidas: {
    titulo: string;
    intro: string;
    tarjetas: { nombre: string; etiqueta: string; tipo: string; recorrido?: string; restricciones: string[]; vigencia: string }[];
  };
  llegadas: { intro: string; puntos: { punto: string; desde: string }[]; notas: Nota[]; dialogo: Linea[]; pie: string };
  ils: {
    intro: string;
    aproximaciones: {
      nombre: string;
      carta: string;
      vigencia: string;
      localizador: string;
      curso: string;
      minimo: string;
      obligatorio?: string;
      frustrada: string;
    }[];
  };
  vfr?: {
    intro: string;
    puntos: { nombre: string; donde: string; nm: number }[];
    rutas: { desde: string; ruta: string[] }[];
    notas: Nota[];
    dialogo: Linea[];
    pie: string;
  };
  errores: { error: string; mejor: string }[];
  fuentes: string;
}

const H2 = "mt-16 font-display text-2xl font-bold text-white sm:text-3xl";
const INTRO = "mt-3 max-w-2xl text-sm leading-relaxed text-white/60";
const CAJA = "rounded-2xl border border-white/10 bg-white/[0.03]";

function Dialogo({ lineas }: { lineas: Linea[] }) {
  return (
    <div className="mt-4 grid gap-2">
      {lineas.map((l, j) => (
        <p
          key={j}
          className={`max-w-2xl rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
            l.de === "tu" ? "border border-gold-500/25 bg-gold-500/[0.06] text-white" : "ml-auto border border-white/10 bg-navy-900 text-white/80"
          }`}
        >
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-white/40">{l.de === "tu" ? "Tú" : "Control"}</span>
          {nb(l.texto)}
        </p>
      ))}
    </div>
  );
}

function Notas({ notas }: { notas: Nota[] }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {notas.map((n) => (
        <div key={n.titulo} className={`${CAJA} p-5`}>
          <p className="font-semibold text-white">{n.titulo}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">{nb(n.texto)}</p>
        </div>
      ))}
    </div>
  );
}

export function GuiaAeropuerto({ guia, otras }: { guia: Guia; otras: { nombre: string; ruta: string }[] }) {
  const { icao, ruta, hero, ficha, frecuencias, pasos, salidas, llegadas, ils, vfr, errores, fuentes } = guia;
  useEffect(() => registrarVisitaRuta(`aeropuerto-${icao.toLowerCase()}`, window.location.search), [icao]);
  const [copiado, setCopiado] = useState(false);
  const copiar = () =>
    navigator.clipboard?.writeText(`https://villanueva-aviation.pages.dev${ruta}?ref=comunidad`).then(
      () => setCopiado(true),
      () => undefined,
    );

  return (
    <div>
      <PageHero eyebrow="Guía de aeropuerto · Gratis · Sin cuenta" title={hero.titulo} description={hero.descripcion} />
      <Container className="py-12 md:py-16">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ficha.map((f) => (
            <div key={f.dato} className={`${CAJA} px-4 py-3`}>
              <dt className="text-xs uppercase tracking-wider text-white/45">{f.dato}</dt>
              <dd className="mt-1 font-display text-lg font-semibold text-white">{nb(f.valor)}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 font-display text-2xl font-bold text-white sm:text-3xl">Las frecuencias, en el orden en que las usas</h2>
        <ol className="mt-6 grid gap-2">
          {frecuencias.map((f, i) => (
            <li
              key={f.quien}
              className="grid grid-cols-[1.75rem_1fr_auto] items-baseline gap-x-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 sm:grid-cols-[1.75rem_10rem_8rem_1fr]"
            >
              <span className="font-mono text-sm text-white/40">{i + 1}</span>
              <span className="text-sm font-semibold text-white">{f.quien}</span>
              <span className="font-mono text-sm text-gold-400">{f.mhz}</span>
              <span className="col-start-2 col-end-4 mt-1 text-sm text-white/60 sm:col-start-4 sm:mt-0">{nb(f.para)}</span>
            </li>
          ))}
        </ol>

        <h2 className={H2}>La salida, llamada por llamada</h2>
        <p className={INTRO}>{nb(pasos.intro)}</p>
        <ol className="mt-8 grid gap-6">
          {pasos.items.map((p, i) => (
            <li key={p.titulo} className={`${CAJA} p-5 md:p-6`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-white">
                  <span className="mr-2 text-gold-400">{i + 1}.</span>
                  {p.titulo}
                </h3>
                <span className="font-mono text-sm text-gold-400">{p.frecuencia}</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{nb(p.nota)}</p>
              {p.dialogo.length > 0 && <Dialogo lineas={p.dialogo} />}
            </li>
          ))}
        </ol>

        <h2 className={H2}>{salidas.titulo}</h2>
        <p className={INTRO}>{nb(salidas.intro)}</p>
        <div className={`mt-6 grid gap-4 ${salidas.tarjetas.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
          {salidas.tarjetas.map((s) => (
            <article key={s.nombre} className={`flex flex-col ${CAJA} p-5`}>
              <h3 className="font-display text-xl font-bold text-white">{s.nombre}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-gold-400">{s.etiqueta}</p>
              <p className="mt-1 text-xs text-white/45">{s.tipo}</p>
              {s.recorrido && <p className="mt-4 text-sm leading-relaxed text-white/70">{nb(s.recorrido)}</p>}
              <ul className="mt-4 grid gap-1.5">
                {s.restricciones.map((r) => (
                  <li key={r} className="text-sm text-white/80">
                    · {nb(r)}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-xs text-white/40">Carta vigente desde el {s.vigencia}</p>
            </article>
          ))}
        </div>

        <h2 className={H2}>La llegada</h2>
        <p className={INTRO}>{nb(llegadas.intro)}</p>
        <ul className={`mt-6 grid grid-cols-2 gap-2 ${llegadas.puntos.length > 4 ? "sm:grid-cols-4 lg:grid-cols-7" : "sm:grid-cols-4"}`}>
          {llegadas.puntos.map((l) => (
            <li key={l.punto} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="font-mono text-base font-bold text-gold-400">{l.punto}</p>
              <p className="text-xs text-white/55">Llegas del {l.desde.toLowerCase()}</p>
            </li>
          ))}
        </ul>
        <Notas notas={llegadas.notas} />
        <div className="mt-2">
          <Dialogo lineas={llegadas.dialogo} />
        </div>
        <p className="mt-3 text-xs text-white/45">{llegadas.pie}</p>

        <h2 className={H2}>Las aproximaciones ILS</h2>
        <p className={INTRO}>{nb(ils.intro)}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ils.aproximaciones.map((a) => (
            <article key={a.nombre} className={`${CAJA} p-5`}>
              <h3 className="font-display text-xl font-bold text-white">{a.nombre}</h3>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/45">Localizador</dt>
                  <dd className="mt-0.5 font-mono text-gold-400">{a.localizador}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/45">Curso final</dt>
                  <dd className="mt-0.5 font-mono text-gold-400">{a.curso}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/45">Mínimo</dt>
                  <dd className="mt-0.5 text-white/80">{nb(a.minimo)}</dd>
                </div>
              </dl>
              {a.obligatorio && (
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  <span className="font-semibold text-white">Altitud obligatoria: </span>
                  {nb(a.obligatorio)}
                </p>
              )}
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                <span className="font-semibold text-white">Frustrada: </span>
                {nb(a.frustrada)}
              </p>
              <p className="mt-4 text-xs text-white/40">
                Carta {a.carta}, vigente desde el {a.vigencia}
              </p>
            </article>
          ))}
        </div>

        {vfr && (
          <>
            <h2 className={H2}>Si vuelas VFR: los puntos visuales</h2>
            <p className={INTRO}>{nb(vfr.intro)}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {vfr.puntos.map((p) => (
                <li key={p.nombre} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="font-semibold text-white">{p.nombre}</p>
                  <p className="text-xs text-white/55">{nb(`${p.donde}, ~${p.nm} NM`)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/45">Rumbo y distancia desde el aeropuerto, aproximados: mídelos en tu carta.</p>

            <p className="mt-8 font-semibold text-white">Cómo entrar</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {vfr.rutas.map((r) => (
                <li key={r.desde} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                  <span className="text-white/55">{r.desde}: </span>
                  <span className="text-white">{r.ruta.join(" → ")}</span>
                </li>
              ))}
            </ul>
            <Notas notas={vfr.notas} />
            <div className="mt-2">
              <Dialogo lineas={vfr.dialogo} />
            </div>
            <p className="mt-3 text-xs text-white/45">{vfr.pie}</p>
          </>
        )}

        <h2 className={H2}>Los errores que más vemos</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {errores.map((e) => (
            <li key={e.error} className={`${CAJA} p-5`}>
              <p className="font-semibold text-white">{nb(e.error)}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{nb(e.mejor)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8">
            <h2 className="font-display text-2xl font-semibold text-white">Practícalo antes de conectarte</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              La ruta "Listo para volar en red" te lleva de MMGL a MMMX en ocho lecciones, con audios para practicar la autorización. Gratis.
            </p>
            <div className="mt-6">
              <Button to={ROUTES.rutaRed}>
                Ver la ruta <ArrowRight size={16} />
              </Button>
            </div>
            {otras.length > 0 && (
              <p className="mt-6 text-sm text-white/65">
                Más guías:{" "}
                {otras.map((o, i) => (
                  <span key={o.ruta}>
                    {i > 0 && " · "}
                    <Link to={o.ruta} className="font-semibold text-gold-400 hover:text-gold-300">
                      {o.nombre}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="font-display text-2xl font-semibold text-white">¿Llevas una comunidad?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Si eres de una división de IVAO o VATSIM, de una aerolínea virtual o de un grupo de simulador, comparte esta guía con tus
              pilotos nuevos. Es gratis y no pide cuenta. ¿Algo no coincide con tu carta? Avísanos en Discord y lo corregimos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={copiar} variant="secondary">
                {copiado ? <Check size={16} /> : <Copy size={16} />} {copiado ? "Enlace copiado" : "Copiar enlace"}
              </Button>
              <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="ghost">
                Escríbenos en Discord
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-white/45">
          {fuentes} Las cartas cambian por ciclo: antes de volar, revisa la tuya. Solo para simulación, no para navegación real. Material de
          práctica para simulador, no instrucción certificada.
        </p>
      </Container>
    </div>
  );
}
