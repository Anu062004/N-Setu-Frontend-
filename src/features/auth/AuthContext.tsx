import { createContext, useContext, useMemo, useState } from "react";

export type AuthRole = "CITIZEN" | "PROVIDER" | "OPERATOR" | "INSTITUTION";

export interface AuthSession {
  userId: string;
  phone: string;
  role: AuthRole;
  token: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
}

const STORAGE_KEY = "nayasetu.auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: (s) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        setSession(s);
      },
      signOut: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}