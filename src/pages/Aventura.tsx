import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, Download, Play, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import {
  fetchProximo,
  fetchVuelosAventura,
  urlDescargaPlan,
  urlImagenPlan,
  type ProximoDestino,
  type VueloAventura,
} from "../features/aventura/aventura";
import { aeropuertosCompletados, formatoDuracion, resumenAventura } from "../features/aventura/calculos";
import { MapaAventura } from "../features/aventura/MapaAventura";
import { HORAS_IVAO } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const FECHA = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="font-display text-3xl font-bold text-white">{valor}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/50">{etiqueta}</p>
    </div>
  );
}

function ComoLoHice({ vuelo }: { vuelo: VueloAventura }) {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const tiene = vuelo.como_lo_hice || vuelo.plan_imagen_path || vuelo.plan_archivo_path;
  if (!tiene) return null;

  async function descargar() {
    setError("");
    const url = await urlDescargaPlan(vuelo.plan_archivo_path!, vuelo.plan_archivo_nombre);
    if (url) window.location.assign(url);
    else setError("No se pudo generar la descarga. Intenta de nuevo.");
  }

  return (
    <details className="group mt-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <summary className="cursor-pointer list-none rounded-xl px-4 py-3 font-display text-sm font-semibold text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60">
        Cómo lo hice · vuela la misma ruta
      </summary>
      <div className="flex flex-col gap-4 border-t border-white/10 p-4">
        {vuelo.plan_imagen_path && (
          <img
            src={urlImagenPlan(vuelo.plan_imagen_path)}
            alt={`Plan de vuelo de ${vuelo.origen_icao} a ${vuelo.destino_icao}`}
            loading="lazy"
            className="w-full rounded-lg border border-white/10"
          />
        )}
        {vuelo.como_lo_hice && <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{vuelo.como_lo_hice}</p>}
        {vuelo.plan_archivo_path &&
          (isAuthenticated ? (
            <div>
              <Button variant="secondary" onClick={descargar}>
                <Download size={15} /> Descargar el plan de vuelo
              </Button>
              {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
            </div>
          ) : (
            <div className="rounded-lg border border-gold-500/25 bg-gold-500/[0.05] p-4 text-sm text-white/75">
              El archivo del plan se descarga con una cuenta gratuita.{" "}
              <Link
                to={`${ROUTES.ingresar}?from=${encodeURIComponent(ROUTES.aventura)}`}
                className="font-medium text-gold-400 underline underline-offset-4"
              >
                Crear cuenta o entrar
              </Link>
            </div>
          ))}
      </div>
    </details>
  );
}

function TarjetaVuelo({ vuelo, numero }: { vuelo: VueloAventura; numero: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/50">
            Vuelo {numero} · {FECHA.format(new Date(vuelo.fecha))} · Simulador
            {vuelo.red !== "ninguna" && ` (${vuelo.red.toUpperCase()})`}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-white">
            {vuelo.origen_icao} <span className="text-gold-500">→</span> {vuelo.destino_icao}
          </h3>
          <p className="text-sm text-white/60">
            {vuelo.origen_nombre} a {vuelo.destino_nombre}
          </p>
        </div>
        {vuelo.video_url && (
          <Button href={vuelo.video_url} target="_blank" rel="noreferrer" variant="secondary" className="shrink-0">
            <Play size={15} /> Ver el episodio
          </Button>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        {[
          ["Avión", vuelo.avion],
          ["Duración", formatoDuracion(vuelo.minutos)],
          ["Distancia", `${vuelo.distancia_nm} NM`],
          ["Aterrizaje", vuelo.aterrizaje_fpm === null ? "—" : `${vuelo.aterrizaje_fpm} fpm`],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-xs text-white/45">{etiqueta}</dt>
            <dd className="mt-0.5 font-medium text-white">{valor}</dd>
          </div>
        ))}
      </dl>

      {vuelo.notas && <p className="mt-4 text-sm leading-relaxed text-white/70">{vuelo.notas}</p>}
      <ComoLoHice vuelo={vuelo} />
    </article>
  );
}

export function Aventura() {
  const [vuelos, setVuelos] = useState<VueloAventura[] | null>(null);
  const [proximo, setProximo] = useState<ProximoDestino | null>(null);

  useEffect(() => {
    fetchVuelosAventura().then(setVuelos);
    fetchProximo().then(setProximo);
  }, []);

  const resumen = vuelos ? resumenAventura(vuelos) : null;

  return (
    <div>
      <PageHero
        eyebrow="The Adventure"
        title="Un vuelo a la vez, sin saltarme ningún aeropuerto"
        description={`Salgo de Guadalajara (MMGL) en un Beechcraft A36TC y cada aterrizaje queda registrado aquí, con su video. Son vuelos en simulador, con ${HORAS_IVAO.toLocaleString("es-MX")} horas registradas en IVAO detrás.`}
      />

      <Container className="py-12 md:py-16">
        {vuelos === null ? null : vuelos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
            <Plane size={22} className="text-gold-500" />
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              El primer vuelo sale pronto desde Guadalajara. Aquí aparecerá cada aeropuerto, con su mapa y su video.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Dato etiqueta="Vuelos" valor={resumen!.vuelos} />
              <Dato etiqueta="Aeropuertos" valor={resumen!.aeropuertos} />
              <Dato etiqueta="Tiempo en el aire" valor={formatoDuracion(resumen!.minutos)} />
              <Dato etiqueta="Millas náuticas" valor={resumen!.nm.toLocaleString("es-MX")} />
            </div>

            <div className="mt-6">
              <MapaAventura vuelos={vuelos} proximo={proximo} />
            </div>

            <h2 className="mt-10 font-display text-xl font-semibold text-white">Aeropuertos completados</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {aeropuertosCompletados(vuelos).map((a) => (
                <li
                  key={a.icao}
                  title={a.nombre}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/[0.06] px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Check size={12} className="text-gold-400" aria-hidden="true" />
                  <span className="sr-only">Completado: </span>
                  {a.icao}
                  <span className="text-white/45">· {FECHA.format(new Date(a.fecha))}</span>
                </li>
              ))}
              {proximo && (
                <li
                  title={proximo.nombre}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/25 px-3 py-1.5 text-xs text-white/70"
                >
                  Próximo: {proximo.icao}
                </li>
              )}
            </ul>

            <h2 className="mt-14 flex items-center gap-2 font-display text-xl font-semibold text-white">
              <Clock size={18} className="text-gold-500" /> Bitácora
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {[...vuelos].reverse().map((v, i) => (
                <TarjetaVuelo key={v.id} vuelo={v} numero={vuelos.length - i} />
              ))}
            </div>
          </>
        )}

        <div className="mt-16 rounded-3xl border border-gold-500/20 bg-gold-500/[0.04] p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-semibold text-white">¿Quieres aprender a volar así?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            La academia es gratis y en español. Empiezas por la lección 1 y avanzas a tu ritmo.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to={ROUTES.empieza}>
              Empieza gratis <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
