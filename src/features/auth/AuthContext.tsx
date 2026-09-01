import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

interface CadetUser {
  nombre: string;
  email: string;
}

interface AuthContextValue {
  user: CadetUser | null;
  isAuthenticated: boolean;
  /** Verdadero mientras se confirma la sesión inicial (evita redirigir a /ingresar antes de tiempo). */
  loading: boolean;
  sendMagicLink: (email: string, redirectTo: string) => Promise<{ error: string | null }>;
  loginWithGoogle: (redirectTo: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toCadetUser(session: Session | null): CadetUser | null {
  const email = session?.user?.email;
  if (!email) return null;
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name;
  const nombre = fullName || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
  return { nombre, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: toCadetUser(session),
      isAuthenticated: session !== null,
      loading,
      sendMagicLink: async (email: string, redirectTo: string) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        return { error: error?.message ?? null };
      },
      loginWithGoogle: async (redirectTo: string) => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
        return { error: error?.message ?? null };
      },
      logout: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
