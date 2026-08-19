import type { MatterMetadata, NeedRequest, ProviderSummary } from "./types";

export const NEED_SEEDS: (NeedRequest & {
  selfDeclaredSection12: string | null;
})[] = [
  {
    id: "req_9f2c1a",
    taxonomyCode: "TENANCY",
    district: "Patna",
    language: "hi",
    modePref: "APP",
    feeCeiling: 1500,
    urgency: "NORMAL",
    selfDeclaredSection12: null,
  },
  {
    id: "req_4d81b7",
    taxonomyCode: "FAMILY",
    district: "Patna",
    language: "hi",
    modePref: "APP",
    feeCeiling: 8000,
    urgency: "NORMAL",
    selfDeclaredSection12: "WOMAN_OR_CHILD",
  },
  {
    id: "req_77e02d",
    taxonomyCode: "PROPERTY",
    district: "Gaya",
    language: "hi",
    modePref: "ASSISTED",
    feeCeiling: null,
    urgency: "NORMAL",
    selfDeclaredSection12: null,
  },
];

type SeedProvider = Omit<ProviderSummary, "nextSlot"> & {
  taxonomyCodes: string[];
  slots: { id: string; startsAt: string; endsAt: string; available: boolean }[];
};

export const PROVIDERS: SeedProvider[] = [
  {
    providerId: "p_001",
    displayName: "Adv. Sunita Kumari",
    providerType: "ADVOCATE",
    district: "Patna",
    state: "Bihar",
    languages: ["hi", "en"],
    serviceModes: ["IN_PERSON", "PHONE"],
    tier: "FULLY_VERIFIED",
    tierFresh: true,
    feeRange: [800, 1500],
    taxonomyCodes: ["TENANCY", "FAMILY", "PROPERTY"],
    slots: [
      { id: "s1", startsAt: "2026-08-21T10:00:00+05:30", endsAt: "2026-08-21T11:00:00+05:30", available: true },
      { id: "s2", startsAt: "2026-08-21T15:00:00+05:30", endsAt: "2026-08-21T16:00:00+05:30", available: true },
    ],
  },
  {
    providerId: "p_002",
    displayName: "Adv. Rajesh Prasad",
    providerType: "ADVOCATE",
    district: "Patna",
    state: "Bihar",
    languages: ["hi", "en", "bho"],
    serviceModes: ["IN_PERSON"],
    tier: "FULLY_VERIFIED",
    tierFresh: true,
    feeRange: [1000, 2000],
    taxonomyCodes: ["TENANCY", "CONSUMER"],
    slots: [
      { id: "s1", startsAt: "2026-08-21T12:00:00+05:30", endsAt: "2026-08-21T13:00:00+05:30", available: true },
    ],
  },
  {
    providerId: "p_003",
    displayName: "Adv. Meera Singh",
    providerType: "ADVOCATE",
    district: "Patna",
    state: "Bihar",
    languages: ["hi", "en"],
    serviceModes: ["PHONE", "VIDEO"],
    tier: "DOCUMENT_VERIFIED",
    tierFresh: true,
    feeRange: [600, 1200],
    taxonomyCodes: ["FAMILY", "TENANCY"],
    slots: [
      { id: "s1", startsAt: "2026-08-22T09:00:00+05:30", endsAt: "2026-08-22T10:00:00+05:30", available: true },
    ],
  },
  {
    providerId: "p_004",
    displayName: "Adv. Arjun Verma",
    providerType: "ADVOCATE",
    district: "Patna",
    state: "Bihar",
    languages: ["hi"],
    serviceModes: ["IN_PERSON", "PHONE"],
    tier: "SELF_DECLARED",
    tierFresh: false,
    feeRange: [500, 1000],
    taxonomyCodes: ["TENANCY", "EMPLOYMENT", "CONSUMER"],
    slots: [
      { id: "s1", startsAt: "2026-08-21T16:00:00+05:30", endsAt: "2026-08-21T17:00:00+05:30", available: true },
    ],
  },
  {
    providerId: "p_005",
    displayName: "Adv. Kavita Devi",
    providerType: "ADVOCATE",
    district: "Gaya",
    state: "Bihar",
    languages: ["hi", "en"],
    serviceModes: ["IN_PERSON", "VIDEO"],
    tier: "FULLY_VERIFIED",
    tierFresh: true,
    feeRange: [1200, 2500],
    taxonomyCodes: ["PROPERTY", "FAMILY"],
    slots: [
      { id: "s1", startsAt: "2026-08-23T11:00:00+05:30", endsAt: "2026-08-23T12:00:00+05:30", available: true },
    ],
  },
  {
    providerId: "p_006",
    displayName: "Med. Shashi Kumar",
    providerType: "MEDIATOR",
    district: "Patna",
    state: "Bihar",
    languages: ["hi", "en", "mai"],
    serviceModes: ["IN_PERSON"],
    tier: "FULLY_VERIFIED",
    tierFresh: true,
    feeRange: [700, 1400],
    taxonomyCodes: ["FAMILY", "TENANCY"],
    slots: [
      { id: "s1", startsAt: "2026-08-22T14:00:00+05:30", endsAt: "2026-08-22T15:00:00+05:30", available: true },
    ],
  },
];

