import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type {
  Grievance,
  LedgerSummary,
  ProviderAppointment,
  ProviderPaymentStatus,
  ProviderVerification,
  Slot,
} from "../../lib/types";
import { StatusLabel, TierLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { formatINR, formatDate, formatTime } from "../../lib/format";
import { CURRENT_PROVIDER } from "../../lib/seed";

const REDEMPTIONS = [
  ["SERVICE_RECORD_EXPORT", "Signed export of your verified service events"],
  ["PANEL_APPLICATION_EVIDENCE_PACKET", "Evidence packet for a DLSA / High Court panel application"],
  ["RECOGNITION_ELIGIBILITY_PACKET", "Service-threshold evidence for an authorized institution"],
  ["CLE_ACTIVITY_RECORD", "Verifiable record of completed learning activity"],
] as const;

export function ProviderDashboard() {
  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([]);
  const [payments, setPayments] = useState<ProviderPaymentStatus[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState("");
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const load = () => {
    api.getProviderVerification(CURRENT_PROVIDER).then(setVerification);
    api.getLedger(CURRENT_PROVIDER).then(setLedger);
    api.getAppointments(CURRENT_PROVIDER).then(setAppointments);
    api.getProviderPayments(CURRENT_PROVIDER).then(setPayments);
    api.getProviderGrievances(CURRENT_PROVIDER).then(setGrievances);
    api.getSlots(CURRENT_PROVIDER).then(setSlots);
  };

  useEffect(load, []);

  const stale =
    verification &&
    new Date(verification.decidedAt).getTime() + verification.freshnessWindowDays * 86400000 <
      Date.now();

  const handleRedeem = async (type: string) => {
    const r = await api.redeem(CURRENT_PROVIDER, type);
    setRedeemed(`${r.redemptionId} · ${type} generated — evidence artefact, not an official decision.`);
  };

  const handleAddSlot = async () => {
    if (!newSlot) return;
    await api.addSlot(CURRENT_PROVIDER, new Date(newSlot).toISOString());
    setNewSlot("");
    api.getSlots(CURRENT_PROVIDER).then(setSlots);
  };

  return (
    <div className="provider-dash">
      <div className="container">
        <div className="flex-between">
          <div>
            <p className="eyebrow">Provider surface · Adv. Sunita Kumari</p>
            <h1 className="h-section">Dashboard</h1>
          </div>
          <div className="flex-between" style={{ gap: "var(--sp-3)" }}>
            <TierLabel tier={verification?.tier ?? "SELF_DECLARED"} />
            <a href="/provider/verification" className="btn btn--outline btn--sm">Verification</a>
          </div>
        </div>

        {stale && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label="REVERIFICATION DUE" />
            <span className="small">
              Freshness window passed — tier has degraded to DOCUMENT-VERIFIED.{" "}
              <a href="/provider/verification" style={{ textDecoration: "underline" }}>Re-verify now</a>.
            </span>
          </div>
        )}

        <div className="grid-12 mt-6">
          <div className="dash-col" style={{ gridColumn: "span 7" }}>
            <div className="dash-section">
              <h2 className="h-micro">Verification</h2>
              {verification && (
                <>
                  <div className="flex-between mt-4">
                    <TierLabel tier={verification.tier} />
                    <StatusLabel label={stale ? "STALE" : "CURRENT"} />
                  </div>
                  <table className="table table--dense mt-4">
                    <thead>
                      <tr>
                        <th>Check</th>
                        <th>Result</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verification.checks.map((c) => (
                        <tr key={c.checkType}>
                          <td className="small">{c.checkType}</td>
                          <td><StatusLabel label={c.result} /></td>
                          <td>
                            <StatusLabel label={c.sourceMode === "MOCK" ? "DEMO ONLY" : c.sourceMode} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small mt-3">
                    Decided {formatDate(verification.decidedAt)} · freshness{" "}
                    {verification.freshnessWindowDays} days.
                  </p>
                </>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">Service credit ledger</h2>
              {ledger && (
                <>
                  <div className="flex-between mt-4">
                    <div>
                      <p className="meta">Total credits</p>
                      <p className="h-sub tabular">{ledger.totalCredits}</p>
                    </div>
                    <div>
                      <p className="meta">Period credits (Aug)</p>
                      <p className="h-sub tabular">{ledger.periodCredits}</p>
                    </div>
                    <div>
                      <p className="meta">Ledger</p>
                      <StatusLabel label="APPEND-ONLY" />
                    </div>
                  </div>
                  <table className="table table--dense mt-4">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Reference</th>
                        <th style={{ textAlign: "right" }}>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.events.map((e) => (
                        <tr key={e.id}>
                          <td className="small tabular">{formatDate(e.occurredAt)}</td>
                          <td className="small">{e.eventType.replaceAll("_", " ")}</td>
                          <td className="small">{e.reference}</td>
                          <td className="small tabular" style={{ textAlign: "right" }}>
                            +{e.credits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small mt-3">
                    Hash-chained, append-only. Credits are private to you and institutional
                    consumers — never shown to citizens, never purchasable.
                  </p>
                </>
              )}
            </div>

            <div className="dash-section">
              <h2 className="h-micro">Availability</h2>
              <div className="availability-add mt-4">
                <input
                  className="field__input"
                  type="datetime-local"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  aria-label="Add a slot"
                />
                <Button size="sm" variant="ghost" onClick={() => void handleAddSlot()} disabled={!newSlot}>
                  Add slot
                </Button>
              </div>
              <ul className="slot-list mt-4">
                {slots.map((s) => (
                  <li key={s.id} className="slot-item" style={{ cursor: "default" }}>
                    <span className="small tabular">{formatDate(s.startsAt)} · {formatTime(s.startsAt)}</span>
                    <StatusLabel label={s.available ? "AVAILABLE" : "BOOKED"} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">Quotes / payment status</h2>
              <table className="table table--dense mt-4">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.bookingId}>
                      <td className="small tabular">{p.bookingId}</td>
                      <td className="small tabular" style={{ textAlign: "right" }}>
                        {p.amount === 0 ? "s.12 / pro bono" : formatINR(p.amount)}
                      </td>
                      <td><StatusLabel label={p.state} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small mt-3">
                Payments move through an authorized PSP. Only a verified PSP webhook or
                server-side status check moves payment state — never a frontend callback.
              </p>
            </div>
          </div>

          <div className="dash-col" style={{ gridColumn: "span 5" }}>
            <div className="dash-section">
              <h2 className="h-micro">Appointments</h2>
              <ul className="grievance-list mt-4">
                {appointments.map((a) => (
                  <li key={a.id} className="grievance-item">
                    <div className="flex-between">
                      <span className="small tabular">{formatDate(a.startsAt)} · {formatTime(a.startsAt)}</span>
                      <StatusLabel label={a.state} />
                    </div>
                    <p className="small mt-3">{a.citizenLabel} · {a.category}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">Redemptions</h2>
              <ul className="redemption-list mt-4">
                {REDEMPTIONS.map(([type, desc]) => (
                  <li key={type} className="redemption-item">
                    <div>
                      <p className="h-micro">{type.replaceAll("_", " ")}</p>
                      <p className="small mt-2">{desc}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => void handleRedeem(type)}>
                      Export
                    </Button>
                  </li>
                ))}
              </ul>
              {redeemed && (
                <p className="small mt-4" role="status">{redeemed}</p>
              )}
              <p className="small mt-4">
                Evidence packets support applications you make to statutory bodies — the platform
                does not decide eligibility and does not self-issue recognition.
              </p>
            </div>

            <div className="dash-section">
              <h2 className="h-micro">Grievances</h2>
              <ul className="grievance-list mt-4">
                {grievances.map((g) => (
                  <li key={g.id} className="grievance-item">
                    <div className="flex-between">
                      <span className="small tabular">{g.id}</span>
                      <StatusLabel label={g.status} />
                    </div>
                    <p className="small mt-3">{g.summary}</p>
                  </li>
                ))}
              </ul>
              <p className="small mt-4">
                Conduct signals are objective, platform-observable facts — response time, no-show,
                quote honoured. They feed rotation duty accounting and grievance thresholds; they
                are never shown to citizens.
              </p>
            </div>
          </div>
        </div>

        <p className="small mt-6" style={{ color: "var(--color-gray-light)" }}>
          0% platform commission. Third-party payment-processing charges may apply and are
          disclosed separately.
        </p>
      </div>
    </div>
  );
}