import { useEffect, useState } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { api, ApiError } from "../../lib/api";
import type { BookingQuote, ProviderSummary, ProviderVerification, SlotsResponse } from "../../lib/types";
import { TierLabel, StatusLabel } from "../../components/ui/StatusLabel";
import { Button } from "../../components/ui/Button";
import { formatINR } from "../../lib/format";
import { languageLabel } from "../../lib/languages";
import { useI18n } from "../../lib/i18n";

type BookingPhase =
  | { kind: "idle" }
  | { kind: "selected" }
  | { kind: "quote"; quote: BookingQuote }
  | { kind: "quoteError"; code: string; message: string }
  | { kind: "payUnavailable"; code: string; message: string; paymentId: string };

export function ProviderProfile() {
  const { t } = useI18n();
  const { providerId = "" } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const needId = params.get("need");
  const routed = (location.state as { provider?: ProviderSummary } | null)?.provider ?? null;

  const [verification, setVerification] = useState<ProviderVerification | null>(null);
  const [verificationMissing, setVerificationMissing] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [selectState, setSelectState] = useState<{ busy: boolean; done: boolean; error: string | null }>({
    busy: false,
    done: false,
    error: null,
  });
  const [phase, setPhase] = useState<BookingPhase>({ kind: "idle" });
  const [ackState, setAckState] = useState<{ busy: boolean; done: boolean; error: string | null }>({
    busy: false,
    done: false,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    api
      .getVerification(providerId)
      .then((v) => alive && setVerification(v))
      .catch(() => alive && setVerificationMissing(true));
    api
      .getSlots(providerId)
      .then((s) => alive && setSlotsData(s))
      .catch(() => alive && setSlotsData({ availabilityPolicy: "NOT_CONFIGURED", slots: [] }));
    return () => {
      alive = false;
    };
  }, [providerId]);

  const handleSelect = async () => {
    if (!needId) return;
    setSelectState({ busy: true, done: false, error: null });
    try {
      await api.selectProvider(needId, providerId);
      setSelectState({ busy: false, done: true, error: null });
    } catch (e) {
      setSelectState({
        busy: false,
        done: false,
        error:
          e instanceof ApiError
            ? `${e.code} — ${e.message}`
            : e instanceof Error
              ? e.message
              : "Selection failed",
      });
    }
  };

  const handleQuote = async () => {
    try {
      const quote = await api.createQuote({ providerId, needId: needId ?? undefined });
      setPhase({ kind: "quote", quote });
    } catch (e) {
      if (e instanceof ApiError) {
        setPhase({ kind: "quoteError", code: e.code, message: e.message });
      } else {
        setPhase({ kind: "quoteError", code: "REQUEST_FAILED", message: "Could not request a quote" });
      }
    }
  };

  const handlePay = async () => {
    if (phase.kind !== "quote") return;
    try {
      await api.createPaymentIntent(phase.quote.bookingId);
    } catch (e) {
      if (e instanceof ApiError) {
        setPhase({ kind: "payUnavailable", code: e.code, message: e.message, paymentId: phase.quote.bookingId });
      } else {
        setPhase({
          kind: "payUnavailable",
          code: "REQUEST_FAILED",
          message: "Payment could not be initiated",
          paymentId: phase.quote.bookingId,
        });
      }
    }
  };

  const handleOfflineAck = async () => {
    if (phase.kind !== "payUnavailable") return;
    setAckState({ busy: true, done: false, error: null });
    try {
      await api.offlineAck(phase.paymentId);
      setAckState({ busy: false, done: true, error: null });
    } catch (e) {
      setAckState({
        busy: false,
        done: false,
        error: e instanceof ApiError ? `${e.code} — ${e.message}` : "Acknowledgement failed",
      });
    }
  };

  const tier = verification?.tier ?? routed?.tier ?? "SELF_DECLARED";

  return (
    <div className="profile">
      <div className="container">
        <div className="grid-12">
          <div className="profile-main">
            <p className="eyebrow">{t("Professional profile")}</p>
            <h1 className="h-section mt-3">{routed?.displayName ?? t("Verified professional")}</h1>
            <p className="meta mt-2 tabular">{providerId}</p>
            <div className="mt-3">
              <TierLabel
                tier={t(
                  tier === "FULLY_VERIFIED"
                    ? "FULLY VERIFIED"
                    : tier === "DOCUMENT_VERIFIED"
                      ? "DOCUMENT-VERIFIED"
                      : "SELF-DECLARED",
                )}
              />
              {routed && !routed.tierFresh && <StatusLabel label={t("REVERIFICATION DUE")} />}
            </div>
            {(routed || verification) && (
              <p className="small mt-4">
                {routed &&
                  [
                    t(routed.providerType.replace("_", " ")),
                    routed.district ? `${routed.district}${routed.state ? `, ${routed.state}` : ""}` : null,
                    routed.languages.map((l) => languageLabel(l)).join(" · ") || null,
                    routed.serviceModes.map((m) => t(m)).join(" / ") || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                {!routed && verification && t("Live details for this professional are limited to their verified credential status.")}
              </p>
            )}

            <hr className="rule mt-6" />

            <h2 className="h-micro mt-6">{t("Verification status")}</h2>
            {verificationMissing && (
              <p className="small mt-3">
                <StatusLabel label={t("NOT_FOUND")} />{" "}
                {t("No verification case exists for this professional yet.")}
              </p>
            )}
            {verification && (
              <>
                <table className="table table--dense mt-3">
                  <thead>
                    <tr>
                      <th>{t("Check")}</th>
                      <th>{t("Result")}</th>
                      <th>{t("Source")}</th>
                      <th>{t("Mode")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verification.checks.length === 0 && (
                      <tr>
                        <td className="small" colSpan={4}>
                          {t("No checks recorded yet — credential sources are offline in this deployment.")}
                        </td>
                      </tr>
                    )}
                    {verification.checks.map((c) => (
                      <tr key={c.checkType}>
                        <td className="small">{t(c.checkType)}</td>
                        <td>
                          <StatusLabel label={t(c.result)} />
                        </td>
                        <td className="small">{t(c.sourceLabel)}</td>
                        <td>
                          <StatusLabel label={t(c.sourceMode === "MOCK" ? "DEMO ONLY" : c.sourceMode)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="small mt-3">
                  {t(tier === "FULLY_VERIFIED" ? "FULLY VERIFIED" : tier === "DOCUMENT_VERIFIED" ? "DOCUMENT-VERIFIED" : "SELF-DECLARED")}{" "}
                  {t("decided")}{" "}
                  {new Date(verification.decidedAt).toLocaleDateString("en-IN")}.
                  {t(
                    "This professional has no ratings, rankings or public reviews — that information does not exist on this platform.",
                  )}
                </p>
              </>
            )}
          </div>

          <aside className="profile-side">
            <div className="profile-card">
              <h2 className="h-micro">{t("Engage this professional")}</h2>

              {needId ? (
                selectState.done ? (
                  <div className="mt-4" role="status">
                    <StatusLabel label={t("SELECTED")} />
                    <p className="small mt-3">
                      {t("Your selection is locked against your need. The engagement is created as matter metadata only.")}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button block onClick={() => void handleSelect()} disabled={selectState.busy}>
                      {selectState.busy ? t("Locking selection…") : t("Choose this professional")}
                    </Button>
                    {selectState.error && <p className="field__error mt-3">{t(selectState.error)}</p>}
                  </div>
                )
              ) : (
                <p className="small mt-3">
                  {t("Start a legal need first — allocation always runs through eligibility before any paid engagement.")}{" "}
                  <Link to="/start" style={{ textDecoration: "underline" }}>
                    {t("Start here")}
                  </Link>
                  .
                </p>
              )}

              <h2 className="h-micro mt-6">{t("Availability")}</h2>
              {!slotsData ? (
                <p className="meta mt-3">{t("Checking availability…")}</p>
              ) : slotsData.availabilityPolicy !== "CONFIGURED" || slotsData.slots.length === 0 ? (
                <div className="mt-3" role="status">
                  <StatusLabel label={t("SCHEDULING NOT CONFIGURED")} />
                  <p className="small mt-3">
                    {t(
                      "This provider has not published an availability policy, so no real slots can be booked through the platform yet. Nothing is simulated here.",
                    )}
                  </p>
                </div>
              ) : (
                <ul className="slot-list mt-3">
                  {slotsData.slots.map((s) => (
                    <li key={s.id}>
                      <span className="small tabular">{new Date(s.startsAt).toLocaleString("en-IN")}</span>{" "}
                      <StatusLabel label={t(s.available ? "AVAILABLE" : "BOOKED")} />
                    </li>
                  ))}
                </ul>
              )}

              <h2 className="h-micro mt-6">{t("Paid engagement")}</h2>
              {phase.kind === "idle" && (
                <>
                  <p className="small mt-3">
                    {routed?.feeRange
                      ? `${formatINR(routed.feeRange[0])} – ${formatINR(routed.feeRange[1])}`
                      : t("Fee disclosed in a full quote before any work begins.")}
                  </p>
                  <Button block className="mt-4" variant="outline" onClick={() => void handleQuote()}>
                    {t("Request quote")}
                  </Button>
                </>
              )}
              {phase.kind === "quote" && (
                <div className="quote mt-4" role="status">
                  <p className="h-micro">{t("Quote ready")}</p>
                  <p className="h-sub tabular mt-3">{formatINR(phase.quote.amount)}</p>
                  <p className="small mt-2">
                    {t("Professional fee — disclosed before work. Honoured once given.")}
                  </p>
                  <Button block className="mt-4" variant="blue" onClick={() => void handlePay()}>
                    {t("Proceed to payment")}
                  </Button>
                </div>
              )}
              {phase.kind === "quoteError" && (
                <div className="mt-4" role="alert">
                  <StatusLabel label={t("QUOTE UNAVAILABLE")} />
                  <p className="small mt-3">
                    <code className="meta">{phase.code}</code> — {t(phase.message)}
                  </p>
                  <Button block className="mt-4" variant="ghost" onClick={() => setPhase({ kind: "idle" })}>
                    {t("Try again")}
                  </Button>
                </div>
              )}
              {phase.kind === "payUnavailable" && (
                <div className="mt-4" role="alert">
                  <StatusLabel label={t("PAYMENTS UNAVAILABLE")} />
                  <p className="small mt-3">
                    {t(
                      "The payment capability is switched off in this deployment ({code}). No payment can be taken and no booking can be confirmed — the platform will not simulate a paid state.",
                      { code: phase.code },
                    )}
                  </p>
                  <p className="small mt-3">
                    {t("Your quote is retained. You can acknowledge an offline payment arrangement instead.")}
                  </p>
                  {ackState.done ? (
                    <div className="mt-4" role="status">
                      <StatusLabel label={t("OFFLINE ACKNOWLEDGED")} />
                      <p className="small mt-3">
                        {t("Recorded against the quote. This is not a payment confirmation — settlement remains with the authorized payment provider.")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button block className="mt-4" variant="outline" onClick={() => void handleOfflineAck()} disabled={ackState.busy}>
                        {ackState.busy ? t("Recording…") : t("Offline acknowledgement")}
                      </Button>
                      {ackState.error && <p className="field__error mt-3">{t(ackState.error)}</p>}
                    </>
                  )}
                </div>
              )}
              <p className="small mt-4">
                {t(
                  "Payment state is only ever confirmed by the payment provider's signed webhook on the server — never by this app.",
                )}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
