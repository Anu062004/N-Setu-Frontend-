import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, readSession, updateSession, writeSession, type StoredSession } from "../../lib/session";
import { api, PROFILE_PENDING_EVENT, UNAUTHORIZED_EVENT } from "../../lib/api";

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

  // The API client clears storage on 401 UNAUTHENTICATED — mirror that in React state.
  useEffect(() => {
    const onUnauthorized = () => setSession(readSession());
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    // 403 ACCOUNT_PENDING_PROFILE: session stays valid; the guards reroute to onboarding.
    const onProfilePending = () => setSession(readSession());
    window.addEventListener(PROFILE_PENDING_EVENT, onProfilePending);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
      window.removeEventListener(PROFILE_PENDING_EVENT, onProfilePending);
    };
  }, []);

  // Session restore: a stored unexpired token is re-verified against
  // GET /v1/me/profile on every boot — profile state may have changed
  // server-side since the fragment was consumed.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    api
      .getMyProfile()
      .then(({ profileCompleted }) => {
        if (cancelled || profileCompleted === session.profileCompleted) return;
        setSession(updateSession({ profileCompleted }));
      })
      .catch(() => {
        /* 401/403 already handled by the API client's global events. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reconcile roles/providerId — the stored session can go stale when roles
  // are granted on another device or providerId is unknown after re-login.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    api
      .getMe()
      .then((me) => {
        if (cancelled) return;
        const nextRole =
          session.role && me.roles.includes(session.role)
            ? session.role
            : me.roles.find((r) => r !== "ADMIN") ?? session.role;
        const patch = {
          role: nextRole,
          providerId: me.providerId,
          profileCompleted: me.profileCompleted,
        };
        const changed =
          patch.role !== session.role ||
          patch.providerId !== session.providerId ||
          patch.profileCompleted !== session.profileCompleted;
        if (changed) setSession(updateSession(patch) ?? session);
      })
      .catch(() => {
        /* 401 handled by UNAUTHORIZED_EVENT; treat other failures as stale-but-usable. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: (s) => {
        writeSession(s);
        setSession(s);
      },
      signOut: () => {
        // Server-side revocation first (best effort) — the DB session row must
        // not outlive the client that abandoned it.
        void api.revokeSession().catch(() => {});
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
