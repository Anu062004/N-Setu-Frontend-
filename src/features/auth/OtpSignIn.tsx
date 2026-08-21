import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api, ApiError, GOOGLE_START_URL, checkGoogleLoginAvailable } from "../../lib/api";
import { useAuth, type AuthRole } from "./AuthContext";
import { useI18n } from "../../lib/i18n";

const ROLE_CARDS: { value: AuthRole; title: string; body: string }[] = [
  {
    value: "CITIZEN",
    title: "I need legal help",
    body: "Sign in to continue your legal need, view your referral or pro bono assignment, and track your matter.",
  },
  {
    value: "PROVIDER",
    title: "I am a legal professional",
    body: "Sign in to create your professional profile, submit credentials for verification and manage your dashboard.",
  },
  {
    value: "OPERATOR",
    title: "I operate a CSC / VLE",
    body: "Sign in to open a delegated assisted session for a citizen, with recorded consent.",
  },
  {
    value: "INSTITUTION",
    title: "Institution (DLSA / Bar Council / DoJ)",
    body: "Sign in to access scoped institutional surfaces — rosters, aggregate statistics and grievance pipeline.",
  },
];

const DEFAULT_NEXT: Record<AuthRole, string> = {
  CITIZEN: "/start",
  PROVIDER: "/provider/onboarding",
  OPERATOR: "/assist",
  INSTITUTION: "/institutional",
};

const ROLE_HINTS: Record<AuthRole, string> = {
  CITIZEN: "One-time password to your phone. No password to remember.",
  PROVIDER: "OTP verifies your phone. Your professional identity is then verified separately through the credential rail — a phone number is never a professional credential.",
  OPERATOR: "Every assisted action is recorded against both you and the citizen, under a recorded consent reference.",
  INSTITUTION: "Scoped, read-mostly access. Aggregate statistics only for public surfaces.",
};

