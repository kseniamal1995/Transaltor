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
import { getButtonClassName } from "./Button";
import { DeckProgressBar } from "./DeckProgressBar";
import { IconButton } from "./IconButton";
import { DotsVerticalIcon } from "./icons/DotsVerticalIcon";

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
        <p className="text-text-muted">{t("deck_not_found")}</p>
        <Link href="/decks" className="mt-4 text-[var(--color-primary)] hover:underline">
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
        className="inline-block mb-4 text-sm text-[var(--color-primary)] hover:underline"
      >
        {t("deck_back_to_list")}
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text">{deck.name}</h1>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="mt-2"
        />
      </header>

      {cards.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link
              href={lang ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}/study`}
              className={getButtonClassName("primary", "md", "block w-full sm:flex-1 text-center")}
            >
              Режим изучения
            </Link>
            <Link
              href={lang ? `/deck/${deckId}/edit?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}/edit`}
              className={getButtonClassName("secondary", "md", "block w-full sm:flex-1 text-center")}
            >
              {t("deck_menu_rename")}
            </Link>
          </div>

          <ul className="flex flex-col gap-3" aria-label={t("deck_cards_aria")}>
            {cards.map((card) => {
              const studyHref = lang
                ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}`
                : `/deck/${deckId}/study`;
              return (
                <li key={card.id} className="relative group">
                  <Link
                    href={studyHref}
                    className="block w-full p-4 pr-12 min-h-[4rem] bg-surface rounded-xl border border-border group-hover:border-[var(--color-primary)] transition-colors"
                  >
                    <p className="font-medium text-text">{card.foreign}</p>
                    <p className="text-text-secondary mt-1">{displayTranslation(card)}</p>
                    {card.foreignLanguage && (
                      <span className="text-xs text-text-muted mt-1 block">
                        {getLanguageName(card.foreignLanguage)}
                      </span>
                    )}
                  </Link>
                  <div className="absolute top-4 right-4 z-10">
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      ariaLabel={t("deck_more_aria")}
                    >
                      <DotsVerticalIcon size={20} />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-text-muted">{t("deck_no_cards_yet")}</p>
      )}
    </div>
  );
}
