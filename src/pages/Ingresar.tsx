import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, PlaneTakeoff } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.75l4-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function Ingresar() {
  const { sendMagicLink, loginWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = `${window.location.origin}${params.get("from") || ROUTES.miFormacion}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const { error: sendError } = await sendMagicLink(email, redirectTo);
    if (sendError) {
      setError(sendError);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error: googleError } = await loginWithGoogle(redirectTo);
    if (googleError) setError(googleError);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-radar bg-grid">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gold-500/[0.06] blur-[100px]" />
      <Container className="relative z-10 py-16">
        <Reveal className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-navy-900/60 p-8 backdrop-blur-lg md:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-400">
            <PlaneTakeoff size={20} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-white">Acceso de cadete</h1>
          <p className="mt-2 text-sm text-white/55">
            Crea tu cuenta o inicia sesión con tu correo para acceder a la Academia y tu cabina de entrenamiento.
          </p>

          {status === "sent" ? (
            <div className="mt-8 rounded-xl border border-gold-500/30 bg-gold-500/10 p-5 text-sm text-white/80">
              Te enviamos un enlace de acceso a <span className="text-gold-400">{email}</span>. Ábrelo desde este
              mismo dispositivo para entrar — puedes cerrar esta pestaña.
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-navy-950 transition-all duration-200 hover:bg-white/90 active:scale-[0.97]"
              >
                <GoogleIcon /> Continuar con Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-white/35">
                <div className="h-px flex-1 bg-white/10" />
                o con tu correo
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-white/70">
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
                  />
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button type="submit" variant="primary" className="mt-2 w-full" disabled={status === "sending"}>
                  <Mail size={16} /> {status === "sending" ? "Enviando..." : "Enviar enlace de acceso"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-white/35">
            Sin contraseñas — te enviamos un enlace de un solo uso a tu correo para entrar de forma segura.
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
