import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Users } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import {
  fetchTodosCadetes,
  fetchActividadesCompletadasPorCadete,
  TOTAL_ACTIVIDADES,
  type Cadete,
} from "../features/admin/cadetes";
import {
  diasDesde,
  enlaceGmail,
  etapaDeCadete,
  mensajeContacto,
  type EtapaCadete,
} from "../features/admin/contactoCadete";

const FILTROS: { clave: EtapaCadete | "todos"; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "sin-empezar", etiqueta: "Sin empezar" },
  { clave: "en-progreso", etiqueta: "En progreso" },
  { clave: "completo", etiqueta: "Completaron" },
];

export function AdminCadetes() {
  const { user, loading: authLoading } = useAuth();
  const [cadetes, setCadetes] = useState<Cadete[]>([]);
  const [completadas, setCompletadas] = useState<Record<string, number>>({});
  const [filtro, setFiltro] = useState<EtapaCadete | "todos">("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    Promise.all([fetchTodosCadetes(), fetchActividadesCompletadasPorCadete()]).then(([lista, hechas]) => {
      setCadetes(lista);
      setCompletadas(hechas);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  const etapaDe = (c: Cadete) => etapaDeCadete(completadas[c.user_id] ?? 0, TOTAL_ACTIVIDADES);
  const conteo = (clave: EtapaCadete | "todos") =>
    clave === "todos" ? cadetes.length : cadetes.filter((c) => etapaDe(c) === clave).length;
  const visibles = filtro === "todos" ? cadetes : cadetes.filter((c) => etapaDe(c) === filtro);
  const urlFormacion = `${window.location.origin}${ROUTES.miFormacion}`;

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Cadetes registrados"
        description={loading ? "Cargando..." : `${cadetes.length} cadete${cadetes.length === 1 ? "" : "s"} registrado${cadetes.length === 1 ? "" : "s"} en total.`}
      />

      <Container className="py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : cadetes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <Users size={22} className="text-white/30" />
            <p className="text-sm text-white/55">Todavía no hay cadetes registrados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar cadetes por etapa">
              {FILTROS.map((f) => (
                <button
                  key={f.clave}
                  role="tab"
                  aria-selected={filtro === f.clave}
                  onClick={() => setFiltro(f.clave)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    filtro === f.clave
                      ? "border-gold-500/50 bg-gold-500/10 text-gold-400"
                      : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20"
                  }`}
                >
                  {f.etiqueta} · {conteo(f.clave)}
                </button>
              ))}
            </div>
            {visibles.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/50">
                Nadie en esta etapa.
              </p>
            )}
            {visibles.map((c) => {
              const hechas = completadas[c.user_id] ?? 0;
              const pct = Math.round((hechas / TOTAL_ACTIVIDADES) * 100);
              const etapa = etapaDe(c);
              const { asunto, cuerpo } = mensajeContacto(c.nombre, urlFormacion);
              return (
                <div
                  key={c.user_id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{c.nombre || c.email}</p>
                    <p className="text-xs text-white/50">
                      {c.email} · Registrado el {new Date(c.created_at).toLocaleDateString("es-MX")} (hace{" "}
                      {diasDesde(c.created_at)} d)
                    </p>
                  </div>
                  {etapa !== "completo" && (
                    <a
                      href={enlaceGmail(c.email, asunto, cuerpo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gold-500/40 px-4 py-1.5 text-xs font-medium text-gold-400 transition-colors duration-200 hover:bg-gold-500/10"
                    >
                      <Mail size={13} /> Escribirle
                    </a>
                  )}
                  <div className="w-full max-w-xs shrink-0 sm:w-48">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                      <span>Progreso Academia</span>
                      <span>
                        {hechas} de {TOTAL_ACTIVIDADES} · {pct}%
                      </span>
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
