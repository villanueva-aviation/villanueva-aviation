import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROUTES } from "../../lib/routes";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.ingresar}?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}
