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
      const displayName = deckId === ALL_CARDS_DECK_ID && lang ? "Все карточки" : found.name;
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
      <div className="p-4">
        <p className="text-gray-500">Колода не найдена</p>
        <Link href="/decks" className="mt-4 text-blue-600 hover:underline">
          ← Назад к колодам
        </Link>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="p-4 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="text-blue-600 hover:underline mb-6"
        >
          ← Назад к колоде
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Раунд завершён!</h2>
        <p className="mt-2 text-gray-600 text-center">
          Вы просмотрели все карточки. Прогресс сохранён.
        </p>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="mt-4 w-48"
        />
        <Link
          href={lang ? `/deck/${deckId}/study?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}/study`}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Повторить
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="inline-block mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Назад к колоде
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Режим изучения</h1>
        <p className="mt-2 text-gray-600">
          В колоде нет карточек для изучения.
        </p>
      </div>
    );
  }

  const isLastCard = currentIndex >= cards.length - 1 && cards.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <header className="p-4 bg-white border-b border-gray-200 shrink-0">
        <Link
          href={lang ? `/deck/${deckId}?lang=${encodeURIComponent(lang)}` : `/deck/${deckId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Назад к колоде
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">{deck.name}</h1>
        <DeckProgressBar
          learned={progress.learned}
          total={progress.total}
          className="mt-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Карточка {currentIndex + 1} из {cards.length}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <StudyCard
          foreign={currentCard.foreign}
          translation={displayTranslation}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          swipeOffset={swipeOffset}
        />

        {isFlipped && (
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => handleSwipe(false)}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              ✗ Ещё раз
            </button>
            <button
              type="button"
              onClick={() => handleSwipe(true)}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
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
        <p className="p-4 text-center text-gray-500 text-sm">
          Последняя карточка. Нажмите «Выучено» или «Ещё раз».
        </p>
      )}
    </div>
  );
}
