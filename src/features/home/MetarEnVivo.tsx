import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoriaVuelo, consultarMetar, techoFt, textoViento, textoVisibilidad, visibilidadSM, type Categoria, type Metar } from "../../lib/clima";
import { DESCRIPCION_CATEGORIA } from "../../lib/climaTexto";
import { ROUTES } from "../../lib/routes";

const ICAO = "MMGL";

const PUNTO: Record<Categoria, string> = {
  VFR: "bg-emerald-400",
  MVFR: "bg-blue-400",
  IFR: "bg-red-400",
  LIFR: "bg-fuchsia-400",
};

function haceCuanto(obsTime: number) {
  const min = Math.max(0, Math.round((Date.now() / 1000 - obsTime) / 60));
  return min < 60 ? `hace ${min} min` : `hace ${Math.round(min / 60)} h`;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">{etiqueta}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-white tabular-nums">{valor}</dd>
    </div>
  );
}

/** Franja con el METAR real de Guadalajara, decodificado. Si el servicio falla, no se muestra nada. */
export function MetarEnVivo() {
  const [metar, setMetar] = useState<Metar | null | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    consultarMetar(ICAO)
      .then((m) => vigente && setMetar(m))
      .catch(() => vigente && setMetar(null));
    return () => {
      vigente = false;
    };
  }, []);

  if (metar === null) return null;

  if (metar === undefined) {
    return (
      <div className="h-[92px] rounded-2xl border border-white/10 bg-navy-950/60 backdrop-blur-sm" aria-hidden="true">
        <div className="h-full w-full animate-pulse rounded-2xl bg-white/[0.02]" />
      </div>
    );
  }

  const cat = (metar.fltCat as Categoria | null | undefined) ?? categoriaVuelo(techoFt(metar.clouds), visibilidadSM(metar.visib));
  const temp = metar.temp !== null ? `${Math.round(metar.temp)} °C` : "Sin dato";
  const qnh = metar.altim !== null ? `${Math.round(metar.altim)} hPa` : "Sin dato";

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-950/60 px-5 py-4 backdrop-blur-sm md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-8">
        <div className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className={`absolute inset-0 rounded-full ${cat ? PUNTO[cat] : "bg-white/40"} opacity-60 motion-safe:animate-ping`} />
            <span className={`relative h-2.5 w-2.5 rounded-full ${cat ? PUNTO[cat] : "bg-white/40"}`} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-white">
              METAR en vivo · {ICAO} Guadalajara
            </p>
            <p className="text-xs text-white/50">
              {cat ? `${cat} · ${DESCRIPCION_CATEGORIA[cat]}` : "Sin categoría"} · {haceCuanto(metar.obsTime)}
            </p>
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Dato etiqueta="Viento" valor={textoViento(metar.wdir, metar.wspd, metar.wgst)} />
          <Dato etiqueta="Visibilidad" valor={textoVisibilidad(metar.visib)} />
          <Dato etiqueta="Temperatura" valor={temp} />
          <Dato etiqueta="QNH" valor={qnh} />
        </dl>

        <Link
          to={`${ROUTES.briefing}?icao=${ICAO}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-400 underline-offset-4 hover:underline"
        >
          Ver el briefing completo <ArrowRight size={14} />
        </Link>
      </div>
      <p className="mt-3 hidden truncate font-mono text-[11px] text-white/35 md:block" title={metar.rawOb}>
        {metar.rawOb}
      </p>
    </div>
  );
}
