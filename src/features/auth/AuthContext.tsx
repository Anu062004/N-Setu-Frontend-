import { createContext, useContext, useMemo, useState } from "react";
import { clearSession, readSession, writeSession, type StoredSession } from "../../lib/session";

export type AuthRole = "CITIZEN" | "PROVIDER" | "OPERATOR" | "INSTITUTION";

export interface AuthSession extends StoredSession {}

interface AuthContextValue {
  session: AuthSession | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: (s) => {
        writeSession(s);
        setSession(s);
      },
      signOut: () => {
        clearSession();
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
