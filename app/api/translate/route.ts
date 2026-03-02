import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DEEPL_FREE_API = "https://api-free.deepl.com/v2/translate";

// 20 запросов на перевод в минуту на один IP
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "60 s"),
      })
    : null;
const MAX_TEXT_LENGTH = 5000; // защита от злоупотребления и лимиты DeepL

const ALLOWED_LANGS = new Set([
  "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "tr", "pl", "uk",
  "nl", "no", "sv", "sk", "sl", "et", "lt", "lv", "st",
]);

function toDeepLLang(code: string): string {
  const upper = code.toUpperCase();
  if (code === "zh") return "ZH";
  if (code === "ja") return "JA";
  if (code === "ko") return "KO";
  return upper.length === 2 ? upper : code;
}

export async function GET(request: NextRequest) {
  if (ratelimit) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Слишком много запросов. Подождите минуту и попробуйте снова.",
        },
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Сервис перевода временно недоступен." },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const langpair = searchParams.get("langpair") ?? "en|ru";
  const [source, target] = langpair.split("|");

  const text = q?.trim();
  if (!text) {
    return NextResponse.json(
      { error: "Параметр q обязателен" },
      { status: 400 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Текст не должен превышать ${MAX_TEXT_LENGTH} символов` },
      { status: 400 }
    );
  }

  const normalizedSource = source?.toLowerCase().split("-")[0];
  const normalizedTarget = target?.toLowerCase().split("-")[0];
  if (normalizedSource && normalizedSource !== "auto" && !ALLOWED_LANGS.has(normalizedSource)) {
    return NextResponse.json({ error: "Неподдерживаемый исходный язык" }, { status: 400 });
  }
  if (!normalizedTarget || !ALLOWED_LANGS.has(normalizedTarget)) {
    return NextResponse.json({ error: "Неподдерживаемый язык перевода" }, { status: 400 });
  }

  try {
    const targetLang = toDeepLLang(target);
    const useAutoDetect = !source || source === "auto";
    const sourceLang = !useAutoDetect ? toDeepLLang(source) : undefined;

    const body: Record<string, unknown> = {
      text: [text],
      target_lang: targetLang,
    };
    if (sourceLang) {
      body.source_lang = sourceLang;
    }

    const res = await fetch(DEEPL_FREE_API, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data.message || data.error?.message || "Ошибка DeepL API";
      return NextResponse.json(
        { error: msg },
        { status: res.status }
      );
    }

    const translation = data.translations?.[0];
    if (!translation) {
      return NextResponse.json(
        { error: "Пустой ответ от DeepL" },
        { status: 500 }
      );
    }

    const detectedSource = translation.detected_source_language?.toLowerCase();
    const actualSource =
      detectedSource ?? (source === "auto" ? "en" : source) ?? "en";

    return NextResponse.json({
      translatedText: translation.text,
      sourceLanguage: actualSource,
      targetLanguage: target,
    });
  } catch (err) {
    console.error("Translate API error:", err);
    return NextResponse.json(
      { error: "Ошибка при переводе. Попробуйте позже." },
      { status: 500 }
    );
  }
}
