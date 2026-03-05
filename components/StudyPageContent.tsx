"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
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
    if (!isFlipped || !currentCard) return;
    if (e.key === "ArrowRight") {
      handleSwipe(true);
    } else if (e.key === "ArrowLeft") {
      handleSwipe(false);
    }
  }

  if (!deck) {
    return (
      <div className="px-6 py-6 max-w-[600px] mx-auto flex flex-col gap-4 md:px-8">
        <p className="text-text-secondary">{t("deck_not_found")}</p>
        <Link href="/decks" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text hover:underline w-fit">
          {t("deck_back_to_list")}
        </Link>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="px-6 py-6 max-w-[600px] mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 md:px-8">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text hover:underline w-fit"
        >
          {t("deck_back_to_deck")}
        </Link>
        <h2 className="text-2xl font-semibold text-text md:text-3xl">Раунд завершён!</h2>
        <p className="text-text-secondary text-center">
          Вы просмотрели все карточки. Прогресс сохранён.
        </p>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="w-48"
        />
        <Link
          href={lang ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}/study`}
          className="px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Повторить
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="px-6 py-6 max-w-[600px] mx-auto flex flex-col gap-4 md:px-8">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text hover:underline w-fit"
        >
          {t("deck_back_to_deck")}
        </Link>
        <h1 className="text-2xl font-semibold text-text md:text-3xl">Режим изучения</h1>
        <p className="text-text-secondary">
          {t("deck_empty_cards")}
        </p>
      </div>
    );
  }

  const isLastCard = currentIndex >= cards.length - 1 && cards.length > 0;

  return (
    <div
      className="px-6 py-6 max-w-[600px] mx-auto flex flex-col gap-6 min-h-screen md:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="flex flex-col gap-3 shrink-0">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text hover:underline w-fit"
        >
          {t("deck_back_to_deck")}
        </Link>
        <h1 className="text-2xl font-semibold text-text leading-normal md:text-3xl">
          {deck.name}
        </h1>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="w-full"
        />
        <p className="text-xs text-text-muted">
          Карточка {currentIndex + 1} из {cards.length}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
        <StudyCard
          foreign={currentCard.foreign}
          translation={displayTranslation}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          swipeOffset={swipeOffset}
          className="w-full max-w-[400px]"
        />

        {isFlipped && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => handleSwipe(false)}
              className="px-5 py-2.5 rounded-xl border border-border text-text font-medium hover:bg-[var(--color-tertiary)] transition-colors"
            >
              ✗ Ещё раз
            </button>
            <button
              type="button"
              onClick={() => handleSwipe(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              ✓ Выучено
            </button>
          </div>
        )}

        <div className="mt-4">
          <SpeakButton
            text={currentCard.foreign}
            lang={currentCard.foreignLanguage ?? "en"}
          />
        </div>
      </main>

      {isLastCard && isFlipped && (
        <p className="py-2 text-center text-text-muted text-sm">
          Последняя карточка. Нажмите «Выучено» или «Ещё раз».
        </p>
      )}
    </div>
  );
}
