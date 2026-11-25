import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";
import { olvidarOrigen, origenGuardado, recordarOrigen, refParaCuenta } from "../../lib/origen";

interface CadetUser {
  id: string;
  nombre: string;
  email: string;
}

interface AuthContextValue {
  user: CadetUser | null;
  isAuthenticated: boolean;
  /** Verdadero mientras se confirma la sesión inicial (evita redirigir a /ingresar antes de tiempo). */
  loading: boolean;
  sendMagicLink: (email: string, redirectTo: string) => Promise<{ error: string | null }>;
  /** El código del mismo correo del enlace: para la ventana del instructor, donde el enlace abriría otro navegador. */
  verifyEmailCode: (email: string, code: string) => Promise<{ error: string | null }>;
  loginWithGoogle: (redirectTo: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Pega a la cuenta recién creada el `?ref=` con el que llegó la persona (solo una vez). */
let marcando = false;
function marcarOrigen(session: Session | null) {
  const ref = session && refParaCuenta(origenGuardado(), session.user.created_at, session.user.user_metadata?.ref, Date.now());
  if (!ref || marcando) return;
  marcando = true;
  // Fuera del callback de onAuthStateChange: llamar a supabase ahí dentro puede trabar la sesión.
  setTimeout(() => {
    supabase.auth.updateUser({ data: { ref } }).then(({ error }) => {
      if (!error) olvidarOrigen();
      marcando = false;
    });
  }, 0);
}

function toCadetUser(session: Session | null): CadetUser | null {
  const email = session?.user?.email;
  if (!email || !session?.user?.id) return null;
  const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
  const nombre = fullName || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
  return { id: session.user.id, nombre, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recordarOrigen(window.location.search);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      marcarOrigen(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      marcarOrigen(nextSession);
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
      verifyEmailCode: async (email: string, code: string) => {
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
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
