import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/AuthContext";
import { PREFIJO_DIAGNOSTICO } from "../features/payments/reglasSesiones";
import { fechaMinima, horariosDisponibles } from "../lib/agendaSlots";
import { ROUTES } from "../lib/routes";

const NIVELES = ["Apenas empiezo en simulación", "Tengo bases y vuelo VFR", "Vuelo IFR o en línea (VATSIM / IVAO)"];

const CAMPO = "rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50";

/** Solicitud del diagnóstico gratuito: va a la misma tabla `reservas`, con un tema propio que nunca se cobra. */
export function Diagnostico() {
  const { user } = useAuth();
  const [nivel, setNivel] = useState(NIVELES[0]);
  const [objetivo, setObjetivo] = useState("");
  const [equipo, setEquipo] = useState("");
  const [pais, setPais] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const minFecha = fechaMinima();
  const slots = horariosDisponibles(fecha);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fecha || !horario) {
      setError("Elige una fecha y un horario para tu diagnóstico.");
      return;
    }
    if (fecha < minFecha) {
      setError("Elige una fecha con al menos 2 días de anticipación.");
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !user) {
      setError("Debes iniciar sesión para pedir tu diagnóstico.");
      return;
    }

    setStatus("sending");
    const { error: insertError } = await supabase.from("reservas").insert({
      user_id: userId,
      email: user.email,
      tipo: "revision",
      tema: PREFIJO_DIAGNOSTICO,
      fecha_preferida: fecha,
      horario_preferido: horario,
      comentarios: [`Nivel: ${nivel}`, `Objetivo: ${objetivo}`, `Simulador y avión: ${equipo}`, `País / zona horaria: ${pais}`].join("\n"),
    });
    if (insertError) {
      setError(insertError.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <div>
      <PageHero
        eyebrow="Asesorías 1 a 1"
        title="Pide tu diagnóstico gratis"
        description="Cuéntame dónde estás y qué quieres lograr. Te confirmo por correo la fecha de tu diagnóstico de 30 minutos por Discord."
      >
        <Link
          to={ROUTES.asesorias}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          Volver a Asesorías
        </Link>
      </PageHero>

      <Container className="max-w-2xl py-12 md:py-16">
        {status === "sent" ? (
          <div className="animate-result-in rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-6">
            <p className="font-display text-base font-semibold text-white">Solicitud enviada</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Te confirmo la fecha por correo ({user?.email}). Si necesitas otro horario, respóndeme ahí mismo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Tu nivel
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={CAMPO}>
                {NIVELES.map((n) => (
                  <option key={n} value={n} style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              ¿Qué quieres lograr?
              <textarea
                required
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={3}
                placeholder="Ej. Aprender IFR, prepararme para un examen, volar en línea..."
                className={CAMPO}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Simulador y avión que usas
              <input required value={equipo} onChange={(e) => setEquipo(e.target.value)} placeholder="Ej. MSFS 2020, Cessna 172" className={CAMPO} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              País y zona horaria
              <input required value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Ej. España (CET)" className={CAMPO} />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                Fecha preferida
                <input
                  type="date"
                  value={fecha}
                  min={minFecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHorario("");
                  }}
                  className={CAMPO}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                Horario preferido
                <select value={horario} onChange={(e) => setHorario(e.target.value)} disabled={!fecha} className={`${CAMPO} disabled:cursor-not-allowed disabled:opacity-50`}>
                  <option value="" style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                    {fecha ? "Elige un horario" : "Elige primero una fecha"}
                  </option>
                  {slots.map((s) => (
                    <option key={s.value} value={s.value} style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="-mt-2 text-xs text-white/40">
              Horarios en hora del centro de México. Lunes a viernes 5pm-10pm, sábado y domingo 8am-10pm. Con al menos 2 días de anticipación.
            </p>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={status === "sending"}>
              <CalendarClock size={16} /> {status === "sending" ? "Enviando..." : "Pedir mi diagnóstico"}
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}
