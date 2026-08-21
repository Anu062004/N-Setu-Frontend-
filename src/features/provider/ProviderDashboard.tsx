import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import type {
  LedgerSummary,
  ProviderVerification,
  RedemptionArtefact,
  SlotsResponse,
} from "../../lib/types";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../lib/format";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

const REDEMPTIONS = [
  ["SERVICE_RECORD_EXPORT", "Signed export of your verified service events"],
  ["PANEL_APPLICATION_EVIDENCE_PACKET", "Evidence packet for a DLSA / High Court panel application"],
  ["RECOGNITION_ELIGIBILITY_PACKET", "Service-threshold evidence for an authorized institution"],
  ["CLE_ACTIVITY_RECORD", "Verifiable record of completed learning activity"],
] as const;

export function ProviderDashboard() {
  const { t } = useI18n();
  const { session } = useAuth();
  const providerId = session?.providerId ?? null;

  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [redeemed, setRedeemed] = useState<RedemptionArtefact | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    let alive = true;
    setLoadError(null);
    Promise.all([
      api.getVerification(providerId).then(setVerification),
      api.getCredits().then(setLedger),
      api.getSlots(providerId).then(setSlotsData),
    ]).catch((e) => {
      if (!alive) return;
      setLoadError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Could not load dashboard",
      );
    });
    return () => {
      alive = false;
    };
  }, [providerId]);

  if (!providerId) {
    return (
      <div className="container-narrow mt-8">
        <p className="eyebrow">{t("Provider surface")}</p>
        <h1 className="h-section mt-3">{t("No professional profile on this session")}</h1>
        <p className="small mt-4" style={{ maxWidth: 560 }}>
          {t(
            "This dashboard shows your real verification, ledger and availability. Create your professional profile first — the dashboard binds to the profile you create.",
          )}
        </p>
        <div className="mt-6 intake-result__actions">
          <Link to="/provider/onboarding" className="btn btn--primary">
            {t("Create your profile")}
          </Link>
        </div>
      </div>
    );
  }

  const stale =
    verification &&
    new Date(verification.decidedAt).getTime() + verification.freshnessWindowDays * 86400000 <
      Date.now();

  const handleRedeem = async (type: string) => {
    setRedeemError(null);
    try {
      const r =
        type === "SERVICE_RECORD_EXPORT"
          ? await api.getServiceRecord()
          : type === "PANEL_APPLICATION_EVIDENCE_PACKET"
            ? await api.getPanelEvidence()
            : await api.redeem(type);
      setRedeemed(r);
    } catch (e) {
      setRedeemError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Export failed",
      );
    }
  };

  return (
    <div className="provider-dash">
      <div className="container">
        <div className="flex-between">
          <div>
            <p className="eyebrow">{t("Provider surface")} · {session?.phone}</p>
            <h1 className="h-section">{t("Dashboard")}</h1>
          </div>
          <div className="flex-between" style={{ gap: "var(--sp-3)" }}>
            <TierLabel tier={t(verification?.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : verification?.tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")} />
            <a href="/provider/verification" className="btn btn--outline btn--sm">{t("Verification")}</a>
          </div>
        </div>

        {stale && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label={t("REVERIFICATION DUE")} />
            <span className="small">
              {t("Freshness window passed — tier has degraded to DOCUMENT-VERIFIED.")}{" "}
              <a href="/provider/verification" style={{ textDecoration: "underline" }}>{t("Re-verify now")}</a>.
            </span>
          </div>
        )}

        {loadError && (
          <div className="assisted-banner mt-5" role="alert">
            <StatusLabel label={t("ERROR")} />
            <span className="small">{t(loadError)}</span>
          </div>
        )}

        <div className="grid-12 mt-6">
          <div className="dash-col col-span-7">
            <div className="dash-section">
              <h2 className="h-micro">{t("Verification")}</h2>
              {verification && (
                <>
                  <div className="flex-between mt-4">
                    <TierLabel tier={t(verification.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : verification.tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")} />
                    <StatusLabel label={t(stale ? "STALE" : "CURRENT")} />
                  </div>
                  <table className="table table--dense mt-4">
                    <thead>
                      <tr>
                        <th>{t("Check")}</th>
                        <th>{t("Result")}</th>
                        <th>{t("Mode")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verification.checks.length === 0 && (
                        <tr>
                          <td className="small" colSpan={3}>
                            {t("No checks recorded yet — credential sources are offline in this deployment.")}
                          </td>
                        </tr>
                      )}
                      {verification.checks.map((c) => (
                        <tr key={c.checkType}>
                          <td className="small">{t(c.checkType)}</td>
                          <td><StatusLabel label={t(c.result)} /></td>
                          <td>
                            <StatusLabel label={t(c.sourceMode === "MOCK" ? "DEMO ONLY" : c.sourceMode)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small mt-3">
                    {t("Decided {date} · freshness {days} days.", {
                      date: formatDate(verification.decidedAt),
                      days: verification.freshnessWindowDays,
                    })}
                  </p>
                </>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Service credit ledger")}</h2>
              {ledger && (
                <>
                  <div className="flex-between mt-4">
                    <div>
                      <p className="meta">{t("Total credits")}</p>
                      <p className="h-sub tabular">{ledger.totalCredits}</p>
                    </div>
                    <div>
                      <p className="meta">{t("Period credits (this month)")}</p>
                      <p className="h-sub tabular">{ledger.periodCredits}</p>
                    </div>
                    <div>
                      <p className="meta">{t("Ledger")}</p>
                      <StatusLabel label={t("APPEND-ONLY")} />
                    </div>
                  </div>
                  <table className="table table--dense mt-4">
                    <thead>
                      <tr>
                        <th>{t("Date")}</th>
                        <th>{t("Event")}</th>
                        <th>{t("Reference")}</th>
                        <th style={{ textAlign: "right" }}>{t("Credits")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.events.length === 0 && (
                        <tr>
                          <td className="small" colSpan={4}>
                            {t("No credit events yet — credits accrue when pro bono matters close.")}
                          </td>
                        </tr>
                      )}
                      {ledger.events.map((e) => (
                        <tr key={e.id}>
                          <td className="small tabular">{formatDate(e.occurredAt)}</td>
                          <td className="small">{t(e.eventType.replaceAll("_", " "))}</td>
                          <td className="small">{e.reference}</td>
                          <td className="small tabular" style={{ textAlign: "right" }}>
                            +{e.credits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small mt-3">
                    {t("Hash-chained, append-only. Credits are private to you and institutional consumers — never shown to citizens, never purchasable.")}
                  </p>
                </>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Availability")}</h2>
              {slotsData && (
                slotsData.availabilityPolicy === "CONFIGURED" && slotsData.slots.length > 0 ? (
                  <ul className="slot-list mt-4">
                    {slotsData.slots.map((s) => (
                      <li key={s.id} className="slot-item" style={{ cursor: "default" }}>
                        <span className="small tabular">{new Date(s.startsAt).toLocaleString("en-IN")}</span>
                        <StatusLabel label={t(s.available ? "AVAILABLE" : "BOOKED")} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4" role="status">
                    <StatusLabel label={t("SCHEDULING NOT CONFIGURED")} />
                    <p className="small mt-3" style={{ maxWidth: 520 }}>
                      {t(
                        "Your availability policy is not configured on the server, so citizens cannot book real slots with you yet. Slot management is not exposed by this deployment.",
                      )}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Quotes / payment status")}</h2>
              <div className="mt-4" role="status">
                <StatusLabel label={t("PAYMENTS OFF")} />
                <p className="small mt-3" style={{ maxWidth: 520 }}>
                  {t(
                    "PAYMENTS_MODE=OFF in this deployment. Quotes can be raised, but no payment intent can be created and no amount can move. This section will list live payment states once the payment capability is enabled by an authorized PSP.",
                  )}
                </p>
              </div>
              <p className="small mt-3">
                {t("Payments move through an authorized PSP. Only a verified PSP webhook or server-side status check moves payment state — never a frontend callback.")}
              </p>
            </div>
          </div>

          <div className="dash-col col-span-5">
            <div className="dash-section">
              <h2 className="h-micro">{t("Appointments")}</h2>
              <div className="mt-4" role="status">
                <StatusLabel label={t("SCHEDULING NOT CONFIGURED")} />
                <p className="small mt-3">
                  {t("No availability policy is configured, so no appointments can exist yet.")}
                </p>
              </div>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Redemptions")}</h2>
              <ul className="redemption-list mt-4">
                {REDEMPTIONS.map(([type, desc]) => (
                  <li key={type} className="redemption-item">
                    <div>
                      <p className="h-micro">{t(type.replaceAll("_", " "))}</p>
                      <p className="small mt-2">{t(desc)}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => void handleRedeem(type)}>
                      {t("Export")}
                    </Button>
                  </li>
                ))}
              </ul>
              {redeemed && (
                <p className="small mt-4" role="status">
                  {redeemed.redemptionId} · {t("{type} generated — evidence artefact, not an official decision.", { type: redeemed.type })}
                </p>
              )}
              {redeemError && <p className="field__error mt-4">{t(redeemError)}</p>}
              <p className="small mt-4">
                {t("Evidence packets support applications you make to statutory bodies — the platform does not decide eligibility and does not self-issue recognition.")}
              </p>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Grievances about you")}</h2>
              <div className="mt-4" role="status">
                <StatusLabel label={t("NOT EXPOSED HERE")} />
                <p className="small mt-3">
                  {t(
                    "Grievance records are visible to institutions through the scoped institutional surface. They are not listed on the provider dashboard in this deployment.",
                  )}
                </p>
              </div>
              <p className="small mt-4">
                {t("Conduct signals are objective, platform-observable facts — response time, no-show, quote honoured. They feed rotation duty accounting and grievance thresholds; they are never shown to citizens.")}
              </p>
            </div>
          </div>
        </div>

        <p className="small mt-6" style={{ color: "var(--color-gray-light)" }}>
          {t("0% platform commission. Third-party payment-processing charges may apply and are disclosed separately.")}
        </p>
      </div>
    </div>
  );
}
