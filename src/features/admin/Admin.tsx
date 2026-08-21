import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { useI18n } from "../../lib/i18n";

const FLAG_LABELS: Record<string, string> = {
  credentialDigiLocker: "CREDENTIAL_DIGILOCKER_MODE",
  credentialBar: "CREDENTIAL_BAR_MODE",
  credentialAibe: "CREDENTIAL_AIBE_MODE",
  caseStatus: "CASE_STATUS_MODE",
  payments: "PAYMENTS_MODE",
  ivr: "IVR_MODE",
  whatsapp: "WHATSAPP_MODE",
  institutionalExport: "INSTITUTIONAL_EXPORT_MODE",
};

export function Admin() {
  const { t } = useI18n();
  const [capabilities, setCapabilities] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .healthReady()
      .then((h) => alive && setCapabilities(h.capabilities ?? {}))
      .catch((e) =>
        alive && setError(e instanceof ApiError ? `${e.code} — ${e.message}` : "Health check failed"),
      );
    return () => {
      alive = false;
    };
  }, []);

  const rows: [string, string][] = capabilities
    ? Object.entries(capabilities).map(([k, v]) => [FLAG_LABELS[k] ?? k, String(v)])
    : [];

  return (
    <div className="admin">
      <div className="container">
        <p className="eyebrow">{t("Admin surface")}</p>
        <h1 className="h-section">{t("Capability flags & audit")}</h1>
        <p className="small mt-3" style={{ maxWidth: 620 }}>
          {t(
            "Every external adapter advertises LIVE, MOCK or OFF. There is no silent mock in production — the deployment manifest states each capability. A demo never visually represents a mock source as a government-confirmed result.",
          )}
        </p>

        {error && (
          <p className="field__error mt-4" role="alert">
            {t(error)}
          </p>
        )}

        <table className="table table--dense mt-6" style={{ maxWidth: 720 }}>
          <thead>
            <tr>
              <th>{t("Flag")}</th>
              <th>{t("Mode")}</th>
              <th>{t("Behaviour")}</th>
            </tr>
          </thead>
          <tbody>
            {!capabilities && (
              <tr>
                <td className="small" colSpan={3}>
                  {error ? t("Live capability state unavailable — showing nothing rather than guessing.") : t("Reading live capability state…")}
                </td>
              </tr>
            )}
            {rows.map(([flag, mode]) => {
              const modeLabel =
                mode === "LIVE" ? "LIVE" : mode === "MOCK" ? "DEMO ONLY" : mode === "SANDBOX" ? "SANDBOX" : mode;
              return (
                <tr key={flag}>
                  <td className="small tabular">{flag}</td>
                  <td>
                    <StatusLabel label={t(modeLabel)} />
                  </td>
                  <td className="small">
                    {mode === "OFF"
                      ? t("UI exposes limitation; workflow falls back to review")
                      : mode === "MOCK"
                        ? t("Synthetic fixture for demo; cannot produce FULLY VERIFIED")
                        : mode === "LINK_ONLY"
                          ? t("Returns official external continuation")
                          : mode === "LOCAL"
                            ? t("Signed local artefact; evidence, not official status")
                            : t("Real authorized/public source")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="dash-section mt-6" style={{ maxWidth: 720 }}>
          <h2 className="h-micro">{t("Acceptance guardrails (CI)")}</h2>
          <ul className="admin-list mt-4">
            <li className="small">{t("No citizen-facing DTO may contain score, rank, rating, recommended, topMatch, creditBalance or conductScore — build fails.")}</li>
            <li className="small">{t("No code path assigns a numeric quality score to a provider.")}</li>
            <li className="small">{t("Directory ordering replays from the stored seed.")}</li>
            <li className="small">{t("A forged frontend callback can never transition a payment to PAID — only a verified PSP webhook can.")}</li>
            <li className="small">{t("UNAVAILABLE from a credential source never yields FULLY_VERIFIED.")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
