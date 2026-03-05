"use client";

import type { Deck } from "@/types";
import { t } from "@/lib/strings";

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
      <label htmlFor="deck-select" className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id="deck-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white md:text-base"
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
