import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { usePremiumAccess } from "./usePremiumAccess";
import { ROUTES } from "../../lib/routes";

/** Igual que ProtectedRoute, pero además exige haber desbloqueado Contenido Exclusivo. */
export function PremiumRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const location = useLocation();

  if (authLoading || accessLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.ingresar}?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!hasAccess) {
    return <Navigate to={ROUTES.contenidoExclusivo} replace />;
  }

  return <>{children}</>;
}
