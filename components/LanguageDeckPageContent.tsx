"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  getCardsForDeck,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { getLanguageName, getFlagUrl } from "@/lib/languages";
import { PAGE_LAYOUT_CLASSES, BACK_LINK_CLASSES } from "@/lib/ui-classes";
import { t } from "@/lib/strings";

interface LanguageDeckPageContentProps {
  lang: string;
}

function FlagIcon({ code, size = 24 }: { code: string; size?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const url = getFlagUrl(code);
  if (!mounted || !url) {
    return (
      <span
        className="inline-flex shrink-0 rounded-full bg-[var(--color-border)]"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      aria-hidden
      className="shrink-0 rounded-full outline outline-[1px] outline-[var(--color-border)]"
      style={{ width: size, height: size }}
    />
  );
}

type CardItem = {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
};

export function LanguageDeckPageContent({ lang }: LanguageDeckPageContentProps) {
  const [cards, setCards] = useState<CardItem[]>([]);

  const loadCards = useCallback(() => {
    const user = getCurrentUser();
    if (!user.id) return;
    const deckCards = getCardsForDeck(user.id, ALL_CARDS_DECK_ID, lang);
    setCards(deckCards);
  }, [lang]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const displayTranslation = (card: CardItem) => card.customTranslation || card.translation;

  return (
    <div className={`${PAGE_LAYOUT_CLASSES} gap-6 pb-20`}>
      <Link href="/decks" className={BACK_LINK_CLASSES}>
        {t("deck_back_to_list")}
      </Link>

      <header className="flex items-center gap-3">
        <FlagIcon code={lang} size={24} />
        <h1 className="font-display text-2xl font-normal text-text leading-normal md:text-3xl">
          {getLanguageName(lang)}
        </h1>
      </header>

      {cards.length > 0 ? (
        <ul className="flex flex-col gap-3" aria-label={t("deck_cards_aria")}>
          {cards.map((card) => (
            <li key={card.id}>
              <article className="p-4 bg-surface rounded-xl border border-border">
                <p className="font-medium text-text">{card.foreign}</p>
                <p className="text-text-secondary mt-1">{displayTranslation(card)}</p>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary">{t("deck_no_cards_yet")}</p>
      )}
    </div>
  );
}
