"use client";

import { t } from "@/lib/strings";
import { TranslationCard } from "./TranslationCard";

interface TranslateResultProps {
  isLoading: boolean;
  error: string | null;
  translatedText: string | null;
  customTranslation?: string;
  onCustomTranslationChange?: (value: string) => void;
  onRetry?: () => void;
}

export function TranslateResult({
  isLoading,
  error,
  translatedText,
  customTranslation = "",
  onCustomTranslationChange = () => {},
  onRetry,
}: TranslateResultProps) {
  if (isLoading) {
    return (
      <section aria-label={t("result_aria")} className="mt-0 flex items-center justify-center min-h-[110px]">
        <div className="flex items-center gap-2 text-gray-500">
          <span
            className="inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          <span>{t("result_loading")}</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label={t("result_error_aria")} className="mt-0 flex flex-col gap-3 justify-center min-h-[110px]">
        <p className="p-4 text-[var(--color-error)] bg-red-50 rounded-lg border border-red-200">
          {error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="self-start px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            {t("result_retry")}
          </button>
        )}
      </section>
    );
  }

  if (!translatedText) {
    return null;
  }

  return (
    <section aria-label={t("result_aria")} className="mt-0">
      <article className="p-4 min-h-[110px] bg-surface border border-border rounded-xl">
        <TranslationCard
          defaultTranslation={translatedText}
          customTranslation={customTranslation}
          onCustomTranslationChange={onCustomTranslationChange}
        />
      </article>
    </section>
  );
}
