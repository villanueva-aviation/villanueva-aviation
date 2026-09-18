import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ClipboardList, FileText, GraduationCap } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { actualizarEstadoReserva, rechazarReserva, fetchTodasReservas, type Reserva } from "../features/admin/reservas";

const ESTADOS = ["pendiente", "confirmada", "completada"] as const;

const ESTADO_TONE: Record<string, "gold" | "green" | "red" | "neutral"> = {
  pendiente: "gold",
  confirmada: "green",
  completada: "neutral",
  rechazada: "red",
};

function esProyectoFinal(r: Reserva) {
  return r.tema?.startsWith("Proyecto final") ?? false;
}

export function AdminReservas() {
  const { user, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");

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
    if (!error) setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado, motivo_revision: null } : r)));
    setActualizandoId(null);
  }

  async function handleConfirmarRechazo(id: string) {
    if (!motivo.trim()) return;
    setActualizandoId(id);
    const { error } = await rechazarReserva(id, motivo.trim());
    if (!error) {
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "rechazada", motivo_revision: motivo.trim() } : r)),
      );
      setRechazandoId(null);
      setMotivo("");
    }
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
                  className={`flex flex-col gap-3 rounded-xl border p-4 ${
                    r.estado === "pendiente"
                      ? "border-gold-500/20 bg-gold-500/[0.05]"
                      : r.estado === "rechazada"
                        ? "border-red-500/20 bg-red-500/[0.04]"
                        : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      {r.estado === "rechazada" && r.motivo_revision && (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300">
                          <span className="font-semibold">Motivo del rechazo: </span>
                          {r.motivo_revision}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <select
                        value={ESTADOS.includes(r.estado as (typeof ESTADOS)[number]) ? r.estado : "pendiente"}
                        disabled={actualizandoId === r.id}
                        onChange={(e) => handleCambiarEstado(r.id, e.target.value)}
                        className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 disabled:opacity-50"
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e} style={{ backgroundColor: "#0b1d34" }}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="secondary"
                        disabled={actualizandoId === r.id}
                        onClick={() => {
                          setRechazandoId(rechazandoId === r.id ? null : r.id);
                          setMotivo("");
                        }}
                        className="!px-4 !py-2 text-xs"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>

                  {rechazandoId === r.id && (
                    <div className="flex flex-col gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3">
                      <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows={2}
                        placeholder="Explica qué debe corregir el cadete antes de volver a enviarlo..."
                        className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-red-500/50"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="!px-4 !py-2 text-xs"
                          onClick={() => {
                            setRechazandoId(null);
                            setMotivo("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="!px-4 !py-2 text-xs"
                          disabled={!motivo.trim() || actualizandoId === r.id}
                          onClick={() => handleConfirmarRechazo(r.id)}
                        >
                          Confirmar rechazo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
