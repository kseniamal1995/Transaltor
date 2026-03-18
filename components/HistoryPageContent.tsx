"use client";

import { useState, useEffect, useMemo } from "react";
import { getCurrentUser, getDecksForUser, getHistory, clearHistory } from "@/lib/storage";
import { HistoryItem } from "./HistoryItem";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { SearchIcon } from "./icons/SearchIcon";
import { TrashIcon } from "./icons/TrashIcon";
import { t } from "@/lib/strings";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";

export function HistoryPageContent() {
  const [history, setHistory] = useState<
    { id: string; foreign: string; translation: string; customTranslation?: string; foreignLanguage?: string; translationLanguage?: string; createdAt: string }[]
  >([]);
  const [decks, setDecks] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

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

  function handleClearHistory() {
    if (!confirm(t("history_clear_confirm"))) return;
    const user = getCurrentUser();
    if (!user.id) return;
    clearHistory(user.id);
    setHistory([]);
  }

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
    <div className={`${PAGE_LAYOUT_CLASSES} gap-6`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[24px] font-normal text-text">
          {t("history_title")}
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-[var(--color-error)] transition-colors"
          >
            <TrashIcon size={16} />
            <span>{t("history_clear")}</span>
          </button>
        )}
      </div>

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
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(10); }}
              placeholder={t("history_search_placeholder")}
              className="flex-1 min-w-0 bg-transparent text-base text-text placeholder:text-text-secondary focus:outline-none"
            />
          </div>

          {filtered.length > 0 ? (
            <>
              <ul className="flex flex-col gap-3" aria-label={t("history_aria")}>
                {filtered.slice(0, visibleCount).map((item) => (
                  <li key={item.id}>
                    <HistoryItem
                      id={item.id}
                      foreign={item.foreign}
                      translation={item.translation}
                      customTranslation={item.customTranslation}
                      foreignLanguage={item.foreignLanguage}
                      translationLanguage={item.translationLanguage}
                      decks={decks}
                      onSaved={loadData}
                    />
                  </li>
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  className="self-center px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                >
                  {t("show_more")}
                </button>
              )}
            </>
          ) : (
            <p className="text-text-secondary text-center py-6">{t("history_search_no_results")}</p>
          )}
        </div>
      )}
    </div>
  );
}
