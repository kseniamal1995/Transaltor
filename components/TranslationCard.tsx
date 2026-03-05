"use client";

import { useState, useRef, useEffect } from "react";
import { t } from "@/lib/strings";

interface TranslationCardProps {
  defaultTranslation: string;
  customTranslation: string;
  onCustomTranslationChange: (value: string) => void;
  placeholder?: string;
}

export function TranslationCard({
  defaultTranslation,
  customTranslation,
  onCustomTranslationChange,
  placeholder = t("card_custom_placeholder"),
}: TranslationCardProps) {
  const [isCustomChecked, setIsCustomChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayTranslation = customTranslation.trim() || defaultTranslation;

  useEffect(() => {
    if (isCustomChecked) inputRef.current?.focus();
  }, [isCustomChecked]);

  function handleCheckboxChange(checked: boolean) {
    setIsCustomChecked(checked);
    if (!checked) {
      onCustomTranslationChange("");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-text-secondary">{t("card_translation_label")}</span>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer text-text-secondary hover:text-text transition-colors">
          <input
            type="checkbox"
            checked={isCustomChecked}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm">{t("card_custom_label")}</span>
        </label>
      </div>
      <div className="min-h-[44px]">
        {isCustomChecked ? (
          <>
            <p className="text-sm text-text-secondary/80 mb-2">{defaultTranslation}</p>
            <input
              ref={inputRef}
              type="text"
              value={customTranslation}
              onChange={(e) => onCustomTranslationChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-[var(--color-background)] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </>
        ) : (
          <p className="text-base font-normal text-text">{displayTranslation}</p>
        )}
      </div>
    </div>
  );
}
