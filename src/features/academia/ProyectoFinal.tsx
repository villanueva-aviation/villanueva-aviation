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

export function ProyectoFinal({ moduloTitulo, prompt, onComplete }: ProyectoFinalProps) {
  const { user } = useAuth();
  const [respuesta, setRespuesta] = useState("");
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const completo = respuesta.trim().length > 0;

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

    const comentarios = notas.trim() ? `${respuesta}\n\nNotas adicionales:\n${notas}` : respuesta;

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
      <div className="animate-result-in flex flex-col items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-6 py-14 text-center">
        <CheckCircle2 size={28} className="text-gold-400" />
        <p className="max-w-md text-sm text-white/75">
          Tu proyecto fue enviado para revisión. El fundador lo revisará personalmente y podrás dar seguimiento desde{" "}
          <span className="text-gold-400">Contenido Exclusivo → Agenda con el fundador</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-5">
        <p className="text-sm leading-relaxed text-white/75">{prompt}</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Tu respuesta
        <textarea
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Desarrolla aquí lo que te pide el enunciado de arriba..."
          rows={8}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Notas adicionales <span className="text-white/40">(opcional)</span>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Dudas, supuestos que hiciste, o cualquier contexto extra para quien lo revise..."
          rows={3}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={!completo || status === "sending"}>
          <Send size={16} /> {status === "sending" ? "Enviando..." : "Enviar a revisión"}
        </Button>
      </div>
    </form>
  );
}
