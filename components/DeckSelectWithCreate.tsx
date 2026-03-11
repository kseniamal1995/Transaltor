"use client";

import { useState } from "react";
import type { Deck } from "@/types";
import { t } from "@/lib/strings";

const CREATE_NEW_ID = "__create_new__";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

interface DeckSelectWithCreateProps {
  decks: Deck[];
  value: string;
  onChange: (deckId: string) => void;
  onCreateDeck: (name: string) => Deck;
  onDeckCreated?: (deck: Deck) => void;
  className?: string;
}

export function DeckSelectWithCreate({
  decks,
  value,
  onChange,
  onCreateDeck,
  onDeckCreated,
  className = "",
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
    <div className={`flex flex-col gap-2 flex-1 ${className}`}>
      <div className="relative">
        <select
          id="deck-select"
          value={showCreateInput ? CREATE_NEW_ID : displayValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 pr-10 text-base font-medium text-text bg-surface border border-border rounded-xl focus:outline-none cursor-pointer"
        >
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
          <option value={CREATE_NEW_ID}>{t("decks_create_new")}</option>
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
      </div>

      {showCreateInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            placeholder={t("decks_create_placeholder")}
            className="flex-1 px-4 py-3 text-base border border-border rounded-xl focus:outline-none bg-surface text-text placeholder:text-text-secondary"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newDeckName.trim()}
            className="shrink-0 px-4 py-3 text-base font-bold text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("decks_create")}
          </button>
        </div>
      )}
    </div>
  );
}
