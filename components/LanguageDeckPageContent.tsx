"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getCardsForDeck,
  deleteCard,
  deleteLanguage,
  deleteLanguagePair,
  getDeckProgress,
} from "@/lib/storage";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { getLanguageName, getFlagUrl } from "@/lib/languages";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";
import { t } from "@/lib/strings";
import { getButtonClassName, Button } from "./Button";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./DropdownMenu";
import { DeckProgressBar } from "./DeckProgressBar";
import { TrashIcon } from "./icons/TrashIcon";
import { PencilIcon } from "./icons/PencilIcon";
import { DotsVerticalIcon } from "./icons/DotsVerticalIcon";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { SearchIcon } from "./icons/SearchIcon";
import { PlayIcon } from "./icons/PlayIcon";

interface LanguageDeckPageContentProps {
  lang: string;
  targetLang?: string;
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

export function LanguageDeckPageContent({ lang, targetLang }: LanguageDeckPageContentProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState({ total: 0, learned: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);
  const router = useRouter();

  const loadCards = useCallback(() => {
    const user = getCurrentUser();
    if (!user.id) return;
    const deckCards = getCardsForDeck(user.id, ALL_CARDS_DECK_ID, lang, targetLang);
    setCards(deckCards);
    setProgress(getDeckProgress(user.id, ALL_CARDS_DECK_ID, lang, targetLang));
  }, [lang, targetLang]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const displayTranslation = (card: CardItem) => card.customTranslation || card.translation;

  function handleDeleteLanguage() {
    const user = getCurrentUser();
    if (!user.id) return;
    if (targetLang) {
      const srcName = getLanguageName(lang);
      const tgtName = getLanguageName(targetLang);
      const msg = t("deck_delete_pair_confirm")
        .replace("{source}", srcName)
        .replace("{target}", tgtName);
      if (!confirm(msg)) return;
      deleteLanguagePair(user.id, lang, targetLang);
    } else {
      const langName = getLanguageName(lang);
      if (!confirm(t("deck_delete_lang_confirm").replace("{lang}", langName))) return;
      deleteLanguage(user.id, lang);
    }
    router.push("/decks");
  }

  function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    const msg = t("deck_edit_delete_confirm").replace("{n}", String(selectedIds.size));
    if (!confirm(msg)) return;

    const user = getCurrentUser();
    if (!user.id) return;

    for (const id of selectedIds) {
      deleteCard(user.id, id);
    }

    setCards((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setProgress((prev) => ({ ...prev, total: Math.max(0, prev.total - selectedIds.size) }));
    setSelectedIds(new Set());
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setSelectedIds(new Set());
  }

  function toggleCard(cardId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  const filteredCards =
    query.trim().length === 0
      ? cards
      : cards.filter((card) => {
          const haystack = `${card.foreign} ${displayTranslation(card)}`.toLowerCase();
          return haystack.includes(query.trim().toLowerCase());
        });

  const studyHref = `/deck/${ALL_CARDS_DECK_ID}/study?lang=${encodeURIComponent(lang)}${targetLang ? `&targetLang=${encodeURIComponent(targetLang)}` : ""}`;

  const menuItems = [
    {
      label: t("deck_edit_menu_label"),
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: () => setIsEditing(true),
    },
    {
      label: t("deck_delete_lang_menu"),
      icon: <TrashIcon size={16} />,
      onClick: handleDeleteLanguage,
      variant: "destructive" as const,
    },
  ];

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

      <div className="rounded-2xl border border-border p-6 flex flex-col gap-6">
        <div className="flex items-start justify-center gap-3">
          <DeckProgressBar learned={progress.learned} total={progress.total} />
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="font-display text-h2 font-normal text-text leading-normal">
              {targetLang ? `${getLanguageName(lang)} → ${getLanguageName(targetLang)}` : getLanguageName(lang)}
            </h2>
            <span className="text-sm text-text-secondary">
              {formatWordCount(progress.total)}
            </span>
          </div>
          {isEditing ? (
            <Button
              onClick={handleCancelEdit}
              variant="secondary"
              size="sm"
              className="shrink-0 self-start"
            >
              {t("deck_edit_cancel")}
            </Button>
          ) : (
            <DropdownMenu
              items={menuItems}
              trigger={
                <IconButton
                  onClick={() => {}}
                  ariaLabel={t("deck_more_aria")}
                  variant="secondary"
                >
                  <DotsVerticalIcon size={24} />
                </IconButton>
              }
            />
          )}
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className={getButtonClassName(
              "primary",
              "md",
              "inline-flex items-center justify-center gap-2 text-center w-full !bg-[var(--color-error)] hover:!bg-red-700"
            )}
          >
            <TrashIcon size={20} />
            <span>
              {t("deck_edit_delete_selected").replace("{n}", String(selectedIds.size))}
            </span>
          </button>
        ) : (
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
        )}
      </div>

      {cards.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-secondary border border-border rounded-xl">
            <SearchIcon className="w-5 h-5 shrink-0 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisibleCount(10); }}
              placeholder={t("lang_search_placeholder")}
              className="flex-1 min-w-0 bg-transparent text-base text-text placeholder:text-text-secondary focus:outline-none"
            />
          </div>

          {filteredCards.length > 0 ? (
            <>
              <ul className="flex flex-col gap-3" aria-label={t("deck_cards_aria")}>
                {filteredCards.slice(0, visibleCount).map((card) => (
                  <li key={card.id}>
                    <article
                      className={`flex items-start p-4 bg-surface rounded-xl border transition-colors ${
                        isEditing && selectedIds.has(card.id)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-surface)]"
                          : "border-border"
                      } ${isEditing ? "cursor-pointer" : ""}`}
                      onClick={isEditing ? () => toggleCard(card.id) : undefined}
                    >
                      {isEditing && (
                        <div className="shrink-0 mr-3 mt-0.5">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              selectedIds.has(card.id)
                                ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                                : "border-[var(--color-border)] bg-surface-secondary"
                            }`}
                          >
                            {selectedIds.has(card.id) && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <p className="font-bold text-base text-text">{card.foreign}</p>
                        <p className="text-sm text-text-secondary">{displayTranslation(card)}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              {visibleCount < filteredCards.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  className="self-center px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                >
                  {t("show_more")}
                </button>
              )}
            </>
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
