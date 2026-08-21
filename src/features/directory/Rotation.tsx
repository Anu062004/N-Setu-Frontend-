import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { TierLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import type { NeedRequest, ProviderSummary } from "../../lib/types";
import { languageLabel } from "../../lib/languages";
import { useI18n } from "../../lib/i18n";

interface Assignment {
  allocationId: string;
  provider: ProviderSummary;
  mode: "ROTATION";
  assignedAt: string;
}

export function Rotation() {
  const { needId = "" } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [need, setNeed] = useState<(NeedRequest & { selfDeclaredSection12: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string; unavailable: boolean } | null>(null);
  const [declined, setDeclined] = useState(false);
  const [acceptState, setAcceptState] = useState<{ busy: boolean; done: boolean; error: string | null }>({
    busy: false,
    done: false,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    api
      .rotateAllocation(needId)
      .then((a) => {
        if (!alive) return;
        setAssignment(a);
      })
      .catch((e) => {
        if (!alive) return;
        setError({
          code: e instanceof ApiError ? e.code : "REQUEST_FAILED",
          message: e instanceof Error ? e.message : "Rotation failed",
          unavailable: e instanceof ApiError && e.unavailable,
        });
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [needId]);

  // The referral artefact carries the need + routing reason; fetch for context (best effort).
  useEffect(() => {
    let alive = true;
    api
      .getReferral(needId)
      .then((r) => {
        if (!alive) return;
        setNeed(r.need);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [needId]);

  const handleAccept = async () => {
    if (!assignment) return;
    setAcceptState({ busy: true, done: false, error: null });
    try {
      await api.selectProvider(needId, assignment.provider.providerId);
      setAcceptState({ busy: false, done: true, error: null });
    } catch (e) {
      setAcceptState({
        busy: false,
        done: false,
        error:
          e instanceof ApiError
            ? `${e.code} — ${e.message}`
            : e instanceof Error
              ? e.message
              : "Could not lock the assignment",
      });
    }
  };

  if (loading) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">{t("Assigning the next advocate on duty…")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow mt-8">
        <p className="eyebrow">{t("Mode B — duty rotation")}</p>
        <h1 className="h-section mt-3">{t(error.unavailable ? "Rotation unavailable" : "Assignment failed")}</h1>
        <p className="small mt-4" role={error.unavailable ? "status" : "alert"}>
          <code className="meta">{error.code}</code> — {t(error.message)}
        </p>
        <p className="small mt-3" style={{ maxWidth: 560 }}>
          {t(
            "The duty rotation only assigns a real advocate when the roster is configured. Nothing is simulated here.",
          )}
        </p>
        <div className="mt-6 intake-result__actions">
          <button className="btn btn--outline" onClick={() => navigate(0)}>
            {t("Retry")}
          </button>
          <a href="/portal" className="btn btn--ghost">
            {t("Track in my portal")}
          </a>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="rotation">
      <div className="container-narrow">
        <p className="eyebrow">{t("Mode B — duty rotation")}</p>
        <h1 className="h-section">{t("Assigned through duty rotation")}</h1>
        <p className="small mt-3" style={{ maxWidth: 560 }}>
          {t(
            "For {category} needs in your district, advocates serve on a duty roster. You are assigned the next advocate in rotation — not chosen by anyone, and not recommended. Rotation state is fair and replayable.",
            { category: t(CATEGORY_LABELS[need?.taxonomyCode ?? "OTHER"]) }
          )}
        </p>

        <div className="rotation-card mt-6">
          <div className="rotation-card__label">
            <span className="h-micro">{t("Assigned provider")}</span>
            <TierLabel
              tier={t(assignment.provider.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : assignment.provider.tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")}
            />
          </div>
          <p className="h-sub">{assignment.provider.displayName}</p>
          <p className="small mt-3">
            {t(assignment.provider.providerType.replace("_", " "))} · {assignment.provider.district}
            {assignment.provider.state ? `, ${assignment.provider.state}` : ""} ·{" "}
            {assignment.provider.languages.map((l) => languageLabel(l)).join(" · ") || "—"}
          </p>
          <p className="small mt-2 tabular">
            {t("Allocation {allocationId} · {assignedAt}", {
              allocationId: assignment.allocationId,
              assignedAt: new Date(assignment.assignedAt).toLocaleString("en-IN"),
            })}
          </p>

          <div className="mt-6 rotation-card__actions">
            {acceptState.done ? (
              <>
                <Button variant="primary" onClick={() => navigate(`/providers/${assignment.provider.providerId}?need=${needId}`, { state: { provider: assignment.provider } })}>
                  {t("View assigned professional")}
                </Button>
                <span className="small">{t("Selection locked.")}</span>
              </>
            ) : (
              <>
                <Button variant="primary" onClick={() => void handleAccept()} disabled={acceptState.busy}>
                  {acceptState.busy ? t("Locking…") : t("Accept assignment")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDeclined(true)}
                  disabled={declined || acceptState.busy}
                >
                  {t(declined ? "Declined — back in rotation" : "Decline with reason")}
                </Button>
              </>
            )}
          </div>
          {acceptState.error && <p className="field__error mt-3">{t(acceptState.error)}</p>}
          {declined && !acceptState.done && (
            <p className="small mt-3">
              {t(
                "You declined. The assignment returns to rotation and a conduct signal (duty accounting, not a public rating) is recorded.",
              )}
            </p>
          )}
        </div>

        <p className="small mt-5">
          {t(
            "Duty rotation means the next eligible provider is assigned fairly — this is how DLSA panels already work. There is no cost for this route.",
          )}
        </p>
      </div>
    </div>
  );
}
