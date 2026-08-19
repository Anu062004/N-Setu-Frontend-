import { Link } from "react-router-dom";
import { REQUIRED_LEGS, LEG_LABELS } from "../../lib/verification";
import type { ProviderType } from "../../lib/types";
import { SmartImage } from "../../components/ui/SmartImage";

const PORTRAITS = [
  { src: "/join/join-advocate.png", alt: "An advocate with case files outside a district court" },
  { src: "/join/join-paralegal.png", alt: "A paralegal volunteer at a legal aid camp desk" },
  { src: "/join/join-mediator.png", alt: "A mediator in a mediation room" },
];

const WHO = [
  {
    n: "01",
    title: "Advocate",
    body: "Enrolled with a State Bar Council. The credential rail verifies identity, degree, enrolment roll, AIBE Certificate of Practice and currency against the authoritative register — where the source is available.",
  },
  {
    n: "02",
    title: "Notary",
    body: "Appointed under the Notaries Act 1952. Verification checks the appointment notification and currency.",
  },
  {
    n: "03",
    title: "Mediator",
    body: "Empanelled with a mediation centre. Verification checks the empanelment list and currency.",
  },
  {
    n: "04",
    title: "Paralegal volunteer",
    body: "Part of the legal-services ecosystem at the district level, supporting citizens on legal-aid and pro bono matters.",
  },
  {
    n: "05",
    title: "Institutional counsel",
    body: "Counsel engaged by or empanelled with an institution — DLSA, government bodies, NGOs and social-justice organisations.",
  },
];

const TIERS = [
  ["SELF-DECLARED", "Your phone is OTP-verified and your identity is declared by you. No issuer-attested credential submitted. Always shown honestly in citizen-facing lists."],
  ["DOCUMENT-VERIFIED", "Identity plus at least one issuer-attested document, verified through a LIVE source or a DEMO ONLY processing pipeline. A mock source can never produce FULLY VERIFIED."],
  ["FULLY VERIFIED", "Identity, qualification and enrolment all pass against issuer-attested LIVE sources, and currency is confirmed. Degrades automatically when the freshness window passes."],
];

export function ProviderJoin() {
  return (
    <div className="provider-join">
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Professionals · Join Nayasetu</p>
          <h1 className="h-section">For legal professionals</h1>
          <p className="lede mt-3" style={{ maxWidth: 600 }}>
            One verified professional identity, one transparent process, one honest tier. No
            advertising, no paid placement, no ratings — this platform routes citizens fairly and
            verifies you factually.
          </p>
          <div className="mt-5">
            <Link to="/auth?role=PROVIDER&next=%2Fprovider%2Fonboarding" className="btn btn--primary">
              Create professional account
            </Link>
            <Link to="/auth?role=PROVIDER&next=%2Fprovider%2Fdashboard" className="btn btn--outline">
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="principles">
        <div className="container">
          <div className="section-head">
            <p className="section-number">01</p>
            <p className="eyebrow">Who can join</p>
            <h2 className="h-section">Five professional roles.</h2>
          </div>
          <div className="grid-12 principles-grid mt-7">
            {WHO.map((w) => (
              <div key={w.n} className="principle">
                <p className="section-number">{w.n}</p>
                <h3 className="h-micro mt-3">{w.title}</h3>
                <p className="small mt-3">{w.body}</p>
              </div>
            ))}
          </div>
          <div className="join-images mt-6">
            {PORTRAITS.map((p) => (
              <SmartImage key={p.src} src={p.src} alt={p.alt} className="join-img" />
            ))}
          </div>
        </div>
      </section>

      <section className="rails">
        <div className="container">
          <div className="section-head">
            <p className="section-number">02</p>
            <p className="eyebrow">The credential rail</p>
            <h2 className="h-section">What gets verified — and how honestly.</h2>
          </div>
          <div className="rails-grid mt-7">
            {TIERS.map(([t, b]) => (
              <article key={t} className="rail">
                <p className="section-number">{t}</p>
                <p className="small mt-3">{b}</p>
              </article>
            ))}
          </div>
          <p className="small mt-6" style={{ maxWidth: 560 }}>
            Two hard rules: a format check on an enrolment number is never verification, and a DEMO
            ONLY source can demonstrate a flow but can never produce a FULLY VERIFIED outcome.
            Source availability is always stated — LIVE, DEMO ONLY or OFF.
          </p>
        </div>
      </section>

      <section className="how">
        <div className="container-narrow">
          <div className="section-head">
            <p className="section-number">03</p>
            <p className="eyebrow">Required checks</p>
            <h2 className="h-section">What each role submits.</h2>
          </div>
          <div className="mt-6">
            {(Object.keys(REQUIRED_LEGS) as ProviderType[]).map((t) => (
              <div key={t} className="credential-leg">
                <div className="credential-leg__head">
                  <span className="h-micro">{t.replace("_", " ")}</span>
                </div>
                <p className="small mt-3">
                  {REQUIRED_LEGS[t].map((leg) => LEG_LABELS[leg]).join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <Link to="/auth?role=PROVIDER&next=%2Fprovider%2Fonboarding" className="btn btn--primary">
              Start onboarding
            </Link>
            <Link to="/how-it-works" className="btn btn--ghost">How the platform works →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}