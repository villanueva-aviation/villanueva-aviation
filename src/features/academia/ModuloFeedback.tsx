import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../auth/AuthContext";
import { enviarCalificacionModulo, fetchMiCalificacionModulo } from "../feedback/moduloFeedback";

export function ModuloFeedback({ slug, moduloTitulo }: { slug: string; moduloTitulo: string }) {
  const { user } = useAuth();
  const [yaCalificado, setYaCalificado] = useState<boolean | null>(null);
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (!user) return;
    fetchMiCalificacionModulo(user.id, slug).then((existe) => setYaCalificado(!!existe));
  }, [user, slug]);

  if (!user || yaCalificado === null || yaCalificado || status === "sent") {
    return status === "sent" ? (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
        <p className="text-sm text-gold-400">¡Gracias por calificar {moduloTitulo}!</p>
      </div>
    ) : null;
  }

  async function handleEnviar() {
    if (!calificacion || !user) return;
    setStatus("sending");
    await enviarCalificacionModulo({ userId: user.id, email: user.email, moduloSlug: slug, calificacion, comentario });
    setStatus("sent");
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm font-medium text-white">¿Qué te pareció {moduloTitulo}?</p>
      <div className="mt-3 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCalificacion(n)}
            aria-label={`${n} estrellas`}
            className="p-0.5"
          >
            <Star
              size={22}
              className={
                calificacion !== null && n <= calificacion
                  ? "fill-gold-400 text-gold-400"
                  : "text-white/25 transition-colors hover:text-gold-400/60"
              }
            />
          </button>
        ))}
      </div>
      {calificacion !== null && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario opcional..."
            className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50"
          />
          <Button variant="secondary" onClick={handleEnviar} disabled={status === "sending"} className="shrink-0">
            {status === "sending" ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      )}
    </div>
  );
}
