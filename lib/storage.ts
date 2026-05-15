"use client";

import type { Card, Deck, TranslationHistoryItem } from "@/types";
import { normalizeLanguageCode } from "@/lib/languages";
import { ALL_CARDS_DECK_ID } from "./constants";
import { t } from "@/lib/strings";

// ─── API helpers ─────────────────────────────────────

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Types from API → client types mapping ───────────

interface ApiCard {
  id: string;
  foreign_word: string;
  translation: string;
  custom_translation: string | null;
  foreign_language: string | null;
  translation_language: string | null;
  learned: boolean;
  created_at: string;
  deck_ids: string[];
}

interface ApiDeck {
  id: string;
  name: string;
  created_at: string;
}

interface ApiHistoryItem {
  id: string;
  foreign_word: string;
  translation: string;
  custom_translation: string | null;
  foreign_language: string | null;
  translation_language: string | null;
  created_at: string;
}

function toCard(a: ApiCard): Card {
  return {
    id: a.id,
    foreign: a.foreign_word,
    translation: a.translation,
    customTranslation: a.custom_translation ?? undefined,
    foreignLanguage: a.foreign_language ?? undefined,
    translationLanguage: a.translation_language ?? undefined,
    learned: a.learned,
    createdAt: a.created_at,
    deckIds: a.deck_ids,
  };
}

function toDeck(a: ApiDeck): Deck {
  return {
    id: a.id,
    name: a.name,
    createdAt: a.created_at,
  };
}

function toHistoryItem(a: ApiHistoryItem): TranslationHistoryItem {
  return {
    id: a.id,
    foreign: a.foreign_word,
    translation: a.translation,
    customTranslation: a.custom_translation ?? undefined,
    foreignLanguage: a.foreign_language ?? undefined,
    translationLanguage: a.translation_language ?? undefined,
    createdAt: a.created_at,
  };
}

// ─── Decks ───────────────────────────────────────────

function localizeAllCardsDeck(deck: Deck): Deck {
  if (deck.id === ALL_CARDS_DECK_ID) {
    return { ...deck, name: t("decks_all_cards") };
  }
  return deck;
}

export async function getDecksForUser(): Promise<Deck[]> {
  const raw = await api<ApiDeck[]>("/api/decks");
  const decks = raw.map(toDeck).map(localizeAllCardsDeck);
  const allCardsDeck: Deck = {
    id: ALL_CARDS_DECK_ID,
    name: t("decks_all_cards"),
    createdAt: "",
  };
  return [allCardsDeck, ...decks.filter((d) => d.id !== ALL_CARDS_DECK_ID)];
}

export async function createDeck(name: string): Promise<Deck> {
  const raw = await api<ApiDeck>("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return toDeck(raw);
}

export async function renameDeck(deckId: string, name: string): Promise<void> {
  await api("/api/decks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: deckId, name }),
  });
}

export async function deleteDeck(deckId: string): Promise<void> {
  await api(`/api/decks?id=${encodeURIComponent(deckId)}`, { method: "DELETE" });
}

// ─── Cards ───────────────────────────────────────────

export async function getCards(): Promise<Card[]> {
  const raw = await api<ApiCard[]>("/api/cards");
  return raw.map(toCard);
}

export async function getCardsForDeck(
  deckId: string,
  languageFilter?: string,
  translationLanguageFilter?: string,
): Promise<Card[]> {
  const cards = await getCards();
  let filtered =
    deckId === ALL_CARDS_DECK_ID
      ? cards
      : cards.filter((c) => c.deckIds.includes(deckId));

  if (languageFilter) {
    filtered = filtered.filter(
      (c) => normalizeLanguageCode(c.foreignLanguage ?? "en") === languageFilter,
    );
  }
  if (translationLanguageFilter) {
    filtered = filtered.filter(
      (c) => normalizeLanguageCode(c.translationLanguage ?? "ru") === translationLanguageFilter,
    );
  }
  return filtered;
}

export async function getDeckProgress(
  deckId: string,
  languageFilter?: string,
  translationLanguageFilter?: string,
): Promise<{ total: number; learned: number }> {
  const cards = await getCardsForDeck(deckId, languageFilter, translationLanguageFilter);
  const learned = cards.filter((c) => c.learned).length;
  return { total: cards.length, learned };
}

