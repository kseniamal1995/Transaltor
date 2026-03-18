"use client";

import { useState, useEffect, useMemo } from "react";
import { getCurrentUser, getDecksForUser, getHistory, removeFromHistory } from "@/lib/storage";
import { HistoryItem } from "./HistoryItem";
import { PageHeader } from "./PageHeader";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { SearchIcon } from "./icons/SearchIcon";
import { t } from "@/lib/strings";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";

export function HistoryPageContent() {
  const [history, setHistory] = useState<
    { id: string; foreign: string; translation: string; customTranslation?: string; foreignLanguage?: string; createdAt: string }[]
  >([]);
  const [decks, setDecks] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [query, setQuery] = useState("");

  function loadData() {
    const user = getCurrentUser();
    if (user.id) {
      setHistory(getHistory(user.id));
      setDecks(getDecksForUser(user.id));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.foreign.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        (item.customTranslation && item.customTranslation.toLowerCase().includes(q)),
    );
  }, [history, query]);

  return (
    <div className={`${PAGE_LAYOUT_CLASSES} gap-8`}>
      <PageHeader title={t("history_title")} />

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 p-6 border border-border rounded-xl text-center">
          <EmptyStateIllustration className="w-[72px] h-[72px] text-text-muted" />
          <p className="text-text-secondary">{t("history_empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-secondary border border-border rounded-xl">
            <SearchIcon className="w-5 h-5 shrink-0 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("history_search_placeholder")}
              className="flex-1 min-w-0 bg-transparent text-base text-text placeholder:text-text-secondary focus:outline-none"
            />
          </div>

          {filtered.length > 0 ? (
            <ul className="flex flex-col gap-3" aria-label={t("history_aria")}>
              {filtered.map((item) => (
                <li key={item.id}>
                  <HistoryItem
                    id={item.id}
                    foreign={item.foreign}
                    translation={item.translation}
                    customTranslation={item.customTranslation}
                    foreignLanguage={item.foreignLanguage}
                    decks={decks}
                    onSaved={loadData}
                    onDelete={() => {
                      const user = getCurrentUser();
                      if (user.id) {
                        removeFromHistory(user.id, item.id);
                        loadData();
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-center py-6">{t("history_search_no_results")}</p>
          )}
        </div>
      )}
    </div>
  );
}
