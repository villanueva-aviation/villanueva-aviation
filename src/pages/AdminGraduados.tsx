import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { fetchGraduados, marcarReconocido, type Graduado } from "../features/progress/graduacionTeoria";

export function AdminGraduados() {
  const { user, loading: authLoading } = useAuth();
  const [graduados, setGraduados] = useState<Graduado[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    fetchGraduados().then((data) => {
      setGraduados(data);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  async function handleReconocer(userId: string) {
    setActualizandoId(userId);
    const { error } = await marcarReconocido(userId);
    if (!error) setGraduados((prev) => prev.map((g) => (g.user_id === userId ? { ...g, reconocido: true } : g)));
    setActualizandoId(null);
  }

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Graduados de teoría"
        description="Cadetes que completaron el 100% de los módulos de Academia — reconócelos en redes y ofréceles las prácticas de Contenido Exclusivo."
      />

      <Container className="py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : graduados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <GraduationCap size={22} className="text-white/30" />
            <p className="text-sm text-white/55">Todavía no hay cadetes que hayan completado toda la teoría.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {graduados.map((g) => (
              <div
                key={g.user_id}
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  g.reconocido ? "border-white/10 bg-white/[0.02]" : "border-gold-500/20 bg-gold-500/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-gold-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{g.email}</p>
                    <p className="text-xs text-white/55">{new Date(g.completado_en).toLocaleDateString("es-MX")}</p>
                  </div>
                </div>
                {g.reconocido ? (
                  <Badge tone="neutral">Ya reconocido</Badge>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={actualizandoId === g.user_id}
                    onClick={() => handleReconocer(g.user_id)}
                  >
                    Marcar como reconocido
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
