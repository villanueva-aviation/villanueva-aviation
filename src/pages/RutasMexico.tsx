import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, CloudSun, Download } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ROUTES } from "../lib/routes";
import { RUTAS_MEXICO, type AeropuertoRuta, type RutaMexico } from "../data/rutas";

const ft = (n: number) => `${n.toLocaleString("es-MX")} ft`;
const hm = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min` : `${min} min`);
const grados = (n: number) => `${String(n).padStart(3, "0")}°`;

const TIPO_FRECUENCIA: Record<string, string> = {
  ATIS: "ATIS", TWR: "Torre", GND: "Tierra", APP: "Aproximación", DEP: "Salidas", CTAF: "CTAF", UNIC: "UNICOM",
};

const REGIONES = ["Todas", ...Array.from(new Set(RUTAS_MEXICO.rutas.map((r) => r.region)))];

/** Terreno bajo el corredor de la ruta (±5 NM) frente al nivel VFR sugerido. */
function PerfilTerreno({ ruta }: { ruta: RutaMexico }) {
  const W = 640, H = 170, izq = 46, der = 12, arr = 14, abajo = 28;
  const yMax = Math.ceil((Math.max(ruta.nivelSugeridoFt, ruta.terrenoMaxFt) * 1.08) / 5000) * 5000 || 5000;
  const x = (nm: number) => izq + (nm / ruta.distanciaNm) * (W - izq - der);
  const y = (f: number) => arr + (1 - f / yMax) * (H - arr - abajo);
  const linea = ruta.perfil.map(([nm, f]) => `${x(nm).toFixed(1)},${y(f).toFixed(1)}`).join(" ");
  const area = `${x(0)},${y(0)} ${linea} ${x(ruta.distanciaNm)},${y(0)}`;
  const marcas = Array.from({ length: Math.floor(yMax / 5000) + 1 }, (_, i) => i * 5000);
  const cima = ruta.perfil.reduce((a, p) => (p[1] > a[1] ? p : a));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label={`Perfil del terreno: máximo ${ft(ruta.terrenoMaxFt)}, nivel sugerido ${ft(ruta.nivelSugeridoFt)}`}>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={izq} x2={W - der} y1={y(m)} y2={y(m)} stroke="rgba(255,255,255,0.08)" />
          <text x={izq - 6} y={y(m) + 3} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.45)">{m.toLocaleString("es-MX")}</text>
        </g>
      ))}
      <polygon points={area} fill="rgba(201,162,75,0.22)" />
      <polyline points={linea} fill="none" stroke="#C9A24B" strokeWidth="1.6" />
      <line x1={izq} x2={W - der} y1={y(ruta.nivelSugeridoFt)} y2={y(ruta.nivelSugeridoFt)} stroke="#34D399" strokeWidth="1.4" strokeDasharray="6 4" />
      <text x={W - der} y={y(ruta.nivelSugeridoFt) - 5} textAnchor="end" fontSize="10.5" fill="#34D399">
        Nivel sugerido {ft(ruta.nivelSugeridoFt)}
      </text>
      <circle cx={x(cima[0])} cy={y(cima[1])} r="3.4" fill="#FCA5A5" />
      <text x={Math.min(Math.max(x(cima[0]), izq + 50), W - der - 50)} y={y(cima[1]) - 8} textAnchor="middle" fontSize="10.5" fill="#FCA5A5">
        {ft(cima[1])}
      </text>
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={x(ruta.distanciaNm * f)} y={H - 8} textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"} fontSize="10" fill="rgba(255,255,255,0.45)">
          {Math.round(ruta.distanciaNm * f)} NM
        </text>
      ))}
    </svg>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div>
      <div className="font-display text-[11px] font-semibold uppercase tracking-wide text-white/45">{etiqueta}</div>
      <div className="mt-1 text-lg font-semibold leading-tight text-white">{valor}</div>
      {nota && <div className="mt-0.5 text-xs text-white/45">{nota}</div>}
    </div>
  );
}

function FichaAeropuerto({ a, rol }: { a: AeropuertoRuta; rol: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-[11px] font-semibold uppercase tracking-wide text-gold-500">{rol}</div>
          <div className="mt-1 font-semibold text-white">{a.nombre} <span className="font-mono text-sm text-white/50">{a.icao}</span></div>
        </div>
        <Link
          to={`${ROUTES.briefing}?icao=${a.icao}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
        >
          <CloudSun size={13} /> Ver clima
        </Link>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-white/45">Elevación</dt>
        <dd className="text-white/85">{ft(a.elevFt)}{a.torre ? " · con torre" : ""}</dd>
        <dt className="text-white/45">Pistas</dt>
        <dd className="text-white/85">
          {a.pistas.length ? a.pistas.map((p) => `${p.id} · ${p.largoFt.toLocaleString("es-MX")} × ${p.anchoFt} ft`).join(" | ") : "Sin datos"}
        </dd>
        <dt className="text-white/45">Frecuencias</dt>
        <dd className="text-white/85">
          {a.frecuencias.length ? a.frecuencias.map((f) => `${TIPO_FRECUENCIA[f.tipo] ?? f.tipo} ${f.mhz}`).join(" · ") : "Sin datos públicos: consulta la publicación oficial"}
        </dd>
      </dl>
    </div>
  );
}

