import { getSupabase } from "./supabase";

// ─── Types ───────────────────────────────────────────

export interface DbCard {
  id: string;
  user_id: string;
  foreign_word: string;
  translation: string;
  custom_translation: string | null;
  foreign_language: string | null;
  translation_language: string | null;
  learned: boolean;
  created_at: string;
  deck_ids: string[];
}

export interface DbDeck {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface DbHistoryItem {
  id: string;
  user_id: string;
  foreign_word: string;
  translation: string;
  custom_translation: string | null;
  foreign_language: string | null;
  translation_language: string | null;
  created_at: string;
}

// ─── Decks ───────────────────────────────────────────

export async function getDecks(userId: string): Promise<DbDeck[]> {
  const { data, error } = await getSupabase()
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createDeck(userId: string, name: string): Promise<DbDeck> {
  const { data, error } = await getSupabase()
    .from("decks")
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function renameDeck(userId: string, deckId: string, name: string): Promise<void> {
  const { error } = await getSupabase()
    .from("decks")
    .update({ name })
    .eq("id", deckId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteDeck(userId: string, deckId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", userId);

  if (error) throw error;
}

// ─── Cards ───────────────────────────────────────────

export async function getCards(userId: string): Promise<DbCard[]> {
  const { data, error } = await getSupabase()
    .from("cards")
    .select(`
      *,
      card_decks (deck_id)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    foreign_word: row.foreign_word as string,
    translation: row.translation as string,
    custom_translation: row.custom_translation as string | null,
    foreign_language: row.foreign_language as string | null,
    translation_language: row.translation_language as string | null,
    learned: row.learned as boolean,
    created_at: row.created_at as string,
    deck_ids: ((row.card_decks as { deck_id: string }[]) ?? []).map(
      (cd) => cd.deck_id,
    ),
  }));
}

export async function createCard(
  userId: string,
  card: {
    foreign_word: string;
    translation: string;
    custom_translation?: string;
    foreign_language?: string;
    translation_language?: string;
    deck_ids: string[];
  },
): Promise<DbCard> {
  const sb = getSupabase();

  const { data: inserted, error } = await sb
    .from("cards")
    .insert({
      user_id: userId,
      foreign_word: card.foreign_word,
      translation: card.translation,
      custom_translation: card.custom_translation ?? null,
      foreign_language: card.foreign_language ?? null,
      translation_language: card.translation_language ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const realDeckIds = card.deck_ids.filter((id) => id !== "all-cards");
  if (realDeckIds.length > 0) {
    const links = realDeckIds.map((deckId) => ({
      card_id: inserted.id,
      deck_id: deckId,
    }));
    const { error: linkError } = await sb.from("card_decks").insert(links);
    if (linkError) throw linkError;
  }

  return { ...inserted, deck_ids: card.deck_ids };
}

export async function updateCardLearned(
  userId: string,
  cardId: string,
  learned: boolean,
): Promise<void> {
  const { error } = await getSupabase()
    .from("cards")
    .update({ learned })
    .eq("id", cardId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("cards")
    .delete()
    .eq("id", cardId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteCardsByLanguagePair(
  userId: string,
  source: string,
  target: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("cards")
    .delete()
    .eq("user_id", userId)
    .eq("foreign_language", source)
    .eq("translation_language", target);

  if (error) throw error;
}

export async function deleteCardsByLanguage(
  userId: string,
  lang: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("cards")
    .delete()
    .eq("user_id", userId)
    .eq("foreign_language", lang);

  if (error) throw error;
}

export async function resetDeckProgress(
  userId: string,
  deckId: string,
  lang?: string,
  targetLang?: string,
): Promise<void> {
  const cards = await getCards(userId);
  const ids = cards
    .filter((c) => {
      const inDeck = deckId === "all-cards" || c.deck_ids.includes(deckId);
      const matchLang = !lang || c.foreign_language === lang;
      const matchTarget = !targetLang || c.translation_language === targetLang;
      return inDeck && matchLang && matchTarget;
    })
    .map((c) => c.id);

  if (ids.length === 0) return;

  const { error } = await getSupabase()
    .from("cards")
    .update({ learned: false })
    .eq("user_id", userId)
    .in("id", ids);

  if (error) throw error;
}

export async function isCardDuplicate(
  userId: string,
  foreignWord: string,
  deckId: string,
): Promise<boolean> {
  const cards = await getCards(userId);
  const normalized = foreignWord.trim().toLowerCase();
  if (deckId === "all-cards") {
    return cards.some(
      (c) => c.foreign_word.trim().toLowerCase() === normalized,
    );
  }
  return cards.some(
    (c) =>
      c.foreign_word.trim().toLowerCase() === normalized &&
      c.deck_ids.includes(deckId),
  );
}

// ─── History ─────────────────────────────────────────

export async function getHistory(userId: string): Promise<DbHistoryItem[]> {
  const { data, error } = await getSupabase()
    .from("history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addToHistory(
  userId: string,
  item: {
    foreign_word: string;
    translation: string;
    custom_translation?: string;
    foreign_language?: string;
    translation_language?: string;
  },
): Promise<DbHistoryItem> {
  const { data, error } = await getSupabase()
    .from("history")
    .insert({
      user_id: userId,
      foreign_word: item.foreign_word,
      translation: item.translation,
      custom_translation: item.custom_translation ?? null,
      foreign_language: item.foreign_language ?? null,
      translation_language: item.translation_language ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clearHistory(userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("history")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

export async function removeFromHistory(
  userId: string,
  itemId: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("history")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) throw error;
}
