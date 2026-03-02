"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getDecksForLanguage,
  getDeckProgress,
  deleteLanguage,
  deleteDeck,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { getLanguageName, getFlagEmoji } from "@/lib/languages";
import { DeckProgressBar } from "./DeckProgressBar";

interface LanguageDeckPageContentProps {
  lang: string;
}

export function LanguageDeckPageContent({ lang }: LanguageDeckPageContentProps) {
  const router = useRouter();
  const [decks, setDecks] = useState<{ id: string; name: string; learned: number; total: number }[]>([]);

  const loadDecks = useCallback(() => {
    const user = getCurrentUser();
    if (!user.id) return;
    const allDecks = getDecksForLanguage(user.id, lang);
    const withProgress = allDecks.map((deck) => {
      const { total, learned } = getDeckProgress(user.id, deck.id, lang);
      return { ...deck, total, learned };
    });
    setDecks(withProgress);
  }, [lang]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  function handleDeleteLanguage() {
    if (!confirm(`Удалить язык «${getLanguageName(lang)}»? Все карточки по этому языку будут удалены.`)) return;
    const user = getCurrentUser();
    if (user.id) {
      deleteLanguage(user.id, lang);
      router.push("/decks");
    }
  }

  function handleDeleteDeck(deckId: string, deckName: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Удалить колоду «${deckName}»?`)) return;
    const user = getCurrentUser();
    if (user.id) {
      deleteDeck(user.id, deckId);
      loadDecks();
    }
  }

  const customDecks = decks.filter((d) => d.id !== ALL_CARDS_DECK_ID);
  const allCardsDeck = decks.find((d) => d.id === ALL_CARDS_DECK_ID);

  return (
    <div className="p-4 max-w-xl mx-auto pb-20">
      <Link
        href="/decks"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6"
      >
        ← Назад
      </Link>

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-2xl overflow-hidden"
            aria-hidden
          >
            {getFlagEmoji(lang)}
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {getLanguageName(lang)}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleDeleteLanguage}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Удалить язык"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      {allCardsDeck && (
        <section className="mb-6" aria-label="Все карточки">
          <h2 className="text-sm font-medium text-gray-600 mb-2">Все карточки</h2>
          <Link
            href={`/deck/${allCardsDeck.id}/study?lang=${encodeURIComponent(lang)}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
          >
            <span className="font-semibold text-gray-900">Все карточки</span>
            <DeckProgressBar
              learned={allCardsDeck.learned}
              total={allCardsDeck.total}
              className="mt-2"
            />
          </Link>
        </section>
      )}

      <section aria-label="Колоды">
        <h2 className="text-sm font-medium text-gray-600 mb-2">Колоды</h2>
        {customDecks.length === 0 ? (
          <p className="p-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            Вы еще не добавили ни одну колоду по этому языку
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {customDecks.map((deck) => (
              <li key={deck.id} className="relative">
                <Link
                  href={`/deck/${deck.id}/study?lang=${encodeURIComponent(lang)}`}
                  className="block p-4 pr-12 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{deck.name}</h3>
                  <DeckProgressBar learned={deck.learned} total={deck.total} />
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleDeleteDeck(deck.id, deck.name, e)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Удалить колоду ${deck.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
