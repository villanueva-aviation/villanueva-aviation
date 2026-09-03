import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";

interface ProyectoFinalProps {
  moduloTitulo: string;
  prompt: string;
  onComplete: () => void;
}

const CAMPOS = [
  { key: "resumen", label: "Ruta y objetivo", placeholder: "Ej. MMGL → MMZO, vuelo de entrenamiento VFR diurno" },
  { key: "checkpoints", label: "Checkpoints, rumbos y distancias por tramo", placeholder: "Describe cada tramo: checkpoint, rumbo magnético, distancia..." },
  { key: "tiempos", label: "Tiempos y combustible estimados", placeholder: "Tiempo por tramo, tiempo total, combustible requerido + reserva..." },
  { key: "alterno", label: "Alterno y consideraciones adicionales", placeholder: "Aeropuerto alterno elegido y por qué, notas de espacio aéreo, etc." },
] as const;

export function ProyectoFinal({ moduloTitulo, prompt, onComplete }: ProyectoFinalProps) {
  const { user } = useAuth();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const completo = CAMPOS.every((c) => (valores[c.key] ?? "").trim().length > 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !user) {
      setError("Debes iniciar sesión para enviar tu proyecto.");
      setStatus("error");
      return;
    }

    const comentarios = CAMPOS.map((c) => `${c.label}:\n${valores[c.key] ?? ""}`).join("\n\n");

    const { error: insertError } = await supabase.from("reservas").insert({
      user_id: userId,
      email: user.email,
      tipo: "revision",
      tema: `Proyecto final — ${moduloTitulo}`,
      comentarios,
    });

    if (insertError) {
      setError(insertError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    onComplete();
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-6 py-14 text-center">
        <CheckCircle2 size={28} className="text-gold-400" />
        <p className="max-w-md text-sm text-white/75">
          Tu proyecto fue enviado para revisión. Un instructor lo evaluará y podrás dar seguimiento desde{" "}
          <span className="text-gold-400">Contenido Exclusivo → Agenda con instructor</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-5">
        <p className="text-sm leading-relaxed text-white/75">{prompt}</p>
      </div>

      {CAMPOS.map((campo) => (
        <label key={campo.key} className="flex flex-col gap-1.5 text-sm text-white/70">
          {campo.label}
          <textarea
            value={valores[campo.key] ?? ""}
            onChange={(e) => setValores((v) => ({ ...v, [campo.key]: e.target.value }))}
            placeholder={campo.placeholder}
            rows={3}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
          />
        </label>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={!completo || status === "sending"}>
          <Send size={16} /> {status === "sending" ? "Enviando..." : "Enviar a revisión"}
        </Button>
      </div>
    </form>
  );
}
