import type { CredentialLeg, ProviderType, VerificationCheck, VerificationTier } from "./types";

export const REQUIRED_LEGS: Record<ProviderType, CredentialLeg[]> = {
  ADVOCATE: ["IDENTITY", "DEGREE", "ENROLMENT", "PRACTICE_CERT", "CURRENCY"],
  NOTARY: ["IDENTITY", "APPOINTMENT", "CURRENCY"],
  MEDIATOR: ["IDENTITY", "APPOINTMENT", "CURRENCY"],
  PARALEGAL: ["IDENTITY", "DEGREE"],
  COUNSEL: ["IDENTITY", "ENROLMENT", "CURRENCY"],
};

export const LEG_LABELS: Record<CredentialLeg, string> = {
  IDENTITY: "Identity",
  DEGREE: "Law degree",
  ENROLMENT: "Bar enrolment",
  PRACTICE_CERT: "Right to practise (AIBE / CoP)",
  CURRENCY: "Current status (freshness)",
  APPOINTMENT: "Appointment / empanelment",
};

const LEG_ORDER: Record<CredentialLeg, number> = {
  IDENTITY: 0,
  DEGREE: 1,
  ENROLMENT: 2,
  PRACTICE_CERT: 3,
  CURRENCY: 4,
  APPOINTMENT: 2,
};

function rank(leg: CredentialLeg) {
  return LEG_ORDER[leg] ?? 9;
}

export interface TierDecision {
  tier: VerificationTier;
  reasons: string[];
  canUpgrade: boolean;
}

/**
 * Tier rules (Backend Architecture §5.2, §5.4):
 *  - SELF_DECLARED:      profile complete, no issuer-attested credential.
 *  - DOCUMENT_VERIFIED:  identity PASS + required legs satisfied via PASS evidence (LIVE or
 *                        validated document), currency not authoritatively confirmed.
 *  - FULLY_VERIFIED:     DOCUMENT_VERIFIED + currency confirmed against the authoritative
 *                        register within the freshness window via a LIVE check.
 * Hard rules:
 *  - Any MISMATCH / CONFLICT / NOT_FOUND on a required leg fails verification.
 *  - UNAVAILABLE never becomes PASS; an OFF source caps the achievable tier.
 *  - A MOCK source can demonstrate the flow but can never by itself produce FULLY_VERIFIED.
 */
export function decideTier(
  providerType: ProviderType,
  checks: VerificationCheck[],
): TierDecision {
  const required = REQUIRED_LEGS[providerType];
  const reasons: string[] = [];
  const byLeg = new Map(checks.map((c) => [c.checkType, c]));

  const failing = required.filter((leg) => {
    const c = byLeg.get(leg);
    return c && (c.result === "MISMATCH" || c.result === "CONFLICT" || c.result === "NOT_FOUND");
  });
  if (failing.length > 0) {
    reasons.push(
      `Required check failed: ${failing.map((f) => LEG_LABELS[f]).join(", ")}. A conflicting or not-found result cannot be verified.`,
    );
    return { tier: "SELF_DECLARED", reasons, canUpgrade: true };
  }

  const unavailable = required.filter((leg) => {
    const c = byLeg.get(leg);
    return c && (c.result === "UNAVAILABLE" || c.sourceMode === "OFF");
  });
  if (unavailable.length > 0) {
    reasons.push(
      `Source unavailable for: ${unavailable.map((u) => LEG_LABELS[u]).join(", ")}. UNAVAILABLE never becomes PASS — the achievable tier is capped.`,
    );
  }

  const identity = byLeg.get("IDENTITY");
  const currency = byLeg.get("CURRENCY");

  const allPass = required.every((leg) => {
    const c = byLeg.get(leg);
    return c && c.result === "PASS";
  });
  const identityConsistent = identity?.result === "PASS";
  const currencyLiveCurrent =
    currency?.result === "PASS" && currency.sourceMode === "LIVE";

  if (allPass && currencyLiveCurrent) {
    reasons.unshift(
      "Currency confirmed against the authoritative register within the freshness window via a LIVE check.",
    );
    return { tier: "FULLY_VERIFIED", reasons, canUpgrade: false };
  }

  if (identityConsistent && allPass) {
    reasons.unshift(
      "Identity consistent and all required legs satisfied by PASS evidence. Currency is not authoritatively confirmed, so the tier is DOCUMENT-VERIFIED.",
    );
    return { tier: "DOCUMENT_VERIFIED", reasons, canUpgrade: true };
  }

  reasons.push(
    unavailable.length > 0
      ? "Tier capped by unavailable sources."
      : "No issuer-attested or validated evidence submitted yet.",
  );
  return { tier: "SELF_DECLARED", reasons, canUpgrade: true };
}

/** Convert a leg/path submission into a verification check result (demo semantics). */
export function submissionToCheck(leg: CredentialLeg, path: "ISSUER_FETCH" | "UPLOAD" | "AUTHORITY_LOOKUP" | "NOT_NOW"): VerificationCheck {
  const now = new Date().toISOString();
  switch (path) {
    case "ISSUER_FETCH":
      return {
        checkType: leg,
        result: "PASS",
        sourceMode: "LIVE",
        sourceLabel: `Issuer-attested ${LEG_LABELS[leg].toLowerCase()} (approved requester)`,
        checkedAt: now,
      };
    case "AUTHORITY_LOOKUP":
      return {
        checkType: leg,
        result: leg === "CURRENCY" || leg === "ENROLMENT" ? "PASS" : "UNAVAILABLE",
        sourceMode: "LIVE",
        sourceLabel:
          leg === "CURRENCY" || leg === "ENROLMENT"
            ? "Current authoritative register lookup"
            : "Not a register lookup — unavailable",
        checkedAt: now,
      };
    case "UPLOAD":
      return {
        checkType: leg,
        result: "PASS",
        sourceMode: "MOCK",
        sourceLabel: `Uploaded ${LEG_LABELS[leg].toLowerCase()} — temporary processing, deleted after decision (DEMO ONLY)`,
        checkedAt: now,
      };
    default:
      return {
        checkType: leg,
        result: "UNAVAILABLE",
        sourceMode: "OFF",
        sourceLabel: "No credential submitted — source off, tier capped",
        checkedAt: now,
      };
  }
}

export function sortLegs(legs: CredentialLeg[]): CredentialLeg[] {
  return [...legs].sort((a, b) => rank(a) - rank(b));
}