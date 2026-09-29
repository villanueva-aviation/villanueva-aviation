import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, CheckCircle2, Plane, XCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EVALUACION_PRACTICA } from "../../data/examenesTipo";
import { fechaMinima, horariosDisponibles } from "../../lib/agendaSlots";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import { fetchMisReservasPorTema, temaInsigniaPractica, type Reserva } from "../admin/reservas";

const campo =
  "rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50 disabled:cursor-not-allowed disabled:opacity-50";
const opcion = { backgroundColor: "#0b1d34", color: "#fff" };

/**
 * Nivel Plata: el cadete pide su vuelo práctico y el fundador lo evalúa desde su panel de Agenda.
 * Estados de la solicitud: pendiente → confirmada (vuelo agendado) → completada (aprobado) o rechazada (con motivo).
 */
export function VueloPractico({ modelo, corto, teoricoAprobado }: { modelo: string; corto: string; teoricoAprobado: boolean }) {
  const { user } = useAuth();
  const tema = temaInsigniaPractica(modelo);
  const [solicitudes, setSolicitudes] = useState<Reserva[] | null>(null);
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMisReservasPorTema(tema).then(setSolicitudes);
  }, [tema]);

  async function solicitar(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setEnviando(true);
    setError(null);
    const { error: insertError } = await supabase.from("reservas").insert({
      user_id: user.id,
      email: user.email,
      tipo: "examen",
      tema,
      fecha_preferida: fecha,
      horario_preferido: horario,
      comentarios: comentarios.trim() || null,
    });
    setEnviando(false);
    if (insertError) return setError(insertError.message);
    setSolicitudes(await fetchMisReservasPorTema(tema));
  }

  if (solicitudes === null) return null;
  const aprobada = solicitudes.some((s) => s.estado === "completada");
  const ultima = solicitudes[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="font-display text-lg font-semibold text-white">Nivel Plata: vuelo práctico</h2>
      <p className="mt-2 text-sm text-white/60">
        Un vuelo en el simulador con el {corto}, evaluado en vivo por el fundador. Es gratis. Esto es lo que se evalúa:
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-white/70">
        {EVALUACION_PRACTICA.map((p) => (
          <li key={p} className="flex gap-3">
            <Plane size={14} className="mt-1 shrink-0 text-gold-400" />
            {p}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-white/10 pt-6">
        {aprobada ? (
          <p className="flex items-center gap-2 text-sm text-white/80">
            <CheckCircle2 size={18} className="text-slate-200" /> Aprobaste tu vuelo práctico: tienes la Plata.
          </p>
        ) : !teoricoAprobado ? (
          <p className="text-sm text-white/55">Primero aprueba el examen teórico (nivel Bronce); después podrás solicitar tu vuelo.</p>
        ) : ultima?.estado === "pendiente" ? (
          <p className="flex items-start gap-2 text-sm text-white/75">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-gold-400" />
            Solicitud enviada. Te contactaremos para confirmar la fecha y cómo conectarnos.
          </p>
        ) : ultima?.estado === "confirmada" ? (
          <p className="flex items-start gap-2 text-sm text-white/75">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            Tu vuelo está agendado{ultima.fecha_preferida ? ` para el ${ultima.fecha_preferida} a las ${ultima.horario_preferido}` : ""}. Repasa el
            checklist y las emergencias de memoria.
          </p>
        ) : (
          <form onSubmit={solicitar} className="flex flex-col gap-4">
            {ultima?.estado === "rechazada" && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                <div className="text-sm">
                  <p className="font-medium text-white">Esta vez no quedó</p>
                  {ultima.motivo_revision && <p className="mt-1 text-white/70">{ultima.motivo_revision}</p>}
                  <p className="mt-1 text-xs text-white/50">Practica lo indicado y vuelve a solicitarlo cuando estés listo.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                Fecha preferida
                <input
                  type="date"
                  required
                  value={fecha}
                  min={fechaMinima()}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setHorario("");
                  }}
                  className={campo}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                Horario preferido
                <select required value={horario} onChange={(e) => setHorario(e.target.value)} disabled={!fecha} className={campo}>
                  <option value="" style={opcion}>
                    {fecha ? "Elige un horario" : "Elige primero una fecha"}
                  </option>
                  {horariosDisponibles(fecha).map((s) => (
                    <option key={s.value} value={s.value} style={opcion}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="-mt-2 text-xs text-white/40">
              Con al menos 2 días de anticipación. Lunes a viernes 5pm-10pm, sábado y domingo 8am-10pm.
            </p>
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Tu simulador <span className="text-white/40">(opcional: MSFS 2020/2024 o X-Plane, y con qué controles vuelas)</span>
              <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} rows={2} className={campo} />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <Button type="submit" disabled={enviando}>
                <CalendarClock size={16} /> {enviando ? "Enviando..." : "Solicitar mi vuelo práctico"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