export const VERIFICATIONS: Record<string, {
  tier: "SELF_DECLARED" | "DOCUMENT_VERIFIED" | "FULLY_VERIFIED";
  decidedAt: string;
  freshnessWindowDays: number;
  checks: {
    checkType: "IDENTITY" | "DEGREE" | "ENROLMENT" | "PRACTICE_CERT" | "APPOINTMENT" | "CURRENCY";
    result: "PASS" | "MISMATCH" | "NOT_FOUND" | "CONFLICT" | "UNAVAILABLE";
    sourceMode: "LIVE" | "MOCK" | "OFF";
    sourceLabel: string;
    checkedAt: string;
  }[];
}> = {
  p_001: {
    tier: "FULLY_VERIFIED",
    decidedAt: "2026-08-10T10:00:00Z",
    freshnessWindowDays: 90,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested government ID (approved requester)", checkedAt: "2026-08-10T10:00:00Z" },
      { checkType: "DEGREE", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested university document", checkedAt: "2026-08-10T10:01:00Z" },
      { checkType: "ENROLMENT", result: "PASS", sourceMode: "LIVE", sourceLabel: "Bihar State Bar Council roll lookup", checkedAt: "2026-08-10T10:02:00Z" },
      { checkType: "PRACTICE_CERT", result: "PASS", sourceMode: "LIVE", sourceLabel: "AIBE Certificate of Practice", checkedAt: "2026-08-10T10:03:00Z" },
      { checkType: "CURRENCY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Current Bar Council status — fresh", checkedAt: "2026-08-10T10:04:00Z" },
    ],
  },
  p_002: {
    tier: "FULLY_VERIFIED",
    decidedAt: "2026-07-20T10:00:00Z",
    freshnessWindowDays: 90,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested government ID (approved requester)", checkedAt: "2026-07-20T10:00:00Z" },
      { checkType: "DEGREE", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested university document", checkedAt: "2026-07-20T10:01:00Z" },
      { checkType: "ENROLMENT", result: "PASS", sourceMode: "LIVE", sourceLabel: "Bihar State Bar Council roll lookup", checkedAt: "2026-07-20T10:02:00Z" },
      { checkType: "PRACTICE_CERT", result: "PASS", sourceMode: "LIVE", sourceLabel: "AIBE Certificate of Practice", checkedAt: "2026-07-20T10:03:00Z" },
      { checkType: "CURRENCY", result: "UNAVAILABLE", sourceMode: "OFF", sourceLabel: "Authority lookup unavailable — tier capped", checkedAt: "2026-07-20T10:04:00Z" },
    ],
  },
  p_003: {
    tier: "DOCUMENT_VERIFIED",
    decidedAt: "2026-08-01T10:00:00Z",
    freshnessWindowDays: 90,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "OTP-verified phone + name consistency", checkedAt: "2026-08-01T10:00:00Z" },
      { checkType: "DEGREE", result: "PASS", sourceMode: "MOCK", sourceLabel: "Uploaded certificate (DEMO ONLY) — temp processed, deleted after decision", checkedAt: "2026-08-01T10:01:00Z" },
      { checkType: "ENROLMENT", result: "UNAVAILABLE", sourceMode: "OFF", sourceLabel: "Council lookup unavailable — tier capped", checkedAt: "2026-08-01T10:02:00Z" },
      { checkType: "CURRENCY", result: "UNAVAILABLE", sourceMode: "OFF", sourceLabel: "Freshness not confirmable", checkedAt: "2026-08-01T10:03:00Z" },
    ],
  },
  p_004: {
    tier: "SELF_DECLARED",
    decidedAt: "2026-08-05T10:00:00Z",
    freshnessWindowDays: 90,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "OTP-verified phone", checkedAt: "2026-08-05T10:00:00Z" },
      { checkType: "ENROLMENT", result: "NOT_FOUND", sourceMode: "OFF", sourceLabel: "No issuer-attested credential submitted", checkedAt: "2026-08-05T10:01:00Z" },
    ],
  },
  p_005: {
    tier: "FULLY_VERIFIED",
    decidedAt: "2026-08-12T10:00:00Z",
    freshnessWindowDays: 90,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested government ID (approved requester)", checkedAt: "2026-08-12T10:00:00Z" },
      { checkType: "DEGREE", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested university document", checkedAt: "2026-08-12T10:01:00Z" },
      { checkType: "ENROLMENT", result: "PASS", sourceMode: "LIVE", sourceLabel: "Bihar State Bar Council roll lookup", checkedAt: "2026-08-12T10:02:00Z" },
      { checkType: "PRACTICE_CERT", result: "PASS", sourceMode: "LIVE", sourceLabel: "AIBE Certificate of Practice", checkedAt: "2026-08-12T10:03:00Z" },
      { checkType: "CURRENCY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Current Bar Council status — fresh", checkedAt: "2026-08-12T10:04:00Z" },
    ],
  },
  p_006: {
    tier: "FULLY_VERIFIED",
    decidedAt: "2026-08-08T10:00:00Z",
    freshnessWindowDays: 180,
    checks: [
      { checkType: "IDENTITY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Issuer-attested government ID (approved requester)", checkedAt: "2026-08-08T10:00:00Z" },
      { checkType: "APPOINTMENT", result: "PASS", sourceMode: "LIVE", sourceLabel: "Mediation centre empanelment list", checkedAt: "2026-08-08T10:01:00Z" },
      { checkType: "CURRENCY", result: "PASS", sourceMode: "LIVE", sourceLabel: "Empanelment current", checkedAt: "2026-08-08T10:02:00Z" },
    ],
  },
};

