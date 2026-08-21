import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

interface Delegation {
  id: string;
  endsAt?: string;
  consentRef?: string;
}

export function AssistedMode() {
  const { t } = useI18n();
  const [citizenPhone, setCitizenPhone] = useState("");
  const [consent, setConsent] = useState("");
  const [duration, setDuration] = useState("60");
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openSession = async () => {
    if (citizenPhone.length < 10 || consent.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      const d = await api.openDelegation({
        citizenPhone,
        consentRef: consent.trim(),
        durationMinutes: Number(duration),
      });
      setDelegation({ id: d.id, endsAt: d.endsAt, consentRef: d.consentRef ?? consent.trim() });
    } catch (e) {
      setError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Could not open session",
      );
    } finally {
      setBusy(false);
    }
  };

  const closeSession = async () => {
    if (!delegation) return;
    setBusy(true);
    setError(null);
    try {
      await api.closeDelegation(delegation.id);
      setDelegation(null);
      setCitizenPhone("");
      setConsent("");
    } catch (e) {
      setError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Could not close session",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="assisted">
      <div className="container-narrow">
        <p className="eyebrow">{t("CSC / VLE assisted mode")}</p>
        <h1 className="h-section">{t("Act for a citizen — with consent")}</h1>
        <p className="lede mt-4">
          {t(
            "You act on behalf of a citizen who has no smartphone. Every action in this window is recorded against both of you, under a recorded consent reference.",
          )}
        </p>

        {delegation && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label={t("ASSISTED SESSION")} />
            <span className="small tabular">
              {t("Delegation {id}", { id: delegation.id })}
              {delegation.endsAt
                ? ` · ${t("Expires {time}", { time: new Date(delegation.endsAt).toLocaleTimeString("en-IN") })}`
                : ""}
              {delegation.consentRef ? ` · ${t("Consent {ref}", { ref: delegation.consentRef })}` : ""}
            </span>
          </div>
        )}

        <SmartImage
          src="/assist/assist-kiosk.png"
          alt={t("A CSC operator helping a citizen at a kiosk")}
          className="slot-banner slot-banner--16x9 mt-6"
        />

        <div className="assisted-card mt-6">
          <h2 className="h-micro">{delegation ? t("Session active") : t("Open a delegated session")}</h2>
          <p className="small mt-3">
            {t(
              "The operator is never the citizen. The session records who acted, for whom, under what consent, over what window — and every write carries both principals into the audit log.",
            )}
          </p>

          {!delegation ? (
            <div className="assisted-form mt-5">
              <div className="field">
                <label className="field__label" htmlFor="citizenPhone">{t("Citizen phone")}</label>
                <input
                  id="citizenPhone"
                  className="field__input"
                  inputMode="tel"
                  placeholder={t("10-digit mobile")}
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
              <div className="field mt-4">
                <label className="field__label" htmlFor="consent">{t("Consent reference")}</label>
                <input
                  id="consent"
                  className="field__input"
                  placeholder={t("e.g. verbal consent recorded at 17:40")}
                  value={consent}
                  onChange={(e) => setConsent(e.target.value)}
                />
              </div>
              <div className="field mt-4">
                <label className="field__label" htmlFor="duration">{t("Session length")}</label>
                <select id="duration" className="field__select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="60">{t("60 minutes")}</option>
                  <option value="120">{t("120 minutes")}</option>
                </select>
              </div>
              <Button
                className="mt-5"
                onClick={() => void openSession()}
                disabled={busy || citizenPhone.length < 10 || consent.trim().length < 3}
              >
                {busy ? t("Opening…") : t("Open delegated session")}
              </Button>
              {error && <p className="field__error mt-4" role="alert">{t(error)}</p>}
              <p className="small mt-3">
                {t(
                  "A banner will stay visible for the whole session so operator identity is never confused with citizen identity.",
                )}
              </p>
            </div>
          ) : (
            <div className="assisted-actions mt-5">
              <Link to="/start" className="btn btn--primary">{t("Complete citizen intake")}</Link>
              <Link to="/assist/audit" className="btn btn--outline">{t("Session audit log")}</Link>
              <Button variant="ghost" onClick={() => void closeSession()} disabled={busy}>
                {busy ? t("Closing…") : t("Close session")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
