"use client";

import Link from "next/link";
import { t } from "@/lib/strings";
import { getButtonClassName } from "./Button";
import { DAILY_GUEST_LIMIT, WARN_THRESHOLD } from "@/lib/usageLimit";

interface TranslationLimitBannerProps {
  remaining: number;
  onDismiss?: () => void;
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function TranslationLimitBanner({ remaining, onDismiss }: TranslationLimitBannerProps) {
  const isLimitReached = remaining === 0;
  const isWarning = remaining > 0 && remaining <= WARN_THRESHOLD;

  if (!isLimitReached && !isWarning) return null;

  if (isWarning) {
    const text = remaining === 1
      ? t("limit_warning_one").replace("{n}", String(remaining))
      : t("limit_warning").replace("{n}", String(remaining));

    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[var(--color-primary-muted)] rounded-xl text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <InfoIcon className="w-4 h-4 shrink-0 text-[var(--color-primary)]" />
          <span>{text}</span>
        </div>
        <Link
          href="/sign-in"
          className="shrink-0 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors whitespace-nowrap"
        >
          {t("limit_sign_in")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface border border-border rounded-xl">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center">
          <LockIcon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-medium text-text">
            {t("limit_reached_title")}
          </p>
          <p className="text-sm text-text-secondary mt-0.5">
            {t("limit_reached_desc")}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Обновится завтра — или войдите прямо сейчас
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/sign-in"
          className={getButtonClassName("primary", "md", "flex-1 text-center font-bold")}
        >
          {t("limit_sign_in")}
        </Link>
        <Link
          href="/sign-up"
          className={getButtonClassName("secondary", "md", "flex-1 text-center text-text-secondary")}
        >
          {t("limit_sign_up")}
        </Link>
      </div>
    </div>
  );
}

// Маленький счётчик для отображения в плейсхолдере/подсказке
export function TranslationLimitInfo({ remaining }: { remaining: number }) {
  if (remaining > WARN_THRESHOLD || remaining === 0) return null;
  return (
    <span className="text-xs text-[var(--color-primary)] font-medium">
      {remaining === 1
        ? t("limit_warning_one").replace("{n}", "1")
        : t("limit_warning").replace("{n}", String(remaining))}
    </span>
  );
}

export { DAILY_GUEST_LIMIT };
