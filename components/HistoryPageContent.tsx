"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, getDecksForUser, getHistory, removeFromHistory } from "@/lib/storage";
import { HistoryItem } from "./HistoryItem";
import { PageHeader } from "./PageHeader";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { t } from "@/lib/strings";

export function HistoryPageContent() {
  const [history, setHistory] = useState<
    { id: string; foreign: string; translation: string; customTranslation?: string; foreignLanguage?: string; createdAt: string }[]
  >([]);
  const [decks, setDecks] = useState<{ id: string; name: string; createdAt: string }[]>([]);

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

  return (
    <div className="px-6 py-6 max-w-[600px] mx-auto flex flex-col gap-8 md:px-8">
      <PageHeader title={t("history_title")} />

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-4 p-6 border border-border rounded-xl text-center">
          <EmptyStateIllustration className="w-[72px] h-[72px] text-text-muted" />
          <p className="text-text-secondary">{t("history_empty")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3" aria-label={t("history_aria")}>
          {history.map((item) => (
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
      )}
    </div>
  );
}
