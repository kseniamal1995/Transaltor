"use client";

import { SUPPORTED_LANGUAGES, getLanguageName } from "@/lib/languages";
import { getLocale } from "@/lib/strings";

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
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white md:text-base"
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
