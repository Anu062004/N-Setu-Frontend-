import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { api } from "../../lib/api";
import type { ProviderVerification, VerificationCaseResult } from "../../lib/types";
import { LEG_LABELS, REQUIRED_LEGS, sortLegs, decideTier } from "../../lib/verification";
import { CURRENT_PROVIDER } from "../../lib/seed";

export function ProviderVerificationPage() {
  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [refreshResult, setRefreshResult] = useState<VerificationCaseResult | null>(null);
  const [reverifying, setReverifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProviderVerification(CURRENT_PROVIDER).then(setVerification);
  }, []);

  const handleReverify = async () => {
    setReverifying(true);
    setError(null);
    try {
      const r = await api.runReverification(CURRENT_PROVIDER);
      setRefreshResult(r);
      setVerification((v) =>
        v
          ? {
              ...v,
              tier: r.tier,
              decidedAt: r.decidedAt,
              checks: r.checks,
            }
          : v,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reverification failed");
    } finally {
      setReverifying(false);
    }
  };

  if (!verification) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">Loading verification…</p>
      </div>
    );
  }

  const stale =
    new Date(verification.decidedAt).getTime() + verification.freshnessWindowDays * 86400000 <
    Date.now();

  return (
    <div className="verification-page">
      <div className="container-narrow">
        <p className="eyebrow">Credential rail</p>
        <h1 className="h-section">Verification</h1>
        <p className="small mt-3" style={{ maxWidth: 580 }}>
          The credential rail converts issuer-attested evidence into a tier. A format check on an
          enrolment number is a validation, never a verification. The LLM can produce
          REVIEW_REQUIRED — it can never produce FULLY VERIFIED.
        </p>

        {stale && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label="REVERIFICATION DUE" />
            <span className="small">
              Your FULLY VERIFIED status has passed its freshness window and has degraded to
              DOCUMENT-VERIFIED. Re-run verification to restore it.
            </span>
          </div>
        )}

        {refreshResult && (
          <div className="mt-5" role="status">
            <TierLabel tier={refreshResult.tier} />
            <p className="small mt-3">
              Re-verified {new Date(refreshResult.decidedAt).toLocaleString("en-IN")} — case{" "}
              {refreshResult.caseId}. {decideTier("ADVOCATE", refreshResult.checks).reasons.join(" ")}
            </p>
          </div>
        )}

        <div className="dash-section mt-6">
          <div className="flex-between">
            <h2 className="h-micro">Current status</h2>
            <div className="flex-between" style={{ gap: "var(--sp-3)" }}>
              <TierLabel tier={verification.tier} />
              <StatusLabel label={stale ? "STALE" : "CURRENT"} />
            </div>
          </div>
          <p className="small mt-3">
            Decided {new Date(verification.decidedAt).toLocaleDateString("en-IN")} · freshness
            window {verification.freshnessWindowDays} days. A stale FULLY VERIFIED degrades to
            DOCUMENT-VERIFIED automatically — it never silently persists.
          </p>
        </div>

        <table className="table table--dense mt-5">
          <thead>
            <tr>
              <th>Check</th>
              <th>Result</th>
              <th>Source</th>
              <th>Mode</th>
              <th>Checked</th>
            </tr>
          </thead>
          <tbody>
            {sortLegs(REQUIRED_LEGS.ADVOCATE).map((leg) => {
              const c = verification.checks.find((x) => x.checkType === leg);
              return (
                <tr key={leg}>
                  <td className="small">{LEG_LABELS[leg]}</td>
                  <td>
                    <StatusLabel label={c?.result ?? "UNAVAILABLE"} />
                  </td>
                  <td className="small">{c?.sourceLabel ?? "Not submitted"}</td>
                  <td>
                    <StatusLabel label={c?.sourceMode === "MOCK" ? "DEMO ONLY" : (c?.sourceMode ?? "OFF")} />
                  </td>
                  <td className="small tabular">
                    {c ? new Date(c.checkedAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-5">
          <Button onClick={() => void handleReverify()} disabled={reverifying}>
            {reverifying ? "Re-running checks…" : "Run reverification"}
          </Button>
          <span className="small" style={{ marginLeft: "var(--sp-4)" }}>
            Re-runs each check against its configured source. UNAVAILABLE sources cap the tier —
            they never grant one.
          </span>
        </div>

        {error && <p className="field__error mt-4">{error}</p>}
      </div>
    </div>
  );
}