export function OtpSignIn() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, signIn, signOut } = useAuth();

  const requestedRole = (params.get("role") as AuthRole | null) ?? null;
  const next = params.get("next") ?? null;
  const message = params.get("message") ?? null;

  const [role, setRole] = useState<AuthRole | null>(requestedRole);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpUnavailable, setOtpUnavailable] = useState<string | null>(null);
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const [googleStarting, setGoogleStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleFailed = message === "google_failed";

  const handleGoogleSignIn = async () => {
    setGoogleStarting(true);
    setError(null);
    const available = await checkGoogleLoginAvailable();
    if (!available) {
      setGoogleUnavailable(true);
      setGoogleStarting(false);
      return;
    }
    // Full-page navigation — the backend drives the consent + callback round-trip.
    window.location.href = GOOGLE_START_URL;
  };

  const handleRequest = async () => {
    if (phone.length < 10) return;
    setSending(true);
    setError(null);
    try {
      await api.requestOtp(phone);
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError && e.unavailable) {
        setOtpUnavailable(e.code);
      } else {
        setError(e instanceof Error ? e.message : "Failed to send OTP");
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4 || !role) return;
    setError(null);
    try {
      const verified = await api.verifyOtp(phone, otp);
      signIn({
        userId: verified.userId,
        phone,
        role,
        token: verified.token,
      });
      navigate(next ?? DEFAULT_NEXT[role], { replace: true });
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${e.code} — ${e.message}`
          : e instanceof Error
            ? e.message
            : "Invalid OTP",
      );
    }
  };

  if (role === null) {
    return (
      <div className="auth">
        <div className="container-narrow">
          <p className="eyebrow">{t("Sign up / Sign in")}</p>
          <h1 className="h-section">{t("Who are you?")}</h1>
          <p className="small mt-3" style={{ maxWidth: 480 }}>
            {t("One account per person. The role you choose determines the surface you can use — a help-seeker is never shown the provider surface and vice versa.")}
          </p>

          {googleFailed && (
            <div className="assisted-banner mt-5" role="alert">
              <StatusLabel label={t("SIGN-IN FAILED")} />
              <span className="small">
                {t(
                  "Google sign-in could not be completed. No session was created — please try again or use phone sign-in.",
                )}
              </span>
            </div>
          )}

          {(!requestedRole || requestedRole === "CITIZEN") && (
            <>
              <div className="mt-6">
                <GoogleButton onClick={() => void handleGoogleSignIn()} loading={googleStarting} />
                {googleUnavailable && (
                  <p className="field__error mt-3" role="status">
                    {t(
                      "Login temporarily unavailable — the Google sign-in capability is not configured on the server right now (CAPABILITY_UNAVAILABLE). Please use phone sign-in or retry later.",
                    )}
                  </p>
                )}
              </div>
              <p className="small mt-3" style={{ maxWidth: 480 }}>
                {t("or continue with phone —")}
              </p>
            </>
          )}
          <div className="choice-grid mt-3">
            {ROLE_CARDS.map((c) => (
              <label
                key={c.value}
                className="choice-card"
                style={{ cursor: "pointer" }}
                onClick={() => setRole(c.value)}
              >
                <span className="h-micro">{t(c.title)}</span>
                <span className="small mt-2">{t(c.body)}</span>
              </label>
            ))}
          </div>
          <p className="small mt-5" style={{ maxWidth: 480 }}>
            {session ? (
              <>
                {t("Signed in as {role} · {phone}.", {
                  role: t(session.role.toLowerCase().replace("_", " ")),
                  phone: session.phone,
                })}{" "}
                <a
                  href="/auth"
                  onClick={(e) => {
                    e.preventDefault();
                    signOut();
                  }}
                  style={{ textDecoration: "underline" }}
                >
                  {t("Sign out")}
                </a>
              </>
        ) : otpUnavailable ? (
          <div className="mt-6" role="alert">
            <StatusLabel label="SERVICE UNAVAILABLE" />
            <p className="small mt-4" style={{ maxWidth: 520 }}>
              {t(
                "Phone sign-in is not available right now ({code}). No OTP provider is configured in this deployment, so no code can be sent and no session can be created.",
                { code: otpUnavailable },
              )}
            </p>
            <p className="small mt-3" style={{ maxWidth: 520 }}>
              {t(
                "This is an honest fail-closed state — the platform will not simulate a sign-in. You can retry below in case the capability has been enabled, or continue browsing public surfaces.",
              )}
            </p>
            <div className="intake-result__actions mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setOtpUnavailable(null);
                  void handleRequest();
                }}
                disabled={sending}
              >
                {sending ? t("Retrying…") : t("Retry")}
              </Button>
              <a href="/" className="btn btn--ghost">
                {t("Back to home")}
              </a>
            </div>
          </div>
        ) : (
              t("No active session. Choose a role to continue.")
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="container-narrow">
        <p className="eyebrow">
          {t("Sign in — {title}", {
            title: t(ROLE_CARDS.find((c) => c.value === role)?.title ?? ""),
          })}
        </p>
        <h1 className="h-section">{t("One-time password")}</h1>
        <p className="small mt-3" style={{ maxWidth: 480 }}>{t(ROLE_HINTS[role])}</p>

        {message && (
          <div className="assisted-banner mt-5" role="status">
            <StatusLabel label="ROLE MISMATCH" />
            <span className="small">
              {t("Signed in as a different role. Please verify as {role} to continue. You can sign out first if this is not your account.", {
                role: t(role.toLowerCase().replace("_", " ")),
              })}
            </span>
          </div>
        )}

        {session && session.role === role ? (
          <div className="mt-6" role="status">
            <StatusLabel label="SIGNED IN" />
            <p className="small mt-4">
              {t("Signed in as {phone} ({role}).", {
                phone: session.phone,
                role: t(role.toLowerCase().replace("_", " ")),
              })}
            </p>
            <div className="intake-result__actions mt-6">
              <a href={next ?? DEFAULT_NEXT[role]} className="btn btn--primary">{t("Continue")}</a>
              <button className="btn btn--ghost" onClick={() => { signOut(); setSent(false); setOtp(""); }}>
                {t("Sign out")}
              </button>
            </div>
          </div>
        ) : (
          <form
            className="auth-form mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sent) void handleRequest();
              else void handleVerify();
            }}
          >
            <div className="field">
              <label className="field__label" htmlFor="phone">{t("Phone number")}</label>
              <input
                id="phone"
                className="field__input"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("10-digit mobile number")}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                disabled={sent}
              />
            </div>

            {sent && (
              <div className="field mt-4">
                <label className="field__label" htmlFor="otp">{t("One-time password")}</label>
                <input
                  id="otp"
                  className="field__input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder={t("Enter OTP")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <p className="field__hint">
                  {t("A 6-digit code is sent to this number. Rates apply: 5 requests per 10 minutes.")}
                </p>
              </div>
            )}

            {error && <p className="field__error mt-4">{t(error)}</p>}

            <div className="mt-6">
              <Button type="submit" block disabled={phone.length < 10 || (sent && otp.length < 4) || sending}>
                {sent ? t("Verify") : t("Send OTP")}
              </Button>
            </div>

            <button type="button" className="btn btn--ghost mt-4" onClick={() => setRole(null)}>
              {t("← Choose a different role")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}