import { Link } from "react-router-dom";

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
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid-12 footer-grid">
          <div className="footer-brand" style={{ gridColumn: "span 4" }}>
            <Link to="/" className="header-brand" aria-label="Nayasetu — home">
              <img src="/brand/logo.png" alt="" className="header-brand__logo" />
              <span className="header-brand__name">Nayasetu</span>
            </Link>
            <p className="small mt-3" style={{ maxWidth: 280 }}>
              Verified professionals, fair allocation, transparent process and institutional
              accountability. Not a lawyer marketplace.
            </p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title} style={{ gridColumn: "span 2" }}>
              <p className="h-micro">{c.title}</p>
              <ul className="footer-links">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ gridColumn: "span 2" }}>
            <p className="h-micro">Trust</p>
            <ul className="footer-links">
              <li>
                <Link to="/rights">Secure · Private · Confidential</Link>
              </li>
              <li>
                <Link to="/how-it-works">Privilege boundary</Link>
              </li>
              <li>
                <Link to="/admin">Capability status</Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="rule mt-6" />
        <div className="footer-bottom">
          <p className="small">
            Nayasetu is not affiliated with any court, bar council or government body. Professional
            misconduct is a State Bar Council matter under s.35, Advocates Act 1961.
          </p>
        </div>
      </div>
    </footer>
  );
}