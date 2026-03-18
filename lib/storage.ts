"use client";

import type { Card, Deck, TranslationHistoryItem, User } from "@/types";
import { normalizeLanguageCode } from "@/lib/languages";
import { ALL_CARDS_DECK_ID, STORAGE_KEYS } from "./constants";
import { t } from "@/lib/strings";

function generateId(): string {
  return crypto.randomUUID();
}

function getStorageKey(userId: string, type: "decks" | "history" | "cards") {
  switch (type) {
    case "decks":
      return STORAGE_KEYS.decks(userId);
    case "history":
      return STORAGE_KEYS.history(userId);
    case "cards":
      return STORAGE_KEYS.cards(userId);
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}

export function getCurrentUser(): User {
  if (typeof window === "undefined") {
    return { id: "" };
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    try {
      const user = JSON.parse(stored) as User;
      if (user.id) return user;
    } catch {
      // invalid JSON
    }
  }

  return { id: "" };
}

function ensureDefaultDeck(userId: string): void {
  const decks = getDecks(userId);
  const hasAllCards = decks.some((d) => d.id === ALL_CARDS_DECK_ID);
  if (!hasAllCards) {
    const defaultDeck: Deck = {
      id: ALL_CARDS_DECK_ID,
      name: "All cards",
      createdAt: new Date().toISOString(),
    };
    saveDecks(userId, [...decks, defaultDeck]);
  }
}

function getDecks(userId: string): Deck[] {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(userId, "decks");
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Deck[];
  } catch {
    return [];
  }
}

function saveDecks(userId: string, decks: Deck[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId, "decks"), JSON.stringify(decks));
}

export function getDecksForUser(userId: string): Deck[] {
  const decks = getDecks(userId);
  if (decks.length === 0) {
    ensureDefaultDeck(userId);
    return getDecks(userId).map(localizeAllCardsDeck);
  }
  return decks.map(localizeAllCardsDeck);
}

function localizeAllCardsDeck(deck: Deck): Deck {
  if (deck.id === ALL_CARDS_DECK_ID) {
    return { ...deck, name: t("decks_all_cards") };
  }
  return deck;
}

export function createDeck(userId: string, name: string): Deck {
  const decks = getDecksForUser(userId);
  const deck: Deck = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  };
  saveDecks(userId, [...decks, deck]);
  return deck;
}

export function getHistory(userId: string): TranslationHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getStorageKey(userId, "history"));
  if (!raw) return [];
  try {
    const items = JSON.parse(raw) as TranslationHistoryItem[];
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function addToHistory(
  userId: string,
  item: Omit<TranslationHistoryItem, "id" | "createdAt">
): TranslationHistoryItem {
  const history = getHistory(userId);
  const newItem: TranslationHistoryItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...history];
  localStorage.setItem(
    getStorageKey(userId, "history"),
    JSON.stringify(updated)
  );
  return newItem;
}

export function removeFromHistory(userId: string, itemId: string): void {
  const history = getHistory(userId);
  const updated = history.filter((h) => h.id !== itemId);
  localStorage.setItem(
    getStorageKey(userId, "history"),
    JSON.stringify(updated)
  );
}

export function clearHistory(userId: string): void {
  localStorage.setItem(getStorageKey(userId, "history"), JSON.stringify([]));
}

export function getCards(userId: string): Card[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getStorageKey(userId, "cards"));
  if (!raw) return [];
  try {
    const cards = JSON.parse(raw) as Card[];
    return cards.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getCardsForDeck(
  userId: string,
  deckId: string,
  languageFilter?: string,
  translationLanguageFilter?: string,
): Card[] {
  const cards = getCards(userId);
  let filtered =
    deckId === ALL_CARDS_DECK_ID
      ? cards
      : cards.filter((c) => c.deckIds.includes(deckId));

  if (languageFilter) {
    filtered = filtered.filter(
      (c) =>
        normalizeLanguageCode(c.foreignLanguage ?? "en") === languageFilter
    );
  }
  if (translationLanguageFilter) {
    filtered = filtered.filter(
      (c) =>
        normalizeLanguageCode(c.translationLanguage ?? "ru") === translationLanguageFilter
    );
  }
  return filtered;
}

export function getDeckProgress(
  userId: string,
  deckId: string,
  languageFilter?: string,
  translationLanguageFilter?: string,
): { total: number; learned: number } {
  const cards = getCardsForDeck(userId, deckId, languageFilter, translationLanguageFilter);
  const learned = cards.filter((c) => c.learned).length;
  return { total: cards.length, learned };
}

export function getLanguagesInUse(userId: string): string[] {
  const cards = getCards(userId);
  const langs = new Set<string>();
  cards.forEach((c) => {
    const raw = c.foreignLanguage ?? "en";
    const lang = normalizeLanguageCode(raw);
    if (lang !== "auto") {
      langs.add(lang);
    }
  });
  return Array.from(langs).sort();
}

export interface LanguagePair {
  source: string;
  target: string;
  total: number;
  learned: number;
}

export function getLanguagePairsInUse(userId: string): LanguagePair[] {
  const cards = getCards(userId);
  const pairMap = new Map<string, { total: number; learned: number }>();

  cards.forEach((c) => {
    const src = normalizeLanguageCode(c.foreignLanguage ?? "en");
    const tgt = normalizeLanguageCode(c.translationLanguage ?? "ru");
    if (src === "auto") return;
    const key = `${src}|${tgt}`;
    const existing = pairMap.get(key) ?? { total: 0, learned: 0 };
    existing.total++;
    if (c.learned) existing.learned++;
    pairMap.set(key, existing);
  });

  const pairs: LanguagePair[] = [];
  pairMap.forEach((stats, key) => {
    const [source, target] = key.split("|");
    pairs.push({ source, target, ...stats });
  });

  pairs.sort((a, b) => {
    if (a.target !== b.target) return a.target.localeCompare(b.target);
    return a.source.localeCompare(b.source);
  });

  return pairs;
}

export function deleteLanguagePair(userId: string, source: string, target: string): void {
  const cards = getCards(userId);
  const normalizedSrc = normalizeLanguageCode(source);
  const normalizedTgt = normalizeLanguageCode(target);
  const updated = cards.filter(
    (c) =>
      normalizeLanguageCode(c.foreignLanguage ?? "en") !== normalizedSrc ||
      normalizeLanguageCode(c.translationLanguage ?? "ru") !== normalizedTgt
  );
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updated));
}

