"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getButtonClassName, Button } from "./Button";
import { PlayIcon } from "./icons/PlayIcon";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";
import {
  getCurrentUser,
  getDecksForUser,
  getCardsForDeck,
  getDeckProgress,
  setCardLearned,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { t } from "@/lib/strings";
import { DeckProgressBar } from "./DeckProgressBar";
import { StudyCard } from "./StudyCard";
import { SpeakButton } from "./SpeakButton";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";

interface CardData {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  learned?: boolean;
}

interface StudyPageContentProps {
  deckId: string;
  lang?: string;
}

const SWIPE_THRESHOLD = 80;

function formatWordCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return t("decks_word_count_many").replace("{n}", String(n));
  if (mod10 === 1) return t("decks_word_count_one").replace("{n}", String(n));
  if (mod10 >= 2 && mod10 <= 4) return t("decks_word_count_few").replace("{n}", String(n));
  return t("decks_word_count_many").replace("{n}", String(n));
}

export function StudyPageContent({ deckId, lang }: StudyPageContentProps) {
  const [deck, setDeck] = useState<{ id: string; name: string } | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [progress, setProgress] = useState({ total: 0, learned: 0 });
  const touchStartX = useRef(0);
  const swipeOffsetRef = useRef(0);

  const loadData = useCallback(() => {
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
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [deckId, lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentCard = cards[currentIndex];
  const displayTranslation = currentCard
    ? currentCard.customTranslation || currentCard.translation
    : "";

  function handleFlip() {
    setIsFlipped((prev) => !prev);
  }

  function handleSwipe(learned: boolean) {
    if (!currentCard) return;

    const user = getCurrentUser();
    if (user.id) {
      setCardLearned(user.id, currentCard.id, learned);
    }

    const wasLearned = currentCard.learned ?? false;
    setProgress((prev) => ({
      ...prev,
      learned: learned
        ? prev.learned + 1
        : wasLearned
          ? Math.max(0, prev.learned - 1)
          : prev.learned,
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
      setSwipeOffset(0);
    } else {
      setSessionComplete(true);
      setIsFlipped(false);
      setSwipeOffset(0);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isFlipped) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    const clamped = Math.max(-150, Math.min(150, delta));
    swipeOffsetRef.current = clamped;
    setSwipeOffset(clamped);
  }

  function handleTouchEnd() {
    if (!isFlipped) return;
    const delta = swipeOffsetRef.current;
    if (delta > SWIPE_THRESHOLD) {
      handleSwipe(true);
    } else if (delta < -SWIPE_THRESHOLD) {
      handleSwipe(false);
    } else {
      setSwipeOffset(0);
      swipeOffsetRef.current = 0;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!currentCard) return;
    if (e.key === "ArrowRight") {
      handleSwipe(true);
    } else if (e.key === "ArrowLeft") {
      handleSwipe(false);
    }
  }

  if (!deck) {
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
        <p className="text-text-secondary">{t("deck_not_found")}</p>
      </div>
    );
  }

  if (sessionComplete) {
    const studyHref = lang
      ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}`
      : `/deck/${deckId}/study`;

    return (
      <div className={`${PAGE_LAYOUT_CLASSES} items-center justify-start min-h-[60vh] gap-6`}>
        <Image
          src="/party-popper.png"
          alt=""
          width={120}
          height={120}
          unoptimized
        />
        <h2 className="text-2xl font-semibold text-text md:text-3xl">{t("study_round_complete")}</h2>
        <p className="text-text-secondary text-center">
          {t("study_round_complete_desc")}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href={studyHref}
            className={getButtonClassName(
              "primary",
              "md",
              "inline-flex items-center justify-center gap-2 text-center w-full"
            )}
          >
            <PlayIcon className="w-6 h-6" />
            <span>{t("study_repeat")}</span>
          </Link>
          <Link
            href="/decks"
            className={getButtonClassName(
              "secondary",
              "md",
              "inline-flex items-center justify-center text-center w-full"
            )}
          >
            {t("study_back_to_decks")}
          </Link>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
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
        <h1 className="font-display text-2xl font-semibold text-text md:text-3xl">Режим изучения</h1>
        <p className="text-text-secondary">
          {t("deck_empty_cards")}
        </p>
      </div>
    );
  }


  return (
    <div
      className={`${PAGE_LAYOUT_CLASSES} gap-6 min-h-screen`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="flex flex-col gap-4 shrink-0">
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
        <div className="flex items-center gap-3">
          <DeckProgressBar learned={progress.learned} total={progress.total} />
          <h1 className="font-display text-h2 font-normal text-text leading-normal flex-1 min-w-0">
            {deck.name}
          </h1>
          <span className="text-sm text-text-secondary shrink-0">
            {currentIndex + 1} из {cards.length}
          </span>
        </div>
      </header>

      <main className="h-fit flex flex-col items-center justify-center w-full min-h-0">
        <StudyCard
          foreign={currentCard.foreign}
          translation={displayTranslation}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          swipeOffset={swipeOffset}
          className="w-full"
        />

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" size="lg" onClick={() => handleSwipe(false)}>
            ✗ Ещё раз
          </Button>
          <Button size="lg" onClick={() => handleSwipe(true)}>
            ✓ Выучено
          </Button>
        </div>

        <div className="mt-4">
          <SpeakButton
            text={currentCard.foreign}
            lang={currentCard.foreignLanguage ?? "en"}
          />
        </div>

      </main>
    </div>
  );
}