export const LEDGER: Record<string, {
  id: string;
  providerId: string;
  eventType: string;
  credits: number;
  occurredAt: string;
  reference: string;
  hash: string;
}[]> = {
  p_001: [
    { id: "ce_001", providerId: "p_001", eventType: "PRO_BONO_MATTER_CLOSED", credits: 100, occurredAt: "2026-07-12T09:00:00Z", reference: "matter m_1012", hash: "9f2c…a1" },
    { id: "ce_002", providerId: "p_001", eventType: "ASPIRATIONAL_BLOCK_SERVICE", credits: 150, occurredAt: "2026-07-12T09:00:05Z", reference: "matter m_1012 · block multiplier", hash: "71ab…c4" },
    { id: "ce_003", providerId: "p_001", eventType: "ROTATION_DUTY_COMPLETED", credits: 80, occurredAt: "2026-07-28T11:00:00Z", reference: "roster r_04", hash: "2d8f…19" },
    { id: "ce_004", providerId: "p_001", eventType: "FIRST_RESPONSE_SLA_MET", credits: 40, occurredAt: "2026-08-03T13:00:00Z", reference: "matter m_1034", hash: "b3c0…77" },
    { id: "ce_005", providerId: "p_001", eventType: "LEGAL_AID_TIER_MATTER_CLOSED", credits: 120, occurredAt: "2026-08-09T15:00:00Z", reference: "matter m_1042 · s.12", hash: "e7d2…5b" },
    { id: "ce_006", providerId: "p_001", eventType: "LOK_ADALAT_SETTLEMENT", credits: 60, occurredAt: "2026-08-15T10:00:00Z", reference: "matter m_1050", hash: "4a1e…0f" },
  ],
  p_005: [
    { id: "ce_011", providerId: "p_005", eventType: "PRO_BONO_MATTER_CLOSED", credits: 100, occurredAt: "2026-08-02T09:00:00Z", reference: "matter m_1020", hash: "8c31…d2" },
  ],
};

