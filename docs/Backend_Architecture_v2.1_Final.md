# Backend Architecture v2.1 — Supply-Side Rails for Legal Service Delivery

> Status: Finalization candidate for implementation handoff
> Working name: TBD before submission. **Do not use NyayaSetu**: the Department of Justice now operates a public-facing Nyaya Setu AI legal assistant (unveiled 31 Mar 2026 at the DISHA programme). Keep repository/package names neutral until the product name is locked.

## 0. Design thesis

- v1.0 built a lawyer marketplace (search, rank, book, rate) — answers PS challenge #4 but collides with **Rule 36 of the BCI Rules**.
- v2.1 preserves the **three-rail thesis** and hardens external integrations, payment boundaries, incentive semantics, and implementation fallbacks:
  - **Credential rail** — portable, issuer-verified professional identity for five provider types.
  - **Incentive rail** — service-credit ledger converting pro bono and underserved-area work into institutional recognition and panel eligibility.
  - **Accountability rail** — conduct signals and a grievance pipeline wired to statutory disciplinary bodies, with **zero public rating of individuals**.

### v2.1 hardening decisions

- **Name**: NyayaSetu retired as submission name; code stays product-name-neutral until naming is finalized.
- **External integrations**: DigiLocker, Bar Council/AIBE, eCourts, messaging, institutional exports are adapter-based and capability-flagged.
- **Payments**: platform orchestrates an authorized payment provider; it does **not** self-custody funds or implement its own escrow.
- **Incentives**: credits create evidence/records for institutional use; they never buy directory position, allocation priority, payment priority, or an official credential the platform cannot grant.
- **Ledger**: hash-chain writes are transactional and append-only; no cross-row generated-column claim.
- **Demo honesty**: mocks allowed for unavailable integrations but structurally labelled; can never produce a production-grade official verification outcome.

### Deliberately deleted from v1.0

| Deleted | Reason |
|---|---|
| Weighted ranking engine (§9.3) | Algorithmic channelling of clients toward specific lawyers |
| Star ratings / reputation score | Third-party rating of advocates |
| Win-ratio rewards | Unmeasurable; incentivises refusing hard and poor clients |
| Public portfolio, case victories, blog | Named in BCI's 2025 directives |
| Case narrative storage, engagement updates | Privilege exposure; status via CNR + case-status adapter / external eCourts flow |
| Client rating | Deters the population the PS targets |

### Carried forward

Role-based verification conditions, the three-tier trust model, temporary-file/no-retention processing, deterministic-over-LLM discipline, append-only audit.

## 1. System context

```
Citizen (app / IVR) --------------------+
CSC / VLE (assisted mode) --------------+
Provider -------------------------------+--> PLATFORM BACKEND
DLSA / BCI (institutional) -------------+      |
                                               +-- Credential rail
                                               +-- Allocation / access rail
                                               +-- Incentive rail
                                               +-- Accountability rail
                                               |
External integrations <------------------------+
  - Credential sources (DigiLocker when available)
  - State Bar Council / AIBE
  - Notary and mediation registries
  - Case-status adapter / eCourts fallback
  - Tele-Law / Nyaya Bandhu referral
  - DLSA / HC pro bono panel export
  - Licensed payment provider / gateway
  - SMS / IVR / WhatsApp
```

**Three human actor classes, not two**: the assisted-mode operator (CSC/VLE) is a first-class actor acting on behalf of a citizen without a smartphone. This is PS challenge #5.

## 2. Module map

```
api/
  public/          citizen + assisted-mode surface
  provider/        provider surface
  institutional/   DLSA, bar council, DoJ surface (scoped, read-mostly)
  admin/

modules/
  identity/          auth, roles, delegated (operator-on-behalf) sessions
  credential/        verification cases, adapters, tier decisions
  taxonomy/          legal-need taxonomy, means-test rules
  intake/            need capture, classification, PII minimisation
  eligibility/       Section 12 LSA routing decision
  allocation/        directory mode + rotation mode
  scheduling/        availability, slots, atomic reservation
  matter/            metadata-only engagement record
  ledger/            service credit accounting (append-only)
  redemption/        certificates, panel eligibility packets
  settlement/        quotes, payment-provider orchestration, offline recording
  conduct/           reliability signals, grievance, disciplinary referral
  interop/           outbound referrals, case-status adapter
  notify/
  audit/

adapters/
  credential-sources/  bar-council/  aibe/  notary-registry/
  case-status/  telelaw/  nyayabandhu/  payments/  messaging/  llm/
```

