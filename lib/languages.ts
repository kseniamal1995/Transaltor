// Языки, поддерживаемые DeepL API (должны совпадать с app/api/translate/route.ts)
const DEEPL_ALLOWED_LANGS = new Set([
  "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "tr", "pl", "uk",
  "nl", "no", "sv", "sk", "sl", "et", "lt", "lv", "st",
]);

export const SUPPORTED_LANGUAGES = [
  { code: "auto", name: "Авто" },
  { code: "en", name: "Английский" },
  { code: "es", name: "Испанский" },
  { code: "fr", name: "Французский" },
  { code: "de", name: "Немецкий" },
  { code: "it", name: "Итальянский" },
  { code: "pt", name: "Португальский" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "Китайский" },
  { code: "ja", name: "Японский" },
  { code: "ko", name: "Корейский" },
  { code: "ar", name: "Арабский" },
  { code: "tr", name: "Турецкий" },
  { code: "pl", name: "Польский" },
  { code: "uk", name: "Украинский" },
  { code: "nl", name: "Нидерландский" },
  { code: "no", name: "Норвежский" },
  { code: "sv", name: "Шведский" },
  { code: "sk", name: "Словацкий" },
  { code: "sl", name: "Словенский" },
  { code: "et", name: "Эстонский" },
  { code: "lt", name: "Литовский" },
  { code: "lv", name: "Латышский" },
  { code: "st", name: "Сесото" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export async function detectLanguage(text: string): Promise<string> {
  if (typeof window === "undefined") return "auto";
  const trimmed = text.trim();
  if (trimmed.length < 3) return "auto";
  const { detect } = await import("tinyld/light");
  const detected = detect(trimmed)?.toLowerCase();
  if (!detected || !DEEPL_ALLOWED_LANGS.has(detected)) return "auto";
  return detected;
}

const DEEPL_TO_BASE: Record<string, string> = {
  "pt-br": "pt",
  "pt-pt": "pt",
  "en-us": "en",
  "en-gb": "en",
  "zh-cn": "zh",
  "zh-tw": "zh",
  nb: "no",
  sk: "sk",
  sl: "sl",
  et: "et",
  lt: "lt",
  lv: "lv",
};

export function normalizeLanguageCode(code: string): string {
  if (!code || code === "auto") return "en";
  const lower = code.toLowerCase();
  return DEEPL_TO_BASE[lower] ?? lower.split("-")[0] ?? "en";
}

export function getLanguageName(code: string): string {
  if (code === "auto") return "Авто";
  const normalized = normalizeLanguageCode(code);
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === normalized);
  return lang?.name ?? `Язык (${normalized})`;
}

/** ISO 639-1 code -> regional indicator for flag emoji (e.g. "ru" -> "RU" -> 🇷🇺) */
const LANG_TO_REGION: Record<string, string> = {
  en: "gb",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  zh: "cn",
  ja: "jp",
  ko: "kr",
  ar: "sa",
  tr: "tr",
  pl: "pl",
  uk: "ua",
  nl: "nl",
  no: "no",
  sv: "se",
  sk: "sk",
  sl: "si",
  et: "ee",
  lt: "lt",
  lv: "lv",
  st: "ls",
};

export function getFlagEmoji(code: string): string {
  const normalized = normalizeLanguageCode(code);
  const region = (LANG_TO_REGION[normalized] ?? normalized).toUpperCase();
  if (region.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...region.split("").map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  );
}

// Языки, которые часто ошибочно определяются для коротких латинских слов
const RARE_FALSE_POSITIVES = new Set(["st"]);

/** Для короткого текста исправляет ошибочное определение редких языков */
export function sanitizeDetectedForShortText(text: string, code: string): string {
  const normalized = normalizeLanguageCode(code);
  if (text.trim().length < 15 && RARE_FALSE_POSITIVES.has(normalized)) {
    return "en";
  }
  return normalized === "auto" ? "en" : normalized;
}
