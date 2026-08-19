import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { ProviderVerification, Slot } from "../../lib/types";
import { PROVIDERS } from "../../lib/seed";
import { TierLabel, StatusLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { formatINR, formatTime } from "../../lib/format";
import { languageLabel } from "../../lib/languages";

export function ProviderProfile() {
  const { providerId = "p_001" } = useParams();
  const [params] = useSearchParams();
  const needId = params.get("need") ?? "req_9f2c1a";

  const provider = PROVIDERS.find((p) => p.providerId === providerId) ?? PROVIDERS[0];

  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ bookingId: string; amount: number } | null>(null);
  const [bookingState, setBookingState] = useState<string>("QUOTE_READY");

  useEffect(() => {
    api.getProviderVerification(providerId).then(setVerification);
    api.getSlots(providerId).then(setSlots);
  }, [providerId]);

  const handleBook = async () => {
    const q = await api.createQuote(providerId, needId);
    setBooking({ bookingId: q.bookingId, amount: q.amount });
  };

  const handlePay = async () => {
    if (!booking) return;
    await api.initiatePayment(booking.bookingId);
    setBookingState("PAYMENT_INITIATED");
    await api.confirmFromWebhook(booking.bookingId);
    setBookingState("PAID");
  };

  return (
    <div className="profile">
      <div className="container">
        <div className="grid-12">
          <div className="profile-main">
            <p className="eyebrow">Professional profile</p>
            <h1 className="h-section mt-3">{provider.displayName}</h1>
            <div className="mt-3">
              <TierLabel tier={provider.tier} />
              {!provider.tierFresh && <StatusLabel label="REVERIFICATION DUE" />}
            </div>
            <p className="small mt-4">
              {provider.providerType.replace("_", " ")} · {provider.district}, {provider.state} ·{" "}
              {provider.languages.map((l) => languageLabel(l)).join(" · ")} ·{" "}
              {provider.serviceModes.join(" / ")}
            </p>

            <hr className="rule mt-6" />

            <h2 className="h-micro mt-6">Verification status</h2>
            {verification && (
              <table className="table table--dense mt-3">
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Result</th>
                    <th>Source</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {verification.checks.map((c) => (
                    <tr key={c.checkType}>
                      <td className="small">{c.checkType}</td>
                      <td>
                        <StatusLabel label={c.result} />
                      </td>
                      <td className="small">{c.sourceLabel}</td>
                      <td>
                        <StatusLabel label={c.sourceMode === "MOCK" ? "DEMO ONLY" : c.sourceMode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="small mt-3">
              {provider.tier} decided {verification ? new Date(verification.decidedAt).toLocaleDateString("en-IN") : ""}.
              This professional has no ratings, rankings or public reviews — that information does
              not exist on this platform.
            </p>
          </div>

          <aside className="profile-side">
            <div className="profile-card">
              <h2 className="h-micro">Book a slot</h2>
              <p className="small mt-3">
                Fee range:{" "}
                <span className="tabular">
                  {provider.feeRange
                    ? `${formatINR(provider.feeRange[0])} – ${formatINR(provider.feeRange[1])}`
                    : "Pro bono"}
                </span>
                <br />
                A full quote is shown before any payment.
              </p>

              {!booking ? (
                <>
                  <ul className="slot-list mt-4">
                    {slots.map((s) => (
                      <li key={s.id}>
                        <button
                          className={`slot-item ${selectedSlot === s.id ? "is-selected" : ""}`}
                          onClick={() => setSelectedSlot(s.id)}
                          disabled={!s.available}
                        >
                          <span className="small tabular">{formatTime(s.startsAt)}</span>
                          <span className="small meta">21 Aug</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <Button block className="mt-5" disabled={!selectedSlot} onClick={() => void handleBook()}>
                    Request quote
                  </Button>
                </>
              ) : (
                <div className="quote" role="status">
                  <p className="h-micro">Quote ready</p>
                  <p className="h-sub tabular mt-3">{formatINR(booking.amount)}</p>
                  <p className="small mt-2">Professional fee — disclosed before work. Honoured once given.</p>
                  <p className="small mt-3">
                    Payment is processed by an authorized payment provider. The platform never holds
                    your money.
                  </p>
                  {bookingState === "QUOTE_READY" && (
                    <Button block className="mt-5" variant="blue" onClick={() => void handlePay()}>
                      Pay via PSP (sandbox)
                    </Button>
                  )}
                  {bookingState === "PAYMENT_INITIATED" && (
                    <p className="small mt-5">Awaiting provider confirmation…</p>
                  )}
                  {bookingState === "PAID" && (
                    <div className="mt-5">
                      <StatusLabel label="PAID" />
                      <p className="small mt-3">
                        Confirmed only by the payment provider's signed webhook — the browser never
                        sets this state.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}