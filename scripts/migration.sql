-- ============================================
-- Миграция: создание таблиц для Lexio
-- Vercel Postgres (Neon)
-- ============================================

-- 1. Таблица словарей (decks)
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks (user_id);

-- 2. Таблица карточек (cards)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  foreign_word TEXT NOT NULL,
  translation TEXT NOT NULL,
  custom_translation TEXT,
  foreign_language TEXT,
  translation_language TEXT,
  learned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards (user_id);

-- 3. Связующая таблица: карточка ↔ словарь (many-to-many)
CREATE TABLE IF NOT EXISTS card_decks (
  card_id UUID NOT NULL REFERENCES cards (id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES decks (id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, deck_id)
);

CREATE INDEX IF NOT EXISTS idx_card_decks_deck_id ON card_decks (deck_id);
CREATE INDEX IF NOT EXISTS idx_card_decks_card_id ON card_decks (card_id);

-- 4. Таблица истории переводов (history)
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  foreign_word TEXT NOT NULL,
  translation TEXT NOT NULL,
  custom_translation TEXT,
  foreign_language TEXT,
  translation_language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_user_id ON history (user_id);
