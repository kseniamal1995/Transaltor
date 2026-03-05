"use client";

import { useState } from "react";
import type { Deck } from "@/types";
import { t } from "@/lib/strings";

const CREATE_NEW_ID = "__create_new__";

interface DeckSelectWithCreateProps {
  decks: Deck[];
  value: string;
  onChange: (deckId: string) => void;
  onCreateDeck: (name: string) => Deck;
  onDeckCreated?: (deck: Deck) => void;
  label?: string;
}

export function DeckSelectWithCreate({
  decks,
  value,
  onChange,
  onCreateDeck,
  onDeckCreated,
  label = t("decks_deck_label"),
}: DeckSelectWithCreateProps) {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  function handleSelectChange(deckId: string) {
    if (deckId === CREATE_NEW_ID) {
      setShowCreateInput(true);
      setNewDeckName("");
    } else {
      setShowCreateInput(false);
      onChange(deckId);
    }
  }

  function handleCreate() {
    const trimmed = newDeckName.trim();
    if (!trimmed) return;

    const newDeck = onCreateDeck(trimmed);
    onDeckCreated?.(newDeck);
    setShowCreateInput(false);
    setNewDeckName("");
    onChange(newDeck.id);
  }

  const displayValue = value === CREATE_NEW_ID ? "" : value;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="deck-select" className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id="deck-select"
        value={showCreateInput ? CREATE_NEW_ID : displayValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white md:text-base"
      >
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name}
          </option>
        ))}
        <option value={CREATE_NEW_ID}>{t("decks_create_new")}</option>
      </select>

      {showCreateInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            placeholder={t("decks_create_placeholder")}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-base"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newDeckName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t("decks_create")}
          </button>
        </div>
      )}
    </div>
  );
}
