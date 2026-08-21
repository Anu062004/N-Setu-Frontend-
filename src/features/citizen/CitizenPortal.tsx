import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import type { MatterMetadata } from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { listNeeds, type NeedHistoryEntry } from "../../lib/needHistory";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { formatDate, formatINR } from "../../lib/format";
import { SmartImage } from "../../components/ui/SmartImage";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

export function CitizenPortal() {
  const { t } = useI18n();
  const { session } = useAuth();

  const [matterId, setMatterId] = useState("");
  const [matter, setMatter] = useState<MatterMetadata | null>(null);
  const [matterError, setMatterError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [needs] = useState<NeedHistoryEntry[]>(listNeeds);
  const [closeState, setCloseState] = useState<{ busy: boolean; done: boolean; error: string | null }>({
    busy: false,
    done: false,
    error: null,
  });

  useEffect(() => {
    setMatter(null);
    setMatterError(null);
    setCloseState({ busy: false, done: false, error: null });
  }, [session]);

  const lookup = async () => {
    if (!matterId.trim()) return;
    setLookupBusy(true);
    setMatterError(null);
    setMatter(null);
    try {
      setMatter(await api.getMatterStatus(matterId.trim()));
    } catch (e) {
      setMatterError(
        e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Lookup failed",
      );
    } finally {
      setLookupBusy(false);
    }
  };

  const close = async () => {
    if (!matter) return;
    setCloseState({ busy: true, done: false, error: null });
    try {
      const updated = await api.closeMatter(matter.id);
      setMatter(updated);
      setCloseState({ busy: false, done: true, error: null });
    } catch (e) {
      setCloseState({
        busy: false,
        done: false,
        error:
          e instanceof ApiError ? `${e.code} — ${e.message}` : e instanceof Error ? e.message : "Close failed",
      });
    }
  };

  if (!session) {
    return (
      <div className="container-narrow mt-8">
        <p className="eyebrow">{t("Citizen portal")}</p>
        <h1 className="h-section mt-3">{t("Sign in to track your matters")}</h1>
        <p className="small mt-4" style={{ maxWidth: 560 }}>
          {t(
            "Your portal shows matter metadata only — who, when, category, status, fee. No case content is ever stored here.",
          )}
        </p>
        <div className="mt-6 intake-result__actions">
          <Link to="/auth?role=CITIZEN&next=%2Fportal" className="btn btn--primary">
            {t("Sign in")}
          </Link>
          <Link to="/start" className="btn btn--outline">
            {t("Start a legal need")}
          </Link>
        </div>
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
            "Engagements are metadata only — who, when, category, status, fee, CNR pointer. No case content is stored here.",
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
              <h2 className="h-micro">{t("Your raised needs")}</h2>
              {needs.length === 0 ? (
                <p className="small mt-3" style={{ maxWidth: 520 }}>
                  {t(
                    "No legal needs raised on this device yet. Start one and it will be listed here — with exactly one honest route attached.",
                  )}
                </p>
              ) : (
                <ul className="mt-4" style={{ display: "grid", gap: "var(--sp-3)", listStyle: "none", padding: 0 }}>
                  {needs.map((n) => (
                    <li key={n.needId} className="privilege-card" style={{ padding: "var(--sp-4)" }}>
                      <div className="flex-between">
                        <span className="h-micro">{t(CATEGORY_LABELS[n.taxonomyCode] ?? n.taxonomyCode)}</span>
                        <span className="small tabular">{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="small mt-2 tabular">
                        {t("Need")} {n.needId} · {n.district || t("—")}
                      </p>
                      <div className="mt-3 intake-result__actions">
                        {n.route === "PAID" && (
                          <Link to={`/directory/${n.needId}`} className="btn btn--outline btn--sm">
                            {t("Open directory")}
                          </Link>
                        )}
                        {n.route === "PRO_BONO_ROTATION" && (
                          <Link to={`/rotation/${n.needId}`} className="btn btn--outline btn--sm">
                            {t("Open rotation")}
                          </Link>
                        )}
                        {n.route === "LEGAL_AID_REFERRAL" && (
                          <Link to={`/referral/${n.needId}`} className="btn btn--outline btn--sm">
                            {t("Open referral")}
                          </Link>
                        )}
                        {!n.route && (
                          <Link to={`/portal`} className="btn btn--ghost btn--sm" style={{ pointerEvents: "none", opacity: 0.6 }}>
                            {t("Route not recorded")}
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dash-section mt-6">
              <h2 className="h-micro">{t("Look up a matter")}</h2>
              <p className="small mt-3" style={{ maxWidth: 520 }}>
                {t(
                  "Enter the matter reference from your referral or allocation to see its live status. The platform stores metadata only — never case content.",
                )}
              </p>
              <div className="availability-add mt-4">
                <input
                  className="field__input"
                  value={matterId}
                  onChange={(e) => setMatterId(e.target.value)}
                  placeholder={t("Matter reference (UUID)")}
                  aria-label={t("Matter reference")}
                />
                <Button size="sm" variant="ghost" onClick={() => void lookup()} disabled={!matterId.trim() || lookupBusy}>
                  {lookupBusy ? t("Looking up…") : t("Look up")}
                </Button>
              </div>

              {matterError && (
                <p className="field__error mt-4" role="alert">
                  {t(matterError)}
                </p>
              )}

              {matter && (
                <div className="privilege-card mt-5" role="status">
                  <div className="flex-between">
                    <p className="h-micro tabular">{matter.id}</p>
                    <StatusLabel label={t(matter.status)} />
                  </div>
                  <table className="table table--dense mt-4">
                    <tbody>
                      <tr>
                        <td className="small">{t("Category")}</td>
                        <td className="small" style={{ textAlign: "right" }}>{t(CATEGORY_LABELS[matter.category])}</td>
                      </tr>
                      <tr>
                        <td className="small">{t("Fee")}</td>
                        <td className="small" style={{ textAlign: "right" }}>
                          {matter.fee === null || matter.fee === 0 ? t("s.12 / pro bono — free") : formatINR(matter.fee)}
                        </td>
                      </tr>
                      <tr>
                        <td className="small">{t("Opened")}</td>
                        <td className="small tabular" style={{ textAlign: "right" }}>{formatDate(matter.openedAt)}</td>
                      </tr>
                      <tr>
                        <td className="small">CNR</td>
                        <td className="small tabular" style={{ textAlign: "right" }}>
                          {matter.cnr ?? t("No CNR pointer yet")}
                        </td>
                      </tr>
                      {matter.closeReason && (
                        <tr>
                          <td className="small">{t("Closed")}</td>
                          <td className="small" style={{ textAlign: "right" }}>{t(`Closed: ${matter.closeReason}`)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {matter.status !== "CLOSED" && !closeState.done && (
                    <Button size="sm" variant="ghost" className="mt-4" onClick={() => void close()} disabled={closeState.busy}>
                      {closeState.busy ? t("Closing…") : t("Close this matter")}
                    </Button>
                  )}
                  {closeState.done && (
                    <p className="small mt-4" role="status">
                      {t("Matter closed.")}
                    </p>
                  )}
                  {closeState.error && <p className="field__error mt-3">{t(closeState.error)}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="dash-col col-span-5">
            <div className="dash-section">
              <h2 className="h-micro">{t("Account")}</h2>
              <p className="small mt-3" style={{ maxWidth: 420 }}>
                {t(
                  "Needs are listed from this device's local history — the platform stores engagement metadata only, never case content.",
                )}
              </p>
              <div className="mt-4">
                <Link to="/profile" className="btn btn--outline btn--sm">{t("Your profile")}</Link>
              </div>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Actions")}</h2>
              <div className="mt-4">
                <Link to="/start" className="btn btn--outline btn--sm">{t("Start a new need")}</Link>{" "}
                <Link to="/grievance" className="btn btn--outline btn--sm">{t("File a grievance")}</Link>
              </div>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">{t("Case status")}</h2>
              <p className="small mt-3">
                {t(
                  "Matter status is shown through an authorized integration when available — otherwise an official link to the eCourts flow is provided. The platform never scrapes or invents status.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