export const MATTERS: MatterMetadata[] = [
  {
    id: "m_1042",
    needRequestId: "req_4d81b7",
    providerId: "p_001",
    category: "FAMILY",
    status: "CLOSED",
    fee: 0,
    cnr: null,
    openedAt: "2026-07-20T10:00:00Z",
    closedAt: "2026-08-09T15:00:00Z",
    closeReason: "LEGAL_AID_TIER_MATTER_CLOSED",
  },
  {
    id: "m_1050",
    needRequestId: "req_9f2c1a",
    providerId: "p_001",
    category: "TENANCY",
    status: "CLOSED",
    fee: 900,
    cnr: "CNR-BRPA0101232026",
    openedAt: "2026-08-01T10:00:00Z",
    closedAt: "2026-08-15T10:00:00Z",
    closeReason: "LOK_ADALAT_SETTLEMENT",
  },
  {
    id: "m_1055",
    needRequestId: "req_9f2c1a",
    providerId: "p_001",
    category: "TENANCY",
    status: "ACTIVE",
    fee: 1200,
    cnr: null,
    openedAt: "2026-08-16T10:00:00Z",
    closedAt: null,
    closeReason: null,
  },
];

export const BOOKINGS: {
  bookingId: string;
  providerId: string;
  amount: number;
  currency: "INR";
  feeBreakdown: { label: string; amount: number }[];
  psp: string;
  quoteExpiresAt: string;
  state: "QUOTE_READY" | "PAYMENT_INITIATED" | "AWAITING_PROVIDER_CONFIRMATION" | "PAID" | "SETTLED" | "FAILED" | "OFFLINE_ACK";
}[] = [];

export const CURRENT_PROVIDER = "p_001";

export const APPOINTMENTS = [
  {
    id: "ap_101",
    providerId: "p_001",
    citizenLabel: "Citizen #8842 (assisted)",
    category: "TENANCY",
    startsAt: "2026-08-21T10:00:00+05:30",
    endsAt: "2026-08-21T11:00:00+05:30",
    state: "CONFIRMED",
  },
  {
    id: "ap_102",
    providerId: "p_001",
    citizenLabel: "Citizen #2291",
    category: "FAMILY",
    startsAt: "2026-08-22T09:00:00+05:30",
    endsAt: "2026-08-22T09:30:00+05:30",
    state: "SCHEDULED",
  },
  {
    id: "ap_103",
    providerId: "p_001",
    citizenLabel: "Citizen #7710",
    category: "TENANCY",
    startsAt: "2026-08-23T15:00:00+05:30",
    endsAt: "2026-08-23T16:00:00+05:30",
    state: "HELD",
  },
] as {
  id: string;
  providerId: string;
  citizenLabel: string;
  category: "TENANCY" | "FAMILY" | "PROPERTY" | "EMPLOYMENT" | "CONSUMER" | "CRIMINAL" | "OTHER";
  startsAt: string;
  endsAt: string;
  state: "BOOKED" | "HELD" | "CONFIRMED" | "SCHEDULED" | "CANCELLED";
}[];

export const PROVIDER_PAYMENTS = [
  { bookingId: "bk_a01", amount: 900, state: "PAID", updatedAt: "2026-08-18T12:00:00Z" },
  { bookingId: "bk_a02", amount: 1200, state: "AWAITING_PROVIDER_CONFIRMATION", updatedAt: "2026-08-19T08:30:00Z" },
  { bookingId: "bk_a03", amount: 0, state: "PAID", updatedAt: "2026-08-15T10:00:00Z" },
] as {
  bookingId: string;
  amount: number;
  state: "QUOTE_READY" | "PAYMENT_INITIATED" | "AWAITING_PROVIDER_CONFIRMATION" | "PAID" | "SETTLED" | "FAILED" | "OFFLINE_ACK";
  updatedAt: string;
}[];