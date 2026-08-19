import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useI18n } from "../../lib/i18n";

const LINKS = [
  { to: "/start", label: "Start legal help" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/rights", label: "Your rights" },
  { to: "/provider/join", label: "For professionals" },
];

export function Header() {
  const { session, signOut } = useAuth();
  const { locale, toggle, t } = useI18n();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="header-brand" aria-label={t("Nayasetu — home")}>
          <img src="/brand/logo.png" alt="" className="header-brand__logo" />
          <span className="header-brand__name">Nayasetu</span>
        </Link>

        <nav aria-label={t("Primary")}>
          <ul className="header-nav">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => (isActive ? "is-active" : undefined)}
                >
                  {t(l.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="header-link header-lang"
            onClick={toggle}
            aria-label={t("Switch language")}
            title={t("Switch language")}
          >
            {locale === "en" ? "हिन्दी" : "English"}
          </button>
          {session ? (
            <>
              <span className="header-meta">{t(session.role.toLowerCase().replace("_", " "))}</span>
              <button className="header-link" onClick={handleSignOut}>{t("Sign out")}</button>
            </>
          ) : (
            <Link to="/auth" className="header-link">
              {t("Sign in")}
            </Link>
          )}
          <Link to="/start" className="btn btn--primary btn--sm">
            {t("I need legal help")}
          </Link>
        </div>
      </div>
    </header>
  );
}