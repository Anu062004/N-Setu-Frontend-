import { useState } from "react";
import { Link } from "react-router-dom";
import { SECTION12_CATEGORIES, SECTION12_LABELS } from "../../lib/eligibility";
import { SmartImage } from "../../components/ui/SmartImage";
import { useI18n } from "../../lib/i18n";

const RIGHTS = [
  {
    n: "01",
    title: "Free legal aid — Section 12, Legal Services Authorities Act 1987",
    body: "If you belong to any category in the table below, you are entitled to free legal services. The District Legal Services Authority (DLSA) provides them. You must never be charged for a legal-aid matter. On Nayasetu, declaring a Section 12 category routes you to the DLSA / Nyaya Bandhu before any paid flow is even shown.",
  },
  {
    n: "02",
    title: "You are never routed to a paid flow if legal aid applies",
    body: "The eligibility router checks your declaration before anything is sold. A woman, a child, an SC/ST member, an industrial workman, a person in custody, a victim of trafficking, disaster or abuse of power, a person with disability, or a person below the prescribed income limit is referred to free legal aid — the paid directory is not shown to them.",
  },
  {
    n: "03",
    title: "You have a right to an honest process",
    body: "Professionals are verified against issuer-attested sources where available, and source availability is stated honestly — LIVE, DEMO ONLY or OFF. A quote is shown before any payment and is honoured once given. The platform charges 0% commission. If a professional does not honour the quote, you can file a grievance.",
  },
  {
    n: "04",
    title: "You are never rated, ranked or profiled",
    body: "The platform stores no score, rank or rating for citizens or professionals. No rankings, no 'recommended' badges, no paid placement — Rule 36 of the BCI Rules prohibits advocates from soliciting work or advertising. Directory ordering is a seeded rotation, replayable and fair.",
  },
  {
    n: "05",
    title: "Your communications stay privileged",
    body: "Engagements are metadata only — who, when, category, status, fee, CNR pointer. No case narratives, no documents, no advice chat. Attorney–client communications are protected (s.132, Bharatiya Sakshya Adhiniyam 2023).",
  },
  {
    n: "06",
    title: "You can always file a grievance",
    body: "Every engagement can carry a grievance. It runs OPEN → TRIAGED → PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA. Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961) — the platform packages a clean evidence trail and tracks the outcome; it does not adjudicate.",
  },
];

const EXAMPLES = [
  ["You are a woman facing a family dispute", "Free legal aid — Section 12 applies. Routed to DLSA / Nyaya Bandhu. Never charged."],
  ["Your landlord refuses to return your deposit and your ceiling is below the district floor", "Pro bono duty rotation — the next advocate on duty is assigned. Never charged."],
  ["You can afford professional fees", "Paid directory — filtered by your needs, rotated fairly, quote before work."],
  ["A professional asks for a higher fee after the quote", "File a grievance — quote honoured is a platform rule, and the evidence trail goes to the Bar Council if needed."],
];

