"use client";

import type { Deck } from "@/types";
import { DeckSelectWithCreate } from "./DeckSelectWithCreate";
import { Button } from "./Button";
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
  isSaving = false,
}: SaveCardFormProps) {
  return (
    <section
      aria-label={t("card_save_aria")}
      className="bg-surface-secondary rounded-2xl p-5 flex flex-col gap-3"
    >
      <p className="text-base font-bold text-text">{t("card_save_choose_deck")}</p>

      <div className="flex gap-3 items-start">
        <DeckSelectWithCreate
          decks={decks}
          value={selectedDeckId}
          onChange={onDeckChange}
          onCreateDeck={onCreateDeck}
          onDeckCreated={onDeckCreated}
        />

        <Button onClick={onSave} disabled={isSaving} className="shrink-0 font-bold">
          {isSaving ? t("card_saving") : t("card_save")}
        </Button>
      </div>
    </section>
  );
}
