import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, PlaneTakeoff } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/AuthContext";
import { Reveal } from "../components/ui/Reveal";
import { ROUTES } from "../lib/routes";

export function Ingresar() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login(email || "cadete@villanuevaaviation.com", password);
    navigate(params.get("from") || ROUTES.miFormacion, { replace: true });
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
            Ingresa a tu cabina de entrenamiento personal para continuar tu formación.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
            <label className="flex flex-col gap-1.5 text-sm text-white/70">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
              />
            </label>

            <Button type="submit" variant="primary" className="mt-2 w-full">
              <LogIn size={16} /> Ingresar
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/35">
            Versión de demostración — cualquier correo y contraseña te dará acceso a la vista de cadete.
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
