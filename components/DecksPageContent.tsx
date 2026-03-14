"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getLanguagesInUse,
  getDecksForLanguage,
  getDeckProgress,
  deleteDeck,
  renameDeck,
  deleteLanguage,
} from "@/lib/storage";
import { getLanguageName, getFlagUrl } from "@/lib/languages";
import { ALL_CARDS_DECK_ID } from "@/lib/constants";
import { EmptyStateIllustration } from "./EmptyStateIllustration";
import { DeckProgressBar } from "./DeckProgressBar";
import { DotsVerticalIcon } from "./icons/DotsVerticalIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { IconButton } from "./IconButton";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";
import { getButtonClassName } from "./Button";
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

/* ───────── Меню ⋮ для карточки языка ───────── */
interface LanguageCardMenuProps {
  lang: string;
  onDelete: () => void;
}

function LanguageCardMenu({ lang, onDelete }: LanguageCardMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function pick(e: React.MouseEvent, action: () => void) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    action();
  }

  function goToRename(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    router.push(`/decks/${encodeURIComponent(lang)}`);
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <IconButton
        onClick={toggle}
        ariaLabel={t("deck_lang_menu_aria")}
        variant="secondary"
      >
        <DotsVerticalIcon size={20} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-md py-1 min-w-[160px]">
          <button
            type="button"
            onClick={goToRename}
            className="block w-full text-left px-4 py-2.5 text-sm text-text hover:bg-tertiary transition-colors"
          >
            {t("deck_menu_rename")}
          </button>
          <button
            type="button"
            onClick={(e) => pick(e, onDelete)}
            className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-tertiary transition-colors"
          >
            {t("deck_delete_lang_aria")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── Верхняя карточка: язык + общий прогресс ───────── */
interface LanguageCardProps {
  languages: string[];
  selected: string;
  onSelect: (lang: string) => void;
  totalWords: number;
  totalLearned: number;
  studyHref: string;
  onDeleteLanguage: (lang: string) => void;
}

function LanguageCard({ languages, selected, onSelect, totalWords, totalLearned, studyHref, onDeleteLanguage }: LanguageCardProps) {
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

  const hasMultiple = languages.length > 1;

  return (
    <div ref={ref} className="bg-surface rounded-2xl border border-border hover:border-[var(--color-primary)] transition-all">
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link href={studyHref} className="flex-1 min-w-0 flex items-center gap-3">
            <FlagIcon code={selected} size={24} />
            <span className="font-semibold text-base text-text truncate">
              {getLanguageName(selected)}
            </span>
            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropdownOpen((v) => !v);
                }}
                className="shrink-0 p-0.5 rounded hover:bg-[var(--color-primary-muted)]"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <ChevronDownIcon
                  className={`w-5 h-5 text-text-secondary transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </Link>
          <span className="text-sm text-text-secondary shrink-0">
            {t("decks_total_label")} {formatWordCount(totalWords)}
          </span>
          <div className="shrink-0" onClick={(e) => e.preventDefault()}>
            <LanguageCardMenu
              lang={selected}
              onDelete={() => onDeleteLanguage(selected)}
            />
          </div>
        </div>
        {dropdownOpen && hasMultiple && (
          <ul
            role="listbox"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-6 right-6 top-full mt-2 z-50 bg-surface border border-border rounded-xl shadow-md py-1 min-w-[200px]"
          >
            {languages.map((lang) => (
              <li key={lang}>
                <button
                  type="button"
                  role="option"
                  aria-selected={lang === selected}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(lang);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-tertiary ${
                    lang === selected ? "font-semibold text-text" : "text-text"
                  }`}
                >
                  <FlagIcon code={lang} size={20} />
                  {getLanguageName(lang)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href={studyHref} className="block px-6 pb-6">
        <DeckProgressBar learned={totalLearned} total={totalWords} />
      </Link>
    </div>
  );
}

/* ───────── Дропдаун ⋮ для кастомного словаря ───────── */
interface DeckMenuProps {
  deckId: string;
  lang: string;
  onDelete: () => void;
}

function DeckMenu({ deckId, lang, onDelete }: DeckMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function pick(e: React.MouseEvent, action: () => void) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    action();
  }

  const editHref = `/deck/${deckId}/edit${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`;

  return (
    <div ref={ref} className="relative">
      <IconButton
        onClick={toggle}
        ariaLabel="Меню словаря"
        variant="secondary"
      >
        <DotsVerticalIcon size={20} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-md py-1 min-w-[160px]">
          <Link
            href={editHref}
            className="block w-full text-left px-4 py-2.5 text-sm text-text hover:bg-tertiary transition-colors"
            onClick={() => setOpen(false)}
          >
            {t("deck_menu_rename")}
          </Link>
          <button
            type="button"
            onClick={(e) => pick(e, onDelete)}
            className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-error)] hover:bg-tertiary transition-colors"
          >
            {t("deck_menu_delete")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── Главный компонент ───────── */
export function DecksPageContent() {
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [decks, setDecks] = useState<DeckData[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user.id) return;
    const langs = getLanguagesInUse(user.id);
    setLanguages(langs);
    if (langs.length > 0) setSelectedLang(langs[0]);
  }, []);

  const loadDecks = useCallback(() => {
    if (!selectedLang) return;
    const user = getCurrentUser();
    if (!user.id) return;
    const all = getDecksForLanguage(user.id, selectedLang);
    const withProgress = all.map((deck) => {
      const { total, learned } = getDeckProgress(user.id, deck.id, selectedLang);
      return { ...deck, total, learned };
    });
    setDecks(withProgress);
  }, [selectedLang]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  function handleDelete(deckId: string, deckName: string) {
    if (!confirm(`${t("deck_menu_delete")} «${deckName}»?`)) return;
    const user = getCurrentUser();
    if (user.id) { deleteDeck(user.id, deckId); loadDecks(); }
  }

  function handleRename(deckId: string, currentName: string) {
    const newName = prompt(t("deck_rename_prompt"), currentName);
    if (!newName || newName.trim() === currentName) return;
    const user = getCurrentUser();
    if (user.id) { renameDeck(user.id, deckId, newName.trim()); loadDecks(); }
  }

  function handleDeleteLanguage(lang: string) {
    const langName = getLanguageName(lang);
    if (!confirm(t("deck_delete_lang_confirm").replace("{lang}", langName))) return;
    const user = getCurrentUser();
    if (!user.id) return;
    deleteLanguage(user.id, lang);
    const langs = getLanguagesInUse(user.id);
    setLanguages(langs);
    setSelectedLang(langs.length > 0 ? langs[0] : "");
  }

  const { total: totalWords, learned: totalLearned } =
    (() => {
      const user = getCurrentUser();
      if (!user.id || !selectedLang) return { total: 0, learned: 0 };
      return getDeckProgress(user.id, ALL_CARDS_DECK_ID, selectedLang);
    })();

  /* Пустой стейт */
  if (languages.length === 0) {
    return (
      <div className={`${PAGE_LAYOUT_CLASSES} gap-10`}>
        <div className="w-full flex flex-col p-0">
          <div className="flex flex-col items-center gap-4 p-8 border border-border rounded-2xl text-center">
            <EmptyStateIllustration className="w-[68px] h-[68px] text-text-muted" />
            <p className="text-base text-text-secondary">{t("decks_empty")}</p>
          </div>
        </div>
      </div>
    );
  }

  const customDecks = decks.filter((d) => d.id !== ALL_CARDS_DECK_ID);

  return (
    <div className={`${PAGE_LAYOUT_CLASSES} gap-10`}>
      <div className="w-full flex flex-col gap-8 p-0">
        {/* ── Верхняя карточка: язык + общий прогресс ── */}
        <LanguageCard
          languages={languages}
          selected={selectedLang}
          onSelect={setSelectedLang}
          totalWords={totalWords}
          totalLearned={totalLearned}
          studyHref={`/deck/${ALL_CARDS_DECK_ID}/study?lang=${encodeURIComponent(selectedLang)}`}
          onDeleteLanguage={handleDeleteLanguage}
        />

        {/* ── Ваши словари ── */}
        <section>
          <h2 className="font-display text-[22px] font-normal text-text mb-4">
            {t("decks_tab_my")}
          </h2>

          {customDecks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {customDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-surface rounded-2xl border border-border hover:border-[var(--color-primary)] transition-all"
                >
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/deck/${deck.id}/study?lang=${encodeURIComponent(selectedLang)}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="font-semibold text-base text-text truncate">{deck.name}</p>
                      </Link>
                      <span className="text-sm text-text-secondary shrink-0">
                        {formatWordCount(deck.total)}
                      </span>
                      <div className="shrink-0" onClick={(e) => e.preventDefault()}>
                        <DeckMenu
                          deckId={deck.id}
                          lang={selectedLang}
                          onDelete={() => handleDelete(deck.id, deck.name)}
                        />
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/deck/${deck.id}/study?lang=${encodeURIComponent(selectedLang)}`}
                    className="block px-6 pb-6"
                  >
                    <DeckProgressBar learned={deck.learned} total={deck.total} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl border border-border text-center">
              <EmptyStateIllustration className="w-[68px] h-[68px] text-text-muted" />
              <p className="text-base text-text-secondary leading-6 whitespace-pre-line">
                {t("decks_no_custom_decks")}
              </p>
              <Link href="/" className={getButtonClassName("primary", "md")}>
                {t("decks_go_to_translator")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