function TarjetaRuta({ ruta }: { ruta: RutaMexico }) {
  const o = RUTAS_MEXICO.aeropuertos[ruta.origen];
  const d = RUTAS_MEXICO.aeropuertos[ruta.destino];
  const aguaAviso = ruta.sobreAguaPct >= 30;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-display text-xl font-semibold text-white md:text-2xl">
          {o.nombre} <ArrowRight size={18} className="mx-1 inline text-gold-500" /> {d.nombre}
        </h2>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-xs text-white/60">
          {ruta.origen} – {ruta.destino}
        </span>
        <span className="text-xs text-white/40">{ruta.region}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        <Dato etiqueta="Distancia" valor={`${ruta.distanciaNm} NM`} />
        <Dato
          etiqueta="Rumbo magnético"
          valor={grados(ruta.rumboMagneticoIni)}
          nota={`Verdadero ${grados(ruta.rumboVerdaderoIni)} · variación ${Math.abs(ruta.variacionMagnetica).toFixed(1)}° ${ruta.variacionMagnetica >= 0 ? "E" : "O"}`}
        />
        <Dato etiqueta="Tiempo" valor={hm(ruta.tiempoMin100kt)} nota={`a 100 kt · a 140 kt ${hm(ruta.tiempoMin140kt)}`} />
        <Dato etiqueta="Nivel VFR sugerido" valor={ft(ruta.nivelSugeridoFt)} nota={`Terreno + 2,000 ft = ${ft(Math.ceil((ruta.terrenoMaxFt + 2000) / 100) * 100)}`} />
        <Dato etiqueta="Terreno más alto" valor={ft(ruta.terrenoMaxFt)} nota={`a ${ruta.terrenoMaxKmDesdeSalidaNm} NM de la salida`} />
      </div>

      <div className="mt-6">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-sm font-semibold text-white/80">Perfil del terreno bajo la ruta</h3>
          <span className="text-xs text-white/40">Corredor de ±5 NM · pies sobre el nivel del mar</span>
        </div>
        <PerfilTerreno ruta={ruta} />
      </div>

      {(ruta.advertencias.length > 0 || aguaAviso) && (
        <ul className="mt-4 flex flex-col gap-2">
          {ruta.advertencias.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-amber-300/90">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {t}
            </li>
          ))}
          {aguaAviso && (
            <li className="flex items-start gap-2 text-sm text-sky-300/90">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {ruta.sobreAguaPct} % de la ruta va sobre el agua: planea el combustible y las opciones de aterrizaje.
            </li>
          )}
        </ul>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FichaAeropuerto a={o} rol="Salida" />
        <FichaAeropuerto a={d} rol="Destino" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={ruta.plan}
          download
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
        >
          <Download size={15} /> Descargar plan para MSFS (.pln)
        </a>
        <span className="text-xs text-white/40">Ruta directa con nivel de crucero; también lo abre Little Navmap.</span>
      </div>
    </article>
  );
}

export function RutasMexico() {
  const [region, setRegion] = useState("Todas");
  const rutas = region === "Todas" ? RUTAS_MEXICO.rutas : RUTAS_MEXICO.rutas.filter((r) => r.region === region);

  return (
    <div>
      <PageHero
        eyebrow="Paquete de rutas"
        title="Rutas de México para tu simulador"
        description="Rutas VFR entre aeropuertos mexicanos, con distancia, rumbos magnéticos, el terreno que hay debajo, frecuencias y un plan de vuelo listo para cargar en MSFS."
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
        <div className="flex flex-wrap gap-2">
          {REGIONES.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                region === r ? "border-gold-500 bg-gold-500/15 text-gold-400" : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-8">
          {rutas.map((r) => (
            <TarjetaRuta key={r.id} ruta={r} />
          ))}
        </div>

        <section className="mt-14 max-w-3xl text-sm leading-relaxed text-white/60">
          <h2 className="font-display text-lg font-semibold text-white">Cómo leer estas fichas</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <b className="text-white/80">Rumbo magnético</b> = rumbo verdadero menos la variación (si es este, se resta; si es oeste, se suma).
              Se calculó con el modelo {RUTAS_MEXICO.modeloMagnetico} en el punto medio de la ruta. Es el rumbo de la salida en línea recta: en rutas largas cambia un poco.
            </li>
            <li>
              <b className="text-white/80">Nivel VFR sugerido</b>: el terreno más alto del corredor más 2,000 ft de margen, ajustado al siguiente nivel de crucero que
              corresponde a tu rumbo magnético según la Circular Obligatoria CO AV-1.02/25 (apéndice C; aplica sobre 2,000 ft de altura sobre el terreno).
              Si tu avión no llega a ese nivel, esta ruta directa no es para él: planea un rodeo por los valles.
            </li>
            <li>
              <b className="text-white/80">Terreno</b>: modelo de elevación de 90 m (Open-Meteo). No incluye obstáculos como torres ni antenas.
            </li>
            <li>
              <b className="text-white/80">Aeropuertos y frecuencias</b>: datos públicos de NOAA/FAA. Pueden estar incompletos o desactualizados: confirma con la publicación oficial de México.
            </li>
            <li>Datos generados el {RUTAS_MEXICO.generado}. Material para simulación y formación: no lo uses para navegación real.</li>
          </ul>
        </section>
      </Container>
    </div>
  );
}
