"use client";

import type { Deck } from "@/types";
import { t } from "@/lib/strings";
import { FORM_INPUT_CLASSES, FORM_LABEL_CLASSES } from "@/lib/ui-classes";

interface DeckSelectProps {
  decks: Deck[];
  value: string;
  onChange: (deckId: string) => void;
  label?: string;
}

export function DeckSelect({
  decks,
  value,
  onChange,
  label = t("decks_deck_label"),
}: DeckSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="deck-select" className={FORM_LABEL_CLASSES}>
        {label}
      </label>
      <select
        id="deck-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={FORM_INPUT_CLASSES}
      >
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name}
          </option>
        ))}
      </select>
    </div>
  );
}
