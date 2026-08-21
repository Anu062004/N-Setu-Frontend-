import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { api, ApiError } from "../../lib/api";
import type { ProviderVerification } from "../../lib/types";
import { LEG_LABELS, REQUIRED_LEGS, sortLegs } from "../../lib/verification";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

export function ProviderVerificationPage() {
  const { t } = useI18n();
  const { session } = useAuth();
  const providerId = session?.providerId ?? null;

  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getVerification(providerId)
      .then(setVerification)
      .catch((e) =>
        setError(e instanceof ApiError ? `${e.code} — ${e.message}` : "Could not load verification"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [providerId]);

  const handleRefresh = async () => {
    if (!providerId) return;
    setRefreshing(true);
    setError(null);
    try {
      setVerification(await api.getVerification(providerId));
    } catch (e) {
      setError(e instanceof ApiError ? `${e.code} — ${e.message}` : t("Refresh failed"));
    } finally {
      setRefreshing(false);
    }
  };

  if (!providerId) {
    return (
      <div className="container-narrow mt-8">
        <p className="eyebrow">{t("Credential rail")}</p>
        <h1 className="h-section mt-3">{t("No professional profile on this session")}</h1>
        <p className="small mt-4" style={{ maxWidth: 560 }}>
          {t("Create your professional profile to open a verification case.")}
        </p>
        <div className="mt-6 intake-result__actions">
          <Link to="/provider/onboarding" className="btn btn--primary">
            {t("Create your profile")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !verification) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">{t("Loading verification…")}</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="container-narrow mt-8">
        <p className="eyebrow">{t("Credential rail")}</p>
        <h1 className="h-section mt-3">{t("No verification case yet")}</h1>
        {error && (
          <p className="small mt-4" role="alert">
            <code className="meta">{error}</code>
          </p>
        )}
        <p className="small mt-4" style={{ maxWidth: 560 }}>
          {t(
            "A verification case is opened when your profile is created. Credential sources are OFF in this deployment, so checks stay honestly UNAVAILABLE until a source is enabled.",
          )}
        </p>
      </div>
    );
  }

  const stale =
    new Date(verification.decidedAt).getTime() + verification.freshnessWindowDays * 86400000 <
    Date.now();

  return (
    <div className="verification-page">
      <div className="container-narrow">
        <p className="eyebrow">{t("Credential rail")}</p>
        <h1 className="h-section">{t("Verification")}</h1>
        <p className="small mt-3" style={{ maxWidth: 580 }}>
          {t(
            "The credential rail converts issuer-attested evidence into a tier. A format check on an enrolment number is a validation, never a verification. The LLM can produce REVIEW_REQUIRED — it can never produce FULLY VERIFIED.",
          )}
        </p>

        <div className="assisted-banner mt-5" role="status">
          <StatusLabel label={t("CREDENTIAL SOURCES OFF")} />
          <span className="small">
            {t(
              "Issuer-fetch and upload credential modes are switched off in this deployment. Checks cannot run live; results shown are the server's honest fail-closed state.",
            )}
          </span>
        </div>

        {stale && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label={t("REVERIFICATION DUE")} />
            <span className="small">
              {t(
                "Your FULLY VERIFIED status has passed its freshness window and has degraded to DOCUMENT-VERIFIED. Re-run verification to restore it.",
              )}
            </span>
          </div>
        )}

        <div className="dash-section mt-6">
          <div className="flex-between">
            <h2 className="h-micro">{t("Current status")}</h2>
            <div className="flex-between" style={{ gap: "var(--sp-3)" }}>
              <TierLabel
                tier={t(
                  verification.tier === "FULLY_VERIFIED"
                    ? "FULLY VERIFIED"
                    : verification.tier === "DOCUMENT_VERIFIED"
                      ? "DOCUMENT-VERIFIED"
                      : "SELF-DECLARED",
                )}
              />
              <StatusLabel label={t(stale ? "STALE" : "CURRENT")} />
            </div>
          </div>
          <p className="small mt-3">
            {t("Decided {date} · freshness window {days} days.", {
              date: new Date(verification.decidedAt).toLocaleDateString("en-IN"),
              days: verification.freshnessWindowDays,
            })}{" "}
            {t(
              "A stale FULLY VERIFIED degrades to DOCUMENT-VERIFIED automatically — it never silently persists.",
            )}
          </p>
        </div>

        <table className="table table--dense mt-5">
          <thead>
            <tr>
              <th>{t("Check")}</th>
              <th>{t("Result")}</th>
              <th>{t("Source")}</th>
              <th>{t("Mode")}</th>
              <th>{t("Checked")}</th>
            </tr>
          </thead>
          <tbody>
            {sortLegs(REQUIRED_LEGS.ADVOCATE).map((leg) => {
              const c = verification.checks.find((x) => x.checkType === leg);
              return (
                <tr key={leg}>
                  <td className="small">{t(LEG_LABELS[leg])}</td>
                  <td>
                    <StatusLabel label={t(c?.result ?? "UNAVAILABLE")} />
                  </td>
                  <td className="small">{t(c?.sourceLabel ?? "Not submitted")}</td>
                  <td>
                    <StatusLabel
                      label={t(c?.sourceMode === "MOCK" ? "DEMO ONLY" : (c?.sourceMode ?? "OFF"))}
                    />
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
          <Button onClick={() => void handleRefresh()} disabled={refreshing}>
            {refreshing ? t("Refreshing…") : t("Refresh status")}
          </Button>
          <span className="small" style={{ marginLeft: "var(--sp-4)" }}>
            {t(
              "Live reverification needs an enabled credential source. With sources OFF, UNAVAILABLE never grants a tier — it only caps one.",
            )}
          </span>
        </div>

        {error && <p className="field__error mt-4">{t(error)}</p>}
      </div>
    </div>
  );
}
