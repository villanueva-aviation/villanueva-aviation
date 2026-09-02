import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/AuthContext";
import { ROUTES } from "../lib/routes";

interface Reserva {
  id: string;
  tipo: "revision" | "examen";
  tema: string | null;
  fecha_preferida: string | null;
  horario_preferido: string | null;
  comentarios: string | null;
  estado: string;
  created_at: string;
}

const ESTADO_TONE: Record<string, "gold" | "green" | "neutral"> = {
  pendiente: "gold",
  confirmada: "green",
  completada: "neutral",
};

export function AgendarCita() {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<"revision" | "examen">("revision");
  const [tema, setTema] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  async function cargarReservas() {
    const { data } = await supabase
      .from("reservas")
      .select("id, tipo, tema, fecha_preferida, horario_preferido, comentarios, estado, created_at")
      .order("created_at", { ascending: false });
    if (data) setReservas(data as Reserva[]);
  }

  useEffect(() => {
    cargarReservas();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !user) {
      setError("Debes iniciar sesión para agendar.");
      setStatus("error");
      return;
    }

    const { error: insertError } = await supabase.from("reservas").insert({
      user_id: userId,
      email: user.email,
      tipo,
      tema: tipo === "revision" ? tema : null,
      fecha_preferida: fecha || null,
      horario_preferido: horario || null,
      comentarios: comentarios || null,
    });

    if (insertError) {
      setError(insertError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    setTema("");
    setFecha("");
    setHorario("");
    setComentarios("");
    cargarReservas();
  }

  return (
    <div>
      <PageHero
        eyebrow="Contenido de cadetes"
        title="Agenda tu sesión con un instructor"
        description="Solicita una hora de revisión de un tema específico, o agenda un día para tu examen práctico."
      >
        <Link
          to={ROUTES.contenidoExclusivo}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Contenido Exclusivo
        </Link>
      </PageHero>

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex gap-2">
              <button
                onClick={() => setTipo("revision")}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  tipo === "revision"
                    ? "border-gold-500 bg-gold-500/15 text-gold-400"
                    : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                Revisión de tema
              </button>
              <button
                onClick={() => setTipo("examen")}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  tipo === "examen"
                    ? "border-gold-500 bg-gold-500/15 text-gold-400"
                    : "border-white/15 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                Examen práctico
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {tipo === "revision" && (
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Tema a revisar
                  <input
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ej. Navegación VOR, pérdidas y barrenas..."
                    className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                  />
                </label>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Fecha preferida
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Horario preferido
                  <input
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    placeholder="Ej. Mañana, después de las 4pm..."
                    className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                Comentarios
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  rows={3}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {status === "sent" && <p className="text-sm text-gold-400">Solicitud enviada — te contactaremos para confirmar.</p>}

              <Button type="submit" variant="primary" className="mt-2 w-full" disabled={status === "sending"}>
                <CalendarClock size={16} /> {status === "sending" ? "Enviando..." : "Enviar solicitud"}
              </Button>
            </form>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-white">Tus solicitudes</h3>
            <div className="mt-4 flex flex-col gap-3">
              {reservas.length === 0 && <p className="text-sm text-white/45">Aún no has enviado ninguna solicitud.</p>}
              {reservas.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">
                      {r.tipo === "revision" ? `Revisión: ${r.tema || "tema general"}` : "Examen práctico"}
                    </span>
                    <Badge tone={ESTADO_TONE[r.estado] ?? "neutral"}>{r.estado}</Badge>
                  </div>
                  {(r.fecha_preferida || r.horario_preferido) && (
                    <p className="mt-1.5 text-xs text-white/50">
                      {r.fecha_preferida} {r.horario_preferido}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