## 3. Storage decision: Postgres, not MongoDB

Two subsystems need guarantees Mongo makes awkward:

**Rotation queue** — assigning next provider in a duty roster under concurrency:

```sql
SELECT provider_id FROM roster_membership
WHERE roster_id = $1 AND status = 'AVAILABLE' AND active_matters < capacity
ORDER BY active_matters ASC, last_assigned_at ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

**Ledger** — append-only, tamper-evident; balances must never drift from events. Use serializable transactions + application/database-function hash-chain writer. **Do not use a generated column** (cannot reference the previous row).

**Slot booking**:

```sql
ALTER TABLE booking ADD CONSTRAINT no_double_book
EXCLUDE USING gist (provider_id WITH =, slot WITH &&)
WHERE (status IN ('HELD','CONFIRMED','SCHEDULED'));
```

Fallback if team refuses to move: Mongo 4.4+ transactions + unique index on `(providerId, slotStart, activeFlag)` — but you write ledger integrity and queue fairness by hand.

## 4. Core schema

```sql
-- ---------- identity ----------
user_account(id, phone_hash, email, status, created_at)
role_grant(user_id, role, scope, granted_at)         -- CITIZEN|PROVIDER|OPERATOR|INSTITUTION|ADMIN
operator_delegation(id, operator_user_id, citizen_user_id,
                    consent_ref, started_at, ended_at)  -- assisted mode audit

-- ---------- credential ----------
provider(id, user_id, provider_type, display_name, district, state,
         languages[], service_modes[], status, tier, tier_decided_at)
provider_service(provider_id, taxonomy_code, fee_min, fee_max, pro_bono_available)

verification_case(id, provider_id, status, tier_outcome,
                  submitted_at, decided_at, decided_by)
verification_check(case_id, check_type, source_id, result,
                   matched_fields[], source_ref, checked_at)
-- check_type: IDENTITY | DEGREE | ENROLMENT | PRACTICE_CERT | APPOINTMENT | CURRENCY
-- result:     PASS | MISMATCH | NOT_FOUND | CONFLICT | UNAVAILABLE

-- ---------- intake & routing ----------
need_request(id, citizen_user_id, operator_delegation_id NULL,
             taxonomy_code, district, language, mode_pref,
             fee_ceiling, urgency, channel, created_at)
             -- narrative text is NEVER a column here
eligibility_decision(need_request_id, section12_category NULL,
                     self_declared, route, decided_at)
                     -- route: PAID | LEGAL_AID_REFERRAL | PRO_BONO_ROTATION

-- ---------- allocation ----------
roster(id, district, taxonomy_code, provider_type, mode)  -- mode: ROTATION
roster_membership(roster_id, provider_id, status, capacity,
                  active_matters, last_assigned_at, joined_at)
allocation(id, need_request_id, provider_id, mode, roster_id NULL,
           seed NULL, position NULL, decided_at, decided_by)
           -- mode: CITIZEN_CHOICE | ROTATION
directory_surface(need_request_id, provider_id, position, seed)
           -- what was shown, in what order, why: full replay for audit
