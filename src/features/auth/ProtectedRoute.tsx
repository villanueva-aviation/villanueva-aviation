import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROUTES } from "../../lib/routes";
import { RUTAS_EN, esIngles } from "../../lib/idioma";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    const ingresar = esIngles(location.pathname) ? RUTAS_EN.signIn : ROUTES.ingresar;
    return <Navigate to={`${ingresar}?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
