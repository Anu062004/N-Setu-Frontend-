import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { TierLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import type { ProviderSummary } from "../../lib/types";
import { languageLabel } from "../../lib/languages";

export function Rotation() {
  const { needId = "req_77e02d" } = useParams();
  const [assignment, setAssignment] = useState<{
    allocationId: string;
    provider: ProviderSummary;
    mode: "ROTATION";
    assignedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    api
      .rotateAssign(needId)
      .then(setAssignment)
      .finally(() => setLoading(false));
  }, [needId]);

  if (loading) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">Assigning the next advocate on duty…</p>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="rotation">
      <div className="container-narrow">
        <p className="eyebrow">Mode B — duty rotation</p>
        <h1 className="h-section">Assigned through duty rotation</h1>
        <p className="small mt-3" style={{ maxWidth: 560 }}>
          For {CATEGORY_LABELS[needId.startsWith("req_4d") ? "FAMILY" : "PROPERTY"]} needs in your
          district, advocates serve on a duty roster. You are assigned the next advocate in
          rotation — not chosen by anyone, and not recommended. Rotation state is fair and
          replayable.
        </p>

        <div className="rotation-card mt-6">
          <div className="rotation-card__label">
            <span className="h-micro">Assigned provider</span>
            <TierLabel tier={assignment.provider.tier} />
          </div>
          <p className="h-sub">{assignment.provider.displayName}</p>
          <p className="small mt-3">
            {assignment.provider.providerType.replace("_", " ")} · {assignment.provider.district},{" "}
            {assignment.provider.state} ·{" "}
            {assignment.provider.languages.map((l) => languageLabel(l)).join(" · ")}
          </p>
          <p className="small mt-2 tabular">
            Allocation {assignment.allocationId} · {new Date(assignment.assignedAt).toLocaleString("en-IN")}
          </p>

          <div className="mt-6 rotation-card__actions">
            <Button variant="primary">Accept assignment</Button>
            <Button
              variant="ghost"
              onClick={() => setDeclined(true)}
              disabled={declined}
            >
              {declined ? "Declined — back in rotation" : "Decline with reason"}
            </Button>
          </div>
          {declined && (
            <p className="small mt-3">
              You declined. The assignment returns to rotation and a conduct signal (duty
              accounting, not a public rating) is recorded.
            </p>
          )}
        </div>

        <p className="small mt-5">
          Duty rotation means the next eligible provider is assigned fairly — this is how DLSA
          panels already work. There is no cost for this route.
        </p>
      </div>
    </div>
  );
}