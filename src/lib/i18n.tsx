import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { HI } from "./hi";

export type Locale = "en" | "hi";

const LOCALE_KEY = "nayasetu.locale";

const TITLES: Record<Locale, string> = {
  en: "Nayasetu — Access to justice for all",
  hi: "न्यायसेतु — सभी के लिए न्याय तक पहुँच",
};

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "hi" || saved === "en") return saved;
    if (navigator.language?.toLowerCase().startsWith("hi")) return "hi";
  } catch {
    /* noop */
  }
  return "en";
}

function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m
  );
}

let currentLocale: Locale = initialLocale();

/**
 * Translate an English source string to the current locale's dictionary.
 * Keys are the English strings themselves; in English mode the source key is
 * returned unchanged. Unknown keys fall back to English in any locale.
 * `{placeholder}` tokens are preserved and filled from `vars`.
 */
export function translate(key: string, vars?: Record<string, string | number>): string {
  const out = currentLocale === "en" ? key : (HI[key] ?? key);
  return fill(out, vars);
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: typeof translate;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  currentLocale = locale;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = TITLES[locale];
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* noop */
    }
  }, [locale]);

  const value: I18nValue = {
    locale,
    setLocale: setLocaleState,
    toggle: () => setLocaleState((p) => (p === "en" ? "hi" : "en")),
    t: translate,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}