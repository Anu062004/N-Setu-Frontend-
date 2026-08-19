import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Grievance, PublicStat } from "../../lib/types";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { useI18n } from "../../lib/i18n";

export function Institutional() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStat[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);

  useEffect(() => {
    api.getPublicStats().then(setStats);
    api.getGrievances().then(setGrievances);
  }, []);

  return (
    <div className="institutional">
      <div className="container">
        <p className="eyebrow">{t("Institutional surface · DLSA / Bar Council / DoJ")}</p>
        <h1 className="h-section">{t("Command center")}</h1>
        <p className="small mt-3" style={{ maxWidth: 620 }}>
          {t(
            "Scoped, read-mostly access. Public-facing statistics are aggregate only — no named individual is rated. Individual conduct signals and records are visible only to institutional consumers."
          )}
        </p>

        <div className="grid-12 mt-6">
          <div className="dash-col" style={{ gridColumn: "span 7" }}>
            <div className="dash-section">
              <h2 className="h-micro">{t("Aggregate statistics")}</h2>
              <table className="table table--dense mt-4">
                <thead>
                  <tr>
                    <th>{t("District")}</th>
                    <th style={{ textAlign: "right" }}>{t("Matters served")}</th>
                    <th style={{ textAlign: "right" }}>{t("Pro bono")}</th>
                    <th style={{ textAlign: "right" }}>{t("Median response")}</th>
                    <th style={{ textAlign: "right" }}>{t("Grievance resolution")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.district}>
                      <td className="small">{s.district}</td>
                      <td className="small tabular" style={{ textAlign: "right" }}>{s.mattersServed}</td>
                      <td className="small tabular" style={{ textAlign: "right" }}>{s.proBonoMatters}</td>
                      <td className="small tabular" style={{ textAlign: "right" }}>{s.medianResponseHours} h</td>
                      <td className="small tabular" style={{ textAlign: "right" }}>
                        {Math.round(s.grievanceResolutionRate * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small mt-3">
                {t("Satisfies public transparency without rating a single named advocate.")}
              </p>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Roster / duty rotation state")}</h2>
              <table className="table table--dense mt-4">
                <thead>
                  <tr>
                    <th>{t("Roster")}</th>
                    <th>{t("District")}</th>
                    <th>{t("Available")}</th>
                    <th style={{ textAlign: "right" }}>{t("Next due")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["r_04 · TENANCY", "Patna", "AVAILABLE", "p_002"],
                    ["r_07 · PROPERTY", "Gaya", "AVAILABLE", "p_005"],
                    ["r_09 · FAMILY", "Patna", "HOLD", "—"],
                  ].map(([r, d, st, next]) => (
                    <tr key={r}>
                      <td className="small tabular">{t(r)}</td>
                      <td className="small">{d}</td>
                      <td><StatusLabel label={t(st)} /></td>
                      <td className="small tabular" style={{ textAlign: "right" }}>{next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-col" style={{ gridColumn: "span 5" }}>
            <div className="dash-section">
              <h2 className="h-micro">{t("Grievance pipeline")}</h2>
              <ul className="grievance-list mt-4">
                {grievances.map((g) => (
                  <li key={g.id} className="grievance-item">
                    <div className="flex-between">
                      <span className="small tabular">{g.id}</span>
                      <StatusLabel label={t(g.status)} />
                    </div>
                    <p className="small mt-3">{t(g.summary)}</p>
                    <p className="small mt-2" style={{ color: "var(--color-gray-light)" }}>
                      {t("Opened {opened} · Updated {updated}", {
                        opened: new Date(g.openedAt).toLocaleDateString("en-IN"),
                        updated: new Date(g.updatedAt).toLocaleDateString("en-IN"),
                      })}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="small mt-4">
                {t(
                  "Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform packages a clean evidence trail and tracks the outcome — it does not adjudicate or publish verdicts."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}