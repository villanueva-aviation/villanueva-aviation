import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MessageSquareText, Star } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { ACADEMIA_MODULOS } from "../data/academia";
import { fetchTodoFeedback, type Feedback } from "../features/feedback/feedback";
import { fetchTodoModuloFeedback, type ModuloFeedbackRow } from "../features/feedback/moduloFeedback";

function tituloModulo(slug: string) {
  return ACADEMIA_MODULOS.find((m) => m.slug === slug)?.titulo ?? slug;
}

function Estrellas({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className={i <= n ? "fill-gold-400 text-gold-400" : "text-white/15"} />
      ))}
    </div>
  );
}

export function AdminFeedback() {
  const { user, loading: authLoading } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [moduloFeedback, setModuloFeedback] = useState<ModuloFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    Promise.all([fetchTodoFeedback(), fetchTodoModuloFeedback()]).then(([general, porModulo]) => {
      setFeedback(general);
      setModuloFeedback(porModulo);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Experiencia de cadetes"
        description="Todo lo que los cadetes han compartido sobre la plataforma — qué les gusta y qué mejorarían."
      />

      <Container className="py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : feedback.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <MessageSquareText size={22} className="text-white/30" />
            <p className="text-sm text-white/55">Todavía no hay feedback registrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedback.map((f) => (
              <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{f.email}</p>
                  <div className="flex items-center gap-2">
                    {f.calificacion && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={13}
                            className={n <= f.calificacion! ? "fill-gold-400 text-gold-400" : "text-white/15"}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-white/45">{new Date(f.created_at).toLocaleDateString("es-MX")}</p>
                  </div>
                </div>
                {f.lo_que_te_gusto && (
                  <p className="mt-2 text-xs text-white/60">
                    <span className="text-white/40">Le gustó: </span>
                    {f.lo_que_te_gusto}
                  </p>
                )}
                <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-xs text-white/70">
                  {f.que_mejorarias}
                </p>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-4 mt-14 font-display text-lg font-semibold text-white">Calificaciones por módulo</h2>
        {!loading && moduloFeedback.length === 0 ? (
          <p className="text-sm text-white/55">Todavía no hay calificaciones por módulo.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {moduloFeedback.map((f) => (
              <div key={f.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{tituloModulo(f.modulo_slug)}</p>
                  <div className="flex items-center gap-2">
                    <Estrellas n={f.calificacion} />
                    <p className="text-xs text-white/45">{new Date(f.created_at).toLocaleDateString("es-MX")}</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-white/40">{f.email}</p>
                {f.comentario && <p className="mt-1.5 text-xs text-white/65">{f.comentario}</p>}
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
