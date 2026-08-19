import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { DirectoryResponse } from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { formatINR, formatTime } from "../../lib/format";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { languageLabel } from "../../lib/languages";

export function Directory() {
  const { needId = "req_9f2c1a" } = useParams();
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getDirectory(needId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [needId]);

  if (error) {
    return (
      <div className="container-narrow mt-8">
        <StatusLabel label="ERROR" />
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">Loading the directory…</p>
      </div>
    );
  }

  return (
    <div className="directory">
      <div className="container">
        <div className="directory-head">
          <p className="eyebrow">Mode A — citizen choice</p>
          <h1 className="h-section">Available legal professionals</h1>
          <p className="small mt-3" style={{ maxWidth: 600 }}>
            Results are filtered by your legal need, district, language, service mode and fee
            ceiling — then ordered by fair rotation. No professional is ranked above another. You
            choose.
          </p>
        </div>

        <div className="directory-filter">
          <p className="h-micro">Filter summary</p>
          <div className="directory-filter__chips">
            <span className="small">Category — {CATEGORY_LABELS[data.filterSummary.category]}</span>
            <span className="small">District — {data.filterSummary.district}</span>
            <span className="small">Language — {languageLabel(data.filterSummary.language)}</span>
            <span className="small">
              Fee ceiling — {data.filterSummary.feeCeiling ? formatINR(data.filterSummary.feeCeiling) : "none"}
            </span>
          </div>
          <p className="small mt-3">
            {data.matchCount} eligible {data.matchCount === 1 ? "professional" : "professionals"} ·{" "}
            <StatusLabel label="ROTATED" /> · seed <code className="meta">{data.seed}</code> (replayable)
          </p>
        </div>

        <ul className="directory-list">
          {data.providers.map((p) => (
            <li key={p.providerId} className="provider-row">
              <div className="provider-row__main">
                <p className="h-micro">{p.displayName}</p>
                <p className="small mt-2">
                  {p.providerType.replace("_", " ")} · {p.district}, {p.state} ·{" "}
                  {p.languages.map((l) => languageLabel(l)).join(" · ") || "—"} · {p.serviceModes.join(" / ")}
                </p>
                <div className="mt-3">
                  <TierLabel tier={p.tier} />
                  {!p.tierFresh && <StatusLabel label="REVERIFICATION DUE" />}
                </div>
              </div>
              <div className="provider-row__fees">
                <p className="meta">Fee range</p>
                <p className="h-micro tabular">
                  {p.feeRange ? `${formatINR(p.feeRange[0])} – ${formatINR(p.feeRange[1])}` : "Pro bono available"}
                </p>
                <p className="small mt-2">Next slot</p>
                <p className="small tabular">{p.nextSlot ? formatTime(p.nextSlot) : "—"}</p>
              </div>
              <div className="provider-row__action">
                <Link to={`/providers/${p.providerId}?need=${needId}`} className="btn btn--outline btn--sm">
                  View profile
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="small mt-5" style={{ maxWidth: 600 }}>
          No ratings, no rankings, no recommendations. Ordering is a seeded rotation — the same
          request always replays the same order.
        </p>
      </div>
    </div>
  );
}