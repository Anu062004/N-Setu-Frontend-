type Tone = "neutral" | "blue" | "green" | "amber" | "red";

const TONES: Record<string, Tone> = {
  VERIFIED: "green",
  CURRENT: "green",
  PASS: "green",
  CONFIRMED: "green",
  PAID: "green",
  SETTLED: "green",
  PLATFORM_RESOLVED: "green",
  FULLY_VERIFIED: "green",
  PENDING: "amber",
  DEMO_ONLY: "amber",
  MOCK: "amber",
  LINK_REQUIRED: "amber",
  TRIAGED: "amber",
  UNAVAILABLE: "red",
  OFF: "red",
  FAILED: "red",
  MISMATCH: "red",
  CONFLICT: "red",
  NOT_FOUND: "red",
  REFERRED_TO_BAR_COUNCIL: "red",
  REFERRED_TO_DLSA: "red",
  SELF_DECLARED: "neutral",
  DOCUMENT_VERIFIED: "blue",
  OPEN: "blue",
  ACTIVE: "blue",
  PAYMENT_INITIATED: "blue",
  AWAITING_PROVIDER_CONFIRMATION: "blue",
  QUOTE_READY: "neutral",
  LIVE: "green",
  ROTATED: "blue",
};

export function toneFor(label: string): Tone {
  const upper = label.toUpperCase();
  return TONES[upper] ?? "neutral";
}

export function StatusLabel({ label, className = "" }: { label: string; className?: string }) {
  const tone = toneFor(label);
  return (
    <span className={`status status--${tone} ${className}`} role="status">
      {label}
    </span>
  );
}

export function TierLabel({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    SELF_DECLARED: "SELF-DECLARED",
    DOCUMENT_VERIFIED: "DOCUMENT-VERIFIED",
    FULLY_VERIFIED: "FULLY VERIFIED",
  };
  return <StatusLabel label={map[tier] ?? tier} />;
}