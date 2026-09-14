import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, ExternalLink } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { FOUNDER_EMAIL } from "../lib/constants";
import { ROUTES } from "../lib/routes";
import { confirmarVuelo, enlaceVerificacion, fetchPendientes, type VueloPractica } from "../features/practica/vuelosPractica";

export function AdminVuelosPractica() {
  const { user, loading: authLoading } = useAuth();
  const [pendientes, setPendientes] = useState<VueloPractica[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || user?.email !== FOUNDER_EMAIL) return;
    fetchPendientes().then((data) => {
      setPendientes(data);
      setLoading(false);
    });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (user?.email !== FOUNDER_EMAIL) return <Navigate to={ROUTES.home} replace />;

  async function handleConfirmar(id: string) {
    setConfirmandoId(id);
    const { error } = await confirmarVuelo(id);
    if (!error) setPendientes((prev) => prev.filter((v) => v.id !== id));
    setConfirmandoId(null);
  }

  return (
    <div>
      <PageHero
        eyebrow="Panel del fundador"
        title="Vuelos de práctica por confirmar"
        description="Cada fila viene de un cadete marcando una maniobra en Práctica de vuelo. Confírmala solo después de verificarla con él."
      />

      <Container className="py-12 md:py-16">
        {loading ? (
          <p className="text-sm text-white/50">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <ClipboardList size={22} className="text-white/30" />
            <p className="text-sm text-white/55">No hay vuelos pendientes de confirmación por ahora.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendientes.map((v) => (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-xl border border-gold-500/20 bg-gold-500/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{v.maniobra_titulo}</p>
                  <p className="mt-1 text-xs text-white/55">
                    {v.email} · {v.fecha} · {v.matricula ?? "sin matrícula"} · {v.tiempo}h
                    {v.red !== "ninguna" && ` · ${v.red.toUpperCase()} ${v.identificador ?? ""}`}
                  </p>
                  {enlaceVerificacion(v.red, v.identificador) && (
                    <a
                      href={enlaceVerificacion(v.red, v.identificador)!}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gold-400 hover:text-gold-300"
                    >
                      Verificar en {v.red === "vatsim" ? "StatSim" : "IVAO Tracker"} <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <Button
                  variant="secondary"
                  disabled={confirmandoId === v.id}
                  onClick={() => handleConfirmar(v.id)}
                  className="shrink-0"
                >
                  <CheckCircle2 size={15} /> {confirmandoId === v.id ? "Confirmando..." : "Confirmar"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
