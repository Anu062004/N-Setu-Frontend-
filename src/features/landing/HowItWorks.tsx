import { Link } from "react-router-dom";
import { SmartImage } from "../../components/ui/SmartImage";

const DEMO_VIDEO_URL =
  "https://www.youtube.com/watch?v=A_z5g0_hJN8&list=RDA_z5g0_hJN8&start_radio=1";
import { useI18n } from "../../lib/i18n";

const CITIZEN_STEPS = [
  {
    n: "01",
    title: "Tell us your problem",
    body: "Choose a plain-language category — property, family, employment, consumer, criminal, tenancy or other. No legal jargon, no free-text narrative. You tell us what the problem is; the platform never decides who you should get.",
  },
  {
    n: "02",
    title: "We check eligibility — before any paid flow",
    body: "Two checks run before anything is sold to you. First, the Section 12 (Legal Services Authorities Act, 1987) declaration: if you belong to a protected category, you are entitled to free legal aid. Second, the district affordability check: if your fee ceiling is below the district floor for your category, you are routed to the pro bono rotation. Both are declared by you and verified later by the DLSA — declaration is sufficient to route.",
  },
  {
    n: "03",
    title: "You get one route — exactly one",
    body: "The eligibility router shows one of three routes, never a menu of paid options: a legal-aid referral to the District Legal Services Authority / Nyaya Bandhu, an assignment from the pro bono duty rotation, or the paid directory. If legal aid applies, the paid directory is not even shown to you.",
  },
  {
    n: "04",
    title: "Work begins transparently",
    body: "In the paid directory you choose a professional, see a full quote before any payment, and pay through an authorized payment provider — the platform never holds your money, has no wallet and charges 0% commission. All engagements are recorded as metadata only: who, when, category, status, fee, CNR pointer. No case narratives, no documents, no advice chat.",
  },
];

const ROUTES = [
  {
    name: "Legal aid referral",
    tag: "ROUTE 01",
    body: "If you declare a Section 12 category — Scheduled Caste or Scheduled Tribe, woman or child, industrial workman, person in custody, victim of trafficking, disaster, abuse of power, person with disability, or financially disadvantaged — you are referred to the District Legal Services Authority / Nyaya Bandhu. Free legal services apply. You must not be charged. The platform refers; the DLSA verifies and provides.",
  },
  {
    name: "Pro bono duty rotation",
    tag: "ROUTE 02",
    body: "If you cannot afford the district floor for your category, you are placed on the duty rotation and assigned the next advocate on duty — the same way DLSA panels assign counsel. No fees, no bidding, no choice fatigue. The assignment is transparent: you see who was assigned, and why rotation means fairness.",
  },
  {
    name: "Paid directory",
    tag: "ROUTE 03",
    body: "If neither applies, you enter Mode A: a directory filtered hard by your need, district, language, service mode and fee ceiling, then ordered by fair rotation — not by ranking, rating or payment. You choose from the eligible set. Every result shows verification tier and fee range, and a quote is shown before any work begins.",
  },
];

const ALLOCATION = [
  ["Mode A — citizen choice", "Hard-filtered directory, seeded fair rotation. The citizen chooses. Ordering is replayable — the same request always replays the same order. No professional is ranked above another."],
  ["Mode B — duty rotation", "Used for pro bono and legal-aid work. The next eligible professional on the roster is assigned, exactly as DLSA panels assign counsel. You see who was assigned and why."],
  ["Seeded rotation, not ranking", "A stored seed drives the order so the system is fair, auditable and replayable. A seed is not a score. There is no score anywhere in the system."],
];

