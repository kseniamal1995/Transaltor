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
import { CARD_INTERACTIVE_CLASSES, PAGE_LAYOUT_CLASSES, BACK_LINK_CLASSES } from "@/lib/ui-classes";
import { DeckProgressBar } from "./DeckProgressBar";
import { PageHeader } from "./PageHeader";
import { IconButton } from "./IconButton";
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
    <div className={`${PAGE_LAYOUT_CLASSES} gap-10 pb-20`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href="/decks"
          className={BACK_LINK_CLASSES}
        >
          ← Назад
        </Link>
        <IconButton
          onClick={handleDeleteLanguage}
          ariaLabel={t("deck_delete_lang_aria")}
          className="hover:text-[var(--color-error)] hover:bg-[var(--color-primary-muted)]"
        >
          <TrashIcon size={20} />
        </IconButton>
      </div>

      <PageHeader
        title={`${getFlagEmoji(lang)} ${getLanguageName(lang)}`}
        subtitle={t("decks_lang_subtitle")}
      />

      {allCardsDeck && (
        <section className="mb-6" aria-label={t("decks_all_cards")}>
          <h2 className="text-sm font-medium text-text-secondary mb-2">{t("decks_all_cards")}</h2>
          <Link
            href={`/deck/${allCardsDeck.id}/study?lang=${encodeURIComponent(lang)}`}
            className={`${CARD_INTERACTIVE_CLASSES} w-full`}
          >
            <span className="font-semibold text-text block">{t("decks_all_cards")}</span>
            <DeckProgressBar
              learned={allCardsDeck.learned}
              total={allCardsDeck.total}
              className="mt-2"
            />
          </Link>
        </section>
      )}

      <section aria-label={t("deck_section_title")}>
        <h2 className="text-sm font-medium text-text-secondary mb-2">{t("deck_section_title")}</h2>
        {customDecks.length === 0 ? (
          <p className="p-4 text-text-secondary bg-surface-secondary rounded-xl border border-border">
            {t("deck_no_custom_yet")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {customDecks.map((deck) => (
              <li key={deck.id} className="relative group">
                <Link
                  href={`/deck/${deck.id}/study?lang=${encodeURIComponent(lang)}`}
                  className={`block w-full ${CARD_INTERACTIVE_CLASSES} pr-12 group-hover:border-[var(--color-primary)] group-hover:shadow-md`}
                >
                  <h3 className="font-semibold text-text mb-2">{deck.name}</h3>
                  <DeckProgressBar learned={deck.learned} total={deck.total} />
                </Link>
                <IconButton
                  onClick={(e) => handleDeleteDeck(deck.id, deck.name, e)}
                  ariaLabel={`${t("deck_delete_deck_aria")} ${deck.name}`}
                  className="absolute top-4 right-4 hover:text-[var(--color-error)] hover:bg-[var(--color-primary-muted)]"
                >
                  <TrashIcon size={18} />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
