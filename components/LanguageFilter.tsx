"use client";

import { getLanguageName } from "@/lib/languages";
import { FORM_INPUT_CLASSES, FORM_LABEL_CLASSES } from "@/lib/ui-classes";

interface LanguageFilterProps {
  languages: string[];
  selectedLang: string;
  onLangChange: (code: string) => void;
}

export function LanguageFilter({
  languages,
  selectedLang,
  onLangChange,
}: LanguageFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className={FORM_LABEL_CLASSES}>
        Фильтр по языку
      </label>
      <select
        value={selectedLang}
        onChange={(e) => onLangChange(e.target.value)}
        className={FORM_INPUT_CLASSES}
      >
        <option value="all">Все языки</option>
        {languages.map((code) => (
          <option key={code} value={code}>
            {getLanguageName(code)}
          </option>
        ))}
      </select>
    </div>
  );
}
