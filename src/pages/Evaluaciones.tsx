import { useState, type FormEvent } from "react";
import { CircleCheck, CircleX, Clock, Plus } from "lucide-react";
import { CadetTabs } from "../components/layout/CadetTabs";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  EVALUACIONES_PRACTICAS_INICIALES,
  EXAMENES_TEORICOS,
  type EvaluacionPractica,
  type EvaluacionPracticaEstado,
} from "../data/evaluaciones";
import { readStorage, writeStorage } from "../lib/storage";
import { useProgress } from "../features/progress/ProgressContext";
import { Reveal } from "../components/ui/Reveal";

const ESTADO_TONE: Record<EvaluacionPracticaEstado, "gold" | "green" | "neutral"> = {
  Solicitada: "neutral",
  "En revisión": "gold",
  Programada: "gold",
  Completada: "green",
};

const PIPELINE: EvaluacionPracticaEstado[] = ["Solicitada", "En revisión", "Programada", "Completada"];
const STORAGE_KEY = "evaluaciones-practicas";

function ExamenTeoricoIcon({ estado }: { estado: string }) {
  if (estado === "aprobado") return <CircleCheck size={16} className="text-emerald-400" />;
  if (estado === "reprobado") return <CircleX size={16} className="text-red-400" />;
  return <Clock size={16} className="text-white/40" />;
}

export function Evaluaciones() {
  const { examenResultado } = useProgress();
  const [tab, setTab] = useState<"teoricas" | "practicas">("teoricas");
  const [practicas, setPracticas] = useState<EvaluacionPractica[]>(() =>
    readStorage(STORAGE_KEY, EVALUACIONES_PRACTICAS_INICIALES),
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: "", aeronave: "", aeropuerto: "", fechaHorario: "", comentarios: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nueva: EvaluacionPractica = {
      id: `ep-${Date.now()}`,
      tipo: form.tipo || "Evaluación general",
      aeronave: form.aeronave || "Por definir",
      aeropuerto: form.aeropuerto || "Por definir",
      fechaHorario: form.fechaHorario || "Por definir",
      comentarios: form.comentarios,
      estado: "Solicitada",
    };
    const next = [nueva, ...practicas];
    setPracticas(next);
    writeStorage(STORAGE_KEY, next);
    setShowForm(false);
    setForm({ tipo: "", aeronave: "", aeropuerto: "", fechaHorario: "", comentarios: "" });
  }

  return (
    <div>
      <PageHero
        eyebrow="Evaluaciones"
        title="Exámenes y evaluaciones prácticas"
        description="Consulta tus calificaciones teóricas y gestiona tus evaluaciones prácticas en simulador."
      />
      <CadetTabs />

      <Container className="py-14 md:py-20">
        <div className="flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 w-fit">
          {(["teoricas", "practicas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 font-display text-sm font-semibold transition-colors duration-200 ${
                tab === t ? "bg-gold-500 text-navy-950" : "text-white/60 hover:text-white"
              }`}
            >
              {t === "teoricas" ? "Exámenes teóricos" : "Evaluaciones prácticas"}
            </button>
          ))}
        </div>

        {tab === "teoricas" && (
          <div className="mt-8 flex flex-col gap-4">
            {EXAMENES_TEORICOS.map((examBase, i) => {
              const resultado = examenResultado(examBase.id.replace(/^ex-/, ""));
              const ex = resultado
                ? {
                    ...examBase,
                    calificacion: resultado.score,
                    intentos: Math.max(1, examBase.intentos),
                    estado: resultado.passed ? ("aprobado" as const) : ("reprobado" as const),
                    fecha: examBase.fecha ?? new Date().toLocaleDateString("es-ES"),
                  }
                : examBase;
              return (
              <Reveal key={ex.id} delay={i * 80} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ExamenTeoricoIcon estado={ex.estado} />
                    <div>
                      <p className="font-display text-sm font-semibold text-white">{ex.titulo}</p>
                      <p className="text-xs text-white/45">
                        {ex.intentos} intento{ex.intentos === 1 ? "" : "s"} {ex.fecha ? `· ${ex.fecha}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ex.calificacion !== null && (
                      <span className="font-display text-lg font-semibold text-white">{ex.calificacion}%</span>
                    )}
                    <Badge tone={ex.estado === "aprobado" ? "green" : ex.estado === "reprobado" ? "red" : "neutral"}>
                      {ex.estado === "aprobado" ? "Aprobado" : ex.estado === "reprobado" ? "Reprobado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
                {ex.temasRefuerzo.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ex.temasRefuerzo.map((t) => (
                      <span key={t} className="rounded-full border border-white/15 bg-white/[0.02] px-3 py-1 text-xs text-white/60">
                        Reforzar: {t}
                      </span>
                    ))}
                  </div>
                )}
              </Reveal>
              );
            })}
          </div>
        )}

        {tab === "practicas" && (
          <div className="mt-8">
            <div className="flex justify-end">
              <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? "secondary" : "primary"}>
                <Plus size={16} /> Solicitar evaluación
              </Button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-6 sm:grid-cols-2"
              >
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Tipo de evaluación
                  <input
                    required
                    value={form.tipo}
                    onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                    placeholder="Ej. Circuito de tráfico VFR"
                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-gold-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Aeronave
                  <input
                    required
                    value={form.aeronave}
                    onChange={(e) => setForm((f) => ({ ...f, aeronave: e.target.value }))}
                    placeholder="Ej. Cessna 172"
                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-gold-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Aeropuerto
                  <input
                    required
                    value={form.aeropuerto}
                    onChange={(e) => setForm((f) => ({ ...f, aeropuerto: e.target.value }))}
                    placeholder="Ej. MMGL — Guadalajara"
                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-gold-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Fecha y horario
                  <input
                    required
                    value={form.fechaHorario}
                    onChange={(e) => setForm((f) => ({ ...f, fechaHorario: e.target.value }))}
                    placeholder="Ej. 2026-09-10 · 17:00"
                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-gold-500/50"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-white/70 sm:col-span-2">
                  Comentarios
                  <textarea
                    rows={3}
                    value={form.comentarios}
                    onChange={(e) => setForm((f) => ({ ...f, comentarios: e.target.value }))}
                    placeholder="Detalles adicionales para tu instructor"
                    className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-gold-500/50"
                  />
                </label>
                <div className="sm:col-span-2">
                  <Button type="submit">Enviar solicitud</Button>
                </div>
              </form>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {practicas.map((p, i) => (
                <Reveal key={p.id} delay={i * 80} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-semibold text-white">{p.tipo}</p>
                      <p className="text-xs text-white/45">
                        {p.aeronave} · {p.aeropuerto} · {p.fechaHorario}
                      </p>
                    </div>
                    <Badge tone={ESTADO_TONE[p.estado]}>{p.estado}</Badge>
                  </div>
                  {p.comentarios && <p className="mt-3 text-xs text-white/50">{p.comentarios}</p>}
                  <div className="mt-4 flex items-center gap-1.5">
                    {PIPELINE.map((stage, i) => (
                      <div key={stage} className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-10 rounded-full ${
                            PIPELINE.indexOf(p.estado) >= i ? "bg-gold-500" : "bg-white/10"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
