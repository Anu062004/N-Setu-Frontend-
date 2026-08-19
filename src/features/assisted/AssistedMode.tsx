import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

export function AssistedMode() {
  const { t } = useI18n();
  const [active, setActive] = useState(false);

  return (
    <div className="assisted">
      <div className="container-narrow">
        <p className="eyebrow">{t("CSC / VLE assisted mode")}</p>
        <h1 className="h-section">{t("Act for a citizen — with consent")}</h1>
        <p className="lede mt-4">
          {t(
            "You act on behalf of a citizen who has no smartphone. Every action in this window is recorded against both of you, under a recorded consent reference."
          )}
        </p>

        {active && (
          <div className="assisted-banner" role="status">
            <StatusLabel label={t("ASSISTED SESSION")} />
            <span className="small">
              {t("Acting for Citizen #8842 · Consent recorded (consent_ref c_0938) · Expires 18:30")}
            </span>
          </div>
        )}

        <SmartImage
          src="/assist/assist-kiosk.png"
          alt={t("A CSC operator helping a citizen at a kiosk")}
          className="slot-banner slot-banner--16x9 mt-6"
        />

        <div className="assisted-card mt-6">
          <h2 className="h-micro">{active ? t("Session active") : t("Open a delegated session")}</h2>
          <p className="small mt-3">
            {t(
              "The operator is never the citizen. The session records who acted, for whom, under what consent, over what window — and every write carries both principals into the audit log."
            )}
          </p>

          {!active ? (
            <div className="assisted-form mt-5">
              <div className="field">
                <label className="field__label" htmlFor="citizenPhone">{t("Citizen phone")}</label>
                <input id="citizenPhone" className="field__input" placeholder={t("10-digit mobile")} />
              </div>
              <div className="field mt-4">
                <label className="field__label" htmlFor="consent">{t("Consent reference")}</label>
                <input id="consent" className="field__input" placeholder={t("e.g. verbal consent recorded at 17:40")} />
              </div>
              <div className="field mt-4">
                <label className="field__label" htmlFor="duration">{t("Session length")}</label>
                <select id="duration" className="field__select" defaultValue="60">
                  <option value="60">{t("60 minutes")}</option>
                  <option value="120">{t("120 minutes")}</option>
                </select>
              </div>
              <Button className="mt-5" onClick={() => setActive(true)}>
                {t("Open delegated session")}
              </Button>
              <p className="small mt-3">
                {t(
                  "A banner will stay visible for the whole session so operator identity is never confused with citizen identity."
                )}
              </p>
            </div>
          ) : (
            <div className="assisted-actions mt-5">
              <Link to="/start" className="btn btn--primary">{t("Complete citizen intake")}</Link>
              <Link to="/assist/audit" className="btn btn--outline">{t("Session audit log")}</Link>
              <Button variant="ghost" onClick={() => setActive(false)}>{t("Close session")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}