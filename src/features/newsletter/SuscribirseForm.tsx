import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { ROUTES } from "../../lib/routes";

const DUPLICADO = "23505"; // ya estaba suscrito: para quien se suscribe es lo mismo que éxito

export function SuscribirseForm({ origen, titulo }: { origen: string; titulo?: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const { error } = await supabase.from("suscriptores").insert({ email: email.trim().toLowerCase(), origen });
    setEstado(!error || error.code === DUPLICADO ? "listo" : "error");
  }

  if (estado === "listo") {
    return (
      <p className="flex items-center gap-2 text-sm text-gold-400">
        <Check size={16} /> ¡Listo! Te avisaremos de clases, eventos y guías nuevas.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="max-w-sm">
      {titulo && <p className="mb-2 text-sm font-medium text-white/80">{titulo}</p>}
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          aria-label="Correo electrónico"
          className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/35 focus:border-gold-500/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          <Send size={14} /> Suscribirme
        </button>
      </div>
      {estado === "error" && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          No pudimos guardar tu correo. Inténtalo de nuevo en un momento.
        </p>
      )}
      <p className="mt-2 text-xs text-white/40">
        Solo avisos de clases, eventos y guías. Sin spam; puedes pedir que te quitemos cuando quieras.{" "}
        <Link to={`${ROUTES.legal}#privacidad`} className="underline hover:text-gold-400">
          Privacidad
        </Link>
      </p>
    </form>
  );
}