/** Returns decks that have at least one card in the given language. Always includes ALL_CARDS_DECK_ID. */
export function getDecksForLanguage(
  userId: string,
  lang: string
): { id: string; name: string; createdAt: string }[] {
  const allDecks = getDecksForUser(userId);
  const cards = getCards(userId);
  const normalizedLang = normalizeLanguageCode(lang);

  const deckIdsWithCardsInLang = new Set<string>();
  cards.forEach((c) => {
    if (normalizeLanguageCode(c.foreignLanguage ?? "en") === normalizedLang) {
      if (c.deckIds.length > 0) {
        c.deckIds.forEach((did) => deckIdsWithCardsInLang.add(did));
      } else {
        deckIdsWithCardsInLang.add(ALL_CARDS_DECK_ID);
      }
    }
  });

  const result: { id: string; name: string; createdAt: string }[] = [];
  result.push({
    id: ALL_CARDS_DECK_ID,
    name: "Все слова",
    createdAt: "",
  });

  allDecks
    .filter((d) => d.id !== ALL_CARDS_DECK_ID && deckIdsWithCardsInLang.has(d.id))
    .forEach((d) => result.push(d));

  return result;
}

export function isCardDuplicate(userId: string, foreign: string, deckId: string): boolean {
  const cards = getCards(userId);
  const normalizedForeign = foreign.trim().toLowerCase();
  return cards.some(
    (c) => c.foreign.trim().toLowerCase() === normalizedForeign && c.deckIds.includes(deckId),
  );
}

export function saveCard(
  userId: string,
  card: Omit<Card, "id" | "createdAt" | "learned">
): Card {
  const cards = getCards(userId);
  const foreignLang = card.foreignLanguage
    ? normalizeLanguageCode(card.foreignLanguage)
    : undefined;
  const langToSave =
    foreignLang && foreignLang !== "auto" ? foreignLang : undefined;
  const targetLang = card.translationLanguage
    ? normalizeLanguageCode(card.translationLanguage)
    : undefined;
  const targetToSave =
    targetLang && targetLang !== "auto" ? targetLang : undefined;
  const newCard: Card = {
    ...card,
    foreignLanguage: langToSave ?? card.foreignLanguage,
    translationLanguage: targetToSave ?? card.translationLanguage,
    id: generateId(),
    learned: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [...cards, newCard];
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updated));
  return newCard;
}

export function updateCard(userId: string, card: Card): void {
  const cards = getCards(userId);
  const index = cards.findIndex((c) => c.id === card.id);
  if (index === -1) return;
  const updated = [...cards];
  updated[index] = card;
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updated));
}

export function setCardLearned(userId: string, cardId: string, learned: boolean): void {
  const cards = getCards(userId);
  const card = cards.find((c) => c.id === cardId);
  if (!card) return;
  updateCard(userId, { ...card, learned });
}

export function deleteCard(userId: string, cardId: string): void {
  const cards = getCards(userId);
  const updated = cards.filter((c) => c.id !== cardId);
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updated));
}

/** Deletes all cards in the given language. The language will disappear from the decks list. */
export function deleteLanguage(userId: string, lang: string): void {
  const cards = getCards(userId);
  const normalizedLang = normalizeLanguageCode(lang);
  const updated = cards.filter(
    (c) => normalizeLanguageCode(c.foreignLanguage ?? "en") !== normalizedLang
  );
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updated));
}

/** Deletes a deck and removes it from all cards. Cannot delete ALL_CARDS_DECK_ID. */
export function renameDeck(userId: string, deckId: string, name: string): void {
  if (deckId === ALL_CARDS_DECK_ID) return;
  const decks = getDecks(userId);
  const updated = decks.map((d) => (d.id === deckId ? { ...d, name } : d));
  saveDecks(userId, updated);
}

export function deleteDeck(userId: string, deckId: string): void {
  if (deckId === ALL_CARDS_DECK_ID) return;

  const decks = getDecks(userId);
  const updatedDecks = decks.filter((d) => d.id !== deckId);
  saveDecks(userId, updatedDecks);

  const cards = getCards(userId);
  const updatedCards = cards.map((c) => ({
    ...c,
    deckIds: c.deckIds.filter((id) => id !== deckId),
  }));
  localStorage.setItem(getStorageKey(userId, "cards"), JSON.stringify(updatedCards));
}
