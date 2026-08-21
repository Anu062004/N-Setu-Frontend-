import type { AuthRole } from "../features/auth/AuthContext";

export interface StoredSession {
  userId: string;
  phone: string;
  role: AuthRole;
  token: string;
  providerId?: string;
}

const STORAGE_KEY = "nayasetu.auth";

export function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed && typeof parsed.token === "string" && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function updateSession(patch: Partial<StoredSession>): StoredSession | null {
  const current = readSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  writeSession(next);
  return next;
}
