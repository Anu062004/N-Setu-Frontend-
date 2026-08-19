import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api } from "../../lib/api";
import type { Grievance, TaxCategory } from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { useI18n } from "../../lib/i18n";

const PIPELINE = [
  "OPEN",
  "TRIAGED",
  "PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA",
] as const;

export function Grievance() {
  const { t } = useI18n();
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<TaxCategory>("OTHER");
  const [related, setRelated] = useState("");
  const [urgency, setUrgency] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Grievance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (summary.trim().length < 10) return;
    setSubmitting(true);
    setError(null);
    try {
      const g = await api.fileGrievance({
        summary: summary.trim(),
        relatedBookingId: related.includes("bk_") ? related : undefined,
        relatedMatterId: related.includes("m_") ? related : undefined,
        category,
        urgency,
      });
      setResult(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to file grievance");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="intake-result" role="status">
        <StatusLabel label={t(result.status)} />
        <h1 className="h-section mt-4">{t("Grievance filed")}</h1>
        <p className="small mt-4" style={{ maxWidth: 520 }}>
          {t("{id} · {summary} — the grievance pipeline starts here. The platform packages a clean evidence trail for the statutory body that owns the outcome.", {
            id: result.id,
            summary: t(result.summary),
          })}
        </p>
        <div className="intake-result__actions mt-6">
          <Link to="/portal" className="btn btn--primary">{t("Back to my portal")}</Link>
          <Link to="/how-it-works" className="btn btn--ghost">{t("How grievances work →")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grievance">
      <div className="container-narrow">
        <p className="eyebrow">{t("Citizen grievance")}</p>
        <h1 className="h-section">{t("File a grievance")}</h1>
        <p className="small mt-3" style={{ maxWidth: 560 }}>
          {t("Objective, platform-observable issues — a quote not honoured, a no-show, a fee not disclosed before work, a payment demanded on a legal-aid matter. The platform packages evidence; it does not adjudicate.")}
        </p>

        <form
          className="auth-form mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="summary">{t("What happened?")}</label>
            <textarea
              id="summary"
              className="field__input"
              rows={4}
              placeholder={t("Describe the issue in plain language — facts only, no legal jargon required.")}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <p className="field__hint">{t("Facts only. This text is stored for the evidence trail.")}</p>
          </div>

          <div className="fee-grid mt-4">
            <div className="field">
              <label className="field__label" htmlFor="category">{t("Category")}</label>
              <select
                id="category"
                className="field__select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaxCategory)}
              >
                {(Object.keys(CATEGORY_LABELS) as TaxCategory[]).map((code) => (
                  <option key={code} value={code}>{t(CATEGORY_LABELS[code])}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="urgency">{t("Urgency")}</label>
              <select
                id="urgency"
                className="field__select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as "NORMAL" | "URGENT")}
              >
                <option value="NORMAL">{t("Normal")}</option>
                <option value="URGENT">{t("Urgent")}</option>
              </select>
            </div>
          </div>

          <div className="field mt-4">
            <label className="field__label" htmlFor="related">{t("Related booking or matter (optional)")}</label>
            <input
              id="related"
              className="field__input"
              placeholder={t("e.g. bk_4f2a1c or m_1055")}
              value={related}
              onChange={(e) => setRelated(e.target.value)}
            />
          </div>

          {error && <p className="field__error mt-4">{t(error)}</p>}

          <div className="mt-6">
            <Button type="submit" block disabled={summary.trim().length < 10 || submitting}>
              {submitting ? t("Filing…") : t("File grievance")}
            </Button>
          </div>
        </form>

        <div className="credential-leg mt-6">
          <div className="credential-leg__head">
            <span className="h-micro">{t("The pipeline")}</span>
          </div>
          <p className="small mt-3">{PIPELINE.map((s) => t(s)).join(" → ")}</p>
          <p className="small mt-3">
            {t("Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform tracks the outcome so institutions see it — it never publishes verdicts.")}
          </p>
        </div>
      </div>
    </div>
  );
}