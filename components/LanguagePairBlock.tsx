"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface LanguagePairBlockProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onSwap: () => void;
}

export function LanguagePairBlock({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}: LanguagePairBlockProps) {
  return (
    <div
      className="flex items-center justify-between gap-2 p-0 bg-gray-50 rounded-lg"
      aria-label="Выбор языков перевода"
    >
      <select
        value={sourceLang}
        onChange={(e) => onSourceChange(e.target.value)}
        className="flex-1 px-3 py-2 text-base font-medium text-gray-900 bg-white border border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Язык исходного текста"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.code === "auto" ? "Авто" : lang.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onSwap}
        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
        aria-label="Поменять языки местами"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M16 3l4 4-4 4" />
          <path d="M20 7H4" />
          <path d="M8 21l-4-4 4-4" />
          <path d="M4 17h16" />
        </svg>
      </button>

      <select
        value={targetLang}
        onChange={(e) => onTargetChange(e.target.value)}
        className="flex-1 px-3 py-2 text-base font-medium text-gray-900 bg-white border border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Язык перевода"
      >
        {SUPPORTED_LANGUAGES.filter((l) => l.code !== "auto").map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
