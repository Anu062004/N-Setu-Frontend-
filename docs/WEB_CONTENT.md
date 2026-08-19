# Web Content — Legal Access Platform

Source of truth: `Backend_Architecture_v2.1_Final.md` and `frontend_design_requirements.txt` (docs/).
This document defines the page content and its grounding in the architecture. Copy below is
factual product content — every claim traces to a documented system behaviour.

## 0. Positioning

One sentence: **A legal services platform built on three rails — verified professional identity,
service incentives, and institutional accountability — with no rankings, no ratings, and no paid
placement.**

- Not a lawyer marketplace (BCI Rule 36 prohibits advocates from soliciting work or advertising).
- The citizen is routed, never recommended. The platform answers *what* the problem is; it never
  decides *who* the citizen gets.
- **Product name: Nayasetu.** Note: the Department of Justice operates a public-facing "Nyaya Setu"
  AI legal assistant (unveiled 31 Mar 2026). The founding architecture recommended a neutral name
  until branding was locked; the product owner has since selected **Nayasetu** for this build.

## 1. Hero (landing, above the fold)

| Element | Content |
|---|---|
| Eyebrow | ACCESS TO JUSTICE FOR ALL |
| Headline | Get the legal help you are entitled to. |
| Subline | Verified professionals, fair allocation and legal aid routed before any payment. No rankings, no ratings, no paid placement. |
| CTA primary | I need legal help |
| CTA secondary | Check eligibility |
| Trust line | Secure · Private · Confidential |
| Media | Two editorial images, 5-second slideshow, full-screen behind the headline. Caption concepts: "Access to justice is a constitutional promise." / "Verified professionals. Fair allocation. Institutional accountability." |

Grounded in: design thesis (§0), homepage brief (frontend report §6), no rankings above the fold.

## 2. Principles (four)

| № | Title | Content (factual) |
|---|---|---|
| 01 | Verified professionals | Provider identity is verified against issuer-attested sources where available — Bar Council enrolment, AIBE practice certificate, currency against the authoritative register. Tiers: SELF-DECLARED, DOCUMENT-VERIFIED, FULLY VERIFIED. Source availability is stated honestly: LIVE, DEMO ONLY, OFF. |
| 02 | Legal aid first | Before any paid flow, the Section 12 (Legal Services Authorities Act, 1987) check runs. A citizen entitled to free representation is referred to the District Legal Services Authority — never charged. |
| 03 | Fair allocation | Mode A: a hard-filtered directory ordered by fair rotation — the citizen chooses. Mode B: duty rotation for pro bono and legal-aid work, as DLSA panels assign counsel. |
| 04 | Institutional accountability | Objective conduct signals and a grievance pipeline wired to statutory bodies. Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform packages evidence; it does not adjudicate. |

Grounded in: credential rail (§5), eligibility router (§8.2), allocation modes (§6), accountability (§9).

## 3. The three rails (product core)

| Rail | Content |
|---|---|
| Credential | Portable, issuer-verified professional identity for advocates, notaries, mediators, paralegals and counsel. A regex on an enrolment number is never verification. A stale FULLY VERIFIED degrades automatically. |
| Incentive | A service-credit ledger for work the system exists to promote: pro bono matters, legal-aid-tier matters, underserved blocks, rotation duty, response SLAs, CLE modules, Lok Adalat settlements. Append-only, hash-chained. Credits are evidence for institutions — never a leaderboard, never citizen-visible, never purchasable. |
| Accountability | Conduct signals are objective and platform-observable — response time, no-show, quote honoured. Grievances run OPEN → TRIAGED → PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA. Public reporting is aggregate only — no named individual is rated. |

Grounded in: three-rail thesis (§0), ledger integrity (§7.2), redemption guardrail (§7.4), grievance pipeline (§9.2).

## 4. How it works (citizen flow)

| Step | Title | Content |
|---|---|---|
| 01 | Tell us your problem | Plain-language categories — property, family, employment, consumer, criminal, tenancy, other. No legal jargon required. No free-text narrative is stored. |
| 02 | We check eligibility | The Section 12 and district affordability check runs before any paid flow. |
| 03 | You get one route | Legal-aid referral (DLSA / Nyaya Bandhu), pro bono duty rotation, or the paid directory. Exactly one route is shown. |
| 04 | Work begins transparently | Quote before work, quote honoured. Payments move through an authorized payment provider — the platform never holds your money. Matters are metadata only. |

Grounded in: intake + eligibility router (§8.2, §4), payment boundary (§7.6), privilege boundary (§10).

## 5. Legal grounding (rights section)

Content: Section 12, Legal Services Authorities Act 1987 entitles specific categories of citizens
to free legal services — Scheduled Castes and Scheduled Tribes, women and children, industrial
workmen, persons in custody, victims of trafficking, victims of disaster and mass violence,
victims of abuse of power, persons with disability, and persons financially disadvantaged.
Self-declaration is sufficient to route; the DLSA verifies. Why no ratings: Rule 36, BCI Rules
prohibits advocates from soliciting work or advertising. Privilege: matters are metadata only
(s.132, Bharatiya Sakshya Adhiniyam 2023).

Grounded in: Appendix A reference anchors, eligibility router (§8.2), privilege boundary (§10).

## 6. Transparency strip

- 0% platform commission. Third-party payment-processing charges may apply and are disclosed separately.
- Fee disclosed before work; quote honoured.
- No wallet, no escrow, no platform-held funds — an authorized payment provider only.
- Case status is shown only through an authorized integration; otherwise an official-link fallback (LINK REQUIRED).
- Mock sources are labelled DEMO ONLY and can never produce a FULLY VERIFIED outcome.

Grounded in: §7.5, §7.6, §10.1, §13.

## 7. Aggregate statistics (public)

Matters served by district, pro bono matters, median response time by category, grievance
resolution rate. Aggregate only — no named individual. Grounded in §9.3.

## 8. Tone rules

- Factual over promotional: "verified", "routed", "referred", "append-only" — never "best",
  "top", "recommended", "trusted by".
- Never use rating/score/rank vocabulary in citizen-facing copy.
- State capability honestly (LIVE / DEMO ONLY / OFF) wherever verification or integration is shown.
- No emoji, no exclamation marketing, no testimonials, no lawyer endorsements.

## 9. Footer

| Column | Links (route) |
|---|---|
| Citizens | Start legal help · Check eligibility · Legal aid referral · Grievance |
| Professionals | Verification · Provider dashboard · Service credits · Redemptions |
| Institutions | DLSA · Bar Council · Rosters · Aggregate statistics |
| Trust | Secure · Private · Confidential · Privilege boundary · Capability status |

Disclaimer: product name pending; not affiliated with any court, bar council or government body.