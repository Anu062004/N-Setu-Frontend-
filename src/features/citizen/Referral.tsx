import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { NeedRequest } from "../../lib/types";
import { CATEGORY_LABELS, SECTION12_LABELS } from "../../lib/eligibility";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { languageLabel } from "../../lib/languages";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

export function Referral() {
  const { t } = useI18n();
  const { needId = "req_4d81b7" } = useParams();
  const [need, setNeed] = useState<(NeedRequest & { selfDeclaredSection12: string | null }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getReferral(needId)
      .then((r) => {
        if (alive) setNeed(r.need);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Referral not found"));
    return () => {
      alive = false;
    };
  }, [needId]);

  if (error) {
    return (
      <div className="container-narrow mt-8">
        <StatusLabel label={t("ERROR")} />
        <p className="mt-4">{t(error)}</p>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">{t("Loading referral…")}</p>
      </div>
    );
  }

  const declared = need.selfDeclaredSection12;

  return (
    <div className="referral">
      <div className="container-narrow">
        <div className="directory-head">
          <p className="eyebrow">{t("Legal aid referral · DLSA / Nyaya Bandhu")}</p>
          <h1 className="h-section">{t("Your referral artefact")}</h1>
          <p className="small mt-3" style={{ maxWidth: 600 }}>
            {t("This artefact carries your Section 12 declaration to the District Legal Services Authority. The platform refers — it does not adjudicate eligibility. That is the DLSA's statutory function.")}
          </p>
        </div>

        <SmartImage
          src="/referral/referral-banner.png"
          alt={t("Supreme Court of India colonnade at blue hour")}
          className="slot-banner slot-banner--16x9 mt-6"
        />

        <div className="privilege-card mt-6">
          <div className="flex-between">
            <p className="h-micro">{t("Referral {id}", { id: need.id })}</p>
            <StatusLabel label={t("FREE LEGAL AID")} />
          </div>

          <table className="table table--dense mt-4">
            <tbody>
              <tr>
                <td className="small">{t("Referral authority")}</td>
                <td className="small" style={{ textAlign: "right" }}>{t("District Legal Services Authority — {district}", { district: need.district })}</td>
              </tr>
              <tr>
                <td className="small">{t("Problem category")}</td>
                <td className="small" style={{ textAlign: "right" }}>{t(CATEGORY_LABELS[need.taxonomyCode])}</td>
              </tr>
              <tr>
                <td className="small">{t("District")}</td>
                <td className="small" style={{ textAlign: "right" }}>{need.district}</td>
              </tr>
              <tr>
                <td className="small">{t("Language")}</td>
                <td className="small" style={{ textAlign: "right" }}>{languageLabel(need.language)}</td>
              </tr>
              <tr>
                <td className="small">{t("Mode of contact")}</td>
                <td className="small" style={{ textAlign: "right" }}>{t(need.modePref)}</td>
              </tr>
              <tr>
                <td className="small">{t("Section 12 declaration")}</td>
                <td className="small" style={{ textAlign: "right" }}>
                  {declared ? t(SECTION12_LABELS[declared]) : t("None declared")}
                </td>
              </tr>
              <tr>
                <td className="small">{t("Fee")}</td>
                <td className="small" style={{ textAlign: "right" }}>
                  {declared ? t("₹0 — free legal services apply") : t("Not applicable")}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="small mt-4" style={{ maxWidth: 560 }}>
            {t("Carry this reference when you approach the DLSA. The DLSA will verify your declaration and provide counsel at no cost to you. You must not be charged for a legal-aid matter. If anyone demands payment,")}{" "}
            <Link to="/grievance" style={{ textDecoration: "underline" }}>{t("file a grievance")}</Link>.
          </p>
        </div>

        <div className="credential-leg mt-6">
          <div className="credential-leg__head">
            <span className="h-micro">{t("What happens next")}</span>
          </div>
          <p className="small mt-3">
            {t("1. The DLSA assigns counsel from its panel or roster. · 2. Counsel contacts you in your preferred language and mode. · 3. Your matter is tracked as metadata only — the platform never stores its content. · 4. If counsel is not assigned within a reasonable time, the DLSA is the authority — the platform can record the delay for institutional visibility.")}
          </p>
        </div>

        <div className="mt-6">
          <Link to="/portal" className="btn btn--outline">{t("Track in my portal")}</Link>
          <Link to="/start" className="btn btn--ghost">{t("Start over")}</Link>
        </div>
      </div>
    </div>
  );
}