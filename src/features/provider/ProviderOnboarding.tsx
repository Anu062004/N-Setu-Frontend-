import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api, ApiError } from "../../lib/api";
import {
  LEG_LABELS,
  REQUIRED_LEGS,
  sortLegs,
} from "../../lib/verification";
import type {
  CredentialLeg,
  CredentialPath,
  ProviderType,
  ServiceMode,
  TaxCategory,
  VerificationCaseResult,
} from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { SCHEDULED_LANGUAGES } from "../../lib/languages";
import { STATES, districtsFor } from "../../lib/regions";
import { useI18n } from "../../lib/i18n";

const PROVIDER_TYPES: { value: ProviderType; label: string }[] = [
  { value: "ADVOCATE", label: "Advocate" },
  { value: "NOTARY", label: "Notary" },
  { value: "MEDIATOR", label: "Mediator" },
  { value: "PARALEGAL", label: "Paralegal volunteer" },
  { value: "COUNSEL", label: "Counsel (institutional)" },
];

const LANGUAGES = SCHEDULED_LANGUAGES;

const DISTRICTS = districtsFor;
const STATES_ = STATES;

const PATHS: { value: CredentialPath; label: string; hint: string }[] = [
  { value: "ISSUER_FETCH", label: "Issuer fetch", hint: "Authorized requester/issuer integration — can contribute to FULLY VERIFIED where the source is LIVE" },
  { value: "AUTHORITY_LOOKUP", label: "Authority lookup", hint: "Current register lookup where available (enrolment / currency)" },
  { value: "UPLOAD", label: "Upload document", hint: "Temporary processing, deleted after decision — can support DOCUMENT-VERIFIED, never FULLY VERIFIED alone" },
  { value: "NOT_NOW", label: "Not now", hint: "Caps the achievable tier — an OFF source never becomes PASS" },
];

const PROGRESS = ["Profile", "Practice", "Verification"];

