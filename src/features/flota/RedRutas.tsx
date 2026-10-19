import { useEffect, useMemo, useRef, useState } from "react";
import { geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { AEROPUERTOS, REDES, RUTAS, bloque, millas, type ClaveRed, type Ruta } from "../../data/redRutas";

type Filtro = ClaveRed | "todas";

const FILTROS: { clave: Filtro; nombre: string }[] = [
  { clave: "todas", nombre: "Toda la red" },
  { clave: "c408", nombre: REDES.c408.nombre },
  { clave: "c90", nombre: REDES.c90.nombre },
  { clave: "b737", nombre: REDES.b737.nombre },
  { clave: "vuelta", nombre: REDES.vuelta.nombre },
];

const lonLat = (c: string): [number, number] => [AEROPUERTOS[c][1], AEROPUERTOS[c][0]];
const nm = (n: number) => Math.round(n).toLocaleString("es-MX");

type Paises = Topology<{ countries: GeometryCollection }>;

export function RedRutas() {
  const [paises, setPaises] = useState<Paises | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [activa, setActiva] = useState<number | null>(null);
  const [encima, setEncima] = useState<number | null>(null);
  // El dibujo usa el ancho real del contenedor: así las etiquetas miden lo mismo en teléfono que en escritorio.
  const marco = useRef<HTMLElement>(null);
  const [ancho, setAncho] = useState(960);
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setAncho(Math.max(300, Math.round(e.contentRect.width))));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const W = ancho;
  const H = Math.round(ancho < 640 ? ancho * 0.9 : ancho * 0.58);
  const margen = ancho < 640 ? 22 : 40;

  useEffect(() => {
    let vivo = true;
    fetch("/data/paises-50m.json")
      .then((r) => r.json())
      .then((t: Paises) => vivo && setPaises(t))
      .catch(() => {}); // sin mapa base, los arcos y aeropuertos se dibujan igual
    return () => {
      vivo = false;
    };
  }, []);

  const rutas = useMemo(() => RUTAS.filter((r) => filtro === "todas" || r.red === filtro), [filtro]);
  const codigos = useMemo(() => [...new Set(rutas.flatMap((r) => [r.desde, r.hasta]))], [rutas]);

  const dibujo = useMemo(() => {
    // El mundo se centra en Europa; las redes de América, en México.
    const proyeccion = geoNaturalEarth1()
      .rotate([filtro === "todas" || filtro === "vuelta" ? -10 : 100, 0])
      .fitExtent([[margen, margen], [W - margen, H - margen]], { type: "MultiPoint", coordinates: codigos.map(lonLat) });
    const camino = geoPath(proyeccion);
    const base = paises
      ? {
          tierra: camino(feature(paises, paises.objects.countries)) ?? "",
          fronteras: camino(mesh(paises, paises.objects.countries, (a, b) => a !== b)) ?? "",
        }
      : null;
    const arcos = rutas.map((r) => ({
      ruta: r,
      d: camino({ type: "LineString", coordinates: [lonLat(r.desde), lonLat(r.hasta)] }) ?? "",
      medio: r.tramo ? proyeccion(geoInterpolate(lonLat(r.desde), lonLat(r.hasta))(0.5)) : null,
    }));

    // Etiquetas ICAO sin encimarse: se prueba a la derecha, a la izquierda, arriba y abajo.
    type Caja = { x: number; y: number; w: number; h: number };
    const ocupado: Caja[] = [];
    const choca = (b: Caja) => b.x < 2 || b.x + b.w > W - 2 || b.y < 2 || b.y + b.h > H - 2 || ocupado.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
    const puntos = codigos
      .map((c) => ({ c, p: proyeccion(lonLat(c)) }))
      .filter((d): d is { c: string; p: [number, number] } => !!d.p)
      .sort((a, b) => (a.c === "MMGL" ? -1 : b.c === "MMGL" ? 1 : 0));
    puntos.forEach(({ p }) => ocupado.push({ x: p[0] - 4, y: p[1] - 4, w: 8, h: 8 }));
    const etiquetas = puntos.flatMap(({ c, p }) => {
      const w = c.length * 6.6;
      for (const [dx, dy, ancla] of [[7, 4, "start"], [-7, 4, "end"], [0, -8, "middle"], [0, 15, "middle"]] as const) {
        const x0 = ancla === "start" ? p[0] + dx : ancla === "end" ? p[0] + dx - w : p[0] - w / 2;
        const caja = { x: x0, y: p[1] + dy - 10, w, h: 12 };
        if (!choca(caja)) {
          ocupado.push(caja);
          return [{ c, x: p[0] + dx, y: p[1] + dy, ancla }];
        }
      }
      return [];
    });
    return { reticula: camino(geoGraticule10()) ?? "", base, arcos, puntos, etiquetas };
  }, [paises, rutas, codigos, filtro, W, H, margen]);

  const resaltada = encima ?? activa;
  const info = filtro === "todas"
    ? { nombre: "Toda la red", texto: "Las cuatro redes juntas. Elige un avión para acercar el mapa." }
    : REDES[filtro];
  const total = rutas.reduce((s, r) => s + millas(r.desde, r.hasta), 0);
  const elegir = (id: number) => setActiva((a) => (a === id ? null : id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por red">
        {FILTROS.map((f) => (
          <button
            key={f.clave}
            type="button"
            aria-pressed={filtro === f.clave}
            onClick={() => {
              setFiltro(f.clave);
              setActiva(null);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-gold-400 aria-pressed:border-white/30 aria-pressed:bg-white/[0.06] aria-pressed:text-white"
          >
            {f.clave !== "todas" && (
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: REDES[f.clave].color }} aria-hidden="true" />
            )}
            {f.nombre}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <figure ref={marco} className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-950">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Mapa de rutas: ${info.nombre}`}>
            <path d={dibujo.reticula} fill="none" stroke="#1d3656" strokeWidth={0.4} strokeDasharray="2 4" />
            {dibujo.base && (
              <>
                <path d={dibujo.base.tierra} fill="#10223a" />
                <path d={dibujo.base.fronteras} fill="none" stroke="#1d3656" strokeWidth={0.6} />
              </>
            )}
            {dibujo.arcos
              .slice()
              .sort((a, b) => Number(a.ruta.id === resaltada) - Number(b.ruta.id === resaltada))
              .map(({ ruta, d }) => (
                <path
                  key={ruta.id}
                  d={d}
                  fill="none"
                  stroke={REDES[ruta.red].color}
                  strokeWidth={ruta.id === resaltada ? 3.5 : 2}
                  strokeLinecap="round"
                  strokeDasharray={ruta.red === "vuelta" ? "6 4" : undefined}
                  opacity={resaltada !== null && ruta.id !== resaltada ? 0.12 : 1}
                  className="cursor-pointer transition-opacity duration-150"
                  onMouseEnter={() => setEncima(ruta.id)}
                  onMouseLeave={() => setEncima(null)}
                  onClick={() => elegir(ruta.id)}
                />
              ))}
            {dibujo.puntos.map(({ c, p }) => (
              <circle
                key={c}
                cx={p[0]}
                cy={p[1]}
                r={c === "MMGL" ? 5 : 3.5}
                fill={c === "MMGL" ? "#e8c766" : "#060e1a"}
                stroke={c === "MMGL" ? "#e8c766" : "#e7edf6"}
                strokeWidth={1.4}
              >
                <title>{`${c} · ${AEROPUERTOS[c][2]}`}</title>
              </circle>
            ))}
            {dibujo.etiquetas.map((e) => (
              <text
                key={e.c}
                x={e.x}
                y={e.y}
                textAnchor={e.ancla}
                className="font-mono"
                fontSize={10.5}
                fill="#e7edf6"
                stroke="#060e1a"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {e.c}
              </text>
            ))}
            {dibujo.arcos.map(({ ruta, medio }) =>
              medio ? (
                <g key={`n${ruta.id}`} transform={`translate(${medio[0]},${medio[1]})`} className="cursor-pointer" onClick={() => elegir(ruta.id)}>
                  <circle r={8.5} fill="#e8c766" />
                  <text textAnchor="middle" dy={3.5} fontSize={10} fontWeight={600} fill="#060e1a" className="font-mono">
                    {ruta.tramo}
                  </text>
                </g>
              ) : null,
            )}
          </svg>
          <figcaption className="absolute bottom-2.5 left-3 font-mono text-[11px] text-white/45">
            Arcos ortodrómicos · ● base MMGL
          </figcaption>
        </figure>

        <section className="flex flex-col rounded-2xl border border-white/10 bg-navy-900/60 xl:max-h-[560px]" aria-live="polite">
          <div className="border-b border-white/10 px-5 pb-3 pt-4">
            <h3 className="font-display text-xl font-semibold text-white">{info.nombre}</h3>
            <p className="mt-1 text-sm leading-relaxed text-white/55">{info.texto}</p>
            <p className="mt-2 flex gap-4 font-mono text-xs text-white/50 tabular-nums">
              <span><b className="font-medium text-white">{rutas.length}</b> rutas</span>
              <span><b className="font-medium text-white">{codigos.length}</b> aeropuertos</span>
              <span><b className="font-medium text-white">{nm(total)}</b> nm</span>
            </p>
          </div>
          <ol className="grid content-start gap-0.5 overflow-y-auto p-1.5">
            {rutas.map((r: Ruta) => (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={activa === r.id}
                  onMouseEnter={() => setEncima(r.id)}
                  onMouseLeave={() => setEncima(null)}
                  onClick={() => elegir(r.id)}
                  className={`grid w-full grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-gold-400 ${resaltada === r.id ? "bg-white/[0.05]" : ""}`}
                >
                  <span
                    className="grid h-5.5 w-6.5 place-items-center rounded-md font-mono text-[11px] font-semibold text-navy-950"
                    style={{ background: REDES[r.red].color }}
                  >
                    {r.tramo ?? { c408: "R", c90: "E", b737: "T", vuelta: "" }[r.red]}
                  </span>
                  <span className="font-mono text-sm text-white">
                    {r.desde} → {r.hasta}
                  </span>
                  <span className="whitespace-nowrap text-right font-mono text-xs text-white/50 tabular-nums">
                    <b className="font-medium text-white">{nm(millas(r.desde, r.hasta))}</b> nm · {bloque(r)}
                  </span>
                  <span className="col-start-2 col-end-4 min-w-0 text-[13px] text-white/50">
                    {AEROPUERTOS[r.desde][2]} → {AEROPUERTOS[r.hasta][2]}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
