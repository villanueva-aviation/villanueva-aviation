import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../lib/routes";

export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <Compass size={40} className="text-gold-400" />
      <h1 className="mt-6 font-display text-3xl font-bold text-white">404</h1>
      <p className="mt-2 text-white/60">Esta ruta se salió del plan de vuelo.</p>
      <Button to={ROUTES.home} variant="primary" className="mt-8">
        Volver al inicio
      </Button>
    </div>
  );
}
