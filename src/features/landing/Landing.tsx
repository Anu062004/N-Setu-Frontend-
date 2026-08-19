import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroSlideshow } from "./HeroSlideshow";
import { api } from "../../lib/api";
import type { PublicStat } from "../../lib/types";
import { useI18n } from "../../lib/i18n";

const PRINCIPLES = [
  {
    n: "01",
    title: "Verified professionals",
    body: "Identity is verified against issuer-attested sources where available — State Bar Council enrolment, AIBE practice certificate, currency against the authoritative register. Tiers: SELF-DECLARED, DOCUMENT-VERIFIED, FULLY VERIFIED. Source availability is stated honestly: LIVE, DEMO ONLY, OFF.",
  },
  {
    n: "02",
    title: "Legal aid first",
    body: "Before any paid flow, the Section 12 (Legal Services Authorities Act, 1987) check runs. A citizen entitled to free representation is referred to the District Legal Services Authority — never charged.",
  },
  {
    n: "03",
    title: "Fair allocation",
    body: "Mode A: a hard-filtered directory ordered by fair rotation — you choose. Mode B: duty rotation for pro bono and legal-aid work, the way DLSA panels assign counsel.",
  },
  {
    n: "04",
    title: "Institutional accountability",
    body: "Objective conduct signals and a grievance pipeline wired to statutory bodies. Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform packages evidence; it does not adjudicate.",
  },
];

const RAILS = [
  {
    n: "Rail 01",
    title: "Credential",
    body: "Portable, issuer-verified professional identity for advocates, notaries, mediators, paralegals and counsel. A format check on an enrolment number is never verification. A stale FULLY VERIFIED degrades automatically. A mock source can never masquerade as a government verification.",
  },
  {
    n: "Rail 02",
    title: "Incentive",
    body: "A service-credit ledger for the work this system exists to promote: pro bono matters, legal-aid-tier matters, underserved blocks, rotation duty, response SLAs, CLE modules, Lok Adalat settlements. Append-only and hash-chained. Credits are evidence for institutions — never a leaderboard, never citizen-visible, never purchasable.",
  },
  {
    n: "Rail 03",
    title: "Accountability",
    body: "Conduct signals are objective and platform-observable — response time, no-show, quote honoured. Grievances run OPEN → TRIAGED → PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA. Public reporting is aggregate only; no named individual is rated.",
  },
];

const STEPS = [
  ["01", "Tell us your problem", "Plain-language categories — property, family, employment, consumer, criminal, tenancy, other. No legal jargon required. No free-text narrative is stored."],
  ["02", "We check eligibility", "The Section 12 and district affordability check runs before any paid flow."],
  ["03", "You get one route", "Legal-aid referral (DLSA / Nyaya Bandhu), pro bono duty rotation, or the paid directory. Exactly one route is shown."],
  ["04", "Work begins transparently", "Quote before work, quote honoured. Payments move through an authorized payment provider — the platform never holds your money. Matters are metadata only."],
];

const TRANSPARENCY = [
  ["0%", "platform commission. Third-party payment-processing charges may apply and are disclosed separately."],
  ["Quote honoured", "fee is disclosed before work begins. Disputes go to grievance — not hidden fee changes."],
  ["No wallet", "no escrow, no platform-held funds. An authorized payment provider moves the money."],
  ["Official links", "case status is shown only through an authorized integration — otherwise a LINK REQUIRED fallback to the official eCourts flow."],
];

const SECTION12_LINE =
  "Scheduled Castes and Scheduled Tribes, women and children, industrial workmen, persons in custody, victims of trafficking, victims of disaster and mass violence, victims of abuse of power, persons with disability, and persons financially disadvantaged. Self-declaration is sufficient to route; the DLSA verifies.";

