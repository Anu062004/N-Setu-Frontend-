import type {
  AssistedAuditEvent,
  BookingQuote,
  DirectoryResponse,
  EligibilityDecision,
  Grievance,
  GrievanceInput,
  LedgerSummary,
  MatterMetadata,
  NeedRequest,
  ProviderSummary,
  ProviderProfileInput,
  ProviderVerification,
  PublicStat,
  RedemptionArtefact,
  SlotsResponse,
} from "./types";
import { clearSession, readSession, updateSession } from "./session";

export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ||
  "/api";

/** URL that begins the Google OAuth round-trip (full-page navigation, not fetch). */
export const GOOGLE_START_URL = `${API_BASE}/v1/auth/google/start`;

/**
 * Pre-flight the Google start endpoint without navigating.
 * A 302 arrives as an opaque redirect (status 0); a misconfigured deployment
 * answers 503 CAPABILITY_UNAVAILABLE, which we can read and surface honestly.
 */
export async function checkGoogleLoginAvailable(): Promise<boolean> {
  try {
    const res = await fetch(GOOGLE_START_URL, { redirect: "manual" });
    if (res.type === "opaqueredirect") return true;
    return res.status !== 503;
  } catch {
    // Network-level failure — let the navigation attempt surface the real error.
    return true;
  }
}

/** Fired when the backend rejects the stored token; AuthProvider listens and signs out. */
export const UNAUTHORIZED_EVENT = "nayasetu:unauthorized";

/**
 * Fired on 403 ACCOUNT_PENDING_PROFILE: the session is valid but the account
 * is not activated yet. AuthProvider flips profileCompleted=false and the
 * guards route to onboarding — nothing is cleared.
 */
export const PROFILE_PENDING_EVENT = "nayasetu:profile-pending";

export interface CitizenProfile {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface ProviderServiceInput {
  taxonomyCode: string;
  feeMin: number;
  feeMax: number;
  proBonoAvailable: boolean;
}

/** Error codes the deployment advertises as fail-closed capabilities. */
const UNAVAILABLE_CODES = new Set([
  "CAPABILITY_UNAVAILABLE",
  "AVAILABILITY_POLICY_NOT_CONFIGURED",
  "PAYMENTS_MODE_OFF",
  "PRIVACY_POLICY_NOT_CONFIGURED",
  "CREDENTIAL_SOURCE_OFF",
]);

export class ApiError extends Error {
  status: number;
  code: string;
  requestId: string | null;

  constructor(status: number, code: string, message: string, requestId: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }

