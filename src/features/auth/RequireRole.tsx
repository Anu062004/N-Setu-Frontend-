import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AuthRole } from "./AuthContext";

const ROLE_LABELS: Record<AuthRole, string> = {
  CITIZEN: "citizen",
  PROVIDER: "legal professional",
  OPERATOR: "assisted-mode operator",
  INSTITUTION: "institutional consumer",
};

export function RequireRole({ role, children }: { role: AuthRole; children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to={`/auth?role=${role}&next=${encodeURIComponent(location.pathname)}`} replace />;
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
  return ROLE_LABELS[role];
}