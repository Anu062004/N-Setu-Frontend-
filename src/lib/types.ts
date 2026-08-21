export type ProviderType =
  | "ADVOCATE"
  | "NOTARY"
  | "MEDIATOR"
  | "PARALEGAL"
  | "COUNSEL";

export type VerificationTier = "SELF_DECLARED" | "DOCUMENT_VERIFIED" | "FULLY_VERIFIED";

export type CapabilityMode = "LIVE" | "MOCK" | "OFF";

export type TaxCategory =
  | "PROPERTY"
  | "FAMILY"
  | "EMPLOYMENT"
  | "CONSUMER"
  | "CRIMINAL"
  | "TENANCY"
  | "OTHER";

export type Route = "LEGAL_AID_REFERRAL" | "PRO_BONO_ROTATION" | "PAID";

export type Channel = "APP" | "PHONE" | "VIDEO";

export type PaymentState =
  | "QUOTE_READY"
  | "PAYMENT_INITIATED"
  | "AWAITING_PROVIDER_CONFIRMATION"
  | "PAID"
  | "SETTLED"
  | "FAILED"
  | "OFFLINE_ACK";

export interface FilterSummary {
  category: TaxCategory;
  district: string;
  language: string;
  feeCeiling: number | null;
  minimumTier: VerificationTier | null;
}

export interface ProviderSummary {
  providerId: string;
  displayName: string;
  providerType: ProviderType;
  district: string;
  state: string;
  languages: string[];
  serviceModes: string[];
  tier: VerificationTier;
  tierFresh: boolean;
  feeRange: [number, number] | null;
  nextSlot: string | null;
}

export interface DirectoryResponse {
  requestId: string;
  filterSummary: FilterSummary;
  matchCount: number;
  providers: ProviderSummary[];
  ordering: "ROTATED";
  seed: string;
}

export interface EligibilityInput {
  selfDeclaredSection12: string | null;
  feeCeiling: number | null;
  districtFloor: number;
}

export interface EligibilityDecision {
  route: Route;
  selfDeclared: boolean;
  reason: string;
}

export interface NeedRequest {
  id: string;
  taxonomyCode: TaxCategory;
  district: string;
  language: string;
  modePref: Channel;
  feeCeiling: number | null;
  urgency: "NORMAL" | "URGENT";
}

export interface BookingQuote {
  bookingId: string;
  providerId: string;
  amount: number;
  currency: "INR";
  feeBreakdown: { label: string; amount: number }[];
  psp: string;
  quoteExpiresAt: string;
  state: PaymentState;
}

export interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export interface ConductSignal {
  id: string;
  type: string;
  recordedAt: string;
}

export interface CreditEvent {
  id: string;
  providerId: string;
  eventType: string;
  credits: number;
  occurredAt: string;
  reference: string;
  hash: string;
}

export interface LedgerSummary {
  totalCredits: number;
  periodCredits: number;
  events: CreditEvent[];
}

export interface VerificationCheck {
  checkType: "IDENTITY" | "DEGREE" | "ENROLMENT" | "PRACTICE_CERT" | "APPOINTMENT" | "CURRENCY";
  result: "PASS" | "MISMATCH" | "NOT_FOUND" | "CONFLICT" | "UNAVAILABLE";
  sourceMode: CapabilityMode;
  sourceLabel: string;
  checkedAt: string;
}

export interface ProviderVerification {
  providerId: string;
  tier: VerificationTier;
  decidedAt: string;
  freshnessWindowDays: number;
  checks: VerificationCheck[];
}

export interface DelegationSession {
  id: string;
  operatorUserId: string;
  citizenUserId: string;
  consentRef: string;
  startedAt: string;
  endsAt: string;
}

export interface MatterMetadata {
  id: string;
  needRequestId: string;
  providerId: string;
  category: TaxCategory;
  status: "OPEN" | "ACTIVE" | "CLOSED";
  fee: number | null;
  cnr: string | null;
  openedAt: string;
  closedAt: string | null;
  closeReason: string | null;
}

export interface Grievance {
  id: string;
  status: "OPEN" | "TRIAGED" | "PLATFORM_RESOLVED" | "REFERRED_TO_BAR_COUNCIL" | "REFERRED_TO_DLSA";
  summary: string;
  openedAt: string;
  updatedAt: string;
}

export interface GrievanceInput {
  summary: string;
  relatedBookingId?: string;
  relatedMatterId?: string;
  category: TaxCategory;
  urgency: "NORMAL" | "URGENT";
}

export interface AssistedAuditEvent {
  id: string;
  sessionId: string;
  actor: string;
  citizenLabel: string;
  action: string;
  occurredAt: string;
  consentRef: string;
}

export interface CitizenPortalView {
  needs: (NeedRequest & { selfDeclaredSection12: string | null })[];
  matters: MatterMetadata[];
}

export interface PublicStat {
  district: string;
  mattersServed: number;
  proBonoMatters: number;
  medianResponseHours: number;
  grievanceResolutionRate: number;
}

export type ServiceMode = "IN_PERSON" | "PHONE" | "VIDEO";

export interface ProviderProfileInput {
  providerType: ProviderType;
  displayName: string;
  district: string;
  state: string;
  languages: string[];
  serviceModes: ServiceMode[];
  feeMin: number;
  feeMax: number;
  taxonomyCodes: TaxCategory[];
  proBonoAvailable: boolean;
}

export type CredentialLeg = VerificationCheck["checkType"];

export type CredentialPath = "ISSUER_FETCH" | "UPLOAD" | "AUTHORITY_LOOKUP" | "NOT_NOW";

export interface CredentialSubmission {
  leg: CredentialLeg;
  path: CredentialPath;
}

export interface VerificationCaseResult {
  caseId: string;
  providerId: string;
  tier: VerificationTier;
  decidedAt: string;
  checks: VerificationCheck[];
  requiredLegs: CredentialLeg[];
  freshnessWindowDays: number;
}

export interface ProviderAppointment {
  id: string;
  providerId: string;
  citizenLabel: string;
  category: TaxCategory;
  startsAt: string;
  endsAt: string;
  state: "BOOKED" | "HELD" | "CONFIRMED" | "SCHEDULED" | "CANCELLED";
}

export interface ProviderPaymentStatus {
  bookingId: string;
  amount: number;
  state: PaymentState;
  updatedAt: string;
}

export interface SlotsResponse {
  availabilityPolicy: string;
  slots: Slot[];
}

export interface RedemptionArtefact {
  redemptionId: string;
  type: string;
  generatedAt: string;
  note: string;
}