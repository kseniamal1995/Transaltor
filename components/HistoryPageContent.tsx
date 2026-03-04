"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, getDecksForUser, getHistory, removeFromHistory } from "@/lib/storage";
import { HistoryItem } from "./HistoryItem";
import { PageHeader } from "./PageHeader";
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
    <div className="px-8 py-6 max-w-[600px] mx-auto flex flex-col gap-12">
      <PageHeader
        title={t("history_title")}
        subtitle={t("history_subtitle")}
      />

      {history.length === 0 ? (
        <p className="text-gray-500">{t("history_empty")}</p>
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
