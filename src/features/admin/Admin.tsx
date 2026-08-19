import { StatusLabel } from "../../components/ui/StatusLabel";
import { useI18n } from "../../lib/i18n";

const FLAGS: [string, string][] = [
  ["CREDENTIAL_DIGILOCKER_MODE", "OFF"],
  ["CREDENTIAL_BAR_MODE", "LIVE"],
  ["CREDENTIAL_AIBE_MODE", "LIVE"],
  ["CASE_STATUS_MODE", "LINK_ONLY"],
  ["PAYMENTS_MODE", "SANDBOX"],
  ["IVR_MODE", "OFF"],
  ["WHATSAPP_MODE", "MOCK"],
  ["INSTITUTIONAL_EXPORT_MODE", "LOCAL"],
];

export function Admin() {
  const { t } = useI18n();
  return (
    <div className="admin">
      <div className="container">
        <p className="eyebrow">{t("Admin surface")}</p>
        <h1 className="h-section">{t("Capability flags & audit")}</h1>
        <p className="small mt-3" style={{ maxWidth: 620 }}>
          {t(
            "Every external adapter advertises LIVE, MOCK or OFF. There is no silent mock in production — the deployment manifest states each capability. A demo never visually represents a mock source as a government-confirmed result."
          )}
        </p>

        <table className="table table--dense mt-6" style={{ maxWidth: 720 }}>
          <thead>
            <tr>
              <th>{t("Flag")}</th>
              <th>{t("Mode")}</th>
              <th>{t("Behaviour")}</th>
            </tr>
          </thead>
          <tbody>
            {FLAGS.map(([flag, mode]) => {
              const modeLabel = mode === "LIVE" ? "LIVE" : mode === "MOCK" ? "DEMO ONLY" : mode;
              return (
                <tr key={flag}>
                  <td className="small tabular">{flag}</td>
                  <td>
                    <StatusLabel label={t(modeLabel)} />
                  </td>
                  <td className="small">
                    {mode === "OFF" ? t("UI exposes limitation; workflow falls back to review") :
                     mode === "MOCK" ? t("Synthetic fixture for demo; cannot produce FULLY VERIFIED") :
                     mode === "LINK_ONLY" ? t("Returns official external continuation") :
                     mode === "LOCAL" ? t("Signed local artefact; evidence, not official status") :
                     t("Real authorized/public source")}
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