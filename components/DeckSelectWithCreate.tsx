"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Deck } from "@/types";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { t } from "@/lib/strings";
import { Button } from "./Button";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { CheckIcon } from "./icons/CheckIcon";

const CREATE_NEW_ID = "__create_new__";

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
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [dropdownRect, setDropdownRect] = useState<{
    rect: DOMRect;
    openUp: boolean;
    width: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const selectedDeck = decks.find((d) => d.id === value);

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || !open) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 300 && spaceAbove > spaceBelow;
    setDropdownRect({ rect, openUp, width: rect.width, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const dropdown = document.getElementById("deck-dropdown");
      if (dropdown?.contains(target)) return;
      setOpen(false);
      setIsCreating(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSelect(deckId: string) {
    onChange(deckId);
    setOpen(false);
    setIsCreating(false);
  }

  function handleStartCreate() {
    setIsCreating(true);
    setNewDeckName("");
    setTimeout(() => createInputRef.current?.focus(), 0);
  }

  function handleCreate() {
    const trimmed = newDeckName.trim();
    if (!trimmed) return;
    const newDeck = onCreateDeck(trimmed);
    onDeckCreated?.(newDeck);
    setIsCreating(false);
    setNewDeckName("");
    onChange(newDeck.id);
    setOpen(false);
  }

  return (
    <div className={`flex flex-col gap-2 flex-1 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-text bg-surface border border-border hover:border-border-hover rounded-xl focus:outline-none cursor-pointer transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedDeck?.id === ALL_CARDS_DECK_ID ? t("decks_all_cards") : (selectedDeck?.name ?? "")}</span>
        <ChevronDownIcon
          className={`w-5 h-5 shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        dropdownRect &&
        createPortal(
          <div
            id="deck-dropdown"
            role="listbox"
            className="fixed z-[100] bg-surface border border-border overflow-hidden flex flex-col rounded-xl shadow-[0_6px_20px_rgb(0_0_0_/_0.08),0_8px_8px_rgb(0_0_0_/_0.05)]"
            style={{
              top: dropdownRect.openUp ? "auto" : dropdownRect.rect.bottom + 8,
              bottom: dropdownRect.openUp
                ? window.innerHeight - dropdownRect.rect.top + 8
                : "auto",
              left: dropdownRect.left,
              width: dropdownRect.width,
              maxHeight: "min(300px, calc(100vh - 80px))",
            }}
          >
            <ul className="overflow-auto p-1.5">
              {decks.map((deck) => (
                <li
                  key={deck.id}
                  role="option"
                  aria-selected={deck.id === value}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors rounded-lg ${
                    deck.id === value
                      ? "bg-primary-muted text-text font-semibold"
                      : "text-text hover:bg-background"
                  }`}
                  onClick={() => handleSelect(deck.id)}
                >
                  <span className="truncate">{deck.id === ALL_CARDS_DECK_ID ? t("decks_all_cards") : deck.name}</span>
                  {deck.id === value && (
                    <CheckIcon className="w-4 h-4 shrink-0 text-[var(--color-primary)]" />
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-1.5">
              {isCreating ? (
                <div className="flex gap-2 px-1.5 py-1.5">
                  <input
                    ref={createInputRef}
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder={t("decks_create_placeholder")}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none bg-surface text-text placeholder:text-text-secondary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setIsCreating(false);
                    }}
                  />
                  <Button onClick={handleCreate} disabled={!newDeckName.trim()} size="sm" className="shrink-0 font-bold">
                    {t("decks_create")}
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="w-full text-left px-3 py-2.5 text-sm text-text-secondary hover:bg-background rounded-lg transition-colors"
                >
                  {t("decks_create_new")}
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
