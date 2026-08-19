import type {
  AssistedAuditEvent,
  BookingQuote,
  CitizenPortalView,
  DirectoryResponse,
  EligibilityDecision,
  Grievance,
  GrievanceInput,
  LedgerSummary,
  MatterMetadata,
  NeedRequest,
  PaymentState,
  ProviderSummary,
  ProviderAppointment,
  ProviderPaymentStatus,
  ProviderProfileInput,
  ProviderVerification,
  PublicStat,
  Slot,
  VerificationCaseResult,
  CredentialSubmission,
} from "./types";
import { decideRoute, DISTRICT_FLOOR_BY_CATEGORY } from "./eligibility";
import { seededShuffle } from "./format";
import { PROVIDERS, NEED_SEEDS, BOOKINGS, LEDGER, VERIFICATIONS, MATTERS, CURRENT_PROVIDER, APPOINTMENTS, PROVIDER_PAYMENTS } from "./seed";
import { REQUIRED_LEGS, decideTier, sortLegs, submissionToCheck } from "./verification";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const DEMO_MODE = API_BASE === "";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const mock = {
  /* ---------- auth ---------- */
  async requestOtp(_phone: string) {
    await delay(500);
    return { sent: true };
  },
  async verifyOtp(phone: string, otp: string) {
    await delay(600);
    if (otp.length < 4) throw new Error("Invalid OTP");
    return { token: "demo_token", userId: `u_${phone.slice(-4)}` };
  },

  /* ---------- needs ---------- */
  async createNeed(need: NeedRequest) {
    await delay(500);
    return { ...need, id: need.id || `req_${Math.random().toString(36).slice(2, 10)}` };
  },
  async getEligibility(needId: string) {
    const need = NEED_SEEDS.find((n) => n.id === needId) ?? NEED_SEEDS[0];
    const decision = decideRoute({
      selfDeclaredSection12: need.selfDeclaredSection12,
      feeCeiling: need.feeCeiling,
      districtFloor: DISTRICT_FLOOR_BY_CATEGORY[need.taxonomyCode] ?? 3000,
    });
    await delay(450);
    return { need, decision };
  },

  /* ---------- directory (Mode A) ---------- */
  async getDirectory(needId: string): Promise<DirectoryResponse> {
    await delay(500);
    const need = NEED_SEEDS.find((n) => n.id === needId) ?? NEED_SEEDS[0];
    const eligible = PROVIDERS.filter(
      (p) =>
        p.taxonomyCodes.includes(need.taxonomyCode) &&
        p.district === need.district &&
        p.languages.includes(need.language),
    );
    const rotated = seededShuffle(eligible, needId);
    return {
      requestId: needId,
      filterSummary: {
        category: need.taxonomyCode,
        district: need.district,
        language: need.language,
        feeCeiling: need.feeCeiling,
        minimumTier: null,
      },
      matchCount: rotated.length,
      providers: rotated.map(({ taxonomyCodes: _taxonomyCodes, slots, ...p }) => ({
        ...p,
        nextSlot: slots.length > 0 ? slots[0].startsAt : null,
      })),
      ordering: "ROTATED",
      seed: needId,
    };
  },

  async selectProvider(_needId: string, providerId: string) {
    await delay(300);
    return { allocationId: `alloc_${Math.random().toString(36).slice(2, 10)}`, providerId };
  },

  /* ---------- rotation (Mode B) ---------- */
  async rotateAssign(needId: string) {
    await delay(600);
    const need = NEED_SEEDS.find((n) => n.id === needId) ?? NEED_SEEDS[0];
    const roster = PROVIDERS.filter(
      (p) =>
        p.taxonomyCodes.includes(need.taxonomyCode) &&
        p.district === need.district &&
        p.languages.includes(need.language),
    );
    const [next] = seededShuffle(roster, `${needId}:rotation`);
    return {
      allocationId: `alloc_${Math.random().toString(36).slice(2, 10)}`,
      provider: { ...next, nextSlot: next.slots[0]?.startsAt ?? null },
      mode: "ROTATION" as const,
      assignedAt: new Date().toISOString(),
    };
  },

  /* ---------- slots / booking / payments ---------- */
  async getSlots(providerId: string): Promise<Slot[]> {
    await delay(300);
    return PROVIDERS.find((p) => p.providerId === providerId)?.slots ?? [];
  },

  async createQuote(providerId: string, _needId: string): Promise<BookingQuote> {
    await delay(400);
    const p = PROVIDERS.find((p) => p.providerId === providerId);
    const feeRange = p?.feeRange ?? [800, 1500];
    const amount = Math.round(feeRange[0] * 1.08);
    const quote: BookingQuote = {
      bookingId: `bk_${Math.random().toString(36).slice(2, 10)}`,
      providerId,
      amount,
      currency: "INR",
      feeBreakdown: [
        { label: "Professional fee (disclosed before work)", amount: Math.round(feeRange[0]) },
        { label: "Payment-processing charges (third-party)", amount: amount - Math.round(feeRange[0]) },
      ],
      psp: "Authorized Payment Provider (sandbox)",
      quoteExpiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      state: "QUOTE_READY",
    };
    BOOKINGS.push(quote);
    return quote;
  },

  async initiatePayment(bookingId: string): Promise<{ state: PaymentState; pspRef: string }> {
    await delay(400);
    const b = BOOKINGS.find((b) => b.bookingId === bookingId);
    if (b) b.state = "PAYMENT_INITIATED";
    return { state: "PAYMENT_INITIATED", pspRef: `psp_${bookingId}` };
  },

  async confirmFromWebhook(bookingId: string): Promise<{ state: PaymentState }> {
    await delay(1200);
    const b = BOOKINGS.find((b) => b.bookingId === bookingId);
    if (b) b.state = "PAID";
    return { state: "PAID" };
  },

  async getBooking(bookingId: string): Promise<BookingQuote> {
    await delay(200);
    const b = BOOKINGS.find((b) => b.bookingId === bookingId);
    if (!b) throw new Error("Booking not found");
    return b;
  },

  /* ---------- matters ---------- */
  async getMatter(matterId: string): Promise<MatterMetadata> {
    await delay(200);
    return MATTERS.find((m) => m.id === matterId) ?? MATTERS[0];
  },

  /* ---------- provider surface ---------- */
  async getProviderVerification(providerId: string): Promise<ProviderVerification> {
    await delay(300);
    const v = VERIFICATIONS[providerId];
    if (!v) throw new Error("Verification not found");
    return { providerId, ...v };
  },

  async getLedger(providerId: string): Promise<LedgerSummary> {
    await delay(300);
    const events = LEDGER[providerId] ?? [];
    return {
      totalCredits: events.reduce((s, e) => s + e.credits, 0),
      periodCredits: events
        .filter((e) => e.occurredAt >= "2026-08-01")
        .reduce((s, e) => s + e.credits, 0),
      events,
    };
  },

  async redeem(_providerId: string, type: string) {
    await delay(500);
    return {
      redemptionId: `rd_${Math.random().toString(36).slice(2, 10)}`,
      type,
      generatedAt: new Date().toISOString(),
      note: "Evidence artefact — not an official institutional decision.",
    };
  },

  /* ---------- provider pipeline: onboarding / verification / availability ---------- */
  async createProvider(_input: ProviderProfileInput): Promise<{ providerId: string; tier: "SELF_DECLARED" }> {
    await delay(500);
    return {
      providerId: `p_${Math.random().toString(36).slice(2, 8)}`,
      tier: "SELF_DECLARED",
    };
  },

  async submitVerification(
    providerId: string,
    submissions: CredentialSubmission[],
  ): Promise<VerificationCaseResult> {
    await delay(800);
    const provider = PROVIDERS.find((p) => p.providerId === providerId) ?? PROVIDERS[0];
    const checks = submissions
      .filter((s) => s.path !== "NOT_NOW")
      .map((s) => submissionToCheck(s.leg, s.path));
    const decision = decideTier(provider.providerType, checks);
    return {
      caseId: `vc_${Math.random().toString(36).slice(2, 8)}`,
      providerId,
      tier: decision.tier,
      decidedAt: new Date().toISOString(),
      checks: sortLegs(REQUIRED_LEGS[provider.providerType]).map(
        (leg) => checks.find((c) => c.checkType === leg) ?? {
          checkType: leg,
          result: "UNAVAILABLE",
          sourceMode: "OFF",
          sourceLabel: "Not submitted — source off",
          checkedAt: new Date().toISOString(),
        },
      ),
      requiredLegs: REQUIRED_LEGS[provider.providerType],
      freshnessWindowDays: 90,
    };
  },

  async runReverification(providerId: string): Promise<VerificationCaseResult> {
    await delay(700);
    const provider = PROVIDERS.find((p) => p.providerId === providerId) ?? PROVIDERS[0];
    const current = VERIFICATIONS[providerId] ?? VERIFICATIONS["p_001"];
    const checks = current.checks.map((c) => ({
      ...c,
      checkedAt: new Date().toISOString(),
    }));
    const decision = decideTier(provider.providerType, checks);
    return {
      caseId: `vc_${Math.random().toString(36).slice(2, 8)}`,
      providerId,
      tier: decision.tier,
      decidedAt: new Date().toISOString(),
      checks,
      requiredLegs: REQUIRED_LEGS[provider.providerType],
      freshnessWindowDays: current.freshnessWindowDays,
    };
  },

  async addSlot(providerId: string, startsAt: string): Promise<Slot> {
    await delay(300);
    const slot: Slot = {
      id: `s_${Math.random().toString(36).slice(2, 8)}`,
      startsAt,
      endsAt: new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString(),
      available: true,
    };
    const p = PROVIDERS.find((p) => p.providerId === providerId);
    p?.slots.push(slot);
    return slot;
  },

  async getAppointments(providerId: string): Promise<ProviderAppointment[]> {
    await delay(300);
    return APPOINTMENTS.filter((a) => a.providerId === providerId);
  },

  async getProviderPayments(providerId: string): Promise<ProviderPaymentStatus[]> {
    await delay(300);
    return PROVIDER_PAYMENTS.filter((p) => {
      const b = BOOKINGS.find((x) => x.bookingId === p.bookingId);
      return providerId === CURRENT_PROVIDER && (b ? b.providerId === providerId : true);
    });
  },

  async getProviderGrievances(providerId: string): Promise<Grievance[]> {
    await delay(200);
    const all = await mock.getGrievances();
    return all.filter((g) => providerId === CURRENT_PROVIDER || g.status === "PLATFORM_RESOLVED");
  },

  /* ---------- institutional / public ---------- */
  async getPublicStats(): Promise<PublicStat[]> {
    await delay(300);
    return [
      { district: "Patna", mattersServed: 2140, proBonoMatters: 812, medianResponseHours: 6.2, grievanceResolutionRate: 0.91 },
      { district: "Gaya", mattersServed: 1275, proBonoMatters: 640, medianResponseHours: 7.4, grievanceResolutionRate: 0.88 },
      { district: "Muzaffarpur", mattersServed: 980, proBonoMatters: 431, medianResponseHours: 8.1, grievanceResolutionRate: 0.86 },
      { district: "Darbhanga", mattersServed: 1502, proBonoMatters: 705, medianResponseHours: 6.8, grievanceResolutionRate: 0.9 },
    ];
  },

  async getGrievances(): Promise<Grievance[]> {
    await delay(200);
    return [
      { id: "gr_1041", status: "TRIAGED", summary: "Fee not disclosed before work", openedAt: "2026-08-14T10:00:00Z", updatedAt: "2026-08-16T09:00:00Z" },
      { id: "gr_1042", status: "REFERRED_TO_BAR_COUNCIL", summary: "Professional misconduct (s.35 Advocates Act)", openedAt: "2026-08-02T10:00:00Z", updatedAt: "2026-08-10T09:00:00Z" },
      { id: "gr_1043", status: "PLATFORM_RESOLVED", summary: "Quote not honoured — refund processed via PSP", openedAt: "2026-07-28T10:00:00Z", updatedAt: "2026-08-01T09:00:00Z" },
    ];
  },

  async fileGrievance(input: GrievanceInput): Promise<Grievance> {
    await delay(600);
    const now = new Date().toISOString();
    const grievance: Grievance = {
      id: `gr_${Math.floor(1000 + Math.random() * 9000)}`,
      status: "OPEN",
      summary: input.summary,
      openedAt: now,
      updatedAt: now,
    };
    return grievance;
  },

  async getAssistedAudit(_sessionId?: string): Promise<AssistedAuditEvent[]> {
    await delay(300);
    return [
      { id: "ae_901", sessionId: "sess_0938", actor: "Operator op_31 (CSC Gaya)", citizenLabel: "Citizen #8842", action: "SESSION_OPENED — consent recorded (c_0938), 60 minutes", occurredAt: "2026-08-19T17:00:00Z", consentRef: "c_0938" },
      { id: "ae_902", sessionId: "sess_0938", actor: "Operator op_31 (CSC Gaya)", citizenLabel: "Citizen #8842", action: "NEED_CREATED — category TENANCY, district Gaya", occurredAt: "2026-08-19T17:04:00Z", consentRef: "c_0938" },
      { id: "ae_903", sessionId: "sess_0938", actor: "Operator op_31 (CSC Gaya)", citizenLabel: "Citizen #8842", action: "ELIGIBILITY_DECLARED — no s.12, ceiling below district floor", occurredAt: "2026-08-19T17:06:00Z", consentRef: "c_0938" },
      { id: "ae_904", sessionId: "sess_0938", actor: "Operator op_31 (CSC Gaya)", citizenLabel: "Citizen #8842", action: "ROTATION_ASSIGNMENT_VIEWED — advocate assigned on duty", occurredAt: "2026-08-19T17:07:00Z", consentRef: "c_0938" },
      { id: "ae_905", sessionId: "sess_0938", actor: "Operator op_31 (CSC Gaya)", citizenLabel: "Citizen #8842", action: "SESSION_CLOSED — consent window expired", occurredAt: "2026-08-19T18:00:00Z", consentRef: "c_0938" },
    ];
  },

  async getCitizenPortal(): Promise<CitizenPortalView> {
    await delay(300);
    return { needs: NEED_SEEDS, matters: MATTERS };
  },
};

