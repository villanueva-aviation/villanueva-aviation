import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { useLector, type EstadoLector } from "../features/instructor/useLector";
import { armarVuelo, avanzarVuelo, type EvaluacionVuelo, type FaseVuelo } from "../features/instructor/fasesVuelo";
import type { Aeropuerto } from "../features/instructor/aeropuertoSim";
import { lectorViejoChecklist, type Muestra } from "../features/instructor/evaluador";
import {
  avanzarChecklist,
  avisosPorDecir,
  crearChecklist,
  oir,
  resumenChecklist,
  type Checklist,
  type EstadoPunto,
} from "../features/instructor/checklistVoz";
import type { SeccionId } from "../data/checklistVozC172";
import { AVIONES_VOZ, type AvionVoz } from "../data/checklistVozAviones";
import { useVoz } from "../features/instructor/useVoz";
import { useChecklistVoz } from "../features/instructor/useChecklistVoz";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const ESTADO: Record<EstadoLector, { texto: string; tono: "green" | "red" | "neutral" }> = {
  "sin-lector": { texto: "Sin lector", tono: "red" },
  "sin-simulador": { texto: "Sin simulador", tono: "neutral" },
  conectado: { texto: "Conectado", tono: "green" },
};

const FASE: Record<FaseVuelo, string> = {
  rampa: "En rampa",
  rodaje: "Rodaje",
  "carrera-despegue": "Carrera de despegue",
  vuelo: "En vuelo",
  "carrera-aterrizaje": "Carrera de aterrizaje",
  "rodaje-regreso": "Rodaje de regreso",
  terminado: "Terminado",
  invalido: "Inválido",
};

const COLOR: Record<EstadoPunto, string> = {
  pendiente: "text-white/50",
  revisando: "text-gold-400",
  hecho: "text-green-400",
  dicho: "text-white",
  "no-hecho": "text-red-400",
  saltado: "text-red-400",
};
const ETIQUETA: Record<EstadoPunto, string> = {
  pendiente: "",
  revisando: "revisando",
  hecho: "hecho",
  dicho: "dicho",
  "no-hecho": "dicho, no hecho",
  saltado: "saltado",
};
const nuevoChecklist = (a: AvionVoz) => crearChecklist(AVIONES_VOZ[a].secciones);

