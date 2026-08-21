import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicShell } from "./components/layout/PublicShell";
import { AuthProvider } from "./features/auth/AuthContext";
import { LanguageProvider, useI18n } from "./lib/i18n";
import { RequireRole } from "./features/auth/RequireRole";
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
import { OtpSignIn } from "./features/auth/OtpSignIn";
import { AssistedMode } from "./features/assisted/AssistedMode";
import { AssistedAudit } from "./features/assisted/AssistedAudit";
import { Institutional } from "./features/institutional/Institutional";
import { Admin } from "./features/admin/Admin";
import { Referral } from "./features/citizen/Referral";
import { Grievance } from "./features/citizen/Grievance";
import { CitizenPortal } from "./features/citizen/CitizenPortal";

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

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/rights" element={<Rights />} />
            <Route path="/start" element={<IntakeRoute />} />
            <Route path="/directory/:needId" element={<Directory />} />
            <Route path="/rotation/:needId" element={<Rotation />} />
            <Route path="/providers/:providerId" element={<ProviderProfile />} />
            <Route path="/referral/:needId" element={<Referral />} />
            <Route path="/portal" element={<CitizenPortal />} />
            <Route path="/grievance" element={<Grievance />} />
            <Route path="/auth" element={<OtpSignIn />} />
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
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}