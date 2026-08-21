import type { AuthRole } from "../features/auth/AuthContext";

export interface StoredSession {
  userId: string;
  phone: string;
  role: AuthRole;
  token: string;
  providerId?: string;
  /** ISO timestamp after which the session is invalid. */
  expiresAt?: string;
}

const STORAGE_KEY = "nayasetu.auth";

export function isSessionExpired(session: StoredSession | null): boolean {
  if (!session?.expiresAt) return false;
  const t = Date.parse(session.expiresAt);
  return Number.isFinite(t) && t <= Date.now();
}

export function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed || typeof parsed.token !== "string" || !parsed.token) return null;
    if (isSessionExpired(parsed)) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession): void {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export function updateSession(patch: Partial<StoredSession>): StoredSession | null {
  const current = readSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  writeSession(next);
  return next;
}
