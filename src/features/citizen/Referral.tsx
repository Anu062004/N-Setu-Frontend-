import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { NeedRequest } from "../../lib/types";
import { CATEGORY_LABELS, SECTION12_LABELS } from "../../lib/eligibility";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { languageLabel } from "../../lib/languages";
import { SmartImage } from "../../components/ui/SmartImage";

export function Referral() {
  const { needId = "req_4d81b7" } = useParams();
  const [need, setNeed] = useState<(NeedRequest & { selfDeclaredSection12: string | null }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getEligibility(needId)
      .then((r) => setNeed(r.need))
      .catch((e) => setError(e instanceof Error ? e.message : "Referral not found"));
  }, [needId]);

  if (error) {
    return (
      <div className="container-narrow mt-8">
        <StatusLabel label="ERROR" />
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="container-narrow mt-8">
        <p className="meta">Loading referral…</p>
      </div>
    );
  }

  const declared = need.selfDeclaredSection12;

  return (
    <div className="referral">
      <div className="container-narrow">
        <div className="directory-head">
          <p className="eyebrow">Legal aid referral · DLSA / Nyaya Bandhu</p>
          <h1 className="h-section">Your referral artefact</h1>
          <p className="small mt-3" style={{ maxWidth: 600 }}>
            This artefact carries your Section 12 declaration to the District Legal Services
            Authority. The platform refers — it does not adjudicate eligibility. That is the
            DLSA's statutory function.
          </p>
        </div>

        <SmartImage
          src="/referral/referral-banner.png"
          alt="Supreme Court of India colonnade at blue hour"
          className="slot-banner slot-banner--16x9 mt-6"
        />

        <div className="privilege-card mt-6">
          <div className="flex-between">
            <p className="h-micro">Referral {need.id}</p>
            <StatusLabel label="FREE LEGAL AID" />
          </div>

          <table className="table table--dense mt-4">
            <tbody>
              <tr>
                <td className="small">Referral authority</td>
                <td className="small" style={{ textAlign: "right" }}>District Legal Services Authority — {need.district}</td>
              </tr>
              <tr>
                <td className="small">Problem category</td>
                <td className="small" style={{ textAlign: "right" }}>{CATEGORY_LABELS[need.taxonomyCode]}</td>
              </tr>
              <tr>
                <td className="small">District</td>
                <td className="small" style={{ textAlign: "right" }}>{need.district}</td>
              </tr>
              <tr>
                <td className="small">Language</td>
                <td className="small" style={{ textAlign: "right" }}>{languageLabel(need.language)}</td>
              </tr>
              <tr>
                <td className="small">Mode of contact</td>
                <td className="small" style={{ textAlign: "right" }}>{need.modePref}</td>
              </tr>
              <tr>
                <td className="small">Section 12 declaration</td>
                <td className="small" style={{ textAlign: "right" }}>
                  {declared ? SECTION12_LABELS[declared] : "None declared"}
                </td>
              </tr>
              <tr>
                <td className="small">Fee</td>
                <td className="small" style={{ textAlign: "right" }}>
                  {declared ? "₹0 — free legal services apply" : "Not applicable"}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="small mt-4" style={{ maxWidth: 560 }}>
            Carry this reference when you approach the DLSA. The DLSA will verify your declaration
            and provide counsel at no cost to you. You must not be charged for a legal-aid matter.
            If anyone demands payment,{" "}
            <Link to="/grievance" style={{ textDecoration: "underline" }}>file a grievance</Link>.
          </p>
        </div>

        <div className="credential-leg mt-6">
          <div className="credential-leg__head">
            <span className="h-micro">What happens next</span>
          </div>
          <p className="small mt-3">
            1. The DLSA assigns counsel from its panel or roster. · 2. Counsel contacts you in your
            preferred language and mode. · 3. Your matter is tracked as metadata only — the
            platform never stores its content. · 4. If counsel is not assigned within a reasonable
            time, the DLSA is the authority — the platform can record the delay for institutional
            visibility.
          </p>
        </div>

        <div className="mt-6">
          <Link to="/portal" className="btn btn--outline">Track in my portal</Link>
          <Link to="/start" className="btn btn--ghost">Start over</Link>
        </div>
      </div>
    </div>
  );
}