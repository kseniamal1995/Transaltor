"use client";

import { t } from "@/lib/strings";

interface DeckProgressBarProps {
  learned: number;
  total: number;
  className?: string;
}

export function DeckProgressBar({
  learned,
  total,
  className = "",
}: DeckProgressBarProps) {
  const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="progressbar"
      aria-valuenow={learned}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${learned}/${total} ${t("deck_progress_aria")}`}
    >
      <div className="flex-1 h-2 bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm text-text-secondary min-w-[2.5rem] text-center shrink-0">
        {percent}%
      </span>
    </div>
  );
}
