import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AuthRole } from "./AuthContext";
import { isSessionExpired } from "../../lib/session";
import { translate } from "../../lib/i18n";

const ROLE_LABELS: Record<AuthRole, string> = {
  CITIZEN: "citizen",
  PROVIDER: "legal professional",
  OPERATOR: "assisted-mode operator",
  INSTITUTION: "institutional consumer",
};

export function RequireRole({ role, children }: { role: AuthRole; children: ReactNode }) {
  const { session, signOut } = useAuth();
  const location = useLocation();

  // A session that has passed its expiry is treated as signed out.
  useEffect(() => {
    if (session && isSessionExpired(session)) signOut();
  }, [session, signOut]);

  if (!session || isSessionExpired(session)) {
    return <Navigate to={`/auth?role=${role}&next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Unactivated account: nothing behind the guard is reachable until onboarding completes.
  if (session.profileCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (session.role !== role) {
    return (
      <Navigate
        to={`/auth?role=${role}&next=${encodeURIComponent(location.pathname)}&message=signed-in-as-${session.role}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function roleLabel(role: AuthRole): string {
  return translate(ROLE_LABELS[role]);
}