export function Landing() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStat[]>([]);

  useEffect(() => {
    api.getPublicStats().then(setStats).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero" data-hero-top>
        <HeroSlideshow />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="container">
            <div className="hero-copy">
              <p className="eyebrow eyebrow--light">{t("Access to justice for all")}</p>
              <h1 className="h-display hero-title">
                {t("Get the legal help you are")} <em>{t("entitled")}</em>{" "}
                {t("to.")}
              </h1>
              <p className="lede hero-lede">
                {t(
                  "Verified professionals, fair allocation and legal aid routed before any payment. No rankings, no ratings, no paid placement.",
                )}
              </p>
              <div className="hero-cta">
                <Link to="/start" className="btn btn--light">
                  {t("I need legal help")}
                </Link>
                <Link to="/start?step=eligibility" className="btn btn--light-outline">
                  {t("Check eligibility")}
                </Link>
              </div>
              <p className="hero-trust">{t("Secure · Private · Confidential")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="principles">
        <div className="container">
          <div className="section-head">
            <p className="section-number">01</p>
            <p className="eyebrow">{t("What this platform is")}</p>
            <h2 className="h-section">
              {t("Not a marketplace. Civic infrastructure for legal help.")}
            </h2>
            <p className="small mt-3" style={{ maxWidth: 560 }}>
              {t(
                'Rule 36 of the BCI Rules prohibits advocates from soliciting work or advertising. This platform therefore has no ratings, no rankings, no "recommended" and no paid placement — it routes citizens fairly and verifies professionals factually.',
              )}
            </p>
          </div>
          <div className="grid-12 principles-grid">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="principle">
                <p className="section-number">{p.n}</p>
                <h3 className="h-micro mt-3">{t(p.title)}</h3>
                <p className="small mt-3">{t(p.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rails">
        <div className="container">
          <div className="section-head">
            <p className="section-number">02</p>
            <p className="eyebrow">{t("The three rails")}</p>
            <h2 className="h-section">{t("Everything in the system exists to feed three rails.")}</h2>
          </div>
          <div className="rails-grid mt-7">
            {RAILS.map((r) => (
              <article key={r.title} className="rail">
                <p className="section-number">{r.n}</p>
                <h3 className="h-sub mt-3">{t(r.title)}</h3>
                <p className="small mt-3">{t(r.body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container-narrow">
          <div className="section-head">
            <p className="section-number">03</p>
            <p className="eyebrow">{t("How it works")}</p>
            <h2 className="h-section">{t("Four steps. One honest route.")}</h2>
          </div>
          <ol className="how-steps mt-7">
            {STEPS.map(([n, title, body]) => (
              <li key={n} className="how-step">
                <span className="section-number tabular">{n}</span>
                <div>
                  <h3 className="h-micro">{t(title)}</h3>
                  <p className="small mt-2" style={{ maxWidth: 520 }}>
                    {t(body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <Link to="/start" className="btn btn--primary">
              {t("Start now — it is free to check")}
            </Link>
          </div>
        </div>
      </section>

      <section className="rights">
        <div className="container">
          <div className="grid-12 rights-grid">
            <div className="rights-main">
              <div className="section-head">
                <p className="section-number">04</p>
                <p className="eyebrow">{t("The right to legal help")}</p>
                <h2 className="h-section">Section 12, Legal Services Authorities Act 1987</h2>
              </div>
              <p className="lede mt-5" style={{ maxWidth: 560 }}>
                {t("Free legal services are due to citizens in defined categories: ")}
                {t(SECTION12_LINE)}
              </p>
              <p className="small mt-4" style={{ maxWidth: 560 }}>
                {t(
                  "If you declare a Section 12 category, you are routed to the DLSA / Nyaya Bandhu — you will not be charged. This is the single most important flow: a citizen entitled to free representation must never accidentally pay for it.",
                )}
              </p>
              <div className="mt-5">
                <Link to="/start?step=eligibility" className="btn btn--outline">
                  {t("Check if you qualify →")}
                </Link>
              </div>
            </div>
            <div className="rights-side">
              <div className="privilege-card privilege-card--dark">
                <p className="h-micro">{t("Privilege boundary")}</p>
                <p className="small mt-3">
                  {t(
                    "The platform stores metadata about an engagement — who, when, category, status, fee, CNR pointer — never its content. Attorney–client communications are protected (s.132, Bharatiya Sakshya Adhiniyam 2023). No case narratives, no documents, no advice chat.",
                  )}
                </p>
              </div>
              <div className="privilege-card privilege-card--dark">
                <p className="h-micro">{t("Capability honesty")}</p>
                <p className="small mt-3">
                  {t(
                    "External integrations are labelled LIVE, DEMO ONLY or OFF. A mock source can demonstrate a flow but can never produce a FULLY VERIFIED outcome. Unavailable sources cap the achievable tier — they never silently succeed.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="transparency">
        <div className="container">
          <div className="section-head">
            <p className="section-number">05</p>
            <p className="eyebrow">{t("Transparency")}</p>
            <h2 className="h-section">{t("Terms professionals and citizens can hold us to.")}</h2>
          </div>
          <div className="transparency-grid mt-7">
            {TRANSPARENCY.map(([k, v]) => (
              <div key={k} className="transparency-item">
                <p className="h-sub">{t(k)}</p>
                <p className="small mt-3">{t(v)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="stats">
          <div className="container">
            <div className="section-head">
              <p className="section-number">06</p>
              <p className="eyebrow">{t("Aggregate statistics")}</p>
              <h2 className="h-section">{t("Public reporting, aggregate only.")}</h2>
              <p className="small mt-3" style={{ maxWidth: 560 }}>
                {t(
                  "Matters served by district, pro bono contribution, median response time and grievance resolution rates. No named individual is rated anywhere.",
                )}
              </p>
            </div>
            <table className="table table--dense mt-7" style={{ maxWidth: 760 }}>
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
          </div>
        </section>
      )}
    </>
  );
}