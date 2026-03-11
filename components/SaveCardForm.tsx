"use client";

import type { Deck } from "@/types";
import { DeckSelectWithCreate } from "./DeckSelectWithCreate";
import { t } from "@/lib/strings";

interface SaveCardFormProps {
  decks: Deck[];
  selectedDeckId: string;
  onDeckChange: (deckId: string) => void;
  onDeckCreated?: (deck: Deck) => void;
  onCreateDeck: (name: string) => Deck;
  onSave: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function SaveCardForm({
  decks,
  selectedDeckId,
  onDeckChange,
  onDeckCreated,
  onCreateDeck,
  onSave,
  onCancel,
  isSaving = false,
}: SaveCardFormProps) {
  return (
    <section
      aria-label={t("card_save_aria")}
      className="mt-4 p-4 bg-surface border border-border rounded-xl"
    >
      <div className="flex flex-col gap-3">
        <DeckSelectWithCreate
          decks={decks}
          value={selectedDeckId}
          onChange={onDeckChange}
          onCreateDeck={onCreateDeck}
          onDeckCreated={onDeckCreated}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 text-base font-bold text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? t("card_saving") : t("card_save")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-3 text-base font-medium text-text-secondary bg-surface border border-border rounded-xl hover:bg-surface-secondary disabled:opacity-50 transition-colors"
            >
              {t("card_cancel")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
