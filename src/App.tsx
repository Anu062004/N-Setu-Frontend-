import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicShell } from "./components/layout/PublicShell";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { LanguageProvider, useI18n } from "./lib/i18n";
import { RequireRole } from "./features/auth/RequireRole";
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
import { Welcome } from "./features/auth/Welcome";import { AssistedMode } from "./features/assisted/AssistedMode";
import { AssistedAudit } from "./features/assisted/AssistedAudit";
import { Institutional } from "./features/institutional/Institutional";
import { Admin } from "./features/admin/Admin";
import { Referral } from "./features/citizen/Referral";
import { Grievance } from "./features/citizen/Grievance";
import { CitizenPortal } from "./features/citizen/CitizenPortal";

// Runs before the router renders: persists the OAuth session and strips the
// token from the URL/history immediately.
const BOOT_AUTH = consumeAuthHash();

function BootAuthGate({ children }: { children: React.ReactNode }) {
  if (BOOT_AUTH.kind === "authenticated") {
    // New routing rule: an unactivated account never sees the app —
    // onboarding IS the first-run experience.
    if (!BOOT_AUTH.profileCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    if (BOOT_AUTH.accountCreated) {
      return <Navigate to="/welcome" replace />;
    }
  }
  if (BOOT_AUTH.kind === "failed") {
    return <Navigate to="/auth?message=google_failed" replace />;
  }
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
              element={
                <RequireRole role="PROVIDER">
                  <ProviderOnboarding />
                </RequireRole>
              }
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