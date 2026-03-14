"use client";

import { useRef, useLayoutEffect } from "react";
import { t } from "@/lib/strings";
import { SpeakButton } from "./SpeakButton";
import { IconButton } from "./IconButton";
import { XIcon } from "./icons/XIcon";

interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onTranslate?: () => void;
  disabled?: boolean;
  placeholder?: string;
  lang?: string;
}

export function TranslateInput({
  value,
  onChange,
  onBlur,
  onTranslate,
  disabled = false,
  placeholder = t("translate_placeholder"),
  lang = "en",
}: TranslateInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onTranslate?.();
    }
  }

  return (
    <div className="flex flex-col gap-10 pt-3 pl-4 pr-3 pb-4">
      <div className="flex items-start gap-2">
        <label htmlFor="translate-input" className="sr-only">
          {t("translate_input_label")}
        </label>
        <textarea
          ref={textareaRef}
          id="translate-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 text-base font-normal text-text placeholder:text-text-secondary resize-none overflow-hidden focus:outline-none disabled:cursor-not-allowed bg-transparent"
        />
        {value && (
          <IconButton
            onClick={() => onChange("")}
            disabled={disabled}
            ariaLabel="Очистить"
            className={`shrink-0 ${disabled ? "invisible" : ""}`}
          >
            <XIcon className="w-5 h-5" />
          </IconButton>
        )}
      </div>

      <div className={`flex items-center pr-1 ${!value ? "opacity-0 pointer-events-none" : ""}`}>
        <SpeakButton text={value} lang={lang} iconOnly />
      </div>
    </div>
  );
}
