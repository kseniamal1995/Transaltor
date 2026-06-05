import { sql } from "./postgres";

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
  const { rows } = await sql`
    SELECT id, user_id, name, created_at
    FROM decks
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
  `;
  return rows as DbDeck[];
}

export async function createDeck(userId: string, name: string): Promise<DbDeck> {
  const { rows } = await sql`
    INSERT INTO decks (user_id, name)
    VALUES (${userId}, ${name})
    RETURNING id, user_id, name, created_at
  `;
  return rows[0] as DbDeck;
}

export async function renameDeck(userId: string, deckId: string, name: string): Promise<void> {
  await sql`
    UPDATE decks SET name = ${name}
    WHERE id = ${deckId}::uuid AND user_id = ${userId}
  `;
}

export async function deleteDeck(userId: string, deckId: string): Promise<void> {
  await sql`
    DELETE FROM decks
    WHERE id = ${deckId}::uuid AND user_id = ${userId}
  `;
}

// ─── Cards ───────────────────────────────────────────

export async function getCards(userId: string): Promise<DbCard[]> {
  const { rows } = await sql`
    SELECT
      c.id, c.user_id, c.foreign_word, c.translation,
      c.custom_translation, c.foreign_language, c.translation_language,
      c.learned, c.created_at,
      COALESCE(
        array_agg(cd.deck_id) FILTER (WHERE cd.deck_id IS NOT NULL),
        '{}'
      ) AS deck_ids
    FROM cards c
    LEFT JOIN card_decks cd ON cd.card_id = c.id
    WHERE c.user_id = ${userId}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
  return rows as DbCard[];
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
  const { rows } = await sql`
    INSERT INTO cards (user_id, foreign_word, translation, custom_translation, foreign_language, translation_language)
    VALUES (
      ${userId},
      ${card.foreign_word},
      ${card.translation},
      ${card.custom_translation ?? null},
      ${card.foreign_language ?? null},
      ${card.translation_language ?? null}
    )
    RETURNING *
  `;
  const inserted = rows[0];

  const realDeckIds = card.deck_ids.filter((id) => id !== "all-cards");
  for (const deckId of realDeckIds) {
    await sql`
      INSERT INTO card_decks (card_id, deck_id)
      VALUES (${inserted.id}::uuid, ${deckId}::uuid)
    `;
  }

  return { ...inserted, deck_ids: card.deck_ids } as DbCard;
}

export async function updateCardLearned(
  userId: string,
  cardId: string,
  learned: boolean,
): Promise<void> {
  await sql`
    UPDATE cards SET learned = ${learned}
    WHERE id = ${cardId}::uuid AND user_id = ${userId}
  `;
}

export async function deleteCard(userId: string, cardId: string): Promise<void> {
  await sql`
    DELETE FROM cards
    WHERE id = ${cardId}::uuid AND user_id = ${userId}
  `;
}

export async function deleteCardsByLanguagePair(
  userId: string,
  source: string,
  target: string,
): Promise<void> {
  await sql`
    DELETE FROM cards
    WHERE user_id = ${userId}
      AND foreign_language = ${source}
      AND translation_language = ${target}
  `;
}

export async function deleteCardsByLanguage(
  userId: string,
  lang: string,
): Promise<void> {
  await sql`
    DELETE FROM cards
    WHERE user_id = ${userId} AND foreign_language = ${lang}
  `;
}

export async function resetDeckProgress(
  userId: string,
  deckId: string,
  lang?: string,
  targetLang?: string,
): Promise<void> {
  if (deckId === "all-cards") {
    if (lang && targetLang) {
      await sql`
        UPDATE cards SET learned = false
        WHERE user_id = ${userId}
          AND foreign_language = ${lang}
          AND translation_language = ${targetLang}
      `;
    } else if (lang) {
      await sql`
        UPDATE cards SET learned = false
        WHERE user_id = ${userId} AND foreign_language = ${lang}
      `;
    } else {
      await sql`
        UPDATE cards SET learned = false
        WHERE user_id = ${userId}
      `;
    }
  } else {
    if (lang && targetLang) {
      await sql`
        UPDATE cards SET learned = false
        WHERE user_id = ${userId}
          AND foreign_language = ${lang}
          AND translation_language = ${targetLang}
          AND id IN (SELECT card_id FROM card_decks WHERE deck_id = ${deckId}::uuid)
      `;
    } else {
      await sql`
        UPDATE cards SET learned = false
        WHERE user_id = ${userId}
          AND id IN (SELECT card_id FROM card_decks WHERE deck_id = ${deckId}::uuid)
      `;
    }
  }
}

export async function isCardDuplicate(
  userId: string,
  foreignWord: string,
  deckId: string,
): Promise<boolean> {
  const normalized = foreignWord.trim().toLowerCase();

  if (deckId === "all-cards") {
    const { rows } = await sql`
      SELECT 1 FROM cards
      WHERE user_id = ${userId} AND LOWER(TRIM(foreign_word)) = ${normalized}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  const { rows } = await sql`
    SELECT 1 FROM cards c
    JOIN card_decks cd ON cd.card_id = c.id
    WHERE c.user_id = ${userId}
      AND LOWER(TRIM(c.foreign_word)) = ${normalized}
      AND cd.deck_id = ${deckId}::uuid
    LIMIT 1
  `;
  return rows.length > 0;
}

// ─── History ─────────────────────────────────────────

export async function getHistory(userId: string): Promise<DbHistoryItem[]> {
  const { rows } = await sql`
    SELECT * FROM history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows as DbHistoryItem[];
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
  const { rows } = await sql`
    INSERT INTO history (user_id, foreign_word, translation, custom_translation, foreign_language, translation_language)
    VALUES (
      ${userId},
      ${item.foreign_word},
      ${item.translation},
      ${item.custom_translation ?? null},
      ${item.foreign_language ?? null},
      ${item.translation_language ?? null}
    )
    RETURNING *
  `;
  return rows[0] as DbHistoryItem;
}

export async function clearHistory(userId: string): Promise<void> {
  await sql`DELETE FROM history WHERE user_id = ${userId}`;
}

export async function removeFromHistory(
  userId: string,
  itemId: string,
): Promise<void> {
  await sql`
    DELETE FROM history
    WHERE id = ${itemId}::uuid AND user_id = ${userId}
  `;
}
