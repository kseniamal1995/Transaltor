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
  lang?: string;
}

export function TranslateResult({
  isLoading,
  error,
  translatedText,
  customTranslation = "",
  onCustomTranslationChange = () => {},
  onRetry,
  lang = "en",
}: TranslateResultProps) {
  return (
    <section
      aria-label={error ? t("result_error_aria") : t("result_aria")}
      className="bg-surface-secondary border border-border rounded-xl min-h-[132px]"
    >
      {isLoading && (
        <div className="flex items-center justify-center min-h-[132px]">
          <div className="flex items-center gap-2 text-text-secondary">
            <span
              className="inline-block w-5 h-5 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"
              aria-hidden
            />
            <span className="text-base">{t("result_loading")}</span>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col gap-3 justify-center min-h-[132px] p-4">
          <p className="text-[var(--color-error)]">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="self-start text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              {t("result_retry")}
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && !translatedText && (
        <div className="flex items-start pt-3 pl-4 pr-3 pb-4 min-h-[132px]">
          <p className="text-base text-text-secondary">{t("result_placeholder")}</p>
        </div>
      )}

      {!isLoading && !error && translatedText && (
        <TranslationCard
          defaultTranslation={translatedText}
          customTranslation={customTranslation}
          onCustomTranslationChange={onCustomTranslationChange}
          lang={lang}
        />
      )}
    </section>
  );
}
