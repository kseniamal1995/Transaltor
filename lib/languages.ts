import type { Locale } from "./locale";

// Языки, поддерживаемые DeepL API (должны совпадать с app/api/translate/route.ts)
const DEEPL_ALLOWED_LANGS = new Set([
  "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "tr", "pl", "uk",
  "nl", "no", "sv", "sk", "sl", "et", "lt", "lv", "st",
]);

/** Названия языков по локали (для селектора и отображения) */
const LANGUAGE_NAMES: Record<Locale, Record<string, string>> = {
  ru: {
    auto: "Авто",
    en: "Английский",
    ar: "Арабский",
    es: "Испанский",
    it: "Итальянский",
    zh: "Китайский",
    ko: "Корейский",
    lv: "Латышский",
    lt: "Литовский",
    de: "Немецкий",
    nl: "Нидерландский",
    no: "Норвежский",
    pl: "Польский",
    pt: "Португальский",
    ru: "Русский",
    sk: "Словацкий",
    sl: "Словенский",
    st: "Сесото",
    tr: "Турецкий",
    uk: "Украинский",
    fr: "Французский",
    sv: "Шведский",
    et: "Эстонский",
    ja: "Японский",
  },
  en: {
    auto: "Auto",
    en: "English",
    ar: "Arabic",
    es: "Spanish",
    it: "Italian",
    zh: "Chinese",
    ko: "Korean",
    lv: "Latvian",
    lt: "Lithuanian",
    de: "German",
    nl: "Dutch",
    no: "Norwegian",
    pl: "Polish",
    pt: "Portuguese",
    ru: "Russian",
    sk: "Slovak",
    sl: "Slovenian",
    st: "Sesotho",
    tr: "Turkish",
    uk: "Ukrainian",
    fr: "French",
    sv: "Swedish",
    et: "Estonian",
    ja: "Japanese",
  },
};

// Порядок по русскому алфавиту (А–Я)
export const SUPPORTED_LANGUAGES = [
  { code: "auto" },
  { code: "en" },
  { code: "ar" },
  { code: "es" },
  { code: "it" },
  { code: "zh" },
  { code: "ko" },
  { code: "lv" },
  { code: "lt" },
  { code: "de" },
  { code: "nl" },
  { code: "no" },
  { code: "pl" },
  { code: "pt" },
  { code: "ru" },
  { code: "sk" },
  { code: "sl" },
  { code: "st" },
  { code: "tr" },
  { code: "uk" },
  { code: "fr" },
  { code: "sv" },
  { code: "et" },
  { code: "ja" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

/** Фиксированная ширина селектора языка по локали (px) */
const LANG_SELECT_WIDTH_PX: Record<Locale, number> = {
  ru: 126,
  en: 110, // по длине "Portuguese" + стрелка
};

/** CSS max-width для контейнера названия языка — зависит от локали */
export function getLangSelectMaxWidth(locale: Locale): string {
  return `${LANG_SELECT_WIDTH_PX[locale]}px`;
}

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

export function getLanguageName(code: string, locale: Locale = "ru"): string {
  const normalized = normalizeLanguageCode(code);
  const name = LANGUAGE_NAMES[locale][normalized];
  return name ?? `Language (${normalized})`;
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

const CIRCLE_FLAGS_BASE = "https://hatscripts.github.io/circle-flags/flags";

/** URL круглого флага из circle-flags (ISO 3166-1 alpha-2) */
export function getFlagUrl(code: string): string | null {
  if (code === "auto") return null;
  const normalized = normalizeLanguageCode(code);
  const region = LANG_TO_REGION[normalized] ?? normalized;
  if (region.length !== 2) return null;
  return `${CIRCLE_FLAGS_BASE}/${region.toLowerCase()}.svg`;
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
