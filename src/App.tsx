import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PublicShell } from "./components/layout/PublicShell";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { LanguageProvider, useI18n } from "./lib/i18n";
import { RequireRole } from "./features/auth/RequireRole";
import { isSessionExpired } from "./lib/session";
import { consumeAuthHash } from "./lib/bootAuth";
import { Landing } from "./features/landing/Landing";
import { HowItWorks } from "./features/landing/HowItWorks";
import { Rights } from "./features/landing/Rights";
import { IntakeProvider } from "./features/intake/IntakeContext";
import { Intake } from "./features/intake/Intake";
import { Directory } from "./features/directory/Directory";
import { Rotation } from "./features/directory/Rotation";
import { ProviderProfile } from "./features/provider/ProviderProfile";
import { ProviderDashboard } from "./features/provider/ProviderDashboard";
import { ProviderOnboarding } from "./features/provider/ProviderOnboarding";
import { ProviderVerificationPage } from "./features/provider/ProviderVerification";
import { ProviderJoin } from "./features/provider/ProviderJoin";
import { SignIn } from "./features/auth/SignIn";
import { Onboarding } from "./features/auth/Onboarding";
import { Welcome } from "./features/auth/Welcome";
import { AccountOverview } from "./features/account/AccountOverview";
import { CitizenProfileEdit } from "./features/account/CitizenProfileEdit";
import { ProviderServicesEdit } from "./features/account/ProviderServicesEdit";import { AssistedMode } from "./features/assisted/AssistedMode";
import { AssistedAudit } from "./features/assisted/AssistedAudit";
import { Institutional } from "./features/institutional/Institutional";
import { Admin } from "./features/admin/Admin";
import { Referral } from "./features/citizen/Referral";
import { Grievance } from "./features/citizen/Grievance";
import { CitizenPortal } from "./features/citizen/CitizenPortal";

// Runs before the router renders: persists the OAuth session and strips the
// token from the URL/history immediately.
const BOOT_AUTH = consumeAuthHash();

// One-shot latch: the boot redirect fires exactly once per page load. A static
// decision must not fight later client-side navigation (e.g. after onboarding
// completes and the user moves to /start, or any other route).
let BOOT_AUTH_HANDLED = false;

function BootAuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (BOOT_AUTH_HANDLED || BOOT_AUTH.kind === "none") return;
    BOOT_AUTH_HANDLED = true;
    if (BOOT_AUTH.kind === "authenticated") {
      // New routing rule: an unactivated account never sees the app —
      // onboarding IS the first-run experience.
      if (!BOOT_AUTH.profileCompleted) {
        navigate("/onboarding", { replace: true });
      } else if (BOOT_AUTH.accountCreated) {
        navigate("/welcome", { replace: true });
      }
      return;
    }
    navigate("/auth?message=google_failed", { replace: true });
  }, [navigate]);

  return <>{children}</>;
}

function SimplePage({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  const { t } = useI18n();
  return (
    <div className="container-narrow mt-8" style={{ minHeight: "40vh" }}>
      <p className="eyebrow">{t(eyebrow)}</p>
      <h1 className="h-section mt-3">{t(title)}</h1>
      <p className="small mt-4" style={{ maxWidth: 560 }}>{t(body)}</p>
    </div>
  );
}

function IntakeRoute() {
  return (
    <IntakeProvider>
      <Intake />
    </IntakeProvider>
  );
}

/** Onboarding is only for unactivated accounts; completed profiles go into the app. */
function OnboardingRoute() {
  const { session } = useAuth();
  if (session?.profileCompleted === false) {
    return <Onboarding session={session} />;
  }
  return <Navigate to="/start" replace />;
}

/**
 * Provider onboarding accepts both CITIZENs (self-service join via
 * POST /v1/me/provider) and existing PROVIDERs — unlike the rest of the
 * provider surface, which stays PROVIDER-only.
 */
function ProviderOnboardingRoute() {
  const { session } = useAuth();
  if (!session || isSessionExpired(session)) {
    return <Navigate to="/auth?role=PROVIDER&next=%2Fprovider%2Fonboarding" replace />;
  }
  if (session.profileCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }
  return <ProviderOnboarding />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <BootAuthGate>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/rights" element={<Rights />} />
            <Route
              path="/start"
              element={
                <RequireRole role="CITIZEN">
                  <IntakeRoute />
                </RequireRole>
              }
            />
            <Route
              path="/directory/:needId"
              element={
                <RequireRole role="CITIZEN">
                  <Directory />
                </RequireRole>
              }
            />
            <Route
              path="/rotation/:needId"
              element={
                <RequireRole role="CITIZEN">
                  <Rotation />
                </RequireRole>
              }
            />
            <Route
              path="/providers/:providerId"
              element={
                <RequireRole role="CITIZEN">
                  <ProviderProfile />
                </RequireRole>
              }
            />
            <Route
              path="/referral/:needId"
              element={
                <RequireRole role="CITIZEN">
                  <Referral />
                </RequireRole>
              }
            />
            <Route
              path="/portal"
              element={
                <RequireRole role="CITIZEN">
                  <CitizenPortal />
                </RequireRole>
              }
            />
            <Route
              path="/grievance"
              element={
                <RequireRole role="CITIZEN">
                  <Grievance />
                </RequireRole>
              }
            />
            <Route path="/auth" element={<SignIn />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route
              path="/profile"
              element={
                <RequireRole role="CITIZEN">
                  <AccountOverview />
                </RequireRole>
              }
            />
            <Route
              path="/profile/citizen"
              element={
                <RequireRole role="CITIZEN">
                  <CitizenProfileEdit />
                </RequireRole>
              }
            />
            <Route
              path="/profile/provider"
              element={
                <RequireRole role="CITIZEN">
                  <ProviderServicesEdit />
                </RequireRole>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RequireRole role="CITIZEN">
                  <OnboardingRoute />
                </RequireRole>
              }
            />
            <Route
              path="/assist"
              element={
                <RequireRole role="OPERATOR">
                  <AssistedMode />
                </RequireRole>
              }
            />
            <Route path="/assist/audit" element={<AssistedAudit />} />
            <Route path="/provider/join" element={<ProviderJoin />} />
            <Route
              path="/provider/dashboard"
              element={
                <RequireRole role="PROVIDER">
                  <ProviderDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/provider/onboarding"
              element={<ProviderOnboardingRoute />}
            />
            <Route
              path="/provider/verification"
              element={
                <RequireRole role="PROVIDER">
                  <ProviderVerificationPage />
                </RequireRole>
              }
            />
            <Route path="/institutional" element={<Institutional />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="*"
              element={<SimplePage eyebrow="404" title="Page not found" body="The page you are looking for does not exist." />}
            />
          </Route>
        </Routes>
        </BootAuthGate>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}