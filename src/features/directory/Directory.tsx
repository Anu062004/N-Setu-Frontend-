import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { DirectoryResponse } from "../../lib/types";
import { CATEGORY_LABELS } from "../../lib/eligibility";
import { formatINR, formatTime } from "../../lib/format";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { languageLabel } from "../../lib/languages";
import { useI18n } from "../../lib/i18n";

export function Directory() {
  const { needId = "req_9f2c1a" } = useParams();
  const { t } = useI18n();
  const [data, setData] = useState<DirectoryResponse | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getDirectory(needId)
      .then((d) => alive && setData(d))
      .catch((e) => {
        if (!alive) return;
        const code = (e as { code?: string }).code ?? "ERROR";
        setError({ code, message: e instanceof Error ? e.message : "Could not load the directory" });
      });
    return () => {
      alive = false;
    };
  }, [needId]);

  if (error) {
    return (
      <div className="container-narrow mt-8">
        <StatusLabel label={t("ERROR")} />
        <p className="mt-4">
          <code className="meta">{error.code}</code> — {t(error.message)}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">{t("Loading the directory…")}</p>
      </div>
    );
  }

  return (
    <div className="directory">
      <div className="container">
        <div className="directory-head">
          <p className="eyebrow">{t("Mode A — citizen choice")}</p>
          <h1 className="h-section">{t("Available legal professionals")}</h1>
          <p className="small mt-3" style={{ maxWidth: 600 }}>
            {t(
              "Results are filtered by your legal need, district, language, service mode and fee ceiling — then ordered by fair rotation. No professional is ranked above another. You choose."
            )}
          </p>
        </div>

        <div className="directory-filter">
          <p className="h-micro">{t("Filter summary")}</p>
          <div className="directory-filter__chips">
            <span className="small">
              {t("Category — {category}", { category: t(CATEGORY_LABELS[data.filterSummary.category]) })}
            </span>
            <span className="small">
              {t("District — {district}", { district: data.filterSummary.district })}
            </span>
            <span className="small">
              {t("Language — {language}", { language: languageLabel(data.filterSummary.language) })}
            </span>
            <span className="small">
              {t("Fee ceiling — {fee}", { fee: data.filterSummary.feeCeiling ? formatINR(data.filterSummary.feeCeiling) : t("none") })}
            </span>
          </div>
          <p className="small mt-3">
            {t(data.matchCount === 1 ? "{count} eligible professional" : "{count} eligible professionals", {
              count: data.matchCount,
            })}{" "}
            · <StatusLabel label={t("ROTATED")} /> · {t("seed")} <code className="meta">{data.seed}</code>{" "}
            {t("(replayable)")}
          </p>
        </div>

        <ul className="directory-list">
          {data.providers.length === 0 && (
            <li className="grievance-item" role="status">
              <StatusLabel label="NO MATCHES" />
              <p className="small mt-3" style={{ maxWidth: 520 }}>
                {t(
                  "No verified professional matches this need yet in your district. Your need is saved — you can track it in your portal, or check the pro bono duty rotation.",
                )}
              </p>
              <div className="mt-3">
                <Link to={`/rotation/${needId}`} className="btn btn--outline btn--sm">
                  {t("Try the duty rotation")}
                </Link>
              </div>
            </li>
          )}
          {data.providers.map((p) => (
            <li key={p.providerId} className="provider-row">
              <div className="provider-row__main">
                <p className="h-micro">{p.displayName}</p>
                <p className="small mt-2">
                  {t(p.providerType.replace("_", " "))} · {p.district}, {p.state} ·{" "}
                  {p.languages.map((l) => languageLabel(l)).join(" · ") || "—"} ·{" "}
                  {p.serviceModes.map((m) => t(m)).join(" / ")}
                </p>
                <div className="mt-3">
                  <TierLabel
                    tier={t(p.tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : p.tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")}
                  />
                  {!p.tierFresh && <StatusLabel label={t("REVERIFICATION DUE")} />}
                </div>
              </div>
              <div className="provider-row__fees">
                <p className="meta">{t("Fee range")}</p>
                <p className="h-micro tabular">
                  {p.feeRange ? `${formatINR(p.feeRange[0])} – ${formatINR(p.feeRange[1])}` : t("Pro bono available")}
                </p>
                <p className="small mt-2">{t("Next slot")}</p>
                <p className="small tabular">{p.nextSlot ? formatTime(p.nextSlot) : "—"}</p>
              </div>
              <div className="provider-row__action">
                <Link
                  to={`/providers/${p.providerId}?need=${needId}`}
                  state={{ provider: p }}
                  className="btn btn--outline btn--sm"
                >
                  {t("View profile")}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <p className="small mt-5" style={{ maxWidth: 600 }}>
          {t(
            "No ratings, no rankings, no recommendations. Ordering is a seeded rotation — the same request always replays the same order."
          )}
        </p>
      </div>
    </div>
  );
}