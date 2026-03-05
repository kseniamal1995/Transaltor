"use client";

import { useState, useEffect } from "react";
import type { Deck } from "@/types";
import { createDeck, getCurrentUser, saveCard } from "@/lib/storage";
import { SaveCardForm } from "./SaveCardForm";
import { TranslationCard } from "./TranslationCard";
import { TrashIcon } from "./icons/TrashIcon";
import { t } from "@/lib/strings";

interface HistoryItemProps {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  decks: Deck[];
  onSaved: () => void;
  onDelete: () => void;
}

export function HistoryItem({
  id,
  foreign,
  translation,
  foreignLanguage,
  decks,
  onSaved,
  onDelete,
}: HistoryItemProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id ?? "");
  const [customTranslation, setCustomTranslation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (decks.length > 0 && !decks.some((d) => d.id === selectedDeckId)) {
      setSelectedDeckId(decks[0].id);
    }
  }, [decks, selectedDeckId]);

  function handleSave() {
    const user = getCurrentUser();
    if (!user.id) return;

    setIsSaving(true);
    saveCard(user.id, {
      foreign,
      translation,
      customTranslation: customTranslation.trim() || undefined,
      foreignLanguage,
      deckIds: [selectedDeckId],
    });
    setIsSaving(false);
    onSaved();
    setShowForm(false);
    setCustomTranslation("");
  }

  if (decks.length === 0) return null;

  const displayTranslation = customTranslation.trim() || translation;

  return (
    <article className="p-4 bg-white rounded-lg border border-gray-200 relative">
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        aria-label={t("history_delete_aria")}
      >
        <TrashIcon size={18} />
      </button>
      <div className="flex flex-col gap-2 pr-8">
        {!showForm ? (
          <>
            <p className="text-gray-900 font-medium">{foreign}</p>
            <p className="text-gray-600">{displayTranslation}</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="self-start px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              {t("card_save_title")}
            </button>
          </>
        ) : (
          <>
            <div className="p-4 bg-surface border border-border rounded-xl">
              <TranslationCard
                defaultTranslation={translation}
                customTranslation={customTranslation}
                onCustomTranslationChange={setCustomTranslation}
              />
            </div>
            <SaveCardForm
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              onCreateDeck={(name) => createDeck(getCurrentUser().id, name)}
              onDeckCreated={onSaved}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
              isSaving={isSaving}
            />
          </>
        )}
      </div>
    </article>
  );
}
