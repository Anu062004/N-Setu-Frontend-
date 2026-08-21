import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  DISTRICT_FLOOR_BY_CATEGORY,
  SECTION12_CATEGORIES,
  SECTION12_LABELS,
  decideRoute,
} from "../../lib/eligibility";
import type { Channel, Route, TaxCategory } from "../../lib/types";
import { formatINR } from "../../lib/format";
import { useIntake } from "./IntakeContext";
import { SCHEDULED_LANGUAGES, languageLabel } from "../../lib/languages";
import { STATES, districtsFor } from "../../lib/regions";
import { useI18n } from "../../lib/i18n";

export function Intake() {
  const { t } = useI18n();
  const { state, setStep, setField, submit } = useIntake();
  const [searchParams] = useSearchParams();

  const [done, setDone] = useState<null | { route: Route; reason: string }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("step") === "eligibility") {
      setStep(2);
    }
  }, [searchParams, setStep]);

  const floor = state.taxonomyCode
    ? (DISTRICT_FLOOR_BY_CATEGORY[state.taxonomyCode] ?? 3000)
    : 3000;
  const cat = state.taxonomyCode ?? "OTHER";

  const canContinue =
    state.step === 0 ? state.taxonomyCode !== null :
    state.step === 1 ? state.district !== "" && state.language !== "" :
    state.step === 2 ? true :
    state.step === 3 ? true : false;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { need, decision } = await submit();
      const route =
        decision ??
        decideRoute({
          selfDeclaredSection12: need.selfDeclaredSection12,
          feeCeiling: need.feeCeiling,
          districtFloor: floor,
        });
      setDone({ route: route.route, reason: route.reason });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="intake-result" role="status">
        <StatusLabel
          label={
            done.route === "LEGAL_AID_REFERRAL" ? t("LEGAL AID REFERRAL") :
            done.route === "PRO_BONO_ROTATION" ? t("PRO BONO ROTATION") : t("PAID DIRECTORY")
          }
        />
        <h1 className="h-section mt-4">
          {done.route === "LEGAL_AID_REFERRAL" && t("You are entitled to free legal aid.")}
          {done.route === "PRO_BONO_ROTATION" && t("You are assigned the next advocate on duty.")}
          {done.route === "PAID" && t("Choose from verified professionals near you.")}
        </h1>
        <p className="lede mt-4">
          {done.route === "PRO_BONO_ROTATION" && state.feeCeiling !== null
            ? t(
                "Your fee ceiling (₹{ceiling}) is below the {floor} floor for this category in your district. You are routed to the pro bono duty rotation — you are assigned the next advocate on duty.",
                {
                  ceiling: state.feeCeiling.toLocaleString("en-IN"),
                  floor: floor.toLocaleString("en-IN"),
                }
              )
            : t(done.reason)}
        </p>

        <div className="mt-6 intake-result__actions">
          {done.route === "LEGAL_AID_REFERRAL" && (
            <a href={`/referral/${state.needId ?? ""}`} className="btn btn--primary">
              {t("View your referral")}
            </a>
          )}
          {done.route === "PRO_BONO_ROTATION" && (
            <a href={`/rotation/${state.needId ?? ""}`} className="btn btn--primary">
              {t("See your assigned advocate")}
            </a>
          )}
          {done.route === "PAID" && (
            <a href={`/directory/${state.needId ?? ""}`} className="btn btn--primary">
              {t("View available professionals")}
            </a>
          )}
          <a href="/portal" className="btn btn--outline">
            {t("Track in my portal")}
          </a>
          <button className="btn btn--ghost" onClick={() => window.location.reload()}>
            {t("Start over")}
          </button>
        </div>
        <p className="small mt-4">
          {t("One route is shown — {route}. Eligibility is checked before any paid booking.", {
            route: done.route === "PAID" ? t("the paid directory") : t("not the paid directory"),
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="intake">
      <div className="container-narrow">
        <div className="intake-head">
          <p className="eyebrow">{t("Citizen intake")}</p>
          <h1 className="h-section">
            {state.step === 0 && t("What do you need help with?")}
            {state.step === 1 && t("A little about you")}
            {state.step === 2 && t("Can you afford a lawyer?")}
            {state.step === 3 && t("Check your route")}
          </h1>
          <p className="small mt-3" style={{ maxWidth: 560 }}>
            {t(
              "Plain language, no legal jargon. Your problem category is selected from a fixed list — no free-text narrative is stored."
            )}
          </p>
        </div>

        <div className="intake-progress" aria-label={t("Step {step} of 4", { step: state.step + 1 })}>
          {["Your problem", "About you", "Eligibility", "Get help"].map((label, i) => (
            <div key={label} className={`intake-progress__item ${i <= state.step ? "is-active" : ""}`}>
              <span className="section-number tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="small">{t(label)}</span>
            </div>
          ))}
        </div>

        <form
          className="intake-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (state.step < 3) {
              setStep(state.step + 1);
            } else {
              void handleSubmit();
            }
          }}
        >
          {state.step === 0 && (
            <fieldset className="choice-grid" disabled={false}>
              <legend className="sr-only">{t("Choose your legal problem")}</legend>
              {(Object.keys(CATEGORY_LABELS) as TaxCategory[]).map((cat) => (
                <label key={cat} className={`choice-card ${state.taxonomyCode === cat ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="taxonomy"
                    value={cat}
                    checked={state.taxonomyCode === cat}
                    onChange={() => setField("taxonomyCode", cat)}
                  />
                  <span className="h-micro">{t(CATEGORY_LABELS[cat])}</span>
                  <span className="small">{t(CATEGORY_DESCRIPTIONS[cat])}</span>
                </label>
              ))}
            </fieldset>
          )}

          {state.step === 1 && (
            <div className="intake-fields">
              <div className="field">
                <label className="field__label" htmlFor="state">{t("State")}</label>
                <select
                  id="state"
                  className="field__select"
                  value={state.state}
                  onChange={(e) => {
                    setField("state", e.target.value);
                    setField("district", "");
                  }}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="district">{t("District")}</label>
                <select
                  id="district"
                  className="field__select"
                  value={state.district}
                  onChange={(e) => setField("district", e.target.value)}
                >
                  <option value="">{t("Select your district")}</option>
                  {districtsFor(state.state).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <p className="field__hint">
                  {state.district
                    ? `${state.district}, ${state.state}`
                    : t("Choose a district in {state}", { state: state.state })}
                </p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="language">{t("Language")}</label>
                <select
                  id="language"
                  className="field__select"
                  value={state.language}
                  onChange={(e) => setField("language", e.target.value)}
                >
                  {SCHEDULED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {languageLabel(l.code)}
                    </option>
                  ))}
                </select>
                <p className="field__hint">
                  {t(
                    "All 22 scheduled languages of the Indian Constitution are supported, in their native script."
                  )}
                </p>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="mode">{t("How would you like help?")}</label>
                <select
                  id="mode"
                  className="field__select"
                  value={state.modePref}
                  onChange={(e) => setField("modePref", e.target.value as Channel)}
                >
                  <option value="APP">{t("On this app")}</option>
                  <option value="PHONE">{t("By phone call")}</option>
                  <option value="VIDEO">{t("By video call")}</option>
                </select>
                <p className="field__hint">
                  {t("A preference only — the allocated professional confirms what is possible.")}
                </p>
              </div>
            </div>
          )}

          {state.step === 2 && (
            <div className="intake-fields">
              <div className="field">
                <label className="field__label" htmlFor="feeCeiling">
                  {t("Highest fee you can pay per matter")}
                </label>
                <input
                  id="feeCeiling"
                  className="field__input"
                  type="number"
                  min={0}
                  step={100}
                  placeholder={t("Floor for {category} in your district: {floor}", {
                    category: t(CATEGORY_LABELS[cat]),
                    floor: formatINR(floor),
                  })}
                  value={state.feeCeiling === null ? "" : state.feeCeiling}
                  onChange={(e) =>
                    setField("feeCeiling", e.target.value === "" ? null : Number(e.target.value))
                  }
                />
                <p className="field__hint">
                  {t(
                    "If your ceiling is below the district floor for this category, you are routed to the pro bono rotation — no payment required."
                  )}
                </p>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="section12">
                  {t("Do any of these apply to you?")}
                </label>
                <select
                  id="section12"
                  className="field__select"
                  value={state.selfDeclaredSection12 ?? ""}
                  onChange={(e) => setField("selfDeclaredSection12", e.target.value || null)}
                >
                  <option value="">{t("None of these apply")}</option>
                  {SECTION12_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{t(SECTION12_LABELS[c])}</option>
                  ))}
                </select>
                <p className="field__hint">
                  {t(
                    "Section 12, Legal Services Authorities Act 1987. If you declare a category, you are referred to free legal aid — you will not be charged. This is not a means test and does not affect any other government benefit."
                  )}
                </p>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="urgency">{t("Urgency")}</label>
                <select
                  id="urgency"
                  className="field__select"
                  value={state.urgency}
                  onChange={(e) => setField("urgency", e.target.value as "NORMAL" | "URGENT")}
                >
                  <option value="NORMAL">{t("Normal")}</option>
                  <option value="URGENT">{t("Urgent — hearing or deadline soon")}</option>
                </select>
              </div>
            </div>
          )}

          {state.step === 3 && (
            <div className="eligibility-summary">
              <table className="table">
                <tbody>
                  <tr>
                    <td className="small">{t("Problem")}</td>
                    <td className="small" style={{ textAlign: "right" }}>{t(CATEGORY_LABELS[cat])}</td>
                  </tr>
                  <tr>
                    <td className="small">{t("State / district")}</td>
                    <td className="small" style={{ textAlign: "right" }}>
                      {state.district ? `${state.district}, ${state.state}` : state.state}
                    </td>
                  </tr>
                  <tr>
                    <td className="small">{t("Language")}</td>
                    <td className="small" style={{ textAlign: "right" }}>{languageLabel(state.language)}</td>
                  </tr>
                  <tr>
                    <td className="small">{t("Section 12 declaration")}</td>
                    <td className="small" style={{ textAlign: "right" }}>
                      {state.selfDeclaredSection12 ? t(SECTION12_LABELS[state.selfDeclaredSection12]) : t("None")}
                    </td>
                  </tr>
                  <tr>
                    <td className="small">{t("Fee ceiling")}</td>
                    <td className="small" style={{ textAlign: "right" }}>
                      {state.feeCeiling === null ? t("Not stated") : formatINR(state.feeCeiling)}
                    </td>
                  </tr>
                  <tr>
                    <td className="small">{t("District floor ({category})", { category: t(CATEGORY_LABELS[cat]) })}</td>
                    <td className="small" style={{ textAlign: "right" }}>{formatINR(floor)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="small mt-4">
                {t(
                  "The route below is computed by the eligibility router before any paid flow. Self declaration is sufficient to route; the DLSA verifies."
                )}
              </p>
            </div>
          )}

          {error && <p className="field__error mt-4">{t(error)}</p>}

          <div className="intake-nav mt-6">
            {state.step > 0 && (
              <button type="button" className="btn btn--ghost" onClick={() => setStep(state.step - 1)}>
                {t("← Back")}
              </button>
            )}
            <Button type="submit" disabled={!canContinue || submitting}>
              {state.step === 3 ? (submitting ? t("Checking…") : t("Check my route")) : t("Continue")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}