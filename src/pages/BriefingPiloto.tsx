import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Cloud, CloudRain, Eye, Gauge, RefreshCw, Search, Thermometer, Wind } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ROUTES } from "../lib/routes";
import {
  altitudDensidad, categoriaVuelo, componentesViento, consultarClima, fenomenos, techoFt, textoNube,
  textoViento, textoVisibilidad, visibilidadSM,
  type Categoria, type Metar, type PeriodoTaf, type Taf,
} from "../lib/clima";

const AEROPUERTOS = [
  ["MMGL", "Guadalajara"], ["MMMX", "Ciudad de México"], ["MMMY", "Monterrey"], ["MMUN", "Cancún"],
  ["MMTJ", "Tijuana"], ["MMPR", "Puerto Vallarta"], ["MMSD", "Los Cabos"], ["MMMD", "Mérida"],
  ["MMQT", "Querétaro"], ["MMTO", "Toluca"],
];

const ESTILO_CATEGORIA: Record<Categoria, { caja: string; texto: string }> = {
  VFR: { caja: "border-emerald-500/40 bg-emerald-500/10", texto: "Condiciones visuales" },
  MVFR: { caja: "border-blue-500/40 bg-blue-500/10", texto: "Visuales marginales" },
  IFR: { caja: "border-red-500/40 bg-red-500/10", texto: "Condiciones por instrumentos" },
  LIFR: { caja: "border-fuchsia-500/40 bg-fuchsia-500/10", texto: "Instrumentos, muy bajas" },
};
const COLOR_CATEGORIA: Record<Categoria, string> = {
  VFR: "text-emerald-300", MVFR: "text-blue-300", IFR: "text-red-300", LIFR: "text-fuchsia-300",
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; metar: Metar | null; taf: Taf | null; icao: string };

const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1); // solo la primera letra: "SM" y "kt" se quedan como están
const pies = (n: number) => `${Math.round(n).toLocaleString("es-MX")} ft`;

function haceCuanto(segundos: number) {
  const min = Math.max(0, Math.round((Date.now() / 1000 - segundos) / 60));
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h ${min % 60} min`;
}

function horaZ(ts: number) {
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z`;
}

