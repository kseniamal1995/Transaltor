"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { t } from "@/lib/strings";
import { SpeakButton } from "./SpeakButton";
import { IconButton } from "./IconButton";
import { CheckIcon } from "./icons/CheckIcon";
import { CopyIcon } from "./icons/CopyIcon";

interface TranslationCardProps {
  defaultTranslation: string;
  customTranslation: string;
  onCustomTranslationChange: (value: string) => void;
  lang?: string;
  placeholder?: string;
}

export function TranslationCard({
  defaultTranslation,
  customTranslation,
  onCustomTranslationChange,
  lang = "en",
  placeholder = t("card_custom_placeholder"),
}: TranslationCardProps) {
  const [isCustomEnabled, setIsCustomEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isCustomEnabled) inputRef.current?.focus();
  }, [isCustomEnabled]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [customTranslation, isCustomEnabled]);

  function handleToggle() {
    const next = !isCustomEnabled;
    setIsCustomEnabled(next);
    if (!next) onCustomTranslationChange("");
  }

  async function handleCopy() {
    const text = (isCustomEnabled && customTranslation.trim()) ? customTranslation : defaultTranslation;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // clipboard not available
    }
  }

  const displayText = (isCustomEnabled && customTranslation.trim()) ? customTranslation : defaultTranslation;

  return (
    <div className="flex flex-col gap-10 pt-3 pl-4 pr-3 pb-4">
      <div className="grid py-1">
        <p className={`col-start-1 row-start-1 text-base font-normal leading-normal text-text-secondary ${isCustomEnabled ? "invisible pointer-events-none" : ""}`}>
          {defaultTranslation}
        </p>
        <textarea
          ref={inputRef}
          value={customTranslation}
          onChange={(e) => onCustomTranslationChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className={`col-start-1 row-start-1 w-full p-0 bg-transparent resize-none overflow-hidden text-base font-normal leading-normal text-text-secondary placeholder:text-text-secondary focus:outline-none ${!isCustomEnabled ? "invisible pointer-events-none" : ""}`}
        />
      </div>

      <div className="flex items-center gap-2 pr-1">
        <div className="flex flex-1 items-center gap-1">
          <IconButton
            onClick={handleCopy}
            ariaLabel="Копировать перевод"
            title={copied ? "Скопировано!" : "Копировать"}
          >
            {copied
              ? <CheckIcon className="w-5 h-5 text-[var(--color-primary)]" />
              : <CopyIcon className="w-5 h-5" />
            }
          </IconButton>
          <SpeakButton text={displayText} lang={lang} iconOnly />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isCustomEnabled}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
              isCustomEnabled
                ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                : "bg-tertiary hover:bg-border"
            }`}
            aria-label={t("card_custom_label")}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isCustomEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-base font-medium text-text-secondary whitespace-nowrap">
            {t("card_custom_label")}
          </span>
        </div>
      </div>
    </div>
  );
}
