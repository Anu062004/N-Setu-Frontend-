import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { api, ApiError, type CitizenProfile as ProfileShape } from "../../lib/api";
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

export function CitizenProfileEdit() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyProfile()
      .then(({ profileCompleted, profile }) => {
        if (cancelled) return;
        if (profileCompleted && profile) {
          setForm({
            fullName: profile.fullName,
            addressLine1: profile.addressLine1,
            addressLine2: profile.addressLine2 ?? "",
            city: profile.city,
            district: profile.district,
            state: profile.state,
            pincode: profile.pincode,
          });
        }
        setCompleted(profileCompleted);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setServerError(e instanceof ApiError ? `${e.code} — ${e.message}` : "Could not load your profile.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await api.updateMyProfile(toPayload(form));
      setSaved(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? `${err.code} — ${err.message}` : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-narrow" style={{ paddingTop: "var(--sp-8)" }}>
        <p className="small">{t("Loading…")}</p>
      </div>
    );
  }

  // Unactivated accounts belong in onboarding, not the edit surface.
  if (completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="container-narrow" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-10)" }}>
      <p className="eyebrow">{t("Citizen profile")}</p>
      <h1 className="h-section mt-3">{t("Your name and address.")}</h1>
      <p className="small mt-3" style={{ maxWidth: 560 }}>
        {t(
          "Used only for jurisdiction-matching and statutory records — never for ranking or marketing.",
        )}
      </p>

      <form className="mt-7" style={{ maxWidth: 560 }} onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="cp-fullName">{t("Full name *")}</label>
          <input
            id="cp-fullName"
            className="field__input"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            autoComplete="name"
          />
          {errors.fullName && <p className="field__error">{t(errors.fullName)}</p>}
        </div>

        <div className="field mt-5">
          <label className="field__label" htmlFor="cp-address1">{t("Address line 1 *")}</label>
          <input
            id="cp-address1"
            className="field__input"
            value={form.addressLine1}
            onChange={(e) => setField("addressLine1", e.target.value)}
            autoComplete="address-line1"
          />
          {errors.addressLine1 && <p className="field__error">{t(errors.addressLine1)}</p>}
        </div>

        <div className="field mt-5">
          <label className="field__label" htmlFor="cp-address2">{t("Address line 2 (optional)")}</label>
          <input
            id="cp-address2"
            className="field__input"
            value={form.addressLine2}
            onChange={(e) => setField("addressLine2", e.target.value)}
            autoComplete="address-line2"
          />
        </div>

        <div className="mt-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
          <div className="field">
            <label className="field__label" htmlFor="cp-city">{t("City *")}</label>
            <input
              id="cp-city"
              className="field__input"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              autoComplete="address-level2"
            />
            {errors.city && <p className="field__error">{t(errors.city)}</p>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="cp-district">{t("District *")}</label>
            <input
              id="cp-district"
              className="field__input"
              value={form.district}
              onChange={(e) => setField("district", e.target.value)}
            />
            {errors.district && <p className="field__error">{t(errors.district)}</p>}
          </div>
        </div>

        <div className="mt-5" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--sp-4)" }}>
          <div className="field">
            <label className="field__label" htmlFor="cp-state">{t("State *")}</label>
            <input
              id="cp-state"
              className="field__input"
              value={form.state}
              onChange={(e) => setField("state", e.target.value)}
              autoComplete="address-level1"
            />
            {errors.state && <p className="field__error">{t(errors.state)}</p>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="cp-pincode">{t("PIN code *")}</label>
            <input
              id="cp-pincode"
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

        {saved && (
          <div className="mt-5" role="status">
            <StatusLabel label={t("SAVED")} />
          </div>
        )}
        {serverError && (
          <p className="field__error mt-4" role="alert">
            {serverError}
          </p>
        )}

        <div className="mt-7">
          <Button type="submit" disabled={submitting}>
            {submitting ? t("Saving…") : t("Save changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function toPayload(form: FormState): ProfileShape {
  return {
    fullName: form.fullName.trim(),
    addressLine1: form.addressLine1.trim(),
    ...(form.addressLine2.trim() ? { addressLine2: form.addressLine2.trim() } : {}),
    city: form.city.trim(),
    district: form.district.trim(),
    state: form.state.trim(),
    pincode: form.pincode.trim(),
  };
}
