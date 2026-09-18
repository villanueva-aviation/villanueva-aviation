import { useState, type FormEvent } from "react";
import { Star, Send } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../features/auth/AuthContext";
import { enviarFeedback } from "../features/feedback/feedback";

export function Feedback() {
  const { user } = useAuth();
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [loQueTeGusto, setLoQueTeGusto] = useState("");
  const [queMejorarias, setQueMejorarias] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!queMejorarias.trim()) {
      setError("Cuéntanos qué mejorarías, aunque sea breve.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId || !user) {
      setError("Debes iniciar sesión para enviar tu experiencia.");
      setStatus("error");
      return;
    }

    const { error: insertError } = await enviarFeedback({
      userId,
      email: user.email,
      calificacion,
      loQueTeGusto,
      queMejorarias,
    });

    if (insertError) {
      setError(insertError.message);
      setStatus("error");
      return;
    }

    setStatus("sent");
    setCalificacion(null);
    setLoQueTeGusto("");
    setQueMejorarias("");
  }

  return (
    <div>
      <PageHero
        eyebrow="Tu opinión importa"
        title="Comparte tu experiencia"
        description="Cuéntanos qué te ha gustado y qué mejorarías — tus recomendaciones directamente nos ayudan a decidir qué construir después."
      />

      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          {status === "sent" ? (
            <p className="animate-result-in text-center text-sm text-gold-400">
              ¡Gracias por tu feedback! Lo revisamos personalmente.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 text-sm text-white/70">
                Calificación general (opcional)
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCalificacion(n === calificacion ? null : n)}
                      aria-label={`${n} estrellas`}
                      className="p-0.5"
                    >
                      <Star
                        size={26}
                        className={
                          calificacion !== null && n <= calificacion
                            ? "fill-gold-400 text-gold-400"
                            : "text-white/25 transition-colors hover:text-gold-400/60"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                ¿Qué te ha gustado? (opcional)
                <textarea
                  value={loQueTeGusto}
                  onChange={(e) => setLoQueTeGusto(e.target.value)}
                  rows={3}
                  placeholder="Ej. el checklist interactivo, la bitácora de práctica..."
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-white/70">
                ¿Qué mejorarías?
                <textarea
                  value={queMejorarias}
                  onChange={(e) => setQueMejorarias(e.target.value)}
                  rows={4}
                  placeholder="Todo lo que compartas nos sirve, sin importar qué tan pequeño sea."
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors focus:border-gold-500/50"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" variant="primary" className="mt-2 w-full" disabled={status === "sending"}>
                <Send size={16} /> {status === "sending" ? "Enviando..." : "Enviar mi experiencia"}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}