```

**What has no table**: rating, score, rank, portfolio, case document, engagement update, win record, client-funds wallet. Payment tables hold external provider references and state only.

## 5. Credential subsystem

### 5.1 Evidence sources (priority order)

| Leg | Primary source | Fallback |
|---|---|---|
| Identity | Issuer-attested gov ID via approved requester integration (when available) | OTP-verified phone + name consistency; manual review where identity proof required |
| Law degree | Issuer-attested university document (when available) | Uploaded certificate → temp processing → delete after decision |
| Enrolment | Current State Bar Council / authoritative roll lookup (when available) | Enrolment certificate → temp processing + historical/secondary record match + review |
| Right to practise | AIBE / Certificate of Practice (authorized or public verification path) | Document evidence + review; never infer from enrolment-number format |
| Currency | Current authoritative Bar Council status check within freshness window | Review queue; source unavailability caps tier |
| Notary | Notary appointment register, validity window | Appointment certificate → temp processing |
| Mediator | Court-annexed centre / MCPC empanelment list | Training certificate → temp processing |

Issuer-attested credentials are the preferred path, **not a guaranteed dependency**. MVP must run with a mix of LIVE, MOCK, and OFF adapters without changing business rules.

### 5.2 Tier rules

- `SELF_DECLARED` — profile complete; no issuer-attested credential
- `DOCUMENT_VERIFIED` — issuer-attested OR validated document evidence for required legs; identity consistent
- `FULLY_VERIFIED` — DOCUMENT_VERIFIED + currency confirmed against authoritative register within freshness window

**Two hard rules (both testable)**:
1. A format/pattern check on an enrolment number never contributes to a tier (validation ≠ verification).
2. The LLM can produce `REVIEW_REQUIRED`. It can **never** produce `FULLY_VERIFIED`.

Tiers expire: `tier_decided_at + freshness_window` drives a `provider.reverification.due` job. Stale FULLY_VERIFIED degrades to DOCUMENT_VERIFIED automatically.

### 5.3 Adapter contract

```ts
interface CredentialSource {
  sourceId: string;
  legs: CheckType[];
  supports(t: ProviderType): boolean;
  check(input: CredentialQuery): Promise<{
    result: 'PASS'|'MISMATCH'|'NOT_FOUND'|'CONFLICT'|'UNAVAILABLE';
    matchedFields: string[];
    sourceRef?: string;
    validUntil?: string;
    checkedAt: string;
  }>;
}
```

`UNAVAILABLE` must never silently become `PASS`. Source downtime caps the achievable tier; it does not grant one.

### 5.4 Credential capability policy

| Mode | Meaning |
|---|---|
| `LIVE` | Real authorized/public source; result may contribute to a tier |
| `MOCK` | Synthetic fixture for SIH/demo; labelled `DEMO_ONLY`; cannot by itself produce FULLY_VERIFIED |
| `OFF` | Capability unavailable; UI/API exposes limitation; workflow falls back to another permitted source or review |

`FULLY_VERIFIED` requires **at least one LIVE current-authority check** for the role-specific currency/enrolment leg.

## 6. Allocation subsystem — the Rule 36 core

**No scoring. Two modes, both deterministic, both replayable.**

### Mode A — Citizen-Choice Directory (paid engagements)

- **Hard filters only**: provider type, taxonomy code, district, language, service mode, fee ceiling, minimum tier. Boolean set membership — no weights, no partial credit.
- **Fair ordering**: seeded rotation, `seed = need_request.id`. No provider holds persistent top position. `surfaced_count` counter breaks ties toward least-shown eligible provider.
- **No comparative language** in response DTO. No `matchScore`, no `reasons: ["BEST_MATCH"]`, no "recommended". Response explains the filter, not the lawyer:

```json
{
  "requestId": "req_...",
  "filterSummary": {
    "category": "TENANCY_DEPOSIT", "district": "PATNA",
    "language": "hi", "feeCeiling": 2000
  },
  "matchCount": 14,
  "providers": [ { "providerId": "...", "displayName": "...",
                   "tier": "FULLY_VERIFIED", "feeRange": [800,1500],
                   "languages": ["hi","en"], "nextSlot": "..." } ],
  "ordering": "ROTATED",
  "seed": "req_..."
}
```

- The citizen selects. The platform never selects.
- `directory_surface` persists exactly what was shown and in what order — any allegation of preferential placement is answerable with a replay.

### Mode B — Rotational Panel Allocation (pro bono, legal-aid-tier, assisted-mode)

```sql
next(roster) =
  eligible members
  ORDER BY active_matters ASC, last_assigned_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1
