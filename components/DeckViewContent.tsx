"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  getDecksForUser,
  getCardsForDeck,
  getDeckProgress,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { t } from "@/lib/strings";
import { getLanguageName } from "@/lib/languages";
import { DeckProgressBar } from "./DeckProgressBar";

interface DeckViewContentProps {
  deckId: string;
  lang?: string;
}

export function DeckViewContent({ deckId, lang }: DeckViewContentProps) {
  const [deck, setDeck] = useState<{ id: string; name: string } | null>(null);
  const [cards, setCards] = useState<
    { id: string; foreign: string; translation: string; customTranslation?: string; foreignLanguage?: string }[]
  >([]);
  const [progress, setProgress] = useState({ total: 0, learned: 0 });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user.id) return;

    const decks = getDecksForUser(user.id);
    const found = decks.find((d) => d.id === deckId);
    if (found) {
      const displayName = deckId === ALL_CARDS_DECK_ID && lang ? t("decks_all_cards") : found.name;
      setDeck({ ...found, name: displayName });
      const deckCards = getCardsForDeck(user.id, deckId, lang);
      setCards(deckCards);
      setProgress(getDeckProgress(user.id, deckId, lang));
    }
  }, [deckId, lang]);

  if (!deck) {
    return (
      <div className="p-4">
        <p className="text-gray-500">{t("deck_not_found")}</p>
        <Link href="/decks" className="mt-4 text-blue-600 hover:underline">
          {t("deck_back_to_list")}
        </Link>
      </div>
    );
  }

  const displayTranslation = (card: (typeof cards)[0]) =>
    card.customTranslation || card.translation;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Link
        href="/decks"
        className="inline-block mb-4 text-sm text-blue-600 hover:underline"
      >
        {t("deck_back_to_list")}
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="mt-2"
        />
      </header>

      {cards.length > 0 ? (
        <>
          <Link
            href={lang ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}/study`}
            className="block w-full py-3 text-center font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 mb-6"
          >
            Режим изучения
          </Link>

          <ul className="flex flex-col gap-3" aria-label={t("deck_cards_aria")}>
            {cards.map((card) => (
              <li
                key={card.id}
                className="p-4 bg-white rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-900">{card.foreign}</p>
                <p className="text-gray-600 mt-1">{displayTranslation(card)}</p>
                {card.foreignLanguage && (
                  <span className="text-xs text-gray-400 mt-1 block">
                    {getLanguageName(card.foreignLanguage)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-500">{t("deck_no_cards_yet")}</p>
      )}
    </div>
  );
}
