"use client";

import type { Deck } from "@/types";
import { getCurrentUser, isCardDuplicate, saveCard } from "@/lib/storage";
import { DropdownMenu } from "./DropdownMenu";
import { t } from "@/lib/strings";
import { IconButton } from "./IconButton";
import { BookmarkIcon } from "./icons/BookmarkIcon";
import { useToast } from "./Toast";

interface HistoryItemProps {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  translationLanguage?: string;
  decks: Deck[];
  onSaved: () => void;
}

export function HistoryItem({
  foreign,
  translation,
  customTranslation,
  foreignLanguage,
  translationLanguage,
  decks,
  onSaved,
}: HistoryItemProps) {
  const { showToast } = useToast();

  function handleSaveToDeck(deckId: string) {
    const user = getCurrentUser();
    if (!user.id) return;

    const deckName = decks.find((d) => d.id === deckId)?.name ?? "";

    if (isCardDuplicate(user.id, foreign, deckId)) {
      showToast(t("card_duplicate").replace("{deck}", deckName), "error");
      return;
    }

    saveCard(user.id, {
      foreign,
      translation,
      customTranslation: customTranslation?.trim() || undefined,
      foreignLanguage,
      translationLanguage,
      deckIds: [deckId],
    });
    showToast(t("card_saved").replace("{deck}", deckName));
    onSaved();
  }

  const displayTranslation = customTranslation?.trim() || translation;

  const deckItems = decks.map((deck) => ({
    label: deck.name,
    onClick: () => handleSaveToDeck(deck.id),
  }));

  return (
    <article className="p-4 bg-surface rounded-xl border border-border">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-base font-medium text-text">{foreign}</p>
          <p className="text-base text-text-secondary">{displayTranslation}</p>
        </div>
        {decks.length > 0 && (
          <DropdownMenu
            items={deckItems}
            align="right"
            trigger={
              <IconButton
                onClick={() => {}}
                ariaLabel={t("history_save_to")}
              >
                <BookmarkIcon className="w-5 h-5" />
              </IconButton>
            }
          />
        )}
      </div>
    </article>
  );
}
