import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { ProgressBar } from "../components/ui/ProgressBar";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { fetchTodosCadetes, fetchProgresoPorCadete, type Cadete } from "../features/admin/cadetes";

export function AdminCadetes() {
  const { user, loading: authLoading } = useAuth();
  const [cadetes, setCadetes] = useState<Cadete[]>([]);
  const [progreso, setProgreso] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    Promise.all([fetchTodosCadetes(), fetchProgresoPorCadete()]).then(([lista, prog]) => {
      setCadetes(lista);
      setProgreso(prog);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

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
            {cadetes.map((c) => {
              const pct = progreso[c.user_id] ?? 0;
              return (
                <div
                  key={c.user_id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{c.nombre || c.email}</p>
                    <p className="text-xs text-white/50">
                      {c.email} · Registrado el {new Date(c.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <div className="w-full max-w-xs shrink-0 sm:w-48">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                      <span>Progreso Academia</span>
                      <span>{pct}%</span>
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