export interface LanguagePair {
  source: string;
  target: string;
  total: number;
  learned: number;
}

export async function getLanguagePairsInUse(): Promise<LanguagePair[]> {
  const cards = await getCards();
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

export async function getDecksForLanguage(
  lang: string,
): Promise<{ id: string; name: string; createdAt: string }[]> {
  const allDecks = await getDecksForUser();
  const cards = await getCards();
  const normalizedLang = normalizeLanguageCode(lang);

  const deckIdsWithCards = new Set<string>();
  const deckIdsWithCardsInLang = new Set<string>();
  cards.forEach((c) => {
    if (c.deckIds.length > 0) {
      c.deckIds.forEach((did) => deckIdsWithCards.add(did));
    }
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
    name: t("decks_all_cards"),
    createdAt: "",
  });

  allDecks
    .filter((d) => d.id !== ALL_CARDS_DECK_ID && (deckIdsWithCardsInLang.has(d.id) || !deckIdsWithCards.has(d.id)))
    .forEach((d) => result.push(d));

  return result;
}

export async function isCardDuplicate(
  foreign: string,
  deckId: string,
): Promise<boolean> {
  const { isDuplicate } = await api<{ isDuplicate: boolean }>(
    `/api/cards/duplicate?foreignWord=${encodeURIComponent(foreign)}&deckId=${encodeURIComponent(deckId)}`,
  );
  return isDuplicate;
}

export async function saveCard(
  card: Omit<Card, "id" | "createdAt" | "learned">,
): Promise<Card> {
  const foreignLang = card.foreignLanguage
    ? normalizeLanguageCode(card.foreignLanguage)
    : undefined;
  const langToSave = foreignLang && foreignLang !== "auto" ? foreignLang : undefined;
  const targetLang = card.translationLanguage
    ? normalizeLanguageCode(card.translationLanguage)
    : undefined;
  const targetToSave = targetLang && targetLang !== "auto" ? targetLang : undefined;

  const raw = await api<ApiCard>("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foreign_word: card.foreign,
      translation: card.translation,
      custom_translation: card.customTranslation || undefined,
      foreign_language: langToSave ?? card.foreignLanguage,
      translation_language: targetToSave ?? card.translationLanguage,
      deck_ids: card.deckIds,
    }),
  });
  return toCard(raw);
}

export async function setCardLearned(cardId: string, learned: boolean): Promise<void> {
  await api("/api/cards", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: cardId, learned }),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await api(`/api/cards?id=${encodeURIComponent(cardId)}`, { method: "DELETE" });
}

export async function deleteLanguagePair(source: string, target: string): Promise<void> {
  await api(
    `/api/cards?lang=${encodeURIComponent(source)}&targetLang=${encodeURIComponent(target)}`,
    { method: "DELETE" },
  );
}

export async function deleteLanguage(lang: string): Promise<void> {
  await api(`/api/cards?lang=${encodeURIComponent(lang)}`, { method: "DELETE" });
}

export async function resetDeckProgress(
  deckId: string,
  lang?: string,
  targetLang?: string,
): Promise<void> {
  await api("/api/cards/reset-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deckId, lang, targetLang }),
  });
}

// ─── History ─────────────────────────────────────────

export async function getHistory(): Promise<TranslationHistoryItem[]> {
  const raw = await api<ApiHistoryItem[]>("/api/history");
  return raw.map(toHistoryItem);
}

export async function addToHistory(
  item: Omit<TranslationHistoryItem, "id" | "createdAt">,
): Promise<TranslationHistoryItem> {
  const raw = await api<ApiHistoryItem>("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foreign_word: item.foreign,
      translation: item.translation,
      custom_translation: item.customTranslation || undefined,
      foreign_language: item.foreignLanguage,
      translation_language: item.translationLanguage,
    }),
  });
  return toHistoryItem(raw);
}

export async function clearHistory(): Promise<void> {
  await api("/api/history", { method: "DELETE" });
}

export async function removeFromHistory(itemId: string): Promise<void> {
  await api(`/api/history?id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
}