const AFTER_ROUTING = [
  ["Quote before work", "A full quote with fee breakdown and payment-processing charges is shown before any payment. The quote is honoured once given. Disputes go to grievance, not hidden fee changes."],
  ["Payments via PSP only", "The platform is never a wallet and never holds funds. An authorized payment provider moves the money; only a verified PSP webhook or server-side check changes payment state."],
  ["Metadata-only matters", "An engagement is recorded as who, when, category, status, fee and CNR pointer — never the content. Attorney–client communications stay protected (s.132, Bharatiya Sakshya Adhiniyam 2023)."],
  ["Assisted mode", "No smartphone? A CSC / VLE operator can act for you in a delegated session, with recorded consent, with the operator's identity never confused with yours."],
];

const FAQS = [
  ["Is this a marketplace with ratings?", "No. Rule 36 of the BCI Rules prohibits advocates from soliciting work or advertising. There are no ratings, no rankings, no 'recommended' badges and no paid placement. Ordering is a seeded rotation."],
  ["Does the platform decide who I get?", "No. Mode A: you choose from an eligible, rotated set. Mode B: the duty rotation assigns the next eligible professional. The platform answers what the problem is and routes fairly; it never recommends an individual."],
  ["Can the platform ever charge me for legal aid?", "No. If a Section 12 declaration routes you to the DLSA / Nyaya Bandhu, the paid flow is never shown. If your ceiling is below the district floor, you enter the pro bono rotation and are never charged."],
  ["How is my privacy protected?", "Matters are metadata only — who, when, category, status, fee, CNR pointer. No narratives, no documents, no advice chat. Attorney–client communications are protected by law."],
  ["What happens if a professional does not honour the quote?", "The grievance pipeline runs OPEN → TRIAGED → PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA. Professional misconduct is a State Bar Council matter under s.35, Advocates Act 1961 — the platform packages evidence, it does not adjudicate."],
];

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <div className="howitworks">
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">{t("Platform · How it works")}</p>
          <h1 className="h-section">{t("How Nayasetu works")}</h1>
          <p className="lede mt-3" style={{ maxWidth: 600 }}>
            {t(
              "Four steps for the citizen, three rails underneath, three possible routes — and only one honest route shown to you at the end."
            )}
          </p>
          <div className="mt-5">
            <Link to="/start" className="btn btn--primary">{t("Start legal help — it is free to check")}</Link>
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container-narrow">
          <div className="section-head">
            <p className="section-number">01</p>
            <p className="eyebrow">{t("The citizen flow")}</p>
            <h2 className="h-section">{t("Four steps. One honest route.")}</h2>
          </div>
          <div className="how-panel mt-6">
            <div className="how-panel__intro">
              <h3 className="h-sub">{t("The four steps, at a glance")}</h3>
              <p className="small mt-2">
                {t(
                  "Every citizen journey follows the same four steps. After the steps, watch a short demo of the whole product.",
                )}
              </p>
            </div>
            <ol className="how-steps mt-5">
            {CITIZEN_STEPS.map((s) => (
              <li key={s.n} className="how-step">
                <span className="section-number tabular">{s.n}</span>
                <div>
                  <h3 className="h-micro">{t(s.title)}</h3>
                  <p className="small mt-2" style={{ maxWidth: 520 }}>{t(s.body)}</p>
                  {s.n === "01" && (
                    <figure className="how-scene">
                      <SmartImage
                        src="/how/need-phone.png"
                        alt={t("A citizen's hands holding a smartphone with a form at a kitchen table")}
                        className="how-scene__img"
                      />
                    </figure>
                  )}
                  {s.n === "02" && (
                    <figure className="how-scene">
                      <SmartImage
                        src="/how/eligibility-form.png"
                        alt={t("A hand ticking boxes on a Section 12 eligibility form")}
                        className="how-scene__img"
                      />
                    </figure>
                  )}
                  {s.n === "03" && (
                    <figure className="how-scene">
                      <SmartImage
                        src="/how/fork-road.png"
                        alt={t("A village road forking in two at golden hour")}
                        className="how-scene__img"
                      />
                    </figure>
                  )}
                  {s.n === "04" && (
                    <figure className="how-scene">
                      <SmartImage
                        src="/how/work-transparent.png"
                        alt={t("Work begins transparently — choose a professional, see a full quote before any payment, and pay through an authorized payment provider")}
                        className="how-scene__img"
                      />
                    </figure>
                  )}
                </div>
              </li>
            ))}
          </ol>
          </div>

          <div className="demo-card mt-6">
            <a className="demo-card__cover" href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer" aria-label={t("Watch the product demo")}>
              <img
                src="https://img.youtube.com/vi/A_z5g0_hJN8/hqdefault.jpg"
                alt={t("Product demo video cover")}
                className="demo-card__img"
              />
              <span className="demo-card__play" aria-hidden="true"><span className="demo-card__play-icon">▶</span></span>
            </a>
            <div className="demo-card__body">
              <p className="eyebrow">{t("Product demo")}</p>
              <h3 className="h-sub mt-2">{t("Watch the product demo")}</h3>
              <p className="small mt-3">
                {t(
                  "See the full journey in about two minutes — how a citizen is checked for legal aid, routed, and connected to a verified professional.",
                )}
              </p>
              <a className="btn btn--primary mt-4" href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer">
                {t("Watch on YouTube")} →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rails">
        <div className="container">
          <div className="section-head">
            <p className="section-number">02</p>
            <p className="eyebrow">{t("The three routes")}</p>
            <h2 className="h-section">{t("Exactly one route is shown to you.")}</h2>
            <p className="small mt-3" style={{ maxWidth: 560 }}>
              {t(
                "The eligibility router decides before any paid flow. A citizen entitled to free representation must never accidentally pay for it."
              )}
            </p>
          </div>
          <div className="rails-grid mt-7">
            {ROUTES.map((r) => (
              <article key={r.name} className="rail">
                <p className="section-number">{t(r.tag)}</p>
                <h3 className="h-sub mt-3">{t(r.name)}</h3>
                <p className="small mt-3">{t(r.body)}</p>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/start" className="btn btn--outline">{t("Check which route applies to you →")}</Link>
          </div>
        </div>
      </section>

      <section className="transparency">
        <div className="container">
          <div className="section-head">
            <p className="section-number">03</p>
            <p className="eyebrow">{t("Allocation")}</p>
            <h2 className="h-section">{t("Fair allocation is a design constraint, not a feature.")}</h2>
          </div>
          <div className="transparency-grid mt-7">
            {ALLOCATION.map(([k, v]) => (
              <div key={k} className="transparency-item">
                <p className="h-sub">{t(k)}</p>
                <p className="small mt-3">{t(v)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how">
        <div className="container-narrow">
          <div className="section-head">
            <p className="section-number">04</p>
            <p className="eyebrow">{t("After routing")}</p>
            <h2 className="h-section">{t("What happens once you are routed.")}</h2>
          </div>
          <div className="transparency-grid mt-7">
            {AFTER_ROUTING.map(([k, v]) => (
              <div key={k} className="transparency-item">
                <p className="h-sub">{t(k)}</p>
                <p className="small mt-3">{t(v)}</p>
              </div>
            ))}
          </div>
          <SmartImage
            src="/how/how-desk.png"
            alt={t("A hand signing a fee disclosure document")}
            className="slot-banner slot-banner--3x2 mt-6"
          />
        </div>
      </section>

      <section className="principles">
        <div className="container-narrow">
          <div className="section-head">
            <p className="section-number">05</p>
            <p className="eyebrow">{t("Questions")}</p>
            <h2 className="h-section">{t("Frequently asked questions")}</h2>
          </div>
          <div className="mt-6">
            {FAQS.map(([q, a]) => (
              <div key={q} className="credential-leg">
                <div className="credential-leg__head">
                  <span className="h-micro">{t(q)}</span>
                </div>
                <p className="small mt-3">{t(a)}</p>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <Link to="/rights" className="btn btn--outline">{t("Read your legal rights →")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}