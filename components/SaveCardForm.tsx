"use client";

import type { Deck } from "@/types";
import { CustomTranslationInput } from "./CustomTranslationInput";
import { DeckSelectWithCreate } from "./DeckSelectWithCreate";

interface SaveCardFormProps {
  foreign: string;
  defaultTranslation: string;
  decks: Deck[];
  selectedDeckId: string;
  onDeckChange: (deckId: string) => void;
  onDeckCreated?: (deck: Deck) => void;
  onCreateDeck: (name: string) => Deck;
  customTranslation: string;
  onCustomTranslationChange: (value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function SaveCardForm({
  foreign,
  defaultTranslation,
  decks,
  selectedDeckId,
  onDeckChange,
  onDeckCreated,
  onCreateDeck,
  customTranslation,
  onCustomTranslationChange,
  onSave,
  onCancel,
  isSaving = false,
}: SaveCardFormProps) {
  const displayTranslation = customTranslation.trim() || defaultTranslation;

  return (
    <section
      aria-label="Сохранить как карточку"
      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Сохранить как карточку
      </h3>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{foreign}</span>
          {displayTranslation && (
            <>
              {" → "}
              <span className="font-medium">{displayTranslation}</span>
            </>
          )}
        </p>

        <DeckSelectWithCreate
          decks={decks}
          value={selectedDeckId}
          onChange={onDeckChange}
          onCreateDeck={onCreateDeck}
          onDeckCreated={onDeckCreated}
        />

        <CustomTranslationInput
          value={customTranslation}
          onChange={onCustomTranslationChange}
          placeholder={`По умолчанию: ${defaultTranslation}`}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !displayTranslation}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
