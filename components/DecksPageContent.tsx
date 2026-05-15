"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getLanguagePairsInUse,
  getDecksForLanguage,
  getDeckProgress,
  getCardsForDeck,
  resetDeckProgress,
  deleteDeck,
  renameDeck,
  deleteLanguagePair,
  type LanguagePair,
} from "@/lib/storage";
import { getLanguageName, getFlagUrl } from "@/lib/languages";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { DeckProgressBar } from "./DeckProgressBar";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";
import { CardsIcon } from "./icons/CardsIcon";
import { PlayIcon } from "./icons/PlayIcon";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";
import { getButtonClassName, Button } from "./Button";
import { t } from "@/lib/strings";

interface DeckData {
  id: string;
  name: string;
  learned: number;
  total: number;
}

function formatWordCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return t("decks_word_count_many").replace("{n}", String(n));
  if (mod10 === 1) return t("decks_word_count_one").replace("{n}", String(n));
  if (mod10 >= 2 && mod10 <= 4) return t("decks_word_count_few").replace("{n}", String(n));
  return t("decks_word_count_many").replace("{n}", String(n));
}

/* ───────── Флаг языка ───────── */
function FlagIcon({ code, size = 20 }: { code: string; size?: number }) {
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

/* ───────── Верхняя карточка: языковая пара + общий прогресс ───────── */
interface LanguageCardProps {
  pairs: LanguagePair[];
  selected: LanguagePair;
  onSelect: (pair: LanguagePair) => void;
  onStudyClick: () => void;
  dictHref: string;
}

function pairKey(p: LanguagePair): string {
  return `${p.source}|${p.target}`;
}

function LanguageCard({ pairs, selected, onSelect, onStudyClick, dictHref }: LanguageCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  const hasMultiple = pairs.length > 1;

  return (
    <div ref={ref} className="bg-surface rounded-2xl border border-border transition-all">
      <div className="px-6 py-5 flex flex-col gap-5 md:gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-center gap-3 relative">
            <FlagIcon code={selected.source} size={24} />
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => hasMultiple && setDropdownOpen((v) => !v)}
                className={`font-bold text-base flex items-center gap-1.5 text-left ${hasMultiple ? "cursor-pointer" : "cursor-default"}`}
                aria-expanded={hasMultiple ? dropdownOpen : undefined}
                aria-haspopup={hasMultiple ? "listbox" : undefined}
              >
                <span className="text-text truncate">{getLanguageName(selected.source)}</span>
                <ArrowRightIcon size={12} className="text-text-secondary shrink-0 hidden md:inline" />
                <span className="text-text-secondary truncate font-normal hidden md:inline">{getLanguageName(selected.target)}</span>
                {hasMultiple && (
                  <ChevronDownIcon
                    className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {dropdownOpen && hasMultiple && (
                <ul
                  role="listbox"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-[-18px] top-full mt-2 z-50 bg-surface border border-border rounded-xl shadow-lg p-1.5 min-w-[300px]"
                >
                  {pairs.map((pair) => {
                    const isActive = pairKey(pair) === pairKey(selected);
                    return (
                      <li key={pairKey(pair)}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelect(pair);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg ${
                            isActive
                              ? "bg-primary-muted text-text font-semibold"
                              : "text-text hover:bg-background"
                          }`}
                        >
                          <FlagIcon code={pair.source} size={20} />
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{getLanguageName(pair.source)}</span>
                            <ArrowRightIcon size={12} className="text-text-secondary shrink-0" />
                            <span className="text-text-secondary">{getLanguageName(pair.target)}</span>
                          </span>
                          <span className="text-text-secondary text-xs ml-auto shrink-0">
                            {pair.total}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <span className="hidden md:flex items-center gap-1.5 text-sm text-text-secondary shrink-0">
            <CardsIcon className="w-5 h-5 text-border" />
            {formatWordCount(selected.total)}
          </span>
        </div>

        <div className="flex md:hidden items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-text-secondary">
            <CardsIcon className="w-5 h-5 text-border" />
            {formatWordCount(selected.total)}
          </span>
          <DeckProgressBar learned={selected.learned} total={selected.total} size="sm" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex flex-col md:flex-row md:flex-1 items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onStudyClick}
              className={getButtonClassName(
                "primary",
                "sm",
                "inline-flex items-center justify-center gap-2 text-center w-full md:w-auto"
              )}
            >
              <PlayIcon className="w-5 h-5" />
              <span>{t("decks_start_training")}</span>
            </button>
            <Link
              href={dictHref}
              className={getButtonClassName(
                "secondary",
                "sm",
                "inline-flex items-center justify-center text-sm w-full md:w-auto"
              )}
            >
              {t("decks_open_dictionary")}
            </Link>
          </div>
          <div className="hidden md:block">
            <DeckProgressBar learned={selected.learned} total={selected.total} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Главный компонент ───────── */
export function DecksPageContent() {
  const router = useRouter();
  const [pairs, setPairs] = useState<LanguagePair[]>([]);
  const [selectedPair, setSelectedPair] = useState<LanguagePair | null>(null);
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [allLearnedModal, setAllLearnedModal] = useState<{
    deckId: string;
    lang?: string;
    targetLang?: string;
    studyHref: string;
  } | null>(null);

  const loadPairs = useCallback(async () => {
    try {
      const p = await getLanguagePairsInUse();
      setPairs(p);
      setSelectedPair((prev) => {
        if (p.length === 0) return null;
        if (!prev) return p[0];
        const still = p.find((pp) => pp.source === prev.source && pp.target === prev.target);
        return still ?? p[0];
      });
    } catch {
      // error
    }
  }, []);

  useEffect(() => {
    loadPairs();
  }, [loadPairs]);

  const loadDecks = useCallback(async () => {
    if (!selectedPair) return;
    try {
      const all = await getDecksForLanguage(selectedPair.source);
      const withProgress = await Promise.all(
        all.map(async (deck) => {
          const { total, learned } = await getDeckProgress(deck.id, selectedPair.source, selectedPair.target);
          return { ...deck, total, learned };
        }),
      );
      setDecks(withProgress);
    } catch {
      // error
    }
  }, [selectedPair]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  async function handleDelete(deckId: string, deckName: string) {
    if (!confirm(`${t("deck_menu_delete")} «${deckName}»?`)) return;
    try {
      await deleteDeck(deckId);
      loadDecks();
    } catch {
      // error
    }
  }

  async function handleRename(deckId: string, currentName: string) {
    const newName = prompt(t("deck_rename_prompt"), currentName);
    if (!newName || newName.trim() === currentName) return;
    try {
      await renameDeck(deckId, newName.trim());
      loadDecks();
    } catch {
      // error
    }
  }

  async function handleDeletePair() {
    if (!selectedPair) return;
    const srcName = getLanguageName(selectedPair.source);
    const tgtName = getLanguageName(selectedPair.target);
    const msg = t("deck_delete_pair_confirm")
      .replace("{source}", srcName)
      .replace("{target}", tgtName);
    if (!confirm(msg)) return;
    try {
      await deleteLanguagePair(selectedPair.source, selectedPair.target);
      loadPairs();
    } catch {
      // error
    }
  }

  async function handleStudyClick(deckId: string, studyHref: string, lang?: string, tLang?: string) {
    try {
      const deckCards = await getCardsForDeck(deckId, lang, tLang);
      const unlearned = deckCards.filter((c) => !c.learned);
      if (deckCards.length > 0 && unlearned.length === 0) {
        setAllLearnedModal({ deckId, lang, targetLang: tLang, studyHref });
      } else {
        router.push(studyHref);
      }
    } catch {
      router.push(studyHref);
    }
  }

  async function handleResetAndStudy() {
    if (!allLearnedModal) return;
    const { deckId, lang, targetLang, studyHref } = allLearnedModal;
    try {
      await resetDeckProgress(deckId, lang, targetLang);
      setAllLearnedModal(null);
      await loadPairs();
      await loadDecks();
      router.push(studyHref);
    } catch {
      // error
    }
  }

  if (pairs.length === 0) {
    return (
      <div className={`${PAGE_LAYOUT_CLASSES} gap-10`}>
        <div className="w-full flex flex-col gap-8 p-0">
          <section>
            <h2 className="font-display text-[22px] font-normal text-text mb-4">
              {t("decks_tab_my")}
            </h2>
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-border text-center">
              <EmptyStateIllustration className="w-[68px] h-[68px] text-text-muted" />
              <p className="text-base text-text-secondary leading-6 whitespace-pre-line">
                {t("decks_no_custom_decks")}
              </p>
              <Link href="/" className={getButtonClassName("primary", "sm", "inline-flex items-center justify-center gap-2 text-center")}>
                {t("decks_go_to_translator")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!selectedPair) return null;

  const selectedLang = selectedPair.source;
  const selectedTargetLang = selectedPair.target;
  const langQueryPart = `lang=${encodeURIComponent(selectedLang)}&targetLang=${encodeURIComponent(selectedTargetLang)}`;
  const customDecks = decks.filter((d) => d.id !== ALL_CARDS_DECK_ID);

  return (
    <div className={`${PAGE_LAYOUT_CLASSES} gap-10`}>
      <div className="w-full flex flex-col gap-8 p-0">
        <LanguageCard
          pairs={pairs}
          selected={selectedPair}
          onSelect={setSelectedPair}
          onStudyClick={() =>
            handleStudyClick(
              ALL_CARDS_DECK_ID,
              `/deck/${ALL_CARDS_DECK_ID}/study?${langQueryPart}`,
              selectedLang,
              selectedTargetLang,
            )
          }
          dictHref={`/decks/${encodeURIComponent(selectedLang)}?targetLang=${encodeURIComponent(selectedTargetLang)}`}
        />

        <section>
          <h2 className="font-display text-[22px] font-normal text-text mb-4">
            {t("decks_tab_my")}
          </h2>

          {customDecks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {customDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-surface rounded-2xl border border-border transition-all"
                >
                  <div className="px-6 py-5 flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold text-base text-text truncate flex-1 min-w-0">
                        {deck.name}
                      </p>
                      <span className="flex items-center gap-1.5 text-sm text-text-secondary shrink-0">
                        <CardsIcon className="w-5 h-5 text-border" />
                        {formatWordCount(deck.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-1 items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleStudyClick(
                              deck.id,
                              `/deck/${deck.id}/study?${langQueryPart}`,
                              selectedLang,
                              selectedTargetLang,
                            )
                          }
                          className={getButtonClassName(
                            "primary",
                            "sm",
                            "inline-flex items-center justify-center gap-2 text-center"
                          )}
                        >
                          <PlayIcon className="w-5 h-5" />
                          <span>{t("decks_start_training")}</span>
                        </button>
                        <Link
                          href={`/deck/${deck.id}?${langQueryPart}`}
                          className={getButtonClassName(
                            "secondary",
                            "sm",
                            "inline-flex items-center justify-center text-sm"
                          )}
                        >
                          {t("decks_open_dictionary")}
                        </Link>
                      </div>
                      <DeckProgressBar learned={deck.learned} total={deck.total} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-border text-center">
              <EmptyStateIllustration className="w-[68px] h-[68px] text-text-muted" />
              <p className="text-base text-text-secondary leading-6 whitespace-pre-line">
                {t("decks_no_custom_decks")}
              </p>
              <Link href="/" className={getButtonClassName("primary", "sm", "inline-flex items-center justify-center gap-2 text-center")}>
                {t("decks_go_to_translator")}
              </Link>
            </div>
          )}
        </section>
      </div>

      {allLearnedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-2xl shadow-lg p-6 w-full max-w-sm flex flex-col items-center gap-5 animate-card-enter">
            <Image
              src="/party-popper.png"
              alt=""
              width={80}
              height={80}
              unoptimized
              style={{ mixBlendMode: "multiply" }}
            />
            <h2 className="text-xl font-semibold text-text text-center">
              {t("study_all_learned_title")}
            </h2>
            <p className="text-sm text-text-secondary text-center leading-relaxed">
              {t("study_all_learned_desc")}
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <Button onClick={handleResetAndStudy} className="w-full justify-center">
                {t("study_all_learned_reset")}
              </Button>
              <button
                type="button"
                onClick={() => setAllLearnedModal(null)}
                className={getButtonClassName(
                  "secondary",
                  "md",
                  "inline-flex items-center justify-center text-center w-full"
                )}
              >
                {t("study_all_learned_back")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