```

Eligibility gate: tier floor, capacity not exceeded, no conflict flag, roster status AVAILABLE. Decline allowed with reason code, re-enters rotation, records a `conduct_signal`. Repeated declines reduce roster priority — **duty accounting, not client-facing reputation**.

### Why this survives scrutiny

| Concern | Control |
|---|---|
| Algorithmic channelling | No score exists; seeded rotation, replayable from seed |
| Paid placement | No field, no table, no code path prices position |
| Third-party rating | No rating table; conduct signals institution-facing only |
| Platform "recommending" | Mode A returns filtered set; citizen chooses. Mode B is duty rotation |
| AI influencing who gets work | LLM output feeds `taxonomy_code` only, validated against a closed enum |

> **The AI boundary, stated for judges**: AI reads what the citizen's problem is. It never touches who they get.

## 7. Incentive subsystem — the actual PS answer

### 7.1 Earn events

| Event | Unit | Notes |
|---|---|---|
| `PRO_BONO_MATTER_CLOSED` | matter | Requires closure confirmed by both parties |
| `LEGAL_AID_TIER_MATTER_CLOSED` | matter | Section 12–eligible citizen served |
| `ASPIRATIONAL_BLOCK_SERVICE` | matter | Geographic multiplier for underserved blocks |
| `ROTATION_DUTY_COMPLETED` | matter | Accepted and completed a rotation assignment |
| `FIRST_RESPONSE_SLA_MET` | matter | Responded within window |
| `CLE_MODULE_COMPLETED` | module | Continuing legal education |
| `LOK_ADALAT_SETTLEMENT` | matter | Rewards resolution, not litigation |

Weights live in `weight_version` config, published, versioned — a credit earned under v1 weights stays valid when v2 ships.

### 7.2 Integrity

```text
credit_event.hash = sha256(prev_hash || id || provider_id || event_type
                           || credits || occurred_at)
```

- Append-only enforced at the grant level (INSERT only, no UPDATE/DELETE for app role).
- Corrections are compensating negative entries, never edits.
- `credit_balance` maintained in the same serializable transaction as the event insert.
- Writer locks the provider's ledger head, reads prev_hash, computes hash in trusted service/db function, inserts event, updates balance — one transaction.
- **No blockchain.** Trust boundary is a government platform with an auditable database; hash chain gives tamper-evidence at a thousandth of the cost.

### 7.3 Redemption — what credits actually buy

| Redemption | What it is |
|---|---|
| `SERVICE_RECORD_EXPORT` | Signed export of verified service events for provider's own records |
| `PANEL_APPLICATION_EVIDENCE_PACKET` | Evidence packet for DLSA / High Court panel application; platform does not decide eligibility |
| `RECOGNITION_ELIGIBILITY_PACKET` | Service-threshold evidence an authorized institution may use; platform does not self-issue official recognition |
| `CLE_ACTIVITY_RECORD` | Verifiable record of completed learning; official CLE credit only if competent institution recognizes it |

### 7.4 The guardrail that keeps this lawful

- Credits are **never citizen-facing**: no leaderboard, no public badge, no "gold advocate".
- Visible to the provider (own record) and institutional consumers (DLSA, bar council, DoJ) via institutional API.
- A service record submitted to a statutory body is not advertising. A badge shown to prospective clients is. Same data, only one is legal.
- Credits are **non-purchasable and non-transferable** — no code path mints a credit from a payment. Never change directory order, roster eligibility, or payment-settlement speed.

### 7.5 Non-credit incentives worth more than credits

- **Payment protection** through an authorized payment provider (orchestrated via provider API; platform does not custody client funds).
- **Zero platform commission** — state the number: 0%. Third-party payment-processing charges may apply, disclosed separately.
- **Fee transparency enforced upfront** — quote before work, quote honoured, disputes go to grievance.
- **Low-friction onboarding** — issuer-attested credentials; fallback is authority lookup + temporary document processing + review.

### 7.6 Payment boundary — orchestration, not custody

Platform is not a payment system operator, no internal client-funds balance. Backend responsibilities only:
1. Creating a provider-side payment intent/order
2. Storing external reference and disclosed fee breakdown
3. Verifying webhook signatures and idempotency
4. Reconciling provider-side payment/settlement status
5. Recording offline-payment acknowledgements separately
6. Requesting provider-supported cancellation/hold/refund actions where applicable

```
Citizen -> Authorized PSP -> professional / provider settlement
             ^                    |
             |                    v
       signed webhook       status/reference
             \____________________/
                  platform backend
```

No platform-controlled wallet, no generic escrow abstraction. PSP hold/split/marketplace-settlement products stay behind the PaymentProvider adapter.

## 8. Access subsystem — PS challenge #5

### 8.1 Channels

| Channel | Mechanism |
|---|---|
| App / web | OTP-first. Google OAuth optional, never required |
| Assisted mode | CSC/VLE operator creates a delegated session with recorded consent |
| IVR / toll-free | Voice intake, DTMF fallback, operator handoff |
| WhatsApp | Text + voice note intake |

`operator_delegation` records who acted, for whom, under what consent, over what window. Every write in that window carries both principals into `audit_event`. **Assisted access without this is an impersonation hole.**

### 8.2 Eligibility router

```text
if self_declared_section12_category:
    route = LEGAL_AID_REFERRAL   -> refer to DLSA / Nyaya Bandhu, do not charge
