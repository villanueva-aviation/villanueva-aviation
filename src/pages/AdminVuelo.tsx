import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { useLector, type EstadoLector } from "../features/instructor/useLector";
import { armarVuelo, avanzarVuelo, type EvaluacionVuelo, type FaseVuelo } from "../features/instructor/fasesVuelo";
import type { Aeropuerto } from "../features/instructor/aeropuertoSim";
import type { Muestra } from "../features/instructor/evaluador";
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
    }
    setEv(evRef.current);
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
      ]
    : [];

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Vuelo de rampa a rampa"
        description="Prueba del lector v1.4: fases, pistas y eventos de un vuelo completo en el C172. Todavía sin voz ni calificación."
      />
      <Container className="py-12 md:py-16 space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={ESTADO[estado].tono}>{ESTADO[estado].texto}</Badge>
          <Button variant="secondary" onClick={() => (m ? armar(m) : undefined)} disabled={!m}>
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
