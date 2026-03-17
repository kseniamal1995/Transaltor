"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getCardsForDeck,
  deleteCard,
  deleteLanguage,
  getDeckProgress,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { getLanguageName, getFlagUrl } from "@/lib/languages";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";
import { t } from "@/lib/strings";
import { getButtonClassName } from "./Button";
import { IconButton } from "./IconButton";
import { DeckProgressBar } from "./DeckProgressBar";
import { TrashIcon } from "./icons/TrashIcon";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { SearchIcon } from "./icons/SearchIcon";
import { PlayIcon } from "./icons/PlayIcon";

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

function formatWordCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return t("decks_word_count_many").replace("{n}", String(n));
  if (mod10 === 1) return t("decks_word_count_one").replace("{n}", String(n));
  if (mod10 >= 2 && mod10 <= 4) return t("decks_word_count_few").replace("{n}", String(n));
  return t("decks_word_count_many").replace("{n}", String(n));
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
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState({ total: 0, learned: 0 });
  const router = useRouter();

  const loadCards = useCallback(() => {
    const user = getCurrentUser();
    if (!user.id) return;
    const deckCards = getCardsForDeck(user.id, ALL_CARDS_DECK_ID, lang);
    setCards(deckCards);
    setProgress(getDeckProgress(user.id, ALL_CARDS_DECK_ID, lang));
  }, [lang]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const displayTranslation = (card: CardItem) => card.customTranslation || card.translation;

  function handleDeleteCard(cardId: string) {
    const user = getCurrentUser();
    if (!user.id) return;
    deleteCard(user.id, cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  function handleDeleteLanguage() {
    const user = getCurrentUser();
    if (!user.id) return;
    const langName = getLanguageName(lang);
    if (!confirm(t("deck_delete_lang_confirm").replace("{lang}", langName))) return;
    deleteLanguage(user.id, lang);
    router.push("/decks");
  }

  const filteredCards =
    query.trim().length === 0
      ? cards
      : cards.filter((card) => {
          const haystack = `${card.foreign} ${displayTranslation(card)}`.toLowerCase();
          return haystack.includes(query.trim().toLowerCase());
        });

  const studyHref = `/deck/${ALL_CARDS_DECK_ID}/study?lang=${encodeURIComponent(lang)}`;

  return (
    <div className={`${PAGE_LAYOUT_CLASSES} gap-8 pb-20`}>
      <Link
        href="/decks"
        className={getButtonClassName(
          "link",
          "sm",
          "inline-flex items-center gap-1 w-fit no-underline hover:no-underline !px-0"
        )}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>{t("deck_back_short")}</span>
      </Link>

      {/* Language card: progress + title + word count + delete + study button */}
      <div className="rounded-2xl border border-border p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <DeckProgressBar learned={progress.learned} total={progress.total} />
          <h2 className="font-display text-h2 font-normal text-text leading-normal flex-1 min-w-0">
            {getLanguageName(lang)}
          </h2>
          <span className="text-sm text-text-secondary shrink-0">
            {formatWordCount(progress.total)}
          </span>
          <IconButton
            onClick={handleDeleteLanguage}
            ariaLabel={t("deck_delete_lang_aria")}
            variant="secondary"
          >
            <TrashIcon size={24} />
          </IconButton>
        </div>

        <Link
          href={studyHref}
          className={getButtonClassName(
            "primary",
            "md",
            "inline-flex items-center justify-center gap-2 text-center w-full"
          )}
        >
          <PlayIcon className="w-6 h-6" />
          <span>{t("decks_start_training")}</span>
        </Link>
      </div>

      {/* Search + word cards */}
      {cards.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-4 bg-surface-secondary border border-border rounded-xl">
            <SearchIcon className="w-5 h-5 shrink-0 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("lang_search_placeholder")}
              className="flex-1 min-w-0 bg-transparent text-base text-text placeholder:text-text-secondary focus:outline-none"
            />
          </div>

          {filteredCards.length > 0 ? (
            <ul className="flex flex-col gap-4" aria-label={t("deck_cards_aria")}>
              {filteredCards.map((card) => (
                <li key={card.id}>
                  <article className="flex items-start justify-center p-4 bg-surface rounded-xl border border-border">
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <p className="font-bold text-base text-text">{card.foreign}</p>
                      <p className="text-sm text-text-secondary">{displayTranslation(card)}</p>
                    </div>
                    <IconButton
                      onClick={() => handleDeleteCard(card.id)}
                      ariaLabel={t("deck_delete_card_aria")}
                      variant="secondary"
                    >
                      <TrashIcon size={20} />
                    </IconButton>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary">{t("deck_search_no_results")}</p>
          )}
        </div>
      ) : (
        <p className="text-text-secondary">{t("deck_no_cards_yet")}</p>
      )}
    </div>
  );
}