export const api = DEMO_MODE ? mock : {
  requestOtp: (phone: string) => request<{ sent: boolean }>("/v1/auth/otp/request", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; userId: string }>("/v1/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  createNeed: (need: Omit<NeedRequest, "id">) => request<NeedRequest>("/v1/needs", { method: "POST", body: JSON.stringify(need) }),
  getEligibility: (needId: string) =>
    request<{ need: NeedRequest & { selfDeclaredSection12: string | null }; decision: EligibilityDecision }>(
      `/v1/needs/${needId}/eligibility`,
    ),
  getDirectory: (needId: string) => request<DirectoryResponse>(`/v1/needs/${needId}/directory`),
  selectProvider: (needId: string, providerId: string) =>
    request(`/v1/needs/${needId}/select`, { method: "POST", body: JSON.stringify({ providerId }) }),
  rotateAssign: (needId: string) =>
    request<{ allocationId: string; provider: ProviderSummary; mode: "ROTATION"; assignedAt: string }>(
      `/v1/needs/${needId}/rotate`,
      { method: "POST" },
    ),
  getSlots: (providerId: string) => request<Slot[]>(`/v1/providers/${providerId}/slots`),
  createQuote: (providerId: string, needId: string) =>
    request<BookingQuote>("/v1/payments/quotes", { method: "POST", body: JSON.stringify({ providerId, needId }) }),
  initiatePayment: (bookingId: string) =>
    request(`/v1/payments/intents`, { method: "POST", body: JSON.stringify({ bookingId }) }),
  confirmFromWebhook: (bookingId: string) =>
    request(`/v1/payments/webhooks/sandbox`, { method: "POST", body: JSON.stringify({ bookingId }) }),
  getBooking: (bookingId: string) => request<BookingQuote>(`/v1/payments/${bookingId}`),
  getMatter: (matterId: string) => request<MatterMetadata>(`/v1/matters/${matterId}/status`),
  getProviderVerification: (providerId: string) => request<ProviderVerification>(`/v1/providers/${providerId}/verification`),
  getLedger: (providerId: string) => request<LedgerSummary>(`/v1/me/credits?providerId=${providerId}`),
  redeem: (providerId: string, type: string) =>
    request<{ redemptionId: string; type: string; generatedAt: string; note: string }>(
      "/v1/me/redemptions",
      { method: "POST", body: JSON.stringify({ providerId, type }) },
    ),
  getPublicStats: () => request<PublicStat[]>("/v1/public/stats"),
  getGrievances: () => request<Grievance[]>("/v1/grievances"),

  /* provider pipeline (real backend) */
  createProvider: (input: ProviderProfileInput) =>
    request<{ providerId: string; tier: "SELF_DECLARED" }>("/v1/providers", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  submitVerification: (providerId: string, submissions: CredentialSubmission[]) =>
    request<VerificationCaseResult>("/v1/providers/verify", {
      method: "POST",
      body: JSON.stringify({ providerId, submissions }),
    }),
  runReverification: (providerId: string) =>
    request<VerificationCaseResult>(`/v1/providers/${providerId}/verification/reverify`, {
      method: "POST",
    }),
  addSlot: (providerId: string, startsAt: string) =>
    request<Slot>(`/v1/providers/${providerId}/slots`, {
      method: "POST",
      body: JSON.stringify({ startsAt }),
    }),
  getAppointments: (providerId: string) =>
    request<ProviderAppointment[]>(`/v1/providers/${providerId}/appointments`),
  getProviderPayments: (providerId: string) =>
    request<ProviderPaymentStatus[]>(`/v1/providers/${providerId}/payments`),
  getProviderGrievances: (providerId: string) =>
    request<Grievance[]>(`/v1/grievances?providerId=${providerId}`),

  /* citizen surfaces */
  fileGrievance: (input: GrievanceInput) =>
    request<Grievance>("/v1/grievances", { method: "POST", body: JSON.stringify(input) }),
  getAssistedAudit: (sessionId: string) =>
    request<AssistedAuditEvent[]>(`/v1/assist/sessions/${sessionId}/audit`),
  getCitizenPortal: () => request<CitizenPortalView>("/v1/me/portal"),
};