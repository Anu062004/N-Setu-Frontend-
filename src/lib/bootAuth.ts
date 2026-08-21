import { clearSession, readSession, writeSession, type StoredSession } from "./session";

/**
 * Consumes the OAuth return fragment on app boot, before the router renders.
 *
 * The backend finishes the Google round-trip by redirecting to:
 *   {FRONTEND}#sessionToken=<token>&expiresAt=<ISO>&userId=<uuid>
 *     &accountStatus=ACTIVE|PENDING_PROFILE&profileCompleted=true|false[&accountCreated=true]
 * A failed login may instead carry an error marker (e.g. #error=...) or no token.
 */
export type BootAuthResult =
  | { kind: "none" }
  | { kind: "authenticated"; accountCreated: boolean; profileCompleted: boolean }
  | { kind: "failed"; reason: "expired" | "missing_token" };

const OAUTH_KEYS = [
  "sessionToken",
  "expiresAt",
  "userId",
  "accountCreated",
  "accountStatus",
  "profileCompleted",
  "error",
  "error_description",
];

export function consumeAuthHash(): BootAuthResult {
  if (!window.location.hash || window.location.hash.length < 2) return { kind: "none" };

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const isOAuthReturn = OAUTH_KEYS.some((k) => params.has(k));
  if (!isOAuthReturn) return { kind: "none" };

  // Strip the fragment immediately — the token must not linger in URL or history.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  const token = params.get("sessionToken");
  const userId = params.get("userId") ?? "";
  const expiresAt = params.get("expiresAt") ?? undefined;
  const accountCreated = params.get("accountCreated") === "true";
  const profileCompleted = params.get("profileCompleted") !== "false";

  if (!token) {
    clearSession();
    return { kind: "failed", reason: "missing_token" };
  }

  if (expiresAt) {
    const t = Date.parse(expiresAt);
    if (!Number.isFinite(t) || t <= Date.now()) {
      clearSession();
      return { kind: "failed", reason: "expired" };
    }
  }

  const existing = readSession();
  const session: StoredSession = {
    userId,
    phone: existing?.phone ?? "",
    role: existing?.role ?? "CITIZEN",
    providerId: existing?.providerId,
    token,
    expiresAt,
    profileCompleted,
  };
  writeSession(session);
  return { kind: "authenticated", accountCreated, profileCompleted };
}
