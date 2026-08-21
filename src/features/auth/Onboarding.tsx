import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api, ApiError } from "../../lib/api";
import { updateSession, type StoredSession } from "../../lib/session";
import { useAuth } from "./AuthContext";
import { useI18n } from "../../lib/i18n";

interface FormState {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

const EMPTY: FormState = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
};

const REQUIRED: (keyof FormState)[] = ["fullName", "addressLine1", "city", "district", "state", "pincode"];

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  for (const key of REQUIRED) {
    if (!form[key].trim()) errors[key] = "Required";
  }
  if (form.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "PIN code must be exactly 6 digits";
  }
  return errors;
}

export function Onboarding({ session }: { session: StoredSession }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await api.updateMyProfile({
        fullName: form.fullName.trim(),
        addressLine1: form.addressLine1.trim(),
        ...(form.addressLine2.trim() ? { addressLine2: form.addressLine2.trim() } : {}),
        city: form.city.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      });
      const updated = updateSession({ profileCompleted: true });
      if (updated) signIn(updated);
      navigate("/start");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "VALIDATION_ERROR") {
          // The server owns the authoritative field rules; surface its message inline.
          setServerError(err.message);
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-10)" }}>
      <StatusLabel label={t("ONE-TIME SETUP")} />
      <h1 className="h-section mt-4">{t("Complete your profile to continue.")}</h1>
      <p className="lede mt-3" style={{ maxWidth: 560 }}>
        {t(
          "Your account is active, but we need your basic details before you can raise a legal need. This is the only blocked step — everything else on Nayasetu works without it.",
        )}
      </p>

      <form className="mt-7" style={{ maxWidth: 560 }} onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="ob-fullName">{t("Full name *")}</label>
          <input
            id="ob-fullName"
            className="field__input"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            autoComplete="name"
          />
          {errors.fullName && <p className="field__error">{t(errors.fullName)}</p>}
        </div>

        <div className="field mt-5">
          <label className="field__label" htmlFor="ob-address1">{t("Address line 1 *")}</label>
          <input
            id="ob-address1"
            className="field__input"
            value={form.addressLine1}
            onChange={(e) => setField("addressLine1", e.target.value)}
            autoComplete="address-line1"
          />
          {errors.addressLine1 && <p className="field__error">{t(errors.addressLine1)}</p>}
        </div>

        <div className="field mt-5">
          <label className="field__label" htmlFor="ob-address2">{t("Address line 2 (optional)")}</label>
          <input
            id="ob-address2"
            className="field__input"
            value={form.addressLine2}
            onChange={(e) => setField("addressLine2", e.target.value)}
            autoComplete="address-line2"
          />
        </div>

        <div className="mt-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
          <div className="field">
            <label className="field__label" htmlFor="ob-city">{t("City *")}</label>
            <input
              id="ob-city"
              className="field__input"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              autoComplete="address-level2"
            />
            {errors.city && <p className="field__error">{t(errors.city)}</p>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ob-district">{t("District *")}</label>
            <input
              id="ob-district"
              className="field__input"
              value={form.district}
              onChange={(e) => setField("district", e.target.value)}
            />
            {errors.district && <p className="field__error">{t(errors.district)}</p>}
          </div>
        </div>

        <div className="mt-5" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--sp-4)" }}>
          <div className="field">
            <label className="field__label" htmlFor="ob-state">{t("State *")}</label>
            <input
              id="ob-state"
              className="field__input"
              value={form.state}
              onChange={(e) => setField("state", e.target.value)}
              autoComplete="address-level1"
            />
            {errors.state && <p className="field__error">{t(errors.state)}</p>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ob-pincode">{t("PIN code *")}</label>
            <input
              id="ob-pincode"
              className="field__input tabular"
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, ""))}
              autoComplete="postal-code"
            />
            {errors.pincode && <p className="field__error">{t(errors.pincode)}</p>}
          </div>
        </div>

        {serverError && (
          <div className="assisted-banner mt-5" role="alert">
            <StatusLabel label={t("NOT SAVED")} />
            <span className="small">{serverError}</span>
          </div>
        )}

        <div className="mt-7">
          <Button type="submit" disabled={submitting}>
            {submitting ? t("Saving…") : t("Save and continue")}
          </Button>
        </div>

        <p className="small mt-4" style={{ maxWidth: 560 }}>
          {t(
            "Signed in as {userId}. Your details are used only for jurisdiction-matching and statutory records — never for ranking or marketing.",
            { userId: session.userId },
          )}
        </p>
      </form>
    </div>
  );
}
