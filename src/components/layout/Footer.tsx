import { Link } from "react-router-dom";
import { useI18n } from "../../lib/i18n";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Citizens",
    links: [
      { label: "Start legal help", to: "/start" },
      { label: "Check eligibility", to: "/start?step=eligibility" },
      { label: "Legal aid referral", to: "/referral/req_4d81b7" },
      { label: "My portal", to: "/portal" },
      { label: "Grievance", to: "/grievance" },
      { label: "Assisted mode", to: "/assist" },
    ],
  },
  {
    title: "Professionals",
    links: [
      { label: "Join as professional", to: "/provider/join" },
      { label: "Onboarding", to: "/provider/onboarding" },
      { label: "Verification", to: "/provider/verification" },
      { label: "Provider dashboard", to: "/provider/dashboard" },
    ],
  },
  {
    title: "Institutions",
    links: [
      { label: "Institutional surface", to: "/institutional" },
      { label: "Capability status", to: "/admin" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Your rights", to: "/rights" },
    ],
  },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid-12 footer-grid">
          <div className="footer-brand">
            <Link to="/" className="header-brand" aria-label={t("Nayasetu — home")}>
              <img src="/brand/logo.png" alt="" className="header-brand__logo" />
              <span className="header-brand__name">Nayasetu</span>
            </Link>
            <p className="small mt-3" style={{ maxWidth: 280 }}>
              {t(
                "Verified professionals, fair allocation, transparent process and institutional accountability. Not a lawyer marketplace."
              )}
            </p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title} className="footer-col">
              <p className="h-micro">{t(c.title)}</p>
              <ul className="footer-links">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{t(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-col">
            <p className="h-micro">{t("Trust")}</p>
            <ul className="footer-links">
              <li>
                <Link to="/rights">{t("Secure · Private · Confidential")}</Link>
              </li>
              <li>
                <Link to="/how-it-works">{t("Privilege boundary")}</Link>
              </li>
              <li>
                <Link to="/admin">{t("Capability status")}</Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="rule mt-6" />
        <div className="footer-bottom">
          <p className="small">
            {t(
              "Nayasetu is not affiliated with any court, bar council or government body. Professional misconduct is a State Bar Council matter under s.35, Advocates Act 1961."
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}