elif fee_ceiling below district floor for category:
    route = PRO_BONO_ROTATION    -> Mode B against pro-bono roster
else:
    route = PAID                 -> Mode A directory
```

Platform refers; it does **not** adjudicate eligibility (DLSA's statutory function). Self-declaration is sufficient to route; referral carries the declaration for the authority to verify.

> This is the single most important flow — it turns "marketplace" into "access to justice". A citizen entitled to free representation must not be able to accidentally pay for it.

### 8.3 Language

Intake classification runs on 22 scheduled languages via LLM adapter. Taxonomy codes, notifications, IVR prompts are **pre-translated static content**, not model output. Never let a model generate the legal category name a citizen reads.

## 9. Accountability subsystem

### 9.1 Conduct signals, not ratings

`conduct_signal` records objective, platform-observable facts: response time, no-show, fee disclosed before work, quote honoured, unilateral withdrawal. Not opinions.

Consumption rules:
- Never shown to citizens on a provider profile
- Feed rotation priority (duty accounting)
- Trigger grievance review at threshold
- Exposed in aggregate to institutional consumers

### 9.2 Grievance → statutory referral

```text
OPEN -> TRIAGED -> {PLATFORM_RESOLVED | REFERRED_TO_BAR_COUNCIL | REFERRED_TO_DLSA}
```

Professional misconduct is a State Bar Council matter under **s.35 of the Advocates Act**. Platform's job: package a referral with a clean evidence trail and track outcome — not adjudicate, not publish a verdict as a star rating. Interim measures under documented policy: suspend rotation eligibility, pause directory visibility, request hold/cancellation through authorized payment provider where supported. **Never freezes funds it does not lawfully custody.**

### 9.3 Transparency without individual scoring

Public dashboards report at aggregate level: matters served per district, pro bono hours statewide, median response time by category, grievance resolution rates. Satisfies PS challenge #2 without rating a single named advocate.

## 10. Privilege boundary

Platform stores **metadata about an engagement, never its content**.

| Stored | Not stored |
|---|---|
| Who, when, category code, status, fee, CNR pointer | Case narrative, documents, evidence, advice, correspondence |

- Rationale: attorney-client communications protected under **s.132 of the Bharatiya Sakshya Adhiniyam**.
- CNR stored as a pointer; case status only via authorized/available case-status integration or official eCourts flow. **No scraping, no undocumented API.**
- Intake narrative: raw text goes to classifier, discarded on same request. Pre-model redaction pass strips phone numbers, Aadhaar-shaped strings, account numbers, names where detectable. `need_request` has no narrative column.

### 10.1 Case-status adapter policy

```ts
interface CaseStatusSource {
  mode: 'LIVE'|'LINK_ONLY'|'OFF';
  getByCnr(cnr: string): Promise<CaseStatusResult>;
}
```

- `LIVE`: only with authorized/documented integration
- `LINK_ONLY`: returns official eCourts destination/instructions
- `OFF`: case-status enrichment unavailable
- Scraping, CAPTCHA bypass, undocumented private endpoints are **not implementation options**

## 11. API surface

```text
POST   /v1/auth/otp/request | /verify
POST   /v1/auth/delegation                 operator opens assisted session
DELETE /v1/auth/delegation/:id

POST   /v1/providers                       create profile
POST   /v1/providers/:id/credentials/issuer-fetch  initiate configured requester/issuer fetch
POST   /v1/providers/:id/credentials/upload        fallback, multipart, ephemeral
GET    /v1/providers/:id/verification

POST   /v1/needs                           intake -> classification -> eligibility
GET    /v1/needs/:id/directory             Mode A: filtered, rotated set
POST   /v1/needs/:id/select                citizen chooses a provider
POST   /v1/needs/:id/rotate                Mode B: rotation assignment
GET    /v1/needs/:id/referral              legal-aid referral artefact

GET    /v1/providers/:id/slots
POST   /v1/bookings | /:id/accept | /:id/decline | /:id/cancel

