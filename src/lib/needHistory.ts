import type { Route, TaxCategory } from "./types";

/**
 * The backend has no citizen needs-list endpoint yet, so raised needs are
 * remembered locally. Key is namespaced; entries are capped and never carry
 * more than the routing facts needed to re-enter a surface.
 */
const KEY = "nayasetu.needs";
const CAP = 50;

export interface NeedHistoryEntry {
  needId: string;
  route: Route | null;
  taxonomyCode: TaxCategory;
  district: string;
  createdAt: string;
}

export function rememberNeed(entry: Omit<NeedHistoryEntry, "createdAt">): void {
  try {
    const list = listNeeds().filter((e) => e.needId !== entry.needId);
    const next = [{ ...entry, createdAt: new Date().toISOString() }, ...list].slice(0, CAP);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — history is a convenience, not a record */
  }
}

export function listNeeds(): NeedHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NeedHistoryEntry[];
    return Array.isArray(parsed)
      ? parsed.filter((e) => e && typeof e.needId === "string" && e.needId)
      : [];
  } catch {
    return [];
  }
}
