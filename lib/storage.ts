"use client";

import type { Card, Deck, TranslationHistoryItem, User } from "@/types";
import { normalizeLanguageCode } from "@/lib/languages";
import { ALL_CARDS_DECK_ID, STORAGE_KEYS } from "./constants";

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
    return getDecks(userId);
  }
  return decks;
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
  const updated = [newItem, ...history.filter((h) => h.id !== newItem.id)];
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
  languageFilter?: string
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
  return filtered;
}

export function getDeckProgress(
  userId: string,
  deckId: string,
  languageFilter?: string
): { total: number; learned: number } {
  const cards = getCardsForDeck(userId, deckId, languageFilter);
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
    name: "Все карточки",
    createdAt: "",
  });

  allDecks
    .filter((d) => d.id !== ALL_CARDS_DECK_ID && deckIdsWithCardsInLang.has(d.id))
    .forEach((d) => result.push(d));

  return result;
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
  const newCard: Card = {
    ...card,
    foreignLanguage: langToSave ?? card.foreignLanguage,
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
