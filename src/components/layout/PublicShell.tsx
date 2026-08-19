import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PublicShell() {
  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}