export function Rights() {
  const [photoOk, setPhotoOk] = useState(true);
  const { t } = useI18n();

  return (
    <div className="rights-page">
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">{t("Citizen rights · Legal Services Authorities Act 1987")}</p>
          <h1 className="h-section">{t("Know your rights")}</h1>
          <p className="lede mt-3" style={{ maxWidth: 600 }}>
            {t("The right to legal help is a constitutional promise, implemented by the Legal Services Authorities Act 1987. Here is what you are entitled to — and what you must never be charged for.")}
          </p>
        </div>
      </section>

      <section className="principles">
        <div className="container">
          <div className="grid-12 principles-grid">
            {RIGHTS.map((r) => (
              <div key={r.n} className="principle">
                <p className="section-number">{r.n}</p>
                <h3 className="h-micro mt-3">{t(r.title)}</h3>
                <p className="small mt-3">{t(r.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rights">
        <div className="container">
          <div className="grid-12 rights-grid">
            <div className="rights-main">
              <div className="section-head">
                <p className="section-number">07</p>
                <p className="eyebrow">{t("Section 12 — who qualifies")}</p>
                <h2 className="h-section">{t("The protected categories")}</h2>
              </div>
              <p className="lede mt-5" style={{ maxWidth: 560 }}>
                {t("Free legal services are due to citizens in the categories below. Self-declaration is sufficient to route you to free legal aid — the DLSA verifies the declaration, not you.")}
              </p>
              <table className="table table--dense mt-5" style={{ maxWidth: 640 }}>
                <tbody>
                  {SECTION12_CATEGORIES.map((c) => (
                    <tr key={c}>
                      <td className="small">{t(SECTION12_LABELS[c])}</td>
                      <td className="small" style={{ textAlign: "right" }}>{t("ENTITLED")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5">
                <Link to="/start" className="btn btn--primary">{t("Check if you qualify — free")}</Link>
              </div>
            </div>
            <div className="rights-side">
              <SmartImage
                src="/rights/rights-img.png"
                alt={t("A village dispute-resolution meeting under a tree")}
                className="rights-img"
              />
              <div className="privilege-card">
                <SmartImage
                  src="/rights/stamp.png"
                  alt={t("A worn rubber stamp reading FREE LEGAL AID pressed onto a case file")}
                  className="stamp-img"
                />
                <p className="h-micro">{t("What you must never pay for")}</p>
                <p className="small mt-3">
                  {t("A legal-aid matter. If Section 12 applies to you, the platform never shows you a paid flow. Any demand for payment on a legal-aid matter is a grievance that goes to the pipeline — and the DLSA.")}
                </p>
              </div>
              <div className="privilege-card">
                <p className="h-micro">{t("What the platform never does")}</p>
                <p className="small mt-3">
                  {t("It does not adjudicate eligibility (that is the DLSA's statutory function). It does not rate, rank or recommend professionals. It does not hold your money. It does not store your case content — metadata only.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newspaper-section">
        <div className="container">
          <div className="section-head">
            <p className="section-number">08</p>
            <p className="eyebrow">{t("The precedent")}</p>
            <h2 className="h-section">{t("Why this right exists.")}</h2>
          </div>
          <p className="lede mt-5" style={{ maxWidth: 560 }}>
            {t("In 1979, the Supreme Court made free legal aid a constitutional right — in a case that began in Bihar. The DLSA, Nyaya Bandhu and the pro bono rotation exist because of that holding.")}
          </p>

          <div className="newspaper-layout mt-7">
            <div className="newspaper">
              <header className="newspaper__head">
                <p className="newspaper__masthead">The Indian Chronicle</p>
                <p className="newspaper__rule" aria-hidden="true" />
                <p className="newspaper__datebar">{t("PATNA, MONDAY, FEBRUARY 26, 1979 · FIFTY PAISE")}</p>
              </header>

              <h3 className="newspaper__headline">{t("Free legal aid is a fundamental right")}</h3>
              <p className="newspaper__subhead">
                {t("Supreme Court, in Hussainara Khatoon, holds Article 21 entitles every undertrial to counsel; 40,000 Bihar undertrials to be released")}
              </p>

              {photoOk && (
                <figure className="newspaper__photo">
                  <SmartImage
                    src="/rights/newspaper-photo.png"
                    alt={t("Undertrial wing, Patna Central Jail, 1979")}
                    eager
                    onMissing={() => setPhotoOk(false)}
                  />
                  <figcaption>{t("Undertrial wing, Patna Central Jail — the report that became the petition")}</figcaption>
                </figure>
              )}

              <div className="newspaper__cols">
                <p>
                  {t("PATNA — The Supreme Court has held that free legal aid is an integral part of Article 21 of the Constitution. In Hussainara Khatoon v. State of Bihar, a Bench led by Justice P.N. Bhagwati ordered the release of every undertrial who had already served more than the maximum sentence their alleged offence could attract, and directed that counsel be provided at state expense.")}
                </p>
                <p>
                  {t('The case began with a newspaper report on undertrials in Bihar jails — men who had spent years in prison without trial, some longer than the sentence they could ever have received. The Court treated the report as a writ petition. "A procedure which denies legal aid to the accused," the judgment observed, "cannot be said to be reasonable, fair and just."')}
                </p>
                <p>
                  {t("Legal aid, the Court held, is not charity. It is a right of citizenship. The legal services authorities this platform routes you to exist because of that holding. (AIR 1979 SC 1369)")}
                </p>
              </div>

              <footer className="newspaper__foot">
                <p>{t("Compiled for illustration · text abridged from the judgment · quote as reported")}</p>
              </footer>
            </div>

            <aside className="archive-companion">
              <SmartImage
                src="/rights/release-gate.png"
                alt={t("Released undertrials walking out of a prison gate, 1979")}
                className="archive-companion__img"
                eager
              />
              <p className="archive-companion__caption">
                {t("THE GATE OPENS — released undertrials, Bihar, 1979")}
              </p>
              <p className="small mt-3" style={{ color: "var(--color-gray)" }}>
                {t("The judgment ordered the release of every undertrial who had served beyond the maximum sentence their alleged offence could attract. Thousands walked out.")}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="transparency">
        <div className="container">
          <div className="section-head">
            <p className="section-number">09</p>
            <p className="eyebrow">{t("What your situation means")}</p>
            <h2 className="h-section">{t("Examples of how routing works")}</h2>
          </div>
          <div className="examples-layout mt-7">
            <SmartImage
              src="/rights/worker.png"
              alt={t("An industrial worker at a factory gate with a folded document")}
              className="slot-banner slot-banner--4x3"
            />
            <div className="transparency-grid">
              {EXAMPLES.map(([k, v]) => (
                <div key={k} className="transparency-item">
                  <p className="h-sub">{t(k)}</p>
                  <p className="small mt-3">{t(v)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7">
            <Link to="/grievance" className="btn btn--outline">{t("File a grievance →")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}