export function ProviderOnboarding() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [providerType, setProviderType] = useState<ProviderType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [languages, setLanguages] = useState<string[]>(["hi", "en"]);
  const [serviceModes, setServiceModes] = useState<ServiceMode[]>(["IN_PERSON"]);
  const [feeMin, setFeeMin] = useState("800");
  const [feeMax, setFeeMax] = useState("1500");
  const [proBono, setProBono] = useState(true);
  const [taxonomies, setTaxonomies] = useState<TaxCategory[]>(["TENANCY"]);
  const [submissions, setSubmissions] = useState<Partial<Record<CredentialLeg, CredentialPath>>>({});
  const [result, setResult] = useState<VerificationCaseResult | null>(null);
  const [legOutcomes, setLegOutcomes] = useState<{ leg: CredentialLeg; code: string; message: string }[]>([]);
  const [credentialRailOff, setCredentialRailOff] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canContinue =
    step === 0 ? providerType !== null && displayName.trim().length > 1 && district !== "" && state !== "" :
    step === 1 ? languages.length > 0 && serviceModes.length > 0 && taxonomies.length > 0 :
    true;

  const handleSubmit = async () => {
    if (!providerType) return;
    setSubmitting(true);
    setError(null);
    setLegOutcomes([]);
    setCredentialRailOff(false);
    try {
      const created = await api.createProvider({
        providerType,
        displayName: displayName.trim(),
        district,
        state,
        languages,
        serviceModes,
        feeMin: Number(feeMin) || 0,
        feeMax: Number(feeMax) || 0,
        taxonomyCodes: taxonomies,
        proBonoAvailable: proBono,
      });
      if (created.providerId) api.rememberProviderId(created.providerId);

      const legs = sortLegs(REQUIRED_LEGS[providerType]);
      const outcomes: { leg: CredentialLeg; code: string; message: string }[] = [];
      for (const leg of legs) {
        const path = submissions[leg];
        if (path !== "ISSUER_FETCH" && path !== "UPLOAD") continue;
        try {
          if (path === "ISSUER_FETCH") await api.submitCredentialIssuerFetch(created.providerId, leg);
          else await api.submitCredentialUpload(created.providerId, leg);
        } catch (e) {
          if (e instanceof ApiError) {
            outcomes.push({ leg, code: e.code, message: e.message });
            if (e.unavailable) setCredentialRailOff(true);
          } else {
            outcomes.push({ leg, code: "REQUEST_FAILED", message: "Submission failed" });
          }
        }
      }
      setLegOutcomes(outcomes);

      const verification = await api.getVerification(created.providerId);
      setResult({
        caseId: created.providerId,
        providerId: created.providerId,
        tier: verification.tier,
        decidedAt: verification.decidedAt,
        checks: verification.checks,
        requiredLegs: legs,
        freshnessWindowDays: verification.freshnessWindowDays,
      });
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${e.code} — ${e.message}`
          : e instanceof Error
            ? e.message
            : "Onboarding failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="intake-result" role="status">
        <StatusLabel label={t(result.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : result.tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")} />
        <h1 className="h-section mt-4">
          {result.tier === "FULLY_VERIFIED" && t("Verification complete — FULLY VERIFIED.")}
          {result.tier === "DOCUMENT_VERIFIED" && t("Verification complete — DOCUMENT-VERIFIED.")}
          {result.tier === "SELF_DECLARED" && t("Profile created — SELF-DECLARED.")}
        </h1>
        {credentialRailOff && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label={t("CREDENTIAL SOURCES OFF")} />
            <span className="small">
              {t(
                "Credential verification sources are not configured in this deployment, so submitted legs could not be checked. Your tier honestly reflects this — no source was simulated.",
              )}
            </span>
          </div>
        )}
        {legOutcomes.length > 0 && (
          <ul className="mt-4 verification-reasons">
            {legOutcomes.map((o) => (
              <li key={o.leg} className="verification-reason">
                <span className="h-micro">{t(LEG_LABELS[o.leg])}</span>
                <StatusLabel label={t("UNAVAILABLE")} />
                <span className="small">
                  <code className="meta">{o.code}</code> — {t(o.message)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-4 verification-reasons">
          {result.checks.map((c) => (
            <li key={c.checkType} className="verification-reason">
              <span className="h-micro">{t(LEG_LABELS[c.checkType])}</span>
              <StatusLabel label={t(c.result)} />
              <span className="small">{t(c.sourceLabel)}</span>
            </li>
          ))}
        </ul>
        <p className="small mt-4">
          {t("Decided {date} · verification case {caseId}. A stale FULLY VERIFIED degrades to DOCUMENT-VERIFIED automatically when the freshness window passes.", {
            date: new Date(result.decidedAt).toLocaleString("en-IN"),
            caseId: result.caseId,
          })}
        </p>
        <div className="mt-6 intake-result__actions">
          <a href="/provider/dashboard" className="btn btn--primary">{t("Open dashboard")}</a>
          <a href="/provider/verification" className="btn btn--outline">{t("Manage verification")}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="intake">
      <div className="container-narrow">
        <div className="intake-head">
          <p className="eyebrow">{t("Provider onboarding")}</p>
          <h1 className="h-section">
            {step === 0 && t("Create your professional profile")}
            {step === 1 && t("Practice details")}
            {step === 2 && t("Submit credentials")}
          </h1>
          <p className="small mt-3" style={{ maxWidth: 560 }}>
            {t("The credential rail verifies your identity against issuer-attested sources where available. Source availability is stated honestly — LIVE, DEMO ONLY or OFF.")}
          </p>
        </div>

        <div className="intake-progress" aria-label={t("Step {step} of 3", { step: step + 1 })}>
          {PROGRESS.map((label, i) => (
            <div key={label} className={`intake-progress__item ${i <= step ? "is-active" : ""}`}>
              <span className="section-number tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="small">{t(label)}</span>
            </div>
          ))}
        </div>

        <form
          className="intake-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) setStep(step + 1);
            else void handleSubmit();
          }}
        >
          {step === 0 && (
            <div className="intake-fields">
              <fieldset className="choice-grid">
                <legend className="sr-only">{t("Provider type")}</legend>
                {PROVIDER_TYPES.map((pt) => (
                  <label key={pt.value} className={`choice-card ${providerType === pt.value ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="providerType"
                      value={pt.value}
                      checked={providerType === pt.value}
                      onChange={() => setProviderType(pt.value)}
                    />
                    <span className="h-micro">{t(pt.label)}</span>
                  </label>
                ))}
              </fieldset>

              <div className="field">
                <label className="field__label" htmlFor="displayName">{t("Full name")}</label>
                <input
                  id="displayName"
                  className="field__input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("As it appears in your credentials")}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="state">{t("State")}</label>
                <select
                  id="state"
                  className="field__select"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict("");
                  }}
                >
                  <option value="">{t("Select state")}</option>
                  {STATES_.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="district">{t("District")}</label>
                <select
                  id="district"
                  className="field__select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!state}
                >
                  <option value="">{t("Select district")}</option>
                  {state && DISTRICTS(state).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="field__hint">
                  {state ? t("Districts of {state}", { state }) : t("Select a state first")}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="intake-fields">
              <div className="field">
                <label className="field__label">{t("Languages")}</label>
                <div className="checkbox-grid">
                  {LANGUAGES.map((l) => (
                    <label
                      key={l.code}
                      className={`check-chip check-chip--lang ${languages.includes(l.code) ? "is-on" : ""}`}
                      title={l.english}
                    >
                      <input
                        type="checkbox"
                        checked={languages.includes(l.code)}
                        onChange={() => toggle(languages, l.code, setLanguages)}
                      />
                      {l.native} <span className="check-chip__roman">{l.english}</span>
                    </label>
                  ))}
                </div>
                <p className="field__hint">
                  {t("22 scheduled languages, in their native script. Select every language you can serve in.")}
                </p>
              </div>

              <div className="field">
                <label className="field__label">{t("Service modes")}</label>
                <div className="checkbox-grid">
                  {(["IN_PERSON", "PHONE", "VIDEO"] as ServiceMode[]).map((m) => (
                    <label key={m} className={`check-chip ${serviceModes.includes(m) ? "is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={serviceModes.includes(m)}
                        onChange={() => toggle(serviceModes, m, setServiceModes)}
                      />
                      {t(m.replace("_", " "))}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field__label">{t("Services you offer")}</label>
                <div className="checkbox-grid">
                  {(Object.keys(CATEGORY_LABELS) as TaxCategory[]).map((cat) => (
                    <label key={cat} className={`check-chip ${taxonomies.includes(cat) ? "is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={taxonomies.includes(cat)}
                        onChange={() => toggle(taxonomies, cat, setTaxonomies)}
                      />
                      {t(CATEGORY_LABELS[cat])}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fee-grid">
                <div className="field">
                  <label className="field__label" htmlFor="feeMin">{t("Fee minimum (₹)")}</label>
                  <input id="feeMin" className="field__input" type="number" min={0} value={feeMin} onChange={(e) => setFeeMin(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="feeMax">{t("Fee maximum (₹)")}</label>
                  <input id="feeMax" className="field__input" type="number" min={0} value={feeMax} onChange={(e) => setFeeMax(e.target.value)} />
                </div>
              </div>

              <label className={`check-chip check-chip--wide ${proBono ? "is-on" : ""}`}>
                <input type="checkbox" checked={proBono} onChange={() => setProBono(!proBono)} />
                {t("Offer pro bono service (eligible for rotation and service credits)")}
              </label>
              <p className="field__hint">
                {t("Fees are disclosed before work and honoured. Platform commission: 0%. Third-party payment-processing charges may apply and are disclosed separately.")}
              </p>
            </div>
          )}

          {step === 2 && providerType && (
            <div className="intake-fields">
              <p className="h-micro">{t("Required checks — {type}", { type: t(providerType.replace("_", " ")) })}</p>
              {sortLegs(REQUIRED_LEGS[providerType]).map((leg) => (
                <div key={leg} className="credential-leg">
                  <div className="credential-leg__head">
                    <span className="h-micro">{t(LEG_LABELS[leg])}</span>
                    <StatusLabel label={t(!submissions[leg] || submissions[leg] === "NOT_NOW" ? "OFF" : "PENDING")} />
                  </div>
                  <div className="path-grid">
                    {PATHS.map((p) => (
                      <label key={p.value} className={`path-option ${submissions[leg] === p.value ? "is-selected" : ""}`}>
                        <input
                          type="radio"
                          name={`leg-${leg}`}
                          checked={submissions[leg] === p.value}
                          onChange={() => setSubmissions((s) => ({ ...s, [leg]: p.value }))}
                        />
                        <span className="small">{t(p.label)}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field__hint">
                    {t(PATHS.find((p) => p.value === submissions[leg])?.hint ?? "Select how this leg is verified.")}
                  </p>
                </div>
              ))}
              <p className="small">
                {t("Two hard rules: a format check on an enrolment number is never verification, and the system never infers a tier from a pattern. A DEMO ONLY upload can support DOCUMENT-VERIFIED but can never produce FULLY VERIFIED alone.")}
              </p>
            </div>
          )}

          {error && <p className="field__error mt-4">{t(error)}</p>}

          <div className="intake-nav mt-6">
            {step > 0 && (
              <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>{t("← Back")}</button>
            )}
            <Button type="submit" disabled={!canContinue || submitting}>
              {step === 2 ? (submitting ? t("Verifying…") : t("Submit verification")) : t("Continue")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}