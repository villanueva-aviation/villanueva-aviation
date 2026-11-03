import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/AuthContext";
import { PREFIJO_DIAGNOSTICO } from "../features/payments/reglasSesiones";
import { fechaMinima, horariosDisponibles } from "../lib/agendaSlots";
import { ROUTES } from "../lib/routes";
import { RUTAS_EN, esIngles } from "../lib/idioma";

const TEXTOS = {
  es: {
    niveles: ["Apenas empiezo en simulación", "Tengo bases y vuelo VFR", "Vuelo IFR o en línea (VATSIM / IVAO)"],
    eyebrow: "Asesorías 1 a 1",
    titulo: "Pide tu diagnóstico gratis",
    intro: "Cuéntame dónde estás y qué quieres lograr. Te confirmo por correo la fecha de tu diagnóstico de 30 minutos por Discord.",
    volver: "Volver a Asesorías",
    faltaFecha: "Elige una fecha y un horario para tu diagnóstico.",
    pocaAnticipacion: "Elige una fecha con al menos 2 días de anticipación.",
    sinSesion: "Debes iniciar sesión para pedir tu diagnóstico.",
    enviada: "Solicitud enviada",
    confirmo: (correo?: string) => `Te confirmo la fecha por correo (${correo}). Si necesitas otro horario, respóndeme ahí mismo.`,
    nivel: "Tu nivel",
    objetivo: "¿Qué quieres lograr?",
    objetivoEj: "Ej. Aprender IFR, prepararme para un examen, volar en línea...",
    equipo: "Simulador y avión que usas",
    equipoEj: "Ej. MSFS 2020, Cessna 172",
    pais: "País y zona horaria",
    paisEj: "Ej. España (CET)",
    fecha: "Fecha preferida",
    horario: "Horario preferido",
    eligeHorario: "Elige un horario",
    eligeFecha: "Elige primero una fecha",
    nota: "Horarios en hora del centro de México. Lunes a viernes 5pm-10pm, sábado y domingo 8am-10pm. Con al menos 2 días de anticipación.",
    enviando: "Enviando...",
    pedir: "Pedir mi diagnóstico",
  },
  en: {
    niveles: ["I'm just getting started with flight sim", "I have the basics and fly VFR", "I fly IFR or online (VATSIM / IVAO)"],
    eyebrow: "One-on-one coaching",
    titulo: "Book your free assessment",
    intro: "Tell me where you are and what you want to achieve. I'll confirm the date of your 30-minute assessment on Discord by email.",
    volver: "Back to coaching",
    faltaFecha: "Choose a date and a time for your assessment.",
    pocaAnticipacion: "Choose a date at least 2 days from today.",
    sinSesion: "Please sign in to book your assessment.",
    enviada: "Request sent",
    confirmo: (correo?: string) => `I'll confirm the date by email (${correo}). If you need a different time, just reply there.`,
    nivel: "Your level",
    objetivo: "What do you want to achieve?",
    objetivoEj: "E.g. learn IFR, prepare for an exam, fly online...",
    equipo: "Simulator and aircraft you use",
    equipoEj: "E.g. MSFS 2020, Cessna 172",
    pais: "Country and time zone",
    paisEj: "E.g. United States (EST)",
    fecha: "Preferred date",
    horario: "Preferred time",
    eligeHorario: "Choose a time",
    eligeFecha: "Choose a date first",
    nota: "Times are Central Mexico time (UTC−6). Monday to Friday 5–10 pm, Saturday and Sunday 8 am–10 pm. At least 2 days in advance.",
    enviando: "Sending...",
    pedir: "Book my assessment",
  },
};

const CAMPO = "rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50";

/** Solicitud del diagnóstico gratuito: va a la misma tabla `reservas`, con un tema propio que nunca se cobra. */
export function Diagnostico() {
  const { user } = useAuth();
  const ingles = esIngles(useLocation().pathname);
  const t = TEXTOS[ingles ? "en" : "es"];
  const [nivel, setNivel] = useState(t.niveles[0]);
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
      setError(t.faltaFecha);
      return;
    }
    if (fecha < minFecha) {
      setError(t.pocaAnticipacion);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !user) {
      setError(t.sinSesion);
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
      // Las etiquetas quedan en español para el panel de Erik; el idioma avisa en qué dar la sesión.
      comentarios: [
        ...(ingles ? ["Idioma: inglés (llegó por /en)"] : []),
        `Nivel: ${nivel}`,
        `Objetivo: ${objetivo}`,
        `Simulador y avión: ${equipo}`,
        `País / zona horaria: ${pais}`,
      ].join("\n"),
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
      <PageHero eyebrow={t.eyebrow} title={t.titulo} description={t.intro}>
        <Link
          to={ingles ? RUTAS_EN.coaching : ROUTES.asesorias}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-gold-400"
        >
          <ArrowLeft size={15} />
          {t.volver}
        </Link>
      </PageHero>

      <Container className="max-w-2xl py-12 md:py-16">
        {status === "sent" ? (
          <div className="animate-result-in rounded-2xl border border-gold-500/30 bg-gold-500/[0.06] p-6">
            <p className="font-display text-base font-semibold text-white">{t.enviada}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{t.confirmo(user?.email)}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              {t.nivel}
              <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={CAMPO}>
                {t.niveles.map((n) => (
                  <option key={n} value={n} style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              {t.objetivo}
              <textarea
                required
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={3}
                placeholder={t.objetivoEj}
                className={CAMPO}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              {t.equipo}
              <input required value={equipo} onChange={(e) => setEquipo(e.target.value)} placeholder={t.equipoEj} className={CAMPO} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              {t.pais}
              <input required value={pais} onChange={(e) => setPais(e.target.value)} placeholder={t.paisEj} className={CAMPO} />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                {t.fecha}
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
                {t.horario}
                <select value={horario} onChange={(e) => setHorario(e.target.value)} disabled={!fecha} className={`${CAMPO} disabled:cursor-not-allowed disabled:opacity-50`}>
                  <option value="" style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                    {fecha ? t.eligeHorario : t.eligeFecha}
                  </option>
                  {slots.map((s) => (
                    <option key={s.value} value={s.value} style={{ backgroundColor: "#0b1d34", color: "#fff" }}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="-mt-2 text-xs text-white/40">{t.nota}</p>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={status === "sending"}>
              <CalendarClock size={16} /> {status === "sending" ? t.enviando : t.pedir}
            </Button>
          </form>
        )}
      </Container>
    </div>
  );
}
