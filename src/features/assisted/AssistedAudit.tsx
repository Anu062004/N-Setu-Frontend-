import { Link, useSearchParams } from "react-router-dom";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { useI18n } from "../../lib/i18n";

export function AssistedAudit() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const delegationId = params.get("delegation") ?? "current session";

  return (
    <div className="assisted-audit">
      <div className="container-narrow">
        <p className="eyebrow">{t("Assisted mode · audit log")}</p>
        <h1 className="h-section">{t("Session audit log")}</h1>
        <p className="small mt-3" style={{ maxWidth: 580 }}>
          {t(
            "Every action in a delegated session is recorded against both principals — the operator and the citizen — under the recorded consent reference. The operator is never the citizen.",
          )}
        </p>

        <div className="assisted-banner mt-5" role="status">
          <StatusLabel label={t("AUDIT LOG NOT EXPOSED")} />
          <span className="small tabular">{t("Delegation {id}", { id: delegationId })}</span>
        </div>

        <p className="small mt-5" style={{ maxWidth: 580 }}>
          {t(
            "This deployment does not expose an audit-listing endpoint, so the log cannot be rendered here. The server still records every delegated write — nothing is lost; it is simply not readable from this surface yet.",
          )}
        </p>

        <p className="small mt-4" style={{ maxWidth: 580 }}>
          {t(
            "The audit log is append-only. Every write carries both principals into the record, so assisted action is always attributable and never confused with citizen self-service.",
          )}
        </p>

        <div className="mt-6">
          <Link to="/assist" className="btn btn--outline">{t("← Back to assisted mode")}</Link>
        </div>
      </div>
    </div>
  );
}
