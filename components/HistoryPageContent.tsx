"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, getDecksForUser, getHistory, removeFromHistory } from "@/lib/storage";
import { HistoryItem } from "./HistoryItem";
import { PageNav } from "./PageNav";

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
    <div className="p-4 max-w-xl mx-auto">
      <PageNav />
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">История</h1>
        <p className="mt-1 text-gray-600">
          Все ваши переводы. Сохраните любой в карточку.
        </p>
      </header>

      {history.length === 0 ? (
        <p className="text-gray-500">История пуста. Сделайте первый перевод.</p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Список переводов">
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
