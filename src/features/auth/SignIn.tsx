import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { GOOGLE_START_URL, checkGoogleLoginAvailable } from "../../lib/api";
import { useAuth } from "./AuthContext";
import { useI18n } from "../../lib/i18n";

/**
 * Google-only sign-in. Phone/OTP verification is intentionally not part of
 * this flow — the backend's OTP capability is not part of the citizen journey.
 */
export function SignIn() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const { session, signOut } = useAuth();

  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const [googleStarting, setGoogleStarting] = useState(false);

  const googleFailed = params.get("message") === "google_failed";

  const handleGoogleSignIn = async () => {
    setGoogleStarting(true);
    const available = await checkGoogleLoginAvailable();
    if (!available) {
      setGoogleUnavailable(true);
      setGoogleStarting(false);
      return;
    }
    // Full-page navigation — the backend drives the consent + callback round-trip.
    window.location.href = GOOGLE_START_URL;
  };

  return (
    <div className="auth">
      <div className="container-narrow">
        <p className="eyebrow">{t("Sign up / Sign in")}</p>
        <h1 className="h-section">{t("One account. One honest route.")}</h1>
        <p className="small mt-3" style={{ maxWidth: 480 }}>
          {t(
            "Sign in with Google to raise a legal need, follow your referral or pro bono assignment, and track your matter. There is no password to remember.",
          )}
        </p>

        {googleFailed && (
          <div className="assisted-banner mt-5" role="alert">
            <StatusLabel label={t("SIGN-IN FAILED")} />
            <span className="small">
              {t(
                "Google sign-in could not be completed. No session was created — please try again.",
              )}
            </span>
          </div>
        )}

        <div className="mt-6" style={{ maxWidth: 360 }}>
          <GoogleButton onClick={() => void handleGoogleSignIn()} loading={googleStarting} />
        </div>

        {googleUnavailable && (
          <p className="field__error mt-3" role="status" style={{ maxWidth: 480 }}>
            {t(
              "Login temporarily unavailable — the Google sign-in capability is not configured on the server right now (CAPABILITY_UNAVAILABLE). Please retry later; the platform will not simulate a sign-in.",
            )}
          </p>
        )}

        <p className="small mt-6" style={{ maxWidth: 480 }}>
          {session ? (
            <>
              {t("You are signed in on this device.")}{" "}
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
          ) : (
            t(
              "By continuing you agree that your name and address are used only for jurisdiction-matching and statutory records — never for ranking or marketing.",
            )
          )}
        </p>
      </div>
    </div>
  );
}
