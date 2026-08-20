import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { CitizenPortalView } from "../../lib/types";
import { CATEGORY_LABELS, SECTION12_LABELS, decideRoute, DISTRICT_FLOOR_BY_CATEGORY } from "../../lib/eligibility";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { formatDate, formatINR } from "../../lib/format";
import { languageLabel } from "../../lib/languages";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

export function CitizenPortal() {
  const { t } = useI18n();
  const [data, setData] = useState<CitizenPortalView | null>(null);

  useEffect(() => {
    api.getCitizenPortal().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">{t("Loading your portal…")}</p>
      </div>
    );
  }

  return (
    <div className="citizen-portal">
      <div className="container">
        <p className="eyebrow">{t("Citizen portal")}</p>
        <h1 className="h-section">{t("My legal matters")}</h1>
        <p className="small mt-3" style={{ maxWidth: 600 }}>
          {t(
            "Your needs, routes and matter metadata. Engagements are metadata only — who, when, category, status, fee, CNR pointer. No case content is stored here."
          )}
        </p>

        <SmartImage
          src="/portal/portal-corridor.png"
          alt={t("An empty court corridor with light shafts")}
          className="slot-banner slot-banner--4x3 mt-6"
        />

        <div className="grid-12 mt-6">
          <div className="dash-col col-span-7">
            <div className="dash-section">
              <h2 className="h-micro">{t("My needs")}</h2>
              <ul className="grievance-list mt-4">
                {data.needs.map((n) => {
                  const decision = decideRoute({
                    selfDeclaredSection12: n.selfDeclaredSection12,
                    feeCeiling: n.feeCeiling,
                    districtFloor: DISTRICT_FLOOR_BY_CATEGORY[n.taxonomyCode] ?? 3000,
                  });
                  return (
                    <li key={n.id} className="grievance-item">
                      <div className="flex-between">
                        <span className="small tabular">{n.id}</span>
                        <StatusLabel
                          label={t(decision.route === "LEGAL_AID_REFERRAL" ? "LEGAL AID" : decision.route === "PRO_BONO_ROTATION" ? "PRO BONO" : "PAID")}
                        />
                      </div>
                      <p className="small mt-3">
                        {t(CATEGORY_LABELS[n.taxonomyCode])} · {n.district} · {languageLabel(n.language)} ·{" "}
                        {t(n.modePref)}
                      </p>
                      <p className="small mt-2" style={{ color: "var(--color-gray-light)" }}>
                        {n.selfDeclaredSection12
                          ? t("Section 12: {label}", { label: t(SECTION12_LABELS[n.selfDeclaredSection12]) })
                          : t("No Section 12 declaration")}{" "}
                        ·{" "}
                        {t("Fee ceiling: {amount}", {
                          amount: n.feeCeiling === null ? t("not stated") : formatINR(n.feeCeiling),
                        })}
                      </p>
                      <div className="mt-3">
                        {decision.route === "LEGAL_AID_REFERRAL" && (
                          <Link to={`/referral/${n.id}`} className="btn btn--outline btn--sm">{t("View referral")}</Link>
                        )}
                        {decision.route === "PRO_BONO_ROTATION" && (
                          <Link to={`/rotation/${n.id}`} className="btn btn--outline btn--sm">{t("My assigned advocate")}</Link>
                        )}
                        {decision.route === "PAID" && (
                          <Link to={`/directory/${n.id}`} className="btn btn--outline btn--sm">{t("Directory")}</Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="dash-col col-span-5">
            <div className="dash-section">
              <h2 className="h-micro">{t("Matters")}</h2>
              <ul className="grievance-list mt-4">
                {data.matters.map((m) => (
                  <li key={m.id} className="grievance-item">
                    <div className="flex-between">
                      <span className="small tabular">{m.id}</span>
                      <StatusLabel label={t(m.status)} />
                    </div>
                    <p className="small mt-3">
                      {t(CATEGORY_LABELS[m.category])} · {m.fee === null || m.fee === 0 ? t("s.12 / pro bono — free") : formatINR(m.fee)} ·{" "}
                      {t("opened {date}", { date: formatDate(m.openedAt) })}
                    </p>
                    <p className="small mt-2" style={{ color: "var(--color-gray-light)" }}>
                      {m.cnr ? `CNR ${m.cnr}` : t("No CNR pointer yet")} ·{" "}
                      {m.closeReason ? t(`Closed: ${m.closeReason}`) : t("Open")}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="small mt-4">
                {t(
                  "Matter status is shown through an authorized integration when available — otherwise an official link to the eCourts flow is provided."
                )}
              </p>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Actions")}</h2>
              <div className="mt-4">
                <Link to="/start" className="btn btn--outline btn--sm">{t("Start a new need")}</Link>{" "}
                <Link to="/grievance" className="btn btn--outline btn--sm">{t("File a grievance")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}