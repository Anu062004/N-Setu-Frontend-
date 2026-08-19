import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api } from "../../lib/api";
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
  { value: "ISSUER_FETCH", label: "Issuer fetch (LIVE)", hint: "Authorized requester/issuer integration — can contribute to FULLY VERIFIED" },
  { value: "AUTHORITY_LOOKUP", label: "Authority lookup (LIVE)", hint: "Current register lookup where available (enrolment / currency)" },
  { value: "UPLOAD", label: "Upload document", hint: "Temporary processing, deleted after decision — DEMO ONLY" },
  { value: "NOT_NOW", label: "Not now (OFF)", hint: "Caps the achievable tier" },
];

const PROGRESS = ["Profile", "Practice", "Verification"];

export function ProviderOnboarding() {
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
      const legs = sortLegs(REQUIRED_LEGS[providerType]);
      const result_ = await api.submitVerification(
        created.providerId,
        legs.map((leg) => ({ leg, path: submissions[leg] ?? "NOT_NOW" })),
      );
      setResult(result_);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onboarding failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="intake-result" role="status">
        <StatusLabel label={result.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : result.tier} />
        <h1 className="h-section mt-4">
          {result.tier === "FULLY_VERIFIED" && "Verification complete — FULLY VERIFIED."}
          {result.tier === "DOCUMENT_VERIFIED" && "Verification complete — DOCUMENT-VERIFIED."}
          {result.tier === "SELF_DECLARED" && "Profile created — SELF-DECLARED."}
        </h1>
        <ul className="mt-4 verification-reasons">
          {result.checks.map((c) => (
            <li key={c.checkType} className="verification-reason">
              <span className="h-micro">{LEG_LABELS[c.checkType]}</span>
              <StatusLabel label={c.result} />
              <span className="small">{c.sourceLabel}</span>
            </li>
          ))}
        </ul>
        <p className="small mt-4">
          Decided {new Date(result.decidedAt).toLocaleString("en-IN")} · verification case {result.caseId}.
          A stale FULLY VERIFIED degrades to DOCUMENT-VERIFIED automatically when the freshness
          window passes.
        </p>
        <div className="mt-6 intake-result__actions">
          <a href="/provider/dashboard" className="btn btn--primary">Open dashboard</a>
          <a href="/provider/verification" className="btn btn--outline">Manage verification</a>
        </div>
      </div>
    );
  }

  return (
    <div className="intake">
      <div className="container-narrow">
        <div className="intake-head">
          <p className="eyebrow">Provider onboarding</p>
          <h1 className="h-section">
            {step === 0 && "Create your professional profile"}
            {step === 1 && "Practice details"}
            {step === 2 && "Submit credentials"}
          </h1>
          <p className="small mt-3" style={{ maxWidth: 560 }}>
            The credential rail verifies your identity against issuer-attested sources where
            available. Source availability is stated honestly — LIVE, DEMO ONLY or OFF.
          </p>
        </div>

        <div className="intake-progress" aria-label={`Step ${step + 1} of 3`}>
          {PROGRESS.map((label, i) => (
            <div key={label} className={`intake-progress__item ${i <= step ? "is-active" : ""}`}>
              <span className="section-number tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="small">{label}</span>
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
                <legend className="sr-only">Provider type</legend>
                {PROVIDER_TYPES.map((t) => (
                  <label key={t.value} className={`choice-card ${providerType === t.value ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="providerType"
                      value={t.value}
                      checked={providerType === t.value}
                      onChange={() => setProviderType(t.value)}
                    />
                    <span className="h-micro">{t.label}</span>
                  </label>
                ))}
              </fieldset>

              <div className="field">
                <label className="field__label" htmlFor="displayName">Full name</label>
                <input
                  id="displayName"
                  className="field__input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="As it appears in your credentials"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="state">State</label>
                <select
                  id="state"
                  className="field__select"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict("");
                  }}
                >
                  <option value="">Select state</option>
                  {STATES_.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="district">District</label>
                <select
                  id="district"
                  className="field__select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!state}
                >
                  <option value="">Select district</option>
                  {state && DISTRICTS(state).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="field__hint">
                  {state ? `Districts of ${state}` : "Select a state first"}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="intake-fields">
              <div className="field">
                <label className="field__label">Languages</label>
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
                  22 scheduled languages, in their native script. Select every language you can
                  serve in.
                </p>
              </div>

              <div className="field">
                <label className="field__label">Service modes</label>
                <div className="checkbox-grid">
                  {(["IN_PERSON", "PHONE", "VIDEO"] as ServiceMode[]).map((m) => (
                    <label key={m} className={`check-chip ${serviceModes.includes(m) ? "is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={serviceModes.includes(m)}
                        onChange={() => toggle(serviceModes, m, setServiceModes)}
                      />
                      {m.replace("_", " ")}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="field__label">Services you offer</label>
                <div className="checkbox-grid">
                  {(Object.keys(CATEGORY_LABELS) as TaxCategory[]).map((t) => (
                    <label key={t} className={`check-chip ${taxonomies.includes(t) ? "is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={taxonomies.includes(t)}
                        onChange={() => toggle(taxonomies, t, setTaxonomies)}
                      />
                      {CATEGORY_LABELS[t]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="fee-grid">
                <div className="field">
                  <label className="field__label" htmlFor="feeMin">Fee minimum (₹)</label>
                  <input id="feeMin" className="field__input" type="number" min={0} value={feeMin} onChange={(e) => setFeeMin(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="feeMax">Fee maximum (₹)</label>
                  <input id="feeMax" className="field__input" type="number" min={0} value={feeMax} onChange={(e) => setFeeMax(e.target.value)} />
                </div>
              </div>

              <label className={`check-chip check-chip--wide ${proBono ? "is-on" : ""}`}>
                <input type="checkbox" checked={proBono} onChange={() => setProBono(!proBono)} />
                Offer pro bono service (eligible for rotation and service credits)
              </label>
              <p className="field__hint">
                Fees are disclosed before work and honoured. Platform commission: 0%. Third-party
                payment-processing charges may apply and are disclosed separately.
              </p>
            </div>
          )}

          {step === 2 && providerType && (
            <div className="intake-fields">
              <p className="h-micro">Required checks — {providerType.replace("_", " ")}</p>
              {sortLegs(REQUIRED_LEGS[providerType]).map((leg) => (
                <div key={leg} className="credential-leg">
                  <div className="credential-leg__head">
                    <span className="h-micro">{LEG_LABELS[leg]}</span>
                    <StatusLabel label={submissions[leg] === "NOT_NOW" || !submissions[leg] ? "OFF" : submissions[leg] === "UPLOAD" ? "DEMO ONLY" : "LIVE"} />
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
                        <span className="small">{p.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field__hint">
                    {(PATHS.find((p) => p.value === submissions[leg])?.hint ?? "Select how this leg is verified.")}
                  </p>
                </div>
              ))}
              <p className="small">
                Two hard rules: a format check on an enrolment number is never verification, and the
                system never infers a tier from a pattern. A DEMO ONLY upload can support
                DOCUMENT-VERIFIED but can never produce FULLY VERIFIED alone.
              </p>
            </div>
          )}

          {error && <p className="field__error mt-4">{error}</p>}

          <div className="intake-nav mt-6">
            {step > 0 && (
              <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>← Back</button>
            )}
            <Button type="submit" disabled={!canContinue || submitting}>
              {step === 2 ? (submitting ? "Verifying…" : "Submit verification") : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}