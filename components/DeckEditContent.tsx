"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  getDecksForUser,
  getCardsForDeck,
  deleteCard,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { t } from "@/lib/strings";
import { getLanguageName } from "@/lib/languages";
import { IconButton } from "./IconButton";
import { TrashIcon } from "./icons/TrashIcon";

interface DeckEditContentProps {
  deckId: string;
  lang?: string;
}

type CardItem = {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
};

export function DeckEditContent({ deckId, lang }: DeckEditContentProps) {
  const [deck, setDeck] = useState<{ id: string; name: string } | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);

  function load() {
    const user = getCurrentUser();
    if (!user.id) return;

    const decks = getDecksForUser(user.id);
    const found = decks.find((d) => d.id === deckId);
    if (found) {
      const displayName = deckId === ALL_CARDS_DECK_ID && lang ? t("decks_all_cards") : found.name;
      setDeck({ ...found, name: displayName });
      const deckCards = getCardsForDeck(user.id, deckId, lang);
      setCards(deckCards);
    }
  }

  useEffect(() => {
    load();
  }, [deckId, lang]);

  function handleDeleteCard(cardId: string) {
    const user = getCurrentUser();
    if (!user.id) return;
    deleteCard(user.id, cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  if (!deck) {
    return (
      <div className="p-4">
        <p className="text-text-muted">{t("deck_not_found")}</p>
        <Link href="/decks" className="mt-4 text-[var(--color-primary)] hover:underline">
          {t("deck_back_to_list")}
        </Link>
      </div>
    );
  }

  const backHref = lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`;
  const displayTranslation = (card: CardItem) => card.customTranslation || card.translation;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Link href={backHref} className="inline-block mb-4 text-sm text-[var(--color-primary)] hover:underline">
        {t("deck_back_to_deck")}
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">{deck.name}</h1>
      </header>

      {cards.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-label={t("deck_cards_aria")}>
          {cards.map((card) => (
            <li
              key={card.id}
              className="p-4 bg-surface rounded-xl border border-border relative"
            >
              <IconButton
                onClick={() => handleDeleteCard(card.id)}
                ariaLabel={t("deck_delete_card_aria")}
                className="absolute top-4 right-4 hover:text-[var(--color-error)] hover:bg-[var(--color-primary-muted)]"
              >
                <TrashIcon size={18} />
              </IconButton>
              <div className="pr-10">
                <p className="font-medium text-text">{card.foreign}</p>
                <p className="text-text-secondary mt-1">{displayTranslation(card)}</p>
                {card.foreignLanguage && (
                  <span className="text-xs text-text-muted mt-1 block">
                    {getLanguageName(card.foreignLanguage)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted">{t("deck_no_cards_yet")}</p>
      )}
    </div>
  );
}
