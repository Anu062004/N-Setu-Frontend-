import { StatusLabel } from "../../components/ui/StatusLabel";

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
  return (
    <div className="admin">
      <div className="container">
        <p className="eyebrow">Admin surface</p>
        <h1 className="h-section">Capability flags & audit</h1>
        <p className="small mt-3" style={{ maxWidth: 620 }}>
          Every external adapter advertises LIVE, MOCK or OFF. There is no silent mock in
          production — the deployment manifest states each capability. A demo never visually
          represents a mock source as a government-confirmed result.
        </p>

        <table className="table table--dense mt-6" style={{ maxWidth: 720 }}>
          <thead>
            <tr>
              <th>Flag</th>
              <th>Mode</th>
              <th>Behaviour</th>
            </tr>
          </thead>
          <tbody>
            {FLAGS.map(([flag, mode]) => (
              <tr key={flag}>
                <td className="small tabular">{flag}</td>
                <td>
                  <StatusLabel label={mode === "LIVE" ? "LIVE" : mode === "MOCK" ? "DEMO ONLY" : mode} />
                </td>
                <td className="small">
                  {mode === "OFF" ? "UI exposes limitation; workflow falls back to review" :
                   mode === "MOCK" ? "Synthetic fixture for demo; cannot produce FULLY VERIFIED" :
                   mode === "LINK_ONLY" ? "Returns official external continuation" :
                   mode === "LOCAL" ? "Signed local artefact; evidence, not official status" :
                   "Real authorized/public source"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="dash-section mt-6" style={{ maxWidth: 720 }}>
          <h2 className="h-micro">Acceptance guardrails (CI)</h2>
          <ul className="admin-list mt-4">
            <li className="small">No citizen-facing DTO may contain score, rank, rating, recommended, topMatch, creditBalance or conductScore — build fails.</li>
            <li className="small">No code path assigns a numeric quality score to a provider.</li>
            <li className="small">Directory ordering replays from the stored seed.</li>
            <li className="small">A forged frontend callback can never transition a payment to PAID — only a verified PSP webhook can.</li>
            <li className="small">UNAVAILABLE from a credential source never yields FULLY_VERIFIED.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}