POST   /v1/matters/:id/close
GET    /v1/matters/:id/status              case-status adapter; returns LINK_REQUIRED if no authorized integration

GET    /v1/me/credits                      provider's own ledger
POST   /v1/me/redemptions
GET    /v1/me/service-record                signed service-record export
GET    /v1/me/panel-evidence                panel-application evidence packet

POST   /v1/payments/quotes
POST   /v1/payments/intents                 create intent/order with authorized PSP
GET    /v1/payments/:id
POST   /v1/payments/webhooks/:provider      verify provider signature before state transition
POST   /v1/payments/:id/offline-ack

POST   /v1/grievances
GET    /v1/institutional/providers/:id/record    scoped, consented
GET    /v1/institutional/rosters/:id
GET    /v1/public/stats                          aggregate only
```

**Response DTOs are allowlisted.** A lint rule in CI fails the build on `score`, `rank`, `rating`, `recommended`, `topMatch`, `creditBalance`, or `conductScore` in any citizen-facing DTO. Institutional/provider-only DTOs are separately namespaced and schema-tested.

## 12. Build order

| Phase | Deliverable | Exit test |
|---|---|---|
| 0 | Repo, Postgres, migrations, error model, audit, CI | Structured errors, audit writes on every mutation |
| 1 | Identity + delegation + provider profiles | Operator can open a consented session and act |
| 2 | Credential rail (one live/current authority adapter + requester integration if available + mock adapters) | Advocate reaches FULLY_VERIFIED only with current authoritative match; source outage cannot upgrade tier |
| 3 | Intake + eligibility router | Section 12 citizen is referred, never charged |
| 4 | Allocation Mode A + Mode B | Directory ordering replays from seed; rotation is fair under 50 concurrent requests |
| 5 | Scheduling + booking | Exclusion constraint holds; no double-book under load |
| 6 | Ledger + redemption | Hash chain verifies; balance reconciles from events; panel packet exports |
| 7 | Payment-provider orchestration | Only verified PSP webhook/server-side status check moves payment state; platform never self-custodies funds |
| 8 | Conduct + grievance + institutional API | Referral packet generated with full evidence trail |

**Demo narrative**: advocate verifies via configured credential path → citizen in a rural block uses app/IVR-assisted intake → VLE opens a delegated session → eligibility router detects Section 12 category and routes to legal-aid/pro-bono handling instead of paid booking → rotation assigns next advocate on duty → matter closes → ledger credits pro bono + underserved-area service → advocate exports signed service record / panel-application evidence packet. No step claims the platform grants official panel eligibility. Answers all five PS challenges in one flow — no ranked list of lawyers in any frame.

## 13. External dependency matrix and feature flags

Must boot and pass core tests even when non-essential government/partner integrations are unavailable. Each adapter configured explicitly; **no silent mock in production**.

| Capability | MVP mode | Production target | Failure behaviour |
|---|---|---|---|
| State Bar/current authority check | LIVE for at least one supported jurisdiction | Multiple current-authority adapters | Cap tier / review queue |
| DigiLocker requester fetch | LIVE if onboarding approved, else MOCK or OFF | Approved requester integration with supported issuers | Offer fallback credential path |
| AIBE/CoP lookup | LIVE only where authorized/public path exists | Authorized verification source | Cap relevant verification leg |
| eCourts case status | LINK_ONLY unless documented integration | Authorized case-status integration | Return official external continuation |
| Payment provider | Sandbox LIVE | Authorized PSP production account | Booking can remain unpaid / offline path |
| IVR / WhatsApp | MOCK or sandbox as available | Approved messaging/voice provider | Web/app assisted mode remains usable |
| Institutional exports | Local signed artefact | DLSA/BCI/DoJ integration where agreed | Export remains evidence, not official status |

**Recommended flags**:

```text
CREDENTIAL_DIGILOCKER_MODE=LIVE|MOCK|OFF
CREDENTIAL_BAR_MODE=LIVE|MOCK|OFF
CREDENTIAL_AIBE_MODE=LIVE|MOCK|OFF
CASE_STATUS_MODE=LIVE|LINK_ONLY|OFF
PAYMENTS_MODE=LIVE|SANDBOX|OFF
IVR_MODE=LIVE|MOCK|OFF
WHATSAPP_MODE=LIVE|MOCK|OFF
INSTITUTIONAL_EXPORT_MODE=LOCAL|LIVE|OFF
```

**Handoff rule**: README and deployment manifest must state which capabilities are LIVE, MOCK, LINK_ONLY, or OFF. A demo must never visually represent a mock source as a government-confirmed result.

## 14. Acceptance tests that define correctness

1. No code path assigns a numeric quality score to a provider.
2. Directory ordering for a given `need_request.id` is reproducible from the stored seed.
3. A provider cannot improve directory position through any payment; no endpoint accepts one.
4. Service credits cannot improve citizen-facing directory position, rotational allocation priority, or payment-settlement speed.
5. `PANEL_APPLICATION_EVIDENCE_PACKET`, `RECOGNITION_ELIGIBILITY_PACKET`, `CLE_ACTIVITY_RECORD` are evidence artefacts; none is an official institutional decision unless a live authorized institution issues it.
6. Rotation assignment under 50 concurrent requests distributes evenly, each provider at most once.
7. `UNAVAILABLE` from a credential source never yields `FULLY_VERIFIED`.
8. A regex/format match alone never contributes to any tier.
9. LLM output cannot set a verification tier or influence allocation order.
10. A Section 12–eligible citizen cannot complete a paid booking without an explicit override.
11. `need_request` contains no free-text narrative after the request completes.
12. Credit balance recomputed from `credit_event` matches `credit_balance` exactly.
13. No `credit_event` row can be updated or deleted by the application role.
14. A citizen-facing DTO containing any credit, conduct, or grievance field fails CI.
15. Two concurrent bookings for one slot: one succeeds, one gets 409.
16. A forged frontend callback cannot transition a payment to PAID or SETTLED; only a verified payment-provider webhook or server-side provider status check can do so.
17. The platform has no wallet/balance table for client funds and no code path that self-custodies money.
18. If a case-status integration is unavailable, the API returns an explicit fallback (`LINK_REQUIRED` / `UNAVAILABLE`) rather than scraping or inventing status.
19. External adapters marked OFF or UNAVAILABLE never silently fall back to a successful business decision.

## Appendix A. Reference anchors for v2.1 hardening

> Architecture constraints and dependency anchors, not a substitute for legal review or partner onboarding.

- **Bar Council of India — BCI Rules**: Rule 36 prohibits advocates from soliciting work or advertising. Basis for removing public ratings, ranked recommendations, paid placement, promotional win/portfolio features. https://www.barcouncilofindia.org/info/bci-rules
- **Advocates Act, 1961 — s.35**: professional misconduct complaints handled through State Bar Council disciplinary mechanism. https://www.indiacode.nic.in/show-data?actid=AC_CEN_3_46_00001_196125_1517807320172&orderno=42&sectionId=14672&sectionno=35
- **Bharatiya Sakshya Adhiniyam, 2023 — s.132**: professional communications between advocate and client statutorily protected → metadata-only privilege boundary. https://www.indiacode.nic.in/show-data?actid=AC_CEN_5_23_00049_2023-47_1719292804654&orderno=132
- **DigiLocker — Requesters**: requester organizations must register and integrate; capability-dependent rather than assumed. https://www.digilocker.gov.in/web/partners/requesters
- **eCourts Services**: public CNR-based case-status access exists; no generally available developer API assumed → LINK_ONLY support. https://services.ecourts.gov.in/App/apphelp.html
- **RBI — PSS Act FAQ**: operating a payment system requires RBI authorization → delegate fund movement to authorized PSP. https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=420
- **PostgreSQL — Generated Columns**: cannot reference other rows → ledger hash chain written transactionally. https://www.postgresql.org/docs/current/ddl-generated-columns.html
- **PostgreSQL — FOR UPDATE ... SKIP LOCKED**: queue-like tables, duty-roster allocation. https://www.postgresql.org/docs/current/sql-select.html
- **PostgreSQL — Range exclusion constraints**: non-overlapping ranges, prevents double-booking. https://www.postgresql.org/docs/current/rangetypes.html
- **Press Information Bureau — Nyaya Setu**: DoJ's Nyaya Setu AI Chatbot unveiled 31 Mar 2026 → submission name must change. https://www.pib.gov.in/PressReleasePage.aspx?PRID=2247310