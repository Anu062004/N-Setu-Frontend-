import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { SmartImage } from "../../components/ui/SmartImage";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../../lib/i18n";

export function Welcome() {
  const { t } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="intake-result" role="status">
      <StatusLabel label={t("ACCOUNT CREATED")} />
      <h1 className="h-section mt-4">{t("Welcome to Nayasetu.")}</h1>
      <p className="lede mt-4" style={{ maxWidth: 560 }}>
        {t(
          "Your account was created with Google. You are signed in as a citizen — tell us what you need help with and the eligibility router will show you exactly one honest route.",
        )}
      </p>
      {session && (
        <p className="small mt-3 tabular">
          {t("Signed in as {userId}", { userId: session.userId })}
        </p>
      )}

      <SmartImage
        src="/how/need-phone.png"
        alt={t("A citizen describing a legal need on a phone")}
        className="slot-banner slot-banner--16x9 mt-6"
      />

      <div className="mt-6 intake-result__actions">
        <Button onClick={() => navigate("/start")}>{t("Start my legal need")}</Button>
        <Link to="/rights" className="btn btn--outline">
          {t("Know your rights first")}
        </Link>
      </div>

      <p className="small mt-5" style={{ maxWidth: 560 }}>
        {t(
          "No ratings, no rankings, no recommendations — professionals are allocated by fair rotation and verified credentials only.",
        )}
      </p>
    </div>
  );
}