  /** True when the failure is an explicitly unavailable capability, not a bug. */
  get unavailable(): boolean {
    return this.status === 503 || UNAVAILABLE_CODES.has(this.code);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  /** Skip the Authorization header (public endpoints). */
  public?: boolean;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (!opts.public) {
    const session = readSession();
    if (session?.token) {
      headers["Authorization"] = `Bearer ${session.token}`;
      headers["x-actor-role"] = session.role ?? "CITIZEN";
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "The platform service could not be reached. Check your connection and try again.");
  }

  if (!res.ok) {
    const raw = (await res.json().catch(() => null)) as
      | { error?: { code?: string; message?: string; requestId?: string }; code?: string; message?: string; statusCode?: number }
      | null;
    const err = raw?.error;
    const status = res.status;
    const code = err?.code ?? raw?.code ?? "REQUEST_FAILED";

    // Expired/invalid token: drop the local session so route guards bounce to login.
    if (status === 401 && code === "UNAUTHENTICATED") {
      clearSession();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    // Valid session, unactivated account: keep everything, let guards reroute to onboarding.
    if (status === 403 && code === "ACCOUNT_PENDING_PROFILE") {
      updateSession({ profileCompleted: false });
      window.dispatchEvent(new CustomEvent(PROFILE_PENDING_EVENT));
    }

    throw new ApiError(
      status,
      code,
      err?.message ?? raw?.message ?? `Request failed (${status})`,
      err?.requestId ?? null,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json().catch(() => undefined)) as T;
}

/* ------------------------------------------------------------------ */
/* Normalisers — the backend owns these shapes; be defensive at the edge */
/* ------------------------------------------------------------------ */

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function normaliseNeed(raw: unknown): NeedRequest & { selfDeclaredSection12: string | null } {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? r.needId ?? r.needRequestId ?? ""),
    taxonomyCode: (r.taxonomyCode ?? r.category ?? "OTHER") as NeedRequest["taxonomyCode"],
    district: String(r.district ?? ""),
    language: String(r.language ?? ""),
    modePref: (r.modePref ?? r.channel ?? "APP") as NeedRequest["modePref"],
    feeCeiling: (r.feeCeiling ?? null) as number | null,
    urgency: (r.urgency ?? "NORMAL") as NeedRequest["urgency"],
    selfDeclaredSection12: (r.selfDeclaredSection12 ?? null) as string | null,
  };
}

function normaliseDecision(raw: unknown): EligibilityDecision | null {
  const r = asRecord(raw);
  if (!r.route && !r.decision) return null;
  const d = asRecord(r.decision);
  const route = (d.route ?? r.route) as EligibilityDecision["route"] | undefined;
  if (!route) return null;
  return {
    route,
    selfDeclared: Boolean(d.selfDeclared ?? r.selfDeclared),
    reason: String(d.reason ?? r.reason ?? ""),
  };
}

function normaliseProvider(raw: unknown): ProviderSummary {
  const r = asRecord(raw);
  return {
    providerId: String(r.providerId ?? r.id ?? ""),
    displayName: String(r.displayName ?? r.name ?? "Verified professional"),
    providerType: (r.providerType ?? "ADVOCATE") as ProviderSummary["providerType"],
    district: String(r.district ?? ""),
    state: String(r.state ?? ""),
    languages: Array.isArray(r.languages) ? (r.languages as string[]) : [],
    serviceModes: Array.isArray(r.serviceModes) ? (r.serviceModes as string[]) : [],
    tier: (r.tier ?? "SELF_DECLARED") as ProviderSummary["tier"],
    tierFresh: r.tierFresh === undefined ? true : Boolean(r.tierFresh),
    feeRange: Array.isArray(r.feeRange) && r.feeRange.length === 2 ? (r.feeRange as [number, number]) : null,
    nextSlot: (r.nextSlot ?? null) as string | null,
  };
}

function normaliseDirectory(raw: unknown, needId: string): DirectoryResponse {
  const r = asRecord(raw);
  const list = Array.isArray(r.providers) ? r.providers : [];
  const providers = list.map(normaliseProvider);
  const f = asRecord(r.filterSummary);
  return {
    requestId: String(r.requestId ?? needId),
    filterSummary: {
      category: (f.category ?? "OTHER") as DirectoryResponse["filterSummary"]["category"],
      district: String(f.district ?? ""),
      language: String(f.language ?? ""),
      feeCeiling: (f.feeCeiling ?? null) as number | null,
      minimumTier: (f.minimumTier ?? null) as DirectoryResponse["filterSummary"]["minimumTier"],
    },
    matchCount: typeof r.matchCount === "number" ? r.matchCount : providers.length,
    providers,
    ordering: "ROTATED",
    seed: String(r.seed ?? needId),
  };
}

function normaliseLedger(raw: unknown): LedgerSummary {
  const r = asRecord(raw);
  const events = Array.isArray(r.events)
    ? (r.events as Record<string, unknown>[]).map((e) => ({
        id: String(e.id ?? ""),
        providerId: String(e.providerId ?? ""),
        eventType: String(e.eventType ?? ""),
        credits: Number(e.credits ?? 0),
        occurredAt: String(e.occurredAt ?? new Date().toISOString()),
        reference: String(e.reference ?? ""),
        hash: String(e.hash ?? ""),
      }))
    : [];
  const total = typeof r.totalCredits === "number" ? r.totalCredits : events.reduce((s, e) => s + e.credits, 0);
  const period =
    typeof r.periodCredits === "number"
      ? r.periodCredits
      : events
          .filter((e) => e.occurredAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .reduce((s, e) => s + e.credits, 0);
  return { totalCredits: total, periodCredits: period, events };
}

function normaliseVerification(raw: unknown, providerId: string): ProviderVerification {
  const r = asRecord(raw);
  const checks = Array.isArray(r.checks) ? (r.checks as ProviderVerification["checks"]) : [];
  return {
    providerId: String(r.providerId ?? providerId),
    tier: (r.tier ?? "SELF_DECLARED") as ProviderVerification["tier"],
    decidedAt: String(r.decidedAt ?? new Date().toISOString()),
    freshnessWindowDays: Number(r.freshnessWindowDays ?? 90),
    checks,
  };
}

function normaliseMatter(raw: unknown, matterId: string): MatterMetadata {
  const r = asRecord(raw);
  const m = asRecord(r.matter);
  const src = Object.keys(m).length > 0 ? m : r;
  return {
    id: String(src.id ?? src.matterId ?? matterId),
    needRequestId: String(src.needRequestId ?? src.needId ?? ""),
    providerId: String(src.providerId ?? ""),
    category: (src.category ?? src.taxonomyCode ?? "OTHER") as MatterMetadata["category"],
    status: (src.status ?? "OPEN") as MatterMetadata["status"],
    fee: (src.fee ?? null) as number | null,
    cnr: (src.cnr ?? null) as string | null,
    openedAt: String(src.openedAt ?? src.createdAt ?? new Date().toISOString()),
    closedAt: (src.closedAt ?? null) as string | null,
    closeReason: (src.closeReason ?? src.close_reason ?? null) as string | null,
  };
}

/* ------------------------------------------------------------------ */
/* API surface — mapped 1:1 onto the deployed backend                  */
/* ------------------------------------------------------------------ */

export const api = {
  /* ---------- health (public) ---------- */
  healthReady: () =>
    request<{ status: string; capabilities: Record<string, string> }>("/health/ready", { public: true }),

  /* ---------- auth ---------- */
  requestOtp: (phone: string) =>
    request<{ sent: boolean }>("/v1/auth/otp/request", { method: "POST", body: { phone }, public: true }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; userId: string; role?: string }>("/v1/auth/otp/verify", {
      method: "POST",
      body: { phone, otp },
      public: true,
    }),

  /* ---------- citizen profile (onboarding gate) ---------- */
  getMyProfile: () =>
    request<unknown>("/v1/me/profile").then((raw) => {
      const r = asRecord(raw);
      const p = asRecord(r.profile);
      return {
        profileCompleted: r.profileCompleted === true,
        profile:
          r.profileCompleted === true && Object.keys(p).length > 0
            ? {
                fullName: String(p.fullName ?? ""),
                addressLine1: String(p.addressLine1 ?? ""),
                addressLine2: p.addressLine2 == null ? undefined : String(p.addressLine2),
                city: String(p.city ?? ""),
                district: String(p.district ?? ""),
                state: String(p.state ?? ""),
                pincode: String(p.pincode ?? ""),
              }
            : undefined,
      };
    }),
  updateMyProfile: (input: CitizenProfile) =>
    request<unknown>("/v1/me/profile", { method: "POST", body: input }).then((raw) => {
      const r = asRecord(raw);
      return { profileCompleted: r.profileCompleted === true };
    }),

  /* ---------- me: identity, roles & provider services ---------- */
  getMe: () =>
    request<unknown>("/v1/me").then((raw) => {
      const r = asRecord(raw);
      const roles = Array.isArray(r.roles) ? (r.roles as string[]) : [];
      return {
        userId: String(r.userId ?? ""),
        accountStatus: r.accountStatus == null ? undefined : String(r.accountStatus),
        profileCompleted: r.profileCompleted === true,
        roles: roles.filter((x): x is "CITIZEN" | "PROVIDER" | "OPERATOR" | "INSTITUTION" | "ADMIN" =>
          ["CITIZEN", "PROVIDER", "OPERATOR", "INSTITUTION", "ADMIN"].includes(x),
        ),
        providerId: r.providerId == null ? undefined : String(r.providerId),
      };
    }),
  addProviderServices: (providerId: string, services: ProviderServiceInput[]) =>
    request<{ added: number }>(`/v1/providers/${providerId}/services`, {
      method: "POST",
      body: { services },
    }),

  /* ---------- delegation (OPERATOR) ---------- */
  openDelegation: (input: { citizenPhone: string; consentRef: string; durationMinutes: number }) =>
    request<{ id: string; citizenUserId?: string; operatorUserId?: string; consentRef?: string; startedAt?: string; endsAt?: string }>(
      "/v1/auth/delegation",
      { method: "POST", body: input },
    ),
  closeDelegation: (delegationId: string) =>
    request<void>(`/v1/auth/delegation/${delegationId}`, { method: "DELETE" }),

  /* ---------- intake & allocation ---------- */
  createNeed: (input: Omit<NeedRequest, "id"> & { selfDeclaredSection12?: string | null }) =>
    request<unknown>("/v1/needs", { method: "POST", body: input }).then((raw) => {
      const r = asRecord(raw);
      const need = normaliseNeed(r.need ?? raw);
      const decision = normaliseDecision(r) ?? normaliseDecision(asRecord(r.eligibility));
      return { need, decision };
    }),
  getReferral: (needId: string) =>
    request<unknown>(`/v1/needs/${needId}/referral`).then((raw) => {
      const r = asRecord(raw);
      return {
        need: normaliseNeed(r.need ?? raw),
        decision: normaliseDecision(r),
      };
    }),
  getDirectory: (needId: string) =>
    request<unknown>(`/v1/needs/${needId}/directory`).then((raw) => normaliseDirectory(raw, needId)),
  selectProvider: (needId: string, providerId: string) =>
    request<unknown>(`/v1/needs/${needId}/select`, { method: "POST", body: { providerId } }),
  rotateAllocation: (needId: string) =>
    request<unknown>(`/v1/needs/${needId}/rotate`, { method: "POST" }).then((raw) => {
      const r = asRecord(raw);
      const p = asRecord(r.provider ?? r.allocation);
      return {
        allocationId: String(r.allocationId ?? r.id ?? ""),
        provider: normaliseProvider(Object.keys(p).length > 0 ? p : raw),
        mode: "ROTATION" as const,
        assignedAt: String(r.assignedAt ?? r.createdAt ?? new Date().toISOString()),
      };
    }),

  /* ---------- scheduling ---------- */
  getSlots: (providerId: string) =>
    request<unknown>(`/v1/providers/${providerId}/slots`).then((raw): SlotsResponse => {
      const r = asRecord(raw);
      const slots = Array.isArray(r.slots) ? (r.slots as SlotsResponse["slots"]) : [];
      return {
        availabilityPolicy: String(r.availabilityPolicy ?? (slots.length > 0 ? "CONFIGURED" : "NOT_CONFIGURED")),
        slots,
      };
    }),
  createBooking: (input: { providerId: string; slotId?: string; needId?: string }) =>
    request<BookingQuote>("/v1/bookings", { method: "POST", body: input }),
  acceptBooking: (bookingId: string) =>
    request<unknown>(`/v1/bookings/${bookingId}/accept`, { method: "POST" }),
  declineBooking: (bookingId: string) =>
    request<unknown>(`/v1/bookings/${bookingId}/decline`, { method: "POST" }),
  cancelBooking: (bookingId: string) =>
    request<unknown>(`/v1/bookings/${bookingId}/cancel`, { method: "POST" }),

  /* ---------- matters ---------- */
  getMatterStatus: (matterId: string) =>
    request<unknown>(`/v1/matters/${matterId}/status`).then((raw) => normaliseMatter(raw, matterId)),
  closeMatter: (matterId: string, reason?: string) =>
    request<unknown>(`/v1/matters/${matterId}/close`, { method: "POST", body: reason ? { reason } : {} })
      .then((raw) => normaliseMatter(raw, matterId)),

  /* ---------- identity & providers ---------- */

  /**
   * Self-service provider join for a signed-in CITIZEN: creates the provider
   * profile, grants PROVIDER, seeds services — one atomic call (POST /v1/me/provider).
   */
  becomeProvider: (input: {
    providerType: string;
    displayName: string;
    district: string;
    state: string;
    languages: string[];
    serviceModes: string[];
    services: { taxonomyCode: string; feeMin: number; feeMax: number; proBonoAvailable: boolean }[];
  }) =>
    request<unknown>("/v1/me/provider", { method: "POST", body: input }).then((raw) => {
      const r = asRecord(raw);
      return {
        providerId: String(r.providerId ?? r.id ?? ""),
        tier: (r.tier ?? "SELF_DECLARED") as "SELF_DECLARED",
      };
    }),
  revokeSession: () => request<{ revoked: boolean }>("/v1/auth/session", { method: "DELETE" }),
  createProvider: (input: ProviderProfileInput) =>
    request<unknown>("/v1/providers", { method: "POST", body: input }).then((raw) => {
      const r = asRecord(raw);
      return {
        providerId: String(r.providerId ?? r.id ?? ""),
        tier: (r.tier ?? "SELF_DECLARED") as "SELF_DECLARED",
      };
    }),
  submitCredentialIssuerFetch: (providerId: string, leg: string) =>
    request<unknown>(`/v1/providers/${providerId}/credentials/issuer-fetch`, {
      method: "POST",
      body: { leg },
    }),
  submitCredentialUpload: (providerId: string, leg: string) =>
    request<unknown>(`/v1/providers/${providerId}/credentials/upload`, {
      method: "POST",
      body: { leg },
    }),
  getVerification: (providerId: string) =>
    request<unknown>(`/v1/providers/${providerId}/verification`).then((raw) =>
      normaliseVerification(raw, providerId),
    ),

  /* ---------- ledger, settlement & me ---------- */
  getCredits: () => request<unknown>("/v1/me/credits").then(normaliseLedger),
  redeem: (type: string) =>
    request<unknown>("/v1/me/redemptions", { method: "POST", body: { type } }).then(
      (raw): RedemptionArtefact => {
        const r = asRecord(raw);
        return {
          redemptionId: String(r.redemptionId ?? r.id ?? ""),
          type: String(r.type ?? type),
          generatedAt: String(r.generatedAt ?? r.createdAt ?? new Date().toISOString()),
          note: String(r.note ?? "Evidence artefact — not an official institutional decision."),
        };
      },
    ),
  getServiceRecord: () =>
    request<unknown>("/v1/me/service-record").then((raw): RedemptionArtefact => {
      const r = asRecord(raw);
      return {
        redemptionId: String(r.redemptionId ?? r.id ?? "service-record"),
        type: "SERVICE_RECORD_EXPORT",
        generatedAt: String(r.generatedAt ?? new Date().toISOString()),
        note: String(r.note ?? "Signed export of your verified service events."),
      };
    }),
  getPanelEvidence: () =>
    request<unknown>("/v1/me/panel-evidence").then((raw): RedemptionArtefact => {
      const r = asRecord(raw);
      return {
        redemptionId: String(r.redemptionId ?? r.id ?? "panel-evidence"),
        type: "PANEL_APPLICATION_EVIDENCE_PACKET",
        generatedAt: String(r.generatedAt ?? new Date().toISOString()),
        note: String(r.note ?? "Evidence packet for a DLSA / High Court panel application."),
      };
    }),

  /* ---------- payments (fail-closed in this deployment) ---------- */
  createQuote: (input: { providerId: string; needId?: string }) =>
    request<BookingQuote>("/v1/payments/quotes", { method: "POST", body: input }),
  createPaymentIntent: (paymentId: string) =>
    request<unknown>("/v1/payments/intents", { method: "POST", body: { paymentId } }),
  getPayment: (paymentId: string) => request<BookingQuote>(`/v1/payments/${paymentId}`),
  offlineAck: (paymentId: string) =>
    request<unknown>(`/v1/payments/${paymentId}/offline-ack`, { method: "POST" }),

  /* ---------- grievances & institutional ---------- */
  fileGrievance: (input: GrievanceInput) =>
    request<Grievance>("/v1/grievances", { method: "POST", body: input }),
  getInstitutionalProviderRecord: (providerId: string) =>
    request<unknown>(`/v1/institutional/providers/${providerId}/record`),
  getInstitutionalRoster: (rosterId: string) =>
    request<unknown>(`/v1/institutional/rosters/${rosterId}`),
  getPublicStats: () => request<PublicStat[]>("/v1/public/stats", { public: true }),

  /* ---------- assisted audit (not exposed by this deployment) ---------- */
  getAssistedAudit: (_sessionId?: string): Promise<AssistedAuditEvent[]> =>
    Promise.reject(
      new ApiError(503, "CAPABILITY_UNAVAILABLE", "The audit log surface is not exposed by this deployment."),
    ),

  /* ---------- session helpers ---------- */
  forgetSession: clearSession,
  rememberProviderId: (providerId: string) => updateSession({ providerId }),
};
