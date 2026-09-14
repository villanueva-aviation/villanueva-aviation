import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { CONTACT_EMAIL } from "../../lib/constants";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("Error no capturado en la app:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <AlertTriangle size={40} className="text-gold-400" />
        <h1 className="mt-6 font-display text-2xl font-bold text-white">Algo salió mal</h1>
        <p className="mt-2 max-w-md text-white/60">
          Ocurrió un error inesperado en esta página. Intenta recargar — si sigue pasando, escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-400 hover:text-gold-300">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <Button onClick={() => window.location.reload()} variant="primary" className="mt-8">
          Recargar página
        </Button>
      </div>
    );
  }
}
