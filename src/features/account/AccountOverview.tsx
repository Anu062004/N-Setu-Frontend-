import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api } from "../../lib/api";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

const ROLE_SURFACES: Record<string, { title: string; body: string; to: string; requiresProviderId?: boolean }> = {
  CITIZEN: {
    title: "Citizen profile",
    body: "Your name and address, used for jurisdiction-matching and statutory records.",
    to: "/profile/citizen",
  },
  PROVIDER: {
    title: "Professional profile",
    body: "Services and fees on your panel card, plus your verification status.",
    to: "/profile/provider",
    requiresProviderId: true,
  },
};

export function AccountOverview() {
  const { t } = useI18n();
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<string>("ACTIVE");

  useEffect(() => {
    let cancelled = false;
    api
      .getMe()
      .then((me) => {
        if (cancelled) return;
        setAccountStatus(me.accountStatus ?? (me.profileCompleted ? "ACTIVE" : "PENDING_PROFILE"));
      })
      .catch(() => undefined);
    if (!session?.profileCompleted) return () => { cancelled = true; };
    api
      .getMyProfile()
      .then(({ profile }) => {
        if (cancelled) return;
        if (profile?.fullName) setFullName(profile.fullName);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session?.profileCompleted]);

  if (!session) return null;

  return (
    <div className="container-narrow" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-10)" }}>
      <p className="eyebrow">{t("Your account")}</p>
      <h1 className="h-section mt-3">{fullName ? fullName : t("Account overview")}</h1>

      <section className="mt-7">
        <StatusLabel label={t(accountStatus === "PENDING_PROFILE" ? "PENDING_PROFILE" : "ACTIVE")} />
        <div className="mt-4" style={{ display: "grid", gap: "var(--sp-2)", maxWidth: 560 }}>
          <p className="small tabular" style={{ fontFamily: "ui-monospace, monospace" }}>
            {t("User ID")}: {session.userId}
          </p>
          <p className="small">{t("Signed in via Google — there is no password on this account.")}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="h-micro">{t("Roles on this account")}</h2>
        <p className="small mt-2" style={{ maxWidth: 560 }}>
          {t(
            "One Google account can hold both citizen and professional roles. Each role has its own surface.",
          )}
        </p>
        <div className="choice-grid mt-5">
          {Object.entries(ROLE_SURFACES).map(([role, surface]) => {
            // PROVIDER links through only once the account actually has a
            // professional profile (session.providerId from /v1/me).
            if (surface.requiresProviderId && !session.providerId) return null;
            return (
              <Link
                key={role}
                to={surface.to}
                className="choice-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="h-micro">{t(surface.title)}</span>
                <span className="small mt-2">{t(surface.body)}</span>
                <span className="small mt-3" style={{ opacity: 0.7 }}>
                  {t("Manage →")}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="intake-result__actions mt-8">
        <button
          className="btn btn--outline"
          onClick={() => {
            signOut();
            navigate("/auth");
          }}
        >
          {t("Sign out")}
        </button>
      </div>
    </div>
  );
}
