import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useI18n } from "../../lib/i18n";

export function PublicShell() {
  const { t } = useI18n();
  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        {t("Skip to content")}
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}