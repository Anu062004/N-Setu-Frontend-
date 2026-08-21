import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import type { PublicStat } from "../../lib/types";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { useI18n } from "../../lib/i18n";

export function Institutional() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStat[]>([]);
  const [statsState, setStatsState] = useState<{ loading: boolean; code: string | null; message: string | null }>({
    loading: true,
    code: null,
    message: null,
  });

  const [rosterId, setRosterId] = useState("");
  const [roster, setRoster] = useState<unknown>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [rosterBusy, setRosterBusy] = useState(false);

  const [recordId, setRecordId] = useState("");
  const [record, setRecord] = useState<unknown>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordBusy, setRecordBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .getPublicStats()
      .then((s) => {
        if (!alive) return;
        setStats(s);
        setStatsState({ loading: false, code: null, message: null });
      })
      .catch((e) => {
        if (!alive) return;
        setStatsState({
          loading: false,
          code: e instanceof ApiError ? e.code : "REQUEST_FAILED",
          message: e instanceof Error ? e.message : "Statistics unavailable",
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  const lookupRoster = async () => {
    if (!rosterId.trim()) return;
    setRosterBusy(true);
    setRosterError(null);
    setRoster(null);
    try {
      setRoster(await api.getInstitutionalRoster(rosterId.trim()));
    } catch (e) {
      setRosterError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Lookup failed",
      );
    } finally {
      setRosterBusy(false);
    }
  };

  const lookupRecord = async () => {
    if (!recordId.trim()) return;
    setRecordBusy(true);
    setRecordError(null);
    setRecord(null);
    try {
      setRecord(await api.getInstitutionalProviderRecord(recordId.trim()));
    } catch (e) {
      setRecordError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Lookup failed",
      );
    } finally {
      setRecordBusy(false);
    }
  };

  return (
    <div className="institutional">
      <div className="container">
        <p className="eyebrow">{t("Institutional surface · DLSA / Bar Council / DoJ")}</p>
        <h1 className="h-section">{t("Command center")}</h1>
        <p className="small mt-3" style={{ maxWidth: 620 }}>
          {t(
            "Scoped, read-mostly access. Public-facing statistics are aggregate only — no named individual is rated. Individual conduct signals and records are visible only to institutional consumers.",
          )}
        </p>

        <div className="grid-12 mt-6">
          <div className="dash-col col-span-7">
            <div className="dash-section">
              <h2 className="h-micro">{t("Aggregate statistics")}</h2>
              {statsState.loading && <p className="meta mt-4">{t("Loading statistics…")}</p>}
              {!statsState.loading && statsState.code && (
                <div className="mt-4" role="status">
                  <StatusLabel label={t("STATISTICS SUPPRESSED")} />
                  <p className="small mt-3" style={{ maxWidth: 520 }}>
                    <code className="meta">{statsState.code}</code> — {t(statsState.message ?? "")}{" "}
                    {t(
                      "The public aggregate policy is not configured in this deployment, so no numbers are invented here.",
                    )}
                  </p>
                </div>
              )}
              {!statsState.loading && !statsState.code && (
                <>
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
                      {stats.length === 0 && (
                        <tr>
                          <td className="small" colSpan={5}>
                            {t("No aggregate data published yet.")}
                          </td>
                        </tr>
                      )}
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
                </>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Roster / duty rotation state")}</h2>
              <div className="availability-add mt-4">
                <input
                  className="field__input"
                  value={rosterId}
                  onChange={(e) => setRosterId(e.target.value)}
                  placeholder={t("Roster id (UUID)")}
                  aria-label={t("Roster id")}
                />
                <Button size="sm" variant="ghost" onClick={() => void lookupRoster()} disabled={!rosterId.trim() || rosterBusy}>
                  {rosterBusy ? t("Looking up…") : t("Look up")}
                </Button>
              </div>
              {rosterError && (
                <p className="field__error mt-3" role="alert">
                  {t(rosterError)}
                </p>
              )}
              {roster !== null && (
                <pre className="small mt-4 tabular" role="status" style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(roster, null, 2)}
                </pre>
              )}
            </div>
          </div>

          <div className="dash-col col-span-5">
            <div className="dash-section">
              <h2 className="h-micro">{t("Provider record (scoped)")}</h2>
              <div className="availability-add mt-4">
                <input
                  className="field__input"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  placeholder={t("Provider id (UUID)")}
                  aria-label={t("Provider id")}
                />
                <Button size="sm" variant="ghost" onClick={() => void lookupRecord()} disabled={!recordId.trim() || recordBusy}>
                  {recordBusy ? t("Looking up…") : t("Look up")}
                </Button>
              </div>
              {recordError && (
                <p className="field__error mt-3" role="alert">
                  {t(recordError)}
                </p>
              )}
              {record !== null && (
                <pre className="small mt-4 tabular" role="status" style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(record, null, 2)}
                </pre>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Grievance pipeline")}</h2>
              <div className="mt-4" role="status">
                <StatusLabel label={t("LISTING NOT EXPOSED")} />
                <p className="small mt-3">
                  {t(
                    "This deployment does not expose a grievance listing endpoint. Grievances are filed through the citizen surface and tracked through the statutory pipeline.",
                  )}
                </p>
              </div>
              <p className="small mt-4">
                {t(
                  "Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform packages a clean evidence trail and tracks the outcome — it does not adjudicate or publish verdicts.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
