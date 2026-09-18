import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import { Send, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import { fetchMisReservasPorTema, type Reserva } from "../admin/reservas";

interface ProyectoFinalProps {
  moduloTitulo: string;
  prompt: string;
  onComplete: () => void;
}

export function ProyectoFinal({ moduloTitulo, prompt, onComplete }: ProyectoFinalProps) {
  const { user } = useAuth();
  const tema = `Proyecto final — ${moduloTitulo}`;
  const [respuesta, setRespuesta] = useState("");
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ultimaEntrega, setUltimaEntrega] = useState<Reserva | null | undefined>(undefined);

  const completo = respuesta.trim().length > 0;
  const [pegoBloqueado, setPegoBloqueado] = useState(false);
  const inicioEscrituraRef = useRef<number | null>(null);

  function handleRespuestaChange(valor: string) {
    if (inicioEscrituraRef.current === null && valor.trim().length > 0) {
      inicioEscrituraRef.current = Date.now();
    }
    setRespuesta(valor);
  }

  function bloquearPegado(e: ClipboardEvent<HTMLTextAreaElement> | DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    setPegoBloqueado(true);
    setTimeout(() => setPegoBloqueado(false), 3000);
  }

  useEffect(() => {
    fetchMisReservasPorTema(tema).then((entregas) => setUltimaEntrega(entregas[0] ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema]);

  useEffect(() => {
    if (ultimaEntrega?.estado === "confirmada") onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ultimaEntrega?.estado]);

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
    const tiempoEscrituraSegundos = inicioEscrituraRef.current
      ? Math.round((Date.now() - inicioEscrituraRef.current) / 1000)
      : null;

    const { error: insertError } = await supabase.from("reservas").insert({
      user_id: userId,
      email: user.email,
      tipo: "revision",
      tema,
      comentarios,
      tiempo_escritura_segundos: tiempoEscrituraSegundos,
    });

    if (insertError) {
      setError(insertError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    setUltimaEntrega({
      id: "local",
      user_id: userId,
      email: user.email,
      tipo: "revision",
      tema,
      fecha_preferida: null,
      horario_preferido: null,
      comentarios,
      estado: "pendiente",
      motivo_revision: null,
      tiempo_escritura_segundos: tiempoEscrituraSegundos,
      created_at: new Date().toISOString(),
    });
  }

  if (ultimaEntrega === undefined) return null;

  if (status === "sent" || ultimaEntrega?.estado === "pendiente") {
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

  if (ultimaEntrega?.estado === "confirmada") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-6 py-14 text-center">
        <CheckCircle2 size={28} className="text-gold-400" />
        <p className="max-w-md text-sm text-white/75">Tu proyecto final de {moduloTitulo} fue aprobado.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {ultimaEntrega?.estado === "rechazada" && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-white">Tu proyecto necesita correcciones</p>
            {ultimaEntrega.motivo_revision && (
              <p className="mt-1 text-sm text-white/70">{ultimaEntrega.motivo_revision}</p>
            )}
            <p className="mt-2 text-xs text-white/50">Corrige lo indicado y vuelve a enviarlo abajo.</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-5">
        <p className="text-sm leading-relaxed text-white/75">{prompt}</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Tu respuesta <span className="text-white/40">(escríbela con tus propias palabras — no se puede pegar texto)</span>
        <textarea
          value={respuesta}
          onChange={(e) => handleRespuestaChange(e.target.value)}
          onPaste={bloquearPegado}
          onDrop={bloquearPegado}
          placeholder="Desarrolla aquí lo que te pide el enunciado de arriba..."
          rows={8}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
        {pegoBloqueado && (
          <span className="text-xs text-red-400">
            No se puede pegar texto aquí — escribe tu respuesta directamente.
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Notas adicionales <span className="text-white/40">(opcional, tampoco se puede pegar texto)</span>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onPaste={bloquearPegado}
          onDrop={bloquearPegado}
          placeholder="Dudas, supuestos que hiciste, o cualquier contexto extra para quien lo revise..."
          rows={3}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
        {pegoBloqueado && (
          <span className="text-xs text-red-400">
            No se puede pegar texto aquí — escribe tu respuesta directamente.
          </span>
        )}
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
