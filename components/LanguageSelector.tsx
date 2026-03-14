"use client";

import { SUPPORTED_LANGUAGES, getLanguageName } from "@/lib/languages";
import { getLocale } from "@/lib/strings";
import { FORM_INPUT_CLASSES, FORM_LABEL_CLASSES } from "@/lib/ui-classes";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}

export function LanguageSelector({
  value,
  onChange,
  label = "Язык",
}: LanguageSelectorProps) {
  const locale = getLocale();
  const options = SUPPORTED_LANGUAGES.map((l) => ({
    code: l.code,
    name: getLanguageName(l.code, locale),
  }));

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="language-select" className={FORM_LABEL_CLASSES}>
        {label}
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={FORM_INPUT_CLASSES}
      >
        {options.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
