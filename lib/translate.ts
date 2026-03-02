export interface TranslateResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function translate(
  text: string,
  langPair: string = "en|ru"
): Promise<TranslateResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Введите текст для перевода");
  }

  const params = new URLSearchParams({
    q: trimmed,
    langpair: langPair,
  });

  const res = await fetch(`/api/translate?${params}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Ошибка при переводе");
  }

  return {
    translatedText: data.translatedText,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  };
}