const mmss = (seg: number) => {
  const s = Math.max(0, Math.round(seg));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const si = (b?: boolean) => (b ? "sí" : "no");
const n = (x: number | undefined, dec = 0) => (x === undefined ? "—" : x.toFixed(dec));

/** Panel del fundador: sigue un vuelo de rampa a rampa con el lector v1.4, sin voz ni calificación. */
export function AdminVuelo() {
  const { user, loading: authLoading } = useAuth();
  const [ev, setEv] = useState<EvaluacionVuelo | null>(null);
  const [motivo, setMotivo] = useState<string | null>(null);
  const evRef = useRef<EvaluacionVuelo | null>(null);
  const inicio = useRef(0);
  const aeroRef = useRef<Aeropuerto | null>(null);
  const [avion, setAvion] = useState<AvionVoz>("c172");
  const avionRef = useRef<AvionVoz>(avion);
  const [cl, setCl] = useState<Checklist>(() => nuevoChecklist("c172"));
  const clRef = useRef<Checklist>(cl);
  const ultimaT = useRef(0);
  const dichos = useRef(new Set<SeccionId>());
  const [escuchar, setEscuchar] = useState(false);
  const [oido, setOido] = useState("");
  const [oidos, setOidos] = useState<string[]>([]);
  const [escrito, setEscrito] = useState("");
  const voz = useVoz("es", () => null);

  const alOir = (texto: string) => {
    clRef.current = oir(clRef.current, texto, ultimaT.current);
    setCl(clRef.current);
    setOido(texto);
    setOidos((xs) => [texto, ...xs].slice(0, 12));
  };
  const escucha = useChecklistVoz(escuchar, voz, alOir);
  const { decir } = escucha;

  // Al cerrar una sección (y terminar sus revisiones) el instructor dice qué faltó, una vez por lectura.
  useEffect(() => {
    if (cl.abierta) dichos.current.delete(cl.abierta);
    for (const a of avisosPorDecir(cl, dichos.current)) {
      dichos.current.add(a.id);
      decir(a.texto);
    }
  }, [cl, decir]);

  // Arma con `m` si se puede; si no, deja el motivo y vuelve a intentar con la siguiente muestra.
  const armar = (m: Muestra) => {
    const a = armarVuelo(m, aeroRef.current);
    if (a.fase === "invalido") {
      evRef.current = null;
      setMotivo(a.motivo ?? null);
    } else {
      evRef.current = a;
      inicio.current = m.t;
      setMotivo(null);
    }
  };

  const { estado, muestra, aeropuerto } = useLector((lote) => {
    for (const m of lote) {
      if (!evRef.current) armar(m);
      else evRef.current = avanzarVuelo(evRef.current, m, aeroRef.current);
      ultimaT.current = m.t;
      clRef.current = avanzarChecklist(clRef.current, m, {
        elevacionFt: evRef.current?.aeropuerto?.elevacionFt ?? null,
        limites: AVIONES_VOZ[avionRef.current].limites,
      });
    }
    setEv(evRef.current);
    setCl(clRef.current);
  });
  aeroRef.current = aeropuerto;

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  const a = ev?.aeropuerto ?? aeropuerto;
  const frec = (tipo: string) => a?.frecuencias.filter((f) => f.tipo === tipo).map((f) => f.mhz).join(", ") || "—";
  const m = muestra;
  const campos: [string, string][] = m
    ? [
        ["Motor", `${m.motor ? "encendido" : "apagado"} · mezcla ${n(m.mezcla)}% · acelerador ${n(m.acelerador)}%`],
        ["Magnetos", `izq ${si(m.magIzq)} · der ${si(m.magDer)} · master ${si(m.master)}`],
        ["Freno de estacionamiento", si(m.freno)],
        ["Luces", `beacon ${si(m.luzBeacon)} · nav ${si(m.luzNav)} · aterrizaje ${si(m.luzAterrizaje)} · strobe ${si(m.luzStrobe)} · taxi ${si(m.luzTaxi)}`],
        ["Transponder", `${m.xpdr ?? "—"} (modo ${n(m.xpdrModo)})`],
        ["Altímetro / QNH", `${n(m.altimetro, 2)} / ${n(m.qnh, 2)} inHg`],
        ["COM1", n(m.com1, 3)],
        ["Tren", m.tren ? "abajo" : "arriba"],
        ["Viento", `${n(m.vientoDir)}° / ${n(m.vientoKt)} kt`],
        ["GS", `${n(m.gs)} kt · ${n(m.altitud)} ft · ${n(m.agl)} ft AGL`],
        [
          "Aviónica / combustible",
          `aviónica ${si(m.avionica)} · selector ${n(m.selector)} · válvula ${si(m.valvula)} · bomba ${si(m.bomba)} · piloto automático ${si(m.autopiloto)} · trim ${n(m.trim, 1)}`,
        ],
      ]
    : [];
  const resumen = resumenChecklist(cl);
  const reiniciar = () => {
    if (m) armar(m);
    clRef.current = nuevoChecklist(avionRef.current);
    dichos.current.clear();
    setCl(clRef.current);
    setOido("");
  };
  const cambiarAvion = (a: AvionVoz) => {
    avionRef.current = a;
    setAvion(a);
    clRef.current = nuevoChecklist(a);
    dichos.current.clear();
    setCl(clRef.current);
  };

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Vuelo de rampa a rampa"
        description="Prueba del lector v1.5: fases del vuelo y checklist por voz del C172, C152 y Arrow."
      />
      <Container className="py-12 md:py-16 space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={ESTADO[estado].tono}>{ESTADO[estado].texto}</Badge>
          <Button variant="secondary" onClick={reiniciar}>
            Empezar de nuevo
          </Button>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60">Fase</p>
          <p className="font-display text-4xl text-gold-400">{ev ? FASE[ev.fase] : "Esperando una muestra en rampa"}</p>
          {(ev?.motivo ?? motivo) && <p className="mt-2 text-red-400">{ev?.motivo ?? motivo}</p>}
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-display text-lg text-white">Aeropuerto</h2>
            {a ? (
              <div className="mt-2 space-y-1 text-white/80">
                <p>
                  <span className="font-semibold text-white">{a.icao}</span> · {a.nombre} · {Math.round(a.elevacionFt)} ft
                </p>
                <p>Pistas: {a.pistas.map((p) => p.extremos.map((e) => e.ident).join("/")).join(", ") || "—"}</p>
                <p>
                  Torre {frec("torre")} · Rodaje {frec("rodaje")}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-white/60">Todavía no llega del simulador.</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-display text-lg text-white">Eventos</h2>
            {ev && ev.eventos.length > 0 ? (
              <ul className="mt-2 space-y-1 font-mono text-sm text-white/80">
                {ev.eventos.map((e, i) => (
                  <li key={i}>
                    {mmss(e.t - inicio.current)} {e.tipo}
                    {e.pista !== undefined && ` · pista ${e.pista ?? "—"}`}
                    {e.seg !== undefined && ` · ${e.seg.toFixed(1)} s`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-white/60">Sin eventos.</p>
            )}
            {ev && <p className="mt-3 text-sm text-white/60">Máxima distancia: {ev.maxDistNm.toFixed(1)} NM</p>}
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg text-white">Checklist por voz</h2>
            <Button variant={escuchar ? "secondary" : "primary"} onClick={() => setEscuchar((x) => !x)} disabled={!escucha.supported}>
              {escuchar ? "Dejar de escuchar" : "Escuchar checklist"}
            </Button>
            {escucha.escuchando && <Badge tone="green">Escuchando</Badge>}
            {!escucha.supported && <span className="text-sm text-red-400">Este navegador no reconoce voz.</span>}
            {escucha.error && <span className="text-sm text-red-400">{escucha.error}</span>}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Avión del checklist">
            {(Object.keys(AVIONES_VOZ) as AvionVoz[]).map((a) => (
              <Button key={a} variant={a === avion ? "primary" : "secondary"} onClick={() => cambiarAvion(a)} aria-pressed={a === avion}>
                {AVIONES_VOZ[a].nombre}
              </Button>
            ))}
          </div>
          {m && lectorViejoChecklist(m) && (
            <p className="text-sm text-gold-400">Lector v1.4: aviónica, combustible, piloto automático y trim se revisan solo por voz. Baja el v1.5 de Descargas.</p>
          )}
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (escrito.trim()) alOir(escrito.trim());
              setEscrito("");
            }}
          >
            <input
              value={escrito}
              onChange={(e) => setEscrito(e.target.value)}
              placeholder="Escribe lo que diría el cadete, por ejemplo «checklist antes de arrancar»"
              aria-label="Texto de prueba para el checklist"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white"
            />
            <Button type="submit" variant="secondary">
              Decir
            </Button>
          </form>
          {oido && <p className="text-sm text-white/70">Oí: «{oido}»</p>}
          {oidos.length > 1 && (
            <details className="text-sm text-white/60">
              <summary className="cursor-pointer">Todo lo que oí ({oidos.length})</summary>
              <ol className="mt-1 space-y-0.5 font-mono">
                {oidos.map((x, i) => (
                  <li key={i}>«{x}»</li>
                ))}
              </ol>
            </details>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cl.secciones.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border p-4 ${cl.abierta === s.id ? "border-gold-400 bg-gold-400/10" : "border-white/10"}`}
              >
                <h3 className="font-semibold text-white">{s.titulo}</h3>
                <ol className="mt-2 space-y-1 text-sm">
                  {s.puntos.map((p, k) => {
                    const e = cl.puntos[s.id][k];
                    return (
                      <li key={p.id} className={COLOR[e.estado]}>
                        {p.dicho}
                        {ETIQUETA[e.estado] && <span className="text-white/50"> · {ETIQUETA[e.estado]}</span>}
                        {e.detalle && <span> ({e.detalle})</span>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
          <div className="text-sm text-white/80 space-y-1">
            <p>Puntos en orden: {resumen.enOrden} de 80</p>
            {resumen.saltados.length > 0 && <p className="text-red-400">Saltados: {resumen.saltados.join("; ")}</p>}
            {resumen.noHechos.length > 0 && <p className="text-red-400">Dichos pero no hechos: {resumen.noHechos.join("; ")}</p>}
            {resumen.noLeidas.length > 0 && <p className="text-white/60">Sin leer: {resumen.noLeidas.join(", ")}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-lg text-white">Última muestra</h2>
          {m ? (
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
              {campos.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-white/60">Sin muestras.</p>
          )}
        </section>
      </Container>
    </div>
  );
}
