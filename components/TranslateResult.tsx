"use client";

interface TranslateResultProps {
  isLoading: boolean;
  error: string | null;
  translatedText: string | null;
  sourceText?: string;
}

export function TranslateResult({
  isLoading,
  error,
  translatedText,
  sourceText,
}: TranslateResultProps) {
  if (isLoading) {
    return (
      <section aria-label="Результат перевода" className="mt-0">
        <div className="flex items-center gap-2 text-gray-500">
          <span
            className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          <span>Перевожу...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Ошибка перевода" className="mt-0">
        <p className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </p>
      </section>
    );
  }

  if (!translatedText) {
    return null;
  }

  return (
    <section aria-label="Результат перевода" className="mt-0">
      <article className="p-4 min-h-[120px] h-fit bg-white rounded-lg border border-gray-200 shadow-sm">
        {sourceText && (
          <p className="mb-2 text-sm text-gray-500">{sourceText}</p>
        )}
        <p className="text-lg font-medium text-gray-900">{translatedText}</p>
      </article>
    </section>
  );
}
