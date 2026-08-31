import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { readStorage, writeStorage } from "../../lib/storage";

interface CadetUser {
  nombre: string;
  email: string;
}

interface AuthContextValue {
  user: CadetUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CadetUser | null>(() => readStorage(STORAGE_KEY, null));

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login: (email: string, _password: string) => {
        const nombre = email.includes("@") ? email.split("@")[0] : email;
        const nextUser: CadetUser = {
          nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
          email,
        };
        writeStorage(STORAGE_KEY, nextUser);
        setUser(nextUser);
      },
      logout: () => {
        writeStorage(STORAGE_KEY, null);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
