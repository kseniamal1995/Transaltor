"use client";

import { t } from "@/lib/strings";

interface StudyCardProps {
  foreign: string;
  translation: string;
  isFlipped: boolean;
  onFlip: () => void;
  swipeOffset?: number;
  disableTransition?: boolean;
  className?: string;
}

export function StudyCard({
  foreign,
  translation,
  isFlipped,
  onFlip,
  swipeOffset = 0,
  disableTransition = false,
  className = "",
}: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className={`block w-full min-h-[220px] touch-none select-none text-left ${className}`}
      aria-label={isFlipped ? t("study_show_word") : t("study_show_translation")}
    >
      <div
        className="relative w-full h-full min-h-[220px]"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: disableTransition ? "none" : (swipeOffset === 0 ? "transform 0.3s ease-out" : "none"),
        }}
      >
        <div
          className={`w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 rounded-xl border-2 shadow-lg ${
            isFlipped ? "bg-[var(--color-primary-muted)] border-primary" : "bg-surface border-border"
          }`}
        >
          {!isFlipped ? (
            <>
              <p className="text-2xl font-semibold text-text text-center">
                {foreign}
              </p>
              <p className="mt-3 text-sm text-text-muted">
                {t("study_tap_to_flip")}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-medium text-text text-center">
                {translation}
              </p>
              <p className="mt-3 text-sm text-text-muted">
                {t("study_swipe_hint")}
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