function horaLocal(ts: number) {
  return new Date(ts * 1000).toLocaleString("es-MX", { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

function Dato({ icono, titulo, children, nota }: { icono: ReactNode; titulo: string; children: ReactNode; nota?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-white/50">
        {icono}
        <span className="font-display text-xs font-semibold uppercase tracking-wide">{titulo}</span>
      </div>
      <div className="mt-3 text-base font-medium leading-snug text-white">{children}</div>
      {nota && <div className="mt-2 text-sm leading-relaxed text-white/55">{nota}</div>}
    </div>
  );
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex items-start gap-2 text-sm text-amber-300/90">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function ChipCategoria({ cat }: { cat: Categoria | null }) {
  if (!cat) return null;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-display text-xs font-bold ${ESTILO_CATEGORIA[cat].caja} ${COLOR_CATEGORIA[cat]}`}>
      {cat}
    </span>
  );
}

const ETIQUETA_CAMBIO: Record<string, string> = { FM: "Desde", BECMG: "Cambio gradual", TEMPO: "Temporal", PROB: "Probabilidad" };

function FilaTaf({ p }: { p: PeriodoTaf }) {
  const etiqueta = p.fcstChange === null ? "Pronóstico base" : (ETIQUETA_CAMBIO[p.fcstChange] ?? p.fcstChange);
  const partes: string[] = [];
  if (p.wspd !== null) partes.push(`Viento ${minuscula(textoViento(p.wdir, p.wspd, p.wgst))}`);
  if (p.visib !== null) partes.push(`Visibilidad ${minuscula(textoVisibilidad(p.visib))}`);
  partes.push(...fenomenos(p.wxString));
  partes.push(...p.clouds.map(textoNube));
  const cat = p.clouds.length || p.visib !== null ? categoriaVuelo(techoFt(p.clouds), visibilidadSM(p.visib)) : null;
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-sm font-semibold text-gold-400">
          {etiqueta}
          {p.fcstChange === "PROB" && p.probability ? ` ${p.probability} %` : ""}
        </span>
        <span className="font-mono text-xs text-white/60">{horaZ(p.timeFrom)} a {horaZ(p.timeTo)}</span>
        <span className="text-xs text-white/40">
          {horaLocal(p.timeFrom)} a {horaLocal(p.timeTo)} (tu hora)
        </span>
        <ChipCategoria cat={cat} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{partes.join(" · ") || "Sin cambios en los elementos principales"}</p>
    </li>
  );
}

export function BriefingPiloto() {
  const [params, setParams] = useSearchParams();
  const [codigo, setCodigo] = useState((params.get("icao") ?? "MMGL").toUpperCase());
  const [pista, setPista] = useState(params.get("pista") ?? "");
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  const cargar = useCallback(async (icao: string) => {
    setEstado({ tipo: "cargando" });
    try {
      const { metar, taf } = await consultarClima(icao);
      if (!metar && !taf) {
        setEstado({ tipo: "error", mensaje: `No hay reporte para ${icao}. Revisa el código OACI de 4 letras (por ejemplo MMGL) o prueba con otro aeropuerto.` });
      } else {
        setEstado({ tipo: "listo", metar, taf, icao });
      }
    } catch {
      setEstado({ tipo: "error", mensaje: "No pudimos consultar el servicio del clima. Inténtalo de nuevo en un momento." });
    }
  }, []);

  useEffect(() => {
    cargar((params.get("icao") ?? "MMGL").toUpperCase());
    // Solo al abrir la página: después consulta el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function consultar(icao: string) {
    const limpio = icao.trim().toUpperCase();
    setCodigo(limpio);
    if (!/^[A-Z0-9]{4}$/.test(limpio)) {
      setEstado({ tipo: "error", mensaje: "El código OACI tiene 4 letras, por ejemplo MMGL (Guadalajara) o MMMX (Ciudad de México)." });
      return;
    }
    setParams(pista ? { icao: limpio, pista } : { icao: limpio }, { replace: true });
    cargar(limpio);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    consultar(codigo);
  }

  const numPista = parseInt(pista, 10);
  const pistaValida = Number.isFinite(numPista) && numPista >= 1 && numPista <= 36;

  return (
    <div>
      <PageHero
        eyebrow="Herramienta"
        title="Briefing del piloto"
        description="El METAR y el TAF de tu aeropuerto, decodificados en español, con categoría de vuelo, viento cruzado y altitud de densidad. Todo en un solo lugar, antes de despegar en el simulador."
      >
        <Link
          to={ROUTES.descargas}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Descargas
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <form onSubmit={enviar} className="flex flex-col gap-4 md:flex-row md:items-end">
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Aeropuerto (código OACI)
            <input
              id="briefing-icao"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-lg uppercase tracking-widest text-white focus:border-gold-500/60 focus:outline-none md:w-40"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Pista en uso (opcional)
            <input
              id="briefing-pista"
              value={pista}
              onChange={(e) => setPista(e.target.value.replace(/\D/g, "").slice(0, 2))}
              inputMode="numeric"
              placeholder="Ej. 28"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-lg text-white placeholder:text-white/30 focus:border-gold-500/60 focus:outline-none md:w-40"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            <Search size={16} /> Consultar
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {AEROPUERTOS.map(([icao, nombre]) => (
            <button
              key={icao}
              type="button"
              onClick={() => consultar(icao)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                codigo === icao ? "border-gold-500 bg-gold-500/15 text-gold-400" : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {icao} · {nombre}
            </button>
          ))}
        </div>

        {estado.tipo === "cargando" && (
          <p className="mt-10 flex items-center gap-2 text-white/60" role="status">
            <RefreshCw size={16} className="animate-spin" /> Consultando el clima…
          </p>
        )}

        {estado.tipo === "error" && (
          <p role="alert" className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
            {estado.mensaje}
          </p>
        )}

        {estado.tipo === "listo" && <Resultado estado={estado} pistaNum={pistaValida ? numPista : null} />}

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-white/40">
          Datos de aviationweather.gov (NOAA). Es una herramienta educativa y de simulación: no la uses para navegación real,
          que requiere las fuentes oficiales vigentes. ¿Quieres aprender a leer estos reportes?{" "}
          <a href="/downloads/guia-metar-taf.pdf" download className="text-gold-400 hover:text-gold-300">
            Descarga la Guía de METAR y TAF
          </a>
          .
        </p>
      </Container>
    </div>
  );
}

function Resultado({ estado, pistaNum }: { estado: Extract<Estado, { tipo: "listo" }>; pistaNum: number | null }) {
  const { metar, taf } = estado;

  return (
    <div className="mt-10 flex flex-col gap-10">
      {metar ? <TarjetaMetar m={metar} pistaNum={pistaNum} /> : (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
          No hay un METAR reciente para {estado.icao}. Algunos aeropuertos solo publican pronóstico (TAF).
        </p>
      )}
      {taf ? (
        <section>
          <h2 className="font-display text-xl font-semibold text-white">Pronóstico (TAF)</h2>
          <p className="mt-1 text-sm text-white/50">
            Válido de {horaZ(taf.validTimeFrom)} a {horaZ(taf.validTimeTo)} · las horas Z son UTC; abajo verás también tu hora.
          </p>
          <p className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-sm leading-relaxed text-white/80">
            {taf.rawTAF}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {taf.fcsts.map((p, i) => (
              <FilaTaf key={i} p={p} />
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-white/50">Este aeropuerto no publica pronóstico TAF.</p>
      )}
    </div>
  );
}

function TarjetaMetar({ m, pistaNum }: { m: Metar; pistaNum: number | null }) {
  const techo = techoFt(m.clouds);
  const visSM = visibilidadSM(m.visib);
  const cat = (m.fltCat as Categoria | null | undefined) ?? categoriaVuelo(techo, visSM);
  const estilo = cat ? ESTILO_CATEGORIA[cat] : null;
  const spread = m.temp !== null && m.dewp !== null ? m.temp - m.dewp : null;
  const densidad = m.elev !== null && m.altim !== null && m.temp !== null ? altitudDensidad(m.elev, m.altim, m.temp) : null;
  const dirNum = typeof m.wdir === "number" ? m.wdir : null;
  const viento = pistaNum !== null && dirNum !== null && m.wspd ? componentesViento(dirNum, m.wspd, pistaNum) : null;
  const vientoRafaga = pistaNum !== null && dirNum !== null && m.wgst ? componentesViento(dirNum, m.wgst, pistaNum) : null;
  const fen = fenomenos(m.wxString);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            {m.icaoId} <span className="text-white/50">· {m.name?.split(",")[0]}</span>
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Observado {horaZ(m.obsTime)} ({haceCuanto(m.obsTime)}){m.elev !== null && ` · Elevación ${pies(m.elev * 3.28084)}`}
          </p>
        </div>
        {cat && estilo && (
          <div className={`rounded-2xl border px-5 py-3 text-right ${estilo.caja}`}>
            <div className={`font-display text-3xl font-bold leading-none ${COLOR_CATEGORIA[cat]}`}>{cat}</div>
            <div className="mt-1 text-xs text-white/60">{estilo.texto}</div>
          </div>
        )}
      </div>

      <p className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-navy-950 p-4 font-mono text-sm leading-relaxed text-white/80">
        {m.rawOb}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Dato icono={<Wind size={16} />} titulo="Viento" nota="La dirección es de dónde viene el viento, respecto al norte verdadero.">
          {textoViento(m.wdir, m.wspd, m.wgst)}
        </Dato>
        <Dato icono={<Eye size={16} />} titulo="Visibilidad">{textoVisibilidad(m.visib)}</Dato>
        <Dato icono={<CloudRain size={16} />} titulo="Fenómenos">
          {fen.length ? fen.map((f) => <div key={f}>{f}</div>) : <span className="text-white/60">Ninguno</span>}
        </Dato>
        <Dato
          icono={<Cloud size={16} />}
          titulo="Nubes"
          nota={techo !== null ? `Techo: ${pies(techo)} sobre el aeródromo (la capa más baja nublada o cerrada).` : "Sin techo: no hay capa nublada ni cerrada."}
        >
          {m.clouds.length ? m.clouds.map((n, i) => <div key={i}>{textoNube(n)}</div>) : "Despejado"}
        </Dato>
        <Dato
          icono={<Thermometer size={16} />}
          titulo="Temperatura y rocío"
          nota={spread !== null && spread <= 3 ? undefined : spread !== null ? `Diferencia de ${spread} °C.` : undefined}
        >
          {m.temp !== null ? `${m.temp} °C` : "Sin dato"} / {m.dewp !== null ? `${m.dewp} °C` : "sin dato"}
          {spread !== null && spread <= 3 && <Aviso>Diferencia de {spread} °C: hay riesgo de neblina, niebla o nubes bajas.</Aviso>}
        </Dato>
        <Dato icono={<Gauge size={16} />} titulo="Altímetro" nota="Ajusta tu altímetro a este valor cerca del aeródromo.">
          {m.altim !== null ? `${(m.altim * 0.02953).toFixed(2)} inHg · ${Math.round(m.altim)} hPa` : "Sin dato"}
        </Dato>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Dato
          icono={<Gauge size={16} />}
          titulo="Altitud de densidad"
          nota={
            densidad
              ? `Altitud de presión ${pies(densidad.presion)}. La temperatura está ${Math.abs(Math.round(densidad.desviacionIsa))} °C ${densidad.desviacionIsa >= 0 ? "por encima" : "por debajo"} de la estándar (ISA). Tu avión rinde como si el aeropuerto estuviera a esa altitud: consulta las tablas de tu manual.`
              : "Falta la elevación, el altímetro o la temperatura para calcularla."
          }
        >
          {densidad ? pies(densidad.densidad) : "Sin dato"}
        </Dato>
        <Dato
          icono={<Wind size={16} />}
          titulo={pistaNum !== null ? `Viento en la pista ${String(pistaNum).padStart(2, "0")}` : "Viento en la pista"}
          nota={
            pistaNum === null
              ? "Escribe el número de la pista en uso (por ejemplo 28) para calcular el viento cruzado y de frente."
              : "El METAR da el viento respecto al norte verdadero y la pista está en magnético: puede haber unos grados de diferencia. Para elegir pista, usa el ATIS o la torre."
          }
        >
          {viento ? (
            <>
              <div>Cruzado: {Math.round(viento.cruzado)} kt por la {viento.lado}{vientoRafaga ? ` (${Math.round(vientoRafaga.cruzado)} kt en ráfagas)` : ""}</div>
              <div>{viento.frente >= 0 ? "De frente" : "De cola"}: {Math.round(Math.abs(viento.frente))} kt</div>
            </>
          ) : pistaNum === null ? (
            <span className="text-white/60">Elige una pista</span>
          ) : (
            <span className="text-white/60">Viento variable o en calma: sin componente relevante</span>
          )}
        </Dato>
      </div>
    </section>
  );
}
