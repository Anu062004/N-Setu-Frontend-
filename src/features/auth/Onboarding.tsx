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

type GeoStatus = "idle" | "loading" | "success" | "error";

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

/**
 * Reverse-geocode device coordinates into Indian address parts.
 * One user-triggered request per click against OpenStreetMap Nominatim
 * (public, keyless); anything unusable comes back undefined and the
 * citizen types it themselves. Nothing is stored beyond the form.
 */
async function reverseGeocode(lat: number, lon: number): Promise<FormState> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}` +
    `&lon=${encodeURIComponent(String(lon))}&format=jsonv2&addressdetails=1&zoom=14&accept-language=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("GEOCODE_FAILED");
  const data = (await res.json()) as { address?: Record<string, unknown> };
  const a = data?.address ?? {};
  const str = (k: string[]) => {
    for (const key of k) {
      const v = a[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };
  const postcode = typeof a.postcode === "string" && /^\d{6}$/.test(a.postcode.trim()) ? a.postcode.trim() : "";
  return {
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: str(["city", "town", "village", "municipality"]),
    district: str(["state_district", "county"]) || str(["city", "town", "village"]),
    state: str(["state"]),
    pincode: postcode,
  };
}

export function Onboarding({ session }: { session: StoredSession }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("error");
      setGeoMessage(t("Location services are not available on this device."));
      return;
    }
    setGeoStatus("loading");
    setGeoMessage(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const detected = await reverseGeocode(coords.latitude, coords.longitude);
          const usable = Boolean(detected.city || detected.district || detected.state);
          if (!usable) {
            setGeoStatus("error");
            setGeoMessage(t("Could not determine your area from your location. Please enter it manually."));
            return;
          }
          // Suggest only into EMPTY fields — never overwrite what the citizen typed.
          setForm((f) => ({
            ...f,
            city: f.city.trim() || detected.city,
            district: f.district.trim() || detected.district,
            state: f.state.trim() || detected.state,
            pincode: f.pincode.trim() || detected.pincode,
          }));
          setErrors((e) => ({
            ...e,
            ...(detected.city ? { city: undefined } : {}),
            ...(detected.district ? { district: undefined } : {}),
            ...(detected.state ? { state: undefined } : {}),
            ...(detected.pincode ? { pincode: undefined } : {}),
          }));
          setGeoStatus("success");
        } catch {
          setGeoStatus("error");
          setGeoMessage(t("Could not determine your area from your location. Please enter it manually."));
        }
      },
      (err) => {
        setGeoStatus("error");
        setGeoMessage(
          err.code === err.PERMISSION_DENIED
            ? t("Location permission was denied. Please enter your details manually.")
            : t("Could not read your device location. Please enter your details manually."),
        );
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
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
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
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

        <button
          type="button"
          className="btn btn--ghost mt-5"
          onClick={handleDetectLocation}
          disabled={geoStatus === "loading"}
        >
          {geoStatus === "loading"
            ? t("Detecting your location…")
            : geoStatus === "success"
              ? t("Use location again")
              : t("Use current location")}
        </button>
        <p className="small mt-2" style={{ maxWidth: 560 }}>
          {t(
            "Fills city, district, state and PIN from your device location — used once, never stored. Every field stays editable.",
          )}
        </p>

        {geoStatus === "loading" && (
          <p className="small mt-3" role="status">
            {t("Detecting your location…")}
          </p>
        )}
        {geoStatus === "success" && (
          <div className="assisted-banner mt-3" role="status">
            <StatusLabel label={t("AREA FILLED")} />
            <span className="small">
              {t("Please verify the suggested details and complete your street address.")}
            </span>
          </div>
        )}
        {geoStatus === "error" && (
          <p className="field__error mt-3" role="alert">
            {geoMessage ?? t("Could not read your device location. Please enter your details manually.")}
          </p>
        )}

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
