import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClipboardList, FileText, GraduationCap } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { actualizarEstadoReserva, fetchTodasReservas, type Reserva } from "../features/admin/reservas";

const ESTADOS = ["pendiente", "confirmada", "completada"] as const;

const ESTADO_TONE: Record<string, "gold" | "green" | "neutral"> = {
  pendiente: "gold",
  confirmada: "green",
  completada: "neutral",
};

function esProyectoFinal(r: Reserva) {
  return r.tema?.startsWith("Proyecto final") ?? false;
}

export function AdminReservas() {
  const { user, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    fetchTodasReservas().then((data) => {
      setReservas(data);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  async function handleCambiarEstado(id: string, estado: string) {
    setActualizandoId(id);
    const { error } = await actualizarEstadoReserva(id, estado);
    if (!error) setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)));
    setActualizandoId(null);
  }

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Agenda y proyectos finales"
        description="Solicitudes de revisión/examen práctico y proyectos finales enviados desde Academia — todo en un solo lugar."
      />

      <Container className="py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : reservas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <ClipboardList size={22} className="text-white/30" />
            <p className="text-sm text-white/55">No hay solicitudes todavía.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reservas.map((r) => {
              const proyecto = esProyectoFinal(r);
              return (
                <div
                  key={r.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
                    r.estado === "pendiente" ? "border-gold-500/20 bg-gold-500/[0.05]" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {proyecto ? (
                        <GraduationCap size={14} className="text-gold-400" />
                      ) : (
                        <FileText size={14} className="text-gold-400" />
                      )}
                      <p className="text-sm font-medium text-white">
                        {r.tipo === "examen" ? "Simulacro de examen práctico" : r.tema || "Revisión de tema"}
                      </p>
                      <Badge tone={ESTADO_TONE[r.estado] ?? "neutral"}>{r.estado}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-white/55">
                      {r.email} · {new Date(r.created_at).toLocaleDateString("es-MX")}
                      {(r.fecha_preferida || r.horario_preferido) && (
                        <> · {r.fecha_preferida} {r.horario_preferido}</>
                      )}
                    </p>
                    {r.comentarios && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-xs text-white/65">
                        {r.comentarios}
                      </p>
                    )}
                  </div>
                  <select
                    value={r.estado}
                    disabled={actualizandoId === r.id}
                    onChange={(e) => handleCambiarEstado(r.id, e.target.value)}
                    className="shrink-0 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 disabled:opacity-50"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e} style={{ backgroundColor: "#0b1d34" }}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
