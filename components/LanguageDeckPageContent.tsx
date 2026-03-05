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
import { PageHeader } from "./PageHeader";
import { TrashIcon } from "./icons/TrashIcon";
import { t } from "@/lib/strings";

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
    if (!confirm(`${t("deck_delete_deck_aria")} «${deckName}»?`)) return;
    const user = getCurrentUser();
    if (user.id) {
      deleteDeck(user.id, deckId);
      loadDecks();
    }
  }

  const customDecks = decks.filter((d) => d.id !== ALL_CARDS_DECK_ID);
  const allCardsDeck = decks.find((d) => d.id === ALL_CARDS_DECK_ID);

  return (
    <div className="px-6 py-6 max-w-[600px] mx-auto flex flex-col gap-10 pb-20 md:px-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text hover:underline"
        >
          ← Назад
        </Link>
        <button
          type="button"
          onClick={handleDeleteLanguage}
          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={t("deck_delete_lang_aria")}
        >
          <TrashIcon size={20} />
        </button>
      </div>

      <PageHeader
        title={`${getFlagEmoji(lang)} ${getLanguageName(lang)}`}
        subtitle={t("decks_lang_subtitle")}
      />

      {allCardsDeck && (
        <section className="mb-6" aria-label={t("decks_all_cards")}>
          <h2 className="text-sm font-medium text-gray-600 mb-2">{t("decks_all_cards")}</h2>
          <Link
            href={`/deck/${allCardsDeck.id}/study?lang=${encodeURIComponent(lang)}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
          >
            <span className="font-semibold text-gray-900">{t("decks_all_cards")}</span>
            <DeckProgressBar
              learned={allCardsDeck.learned}
              total={allCardsDeck.total}
              className="mt-2"
            />
          </Link>
        </section>
      )}

      <section aria-label={t("deck_section_title")}>
        <h2 className="text-sm font-medium text-gray-600 mb-2">{t("deck_section_title")}</h2>
        {customDecks.length === 0 ? (
          <p className="p-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            {t("deck_no_custom_yet")}
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
                  aria-label={`${t("deck_delete_deck_aria")} ${deck.name}`}
                >
                  <TrashIcon size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
