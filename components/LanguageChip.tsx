import { getLanguageName, getFlagEmoji } from "@/lib/languages";

interface LanguageChipProps {
  lang: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * Чип выбора языка. Используется в фильтре "Мои словари".
 * active  → белый фон + бордер (border-border)
 * inactive → surface-secondary фон, hover добавляет бордер
 */
export function LanguageChip({ lang, active = false, onClick }: LanguageChipProps) {
  const baseClasses =
    "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all text-base font-bold text-text leading-6 select-none";

  const stateClasses = active
    ? "bg-surface border border-border shadow-sm"
    : "bg-surface-secondary border border-transparent hover:border-border-hover";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
    >
      <span className="text-xl leading-none" aria-hidden>
        {getFlagEmoji(lang)}
      </span>
      <span>{getLanguageName(lang)}</span>
    </button>
  );
}
