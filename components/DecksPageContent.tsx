"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, getLanguagesInUse } from "@/lib/storage";
import { getLanguageName, getFlagEmoji } from "@/lib/languages";
import { PageHeader } from "./PageHeader";
import { t } from "@/lib/strings";

export function DecksPageContent() {
  const [languages, setLanguages] = useState<string[]>([]);

  function loadData() {
    const user = getCurrentUser();
    if (user.id) {
      setLanguages(getLanguagesInUse(user.id));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="px-8 py-6 max-w-[600px] mx-auto flex flex-col gap-12">
      <PageHeader
        title={t("decks_title")}
        subtitle={t("decks_subtitle")}
      />

      {languages.length === 0 ? (
        <p className="mt-6 text-gray-500">{t("decks_empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t("decks_aria")}>
          {languages.map((lang) => (
            <li key={lang}>
              <Link
                href={`/decks/${encodeURIComponent(lang)}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                aria-label={getLanguageName(lang)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-xl overflow-hidden"
                    aria-hidden
                  >
                    {getFlagEmoji(lang)}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getLanguageName(lang)}
                  </h2>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
