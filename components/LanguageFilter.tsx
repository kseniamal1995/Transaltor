"use client";

import { getLanguageName } from "@/lib/languages";

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
      <label className="text-sm font-medium text-gray-700">
        Фильтр по языку
      </label>
      <select
        value={selectedLang}
        onChange={(e) => onLangChange(e.target.value)}
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
