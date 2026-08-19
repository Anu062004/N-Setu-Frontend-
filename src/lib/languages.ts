export interface Language {
  code: string;
  native: string;
  english: string;
}

/**
 * The 22 scheduled languages of the Indian Constitution (Eighth Schedule) plus English.
 * Ordered by approximate number of speakers — Indian languages prioritised, English last.
 * Native scripts are shown first; romanised names follow in parentheses.
 */
export const SCHEDULED_LANGUAGES: Language[] = [
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "ur", native: "اردو", english: "Urdu" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "mai", native: "मैथिली", english: "Maithili" },
  { code: "sat", native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali" },
  { code: "ks", native: "कॉशुर", english: "Kashmiri" },
  { code: "ne", native: "नेपाली", english: "Nepali" },
  { code: "sd", native: "سنڌي", english: "Sindhi" },
  { code: "kok", native: "कोंकणी", english: "Konkani" },
  { code: "mni", native: "মৈতৈলোন্", english: "Manipuri (Meitei)" },
  { code: "brx", native: "बर'", english: "Bodo" },
  { code: "doi", native: "डोगरी", english: "Dogri" },
  { code: "sa", native: "संस्कृतम्", english: "Sanskrit" },
  { code: "en", native: "English", english: "English" },
];

const BY_CODE = new Map(SCHEDULED_LANGUAGES.map((l) => [l.code, l]));

/**
 * Legacy / alternate codes found in seeded data. Bhojpuri is not a scheduled
 * language but is widely spoken in Bihar; it is kept out of the 22-language
 * selector but rendered properly where it appears in provider records.
 */
const ALIASES: Record<string, string> = {
  maithili: "mai",
  bho: "bho",
};
const EXTRA: Record<string, Language> = {
  bho: { code: "bho", native: "भोजपुरी", english: "Bhojpuri" },
};

function lookup(code: string): Language | undefined {
  const resolved = ALIASES[code] ?? code;
  return BY_CODE.get(resolved) ?? EXTRA[resolved];
}

export function languageLabel(code: string): string {
  const l = lookup(code);
  return l ? `${l.native} (${l.english})` : code.toUpperCase();
}

export function languageNative(code: string): string {
  const l = lookup(code);
  return l ? l.native : code.toUpperCase();
}