import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api, ApiError, type ProviderServiceInput } from "../../lib/api";
import type { ProviderVerification, TaxCategory } from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

interface ServiceRow extends ProviderServiceInput {
  checked: boolean;
}

function blankRows(): Record<string, ServiceRow> {
  const rows: Record<string, ServiceRow> = {};
  for (const cat of Object.keys(CATEGORY_LABELS)) {
    rows[cat] = { taxonomyCode: cat, feeMin: 0, feeMax: 0, proBonoAvailable: false, checked: false };
  }
  return rows;
}

export function ProviderServicesEdit() {
  const { t } = useI18n();
  const { session } = useAuth();
  const providerId = session?.providerId ?? null;

  const [rows, setRows] = useState<Record<string, ServiceRow>>(blankRows);
  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    let cancelled = false;
    api
      .getVerification(providerId)
      .then((v) => {
        if (!cancelled) setVerification(v);
      })
      .catch((e) => {
        // Verification may not exist yet for a brand-new provider — not fatal.
        if (cancelled && !(e instanceof ApiError)) return;
        if (e instanceof ApiError && e.status !== 404) setError(`${e.code} — ${e.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const setRow = (cat: string, patch: Partial<ServiceRow>) => {
    setRows((r) => ({ ...r, [cat]: { ...r[cat], ...patch } }));
    setSavedCount(null);
  };

  const handleSave = async () => {
    if (!providerId) return;
    setError(null);

    const selected = Object.values(rows).filter((r) => r.checked);
    const problems: string[] = [];
    for (const r of selected) {
      if (!Number.isFinite(r.feeMin) || !Number.isFinite(r.feeMax) || r.feeMax < r.feeMin) {
        problems.push(CATEGORY_LABELS[r.taxonomyCode]);
      }
    }
    if (problems.length > 0) {
      setError(
        t("Fee maximum must be greater than or equal to fee minimum for: {services}", {
          services: problems.join(", "),
        }),
      );
      return;
    }

    setSubmitting(true);
    try {
      const { added } = await api.addProviderServices(
        providerId,
        selected.map(({ taxonomyCode, feeMin, feeMax, proBonoAvailable }) => ({
          taxonomyCode,
          feeMin,
          feeMax,
          proBonoAvailable,
        })),
      );
      setSavedCount(added);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.code} — ${err.message}`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!providerId) {
    return (
      <div className="container-narrow" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-10)" }}>
        <p className="eyebrow">{t("Professional profile")}</p>
        <h1 className="h-section mt-3">{t("No professional profile on this account yet.")}</h1>
        <p className="small mt-3" style={{ maxWidth: 560 }}>
          {t(
            "Services and fees are edited on the professional surface. Create your profile first — identity and credentials are verified separately.",
          )}
        </p>
        <div className="intake-result__actions mt-6">
          <Link to="/provider/join" className="btn btn--primary">
            {t("Create a professional profile")}
          </Link>
          <Link to="/profile" className="btn btn--ghost">
            {t("Back to your account")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-10)" }}>
      <p className="eyebrow">{t("Professional profile")}</p>
      <h1 className="h-section mt-3">{t("Services & verification.")}</h1>
      <p className="small mt-3" style={{ maxWidth: 560 }}>
        {t(
          "Your display name, district and languages are fixed at profile creation. Services, fees and pro bono availability are what citizens see on your panel card.",
        )}
      </p>

      {/* ---------- Section A: services ---------- */}
      <section className="mt-8">
        <h2 className="h-micro">{t("Services")}</h2>
        <p className="small mt-2" style={{ maxWidth: 560 }}>
          {t("Tick each service you offer and set its fee range. Saving upserts by service — unchecked services are left unchanged.")}
        </p>

        <div className="mt-5" style={{ display: "grid", gap: "var(--sp-3)" }}>
          {(Object.keys(CATEGORY_LABELS) as TaxCategory[]).map((cat) => {
            const row = rows[cat];
            return (
              <div
                key={cat}
                className={`check-chip check-chip--wide ${row.checked ? "is-on" : ""}`}
                style={{ display: "grid", gap: "var(--sp-3)", padding: "var(--sp-4)" }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => setRow(cat, { checked: !row.checked })}
                  />
                  <span className="h-micro">{t(CATEGORY_LABELS[cat])}</span>
                </label>
                {row.checked && (
                  <div className="fee-grid">
                    <div className="field">
                      <label className="field__label" htmlFor={`fee-min-${cat}`}>{t("Fee minimum (₹)")}</label>
                      <input
                        id={`fee-min-${cat}`}
                        className="field__input tabular"
                        type="number"
                        min={0}
                        value={row.feeMin}
                        onChange={(e) => setRow(cat, { feeMin: Number(e.target.value) })}
                      />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor={`fee-max-${cat}`}>{t("Fee maximum (₹)")}</label>
                      <input
                        id={`fee-max-${cat}`}
                        className="field__input tabular"
                        type="number"
                        min={0}
                        value={row.feeMax}
                        onChange={(e) => setRow(cat, { feeMax: Number(e.target.value) })}
                      />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={row.proBonoAvailable}
                        onChange={() => setRow(cat, { proBonoAvailable: !row.proBonoAvailable })}
                      />
                      <span className="small">{t("Pro bono available")}</span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {savedCount !== null && (
          <div className="mt-5" role="status">
            <StatusLabel label={t("SAVED")} />
            <span className="small"> {t("{count} service(s) saved.", { count: String(savedCount) })}</span>
          </div>
        )}
        {error && (
          <p className="field__error mt-4" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6">
          <Button onClick={() => void handleSave()} disabled={submitting}>
            {submitting ? t("Saving…") : t("Save services")}
          </Button>
        </div>
      </section>

      {/* ---------- Section B: verification (read-only) ---------- */}
      <section className="mt-8">
        <h2 className="h-micro">{t("Verification")}</h2>
        {verification ? (
          <>
            <div className="mt-4">
              <StatusLabel label={t(verification.tier)} />
            </div>
            <p className="small mt-3">
              {t("Freshness window: {days} days.", { days: String(verification.freshnessWindowDays) })}
            </p>
            {verification.checks.length > 0 && (
              <ul className="small mt-3" style={{ paddingLeft: "1.2rem", maxWidth: 560 }}>
                {verification.checks.map((c, i) => (
                  <li key={i}>
                    {t(c.checkType)} — {t(c.result)}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="small mt-4" style={{ maxWidth: 560 }}>
            {t("No verification decision on file yet.")}
          </p>
        )}
        <div className="intake-result__actions mt-5">
          <Link to="/provider/verification" className="btn btn--outline">
            {t("Open verification surface")}
          </Link>
        </div>
      </section>
    </div>
  );
}
