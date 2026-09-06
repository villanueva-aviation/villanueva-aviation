import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";

export function usePremiumAccess() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    let cancelado = false;
    setLoading(true);

    supabase
      .from("cadete_acceso")
      .select("tiene_acceso")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelado) return;
        setHasAccess(Boolean(data?.tiene_acceso));
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [authLoading, isAuthenticated, user]);

  return { hasAccess, loading: authLoading || loading };
}
