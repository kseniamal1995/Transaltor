"use client";

import { t } from "@/lib/strings";

interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onTranslate?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TranslateInput({
  value,
  onChange,
  onBlur,
  onTranslate,
  disabled = false,
  placeholder = t("translate_placeholder"),
}: TranslateInputProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onTranslate?.();
    }
  }

  return (
    <div className="flex min-h-[110px] p-4 md:p-6">
      <label htmlFor="translate-input" className="sr-only">
        {t("translate_input_label")}
      </label>
      <textarea
        id="translate-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full min-h-[78px] h-[fit-content] text-base font-normal text-text placeholder:text-text-secondary resize-none focus:outline-none disabled:bg-transparent disabled:cursor-not-allowed bg-transparent"
      />
    </div>
  );
}
