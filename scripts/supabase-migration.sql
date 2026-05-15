-- ============================================
-- Миграция: создание таблиц для Lexio
-- Выполнить в Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================

-- 1. Таблица словарей (decks)
create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_decks_user_id on decks (user_id);

-- 2. Таблица карточек (cards)
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  foreign_word text not null,
  translation text not null,
  custom_translation text,
  foreign_language text,
  translation_language text,
  learned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_cards_user_id on cards (user_id);

-- 3. Связующая таблица: карточка ↔ словарь (many-to-many)
create table if not exists card_decks (
  card_id uuid not null references cards (id) on delete cascade,
  deck_id uuid not null references decks (id) on delete cascade,
  primary key (card_id, deck_id)
);

create index if not exists idx_card_decks_deck_id on card_decks (deck_id);
create index if not exists idx_card_decks_card_id on card_decks (card_id);

-- 4. Таблица истории переводов (history)
create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  foreign_word text not null,
  translation text not null,
  custom_translation text,
  foreign_language text,
  translation_language text,
  created_at timestamptz not null default now()
);

create index if not exists idx_history_user_id on history (user_id);

-- ============================================
-- Row Level Security (RLS)
-- Каждый пользователь видит только свои данные
-- ============================================

alter table decks enable row level security;
alter table cards enable row level security;
alter table card_decks enable row level security;
alter table history enable row level security;

-- Политики для decks
create policy "Users can view own decks"
  on decks for select
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can insert own decks"
  on decks for insert
  with check (user_id = current_setting('app.current_user_id', true));

create policy "Users can update own decks"
  on decks for update
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can delete own decks"
  on decks for delete
  using (user_id = current_setting('app.current_user_id', true));

-- Политики для cards
create policy "Users can view own cards"
  on cards for select
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can insert own cards"
  on cards for insert
  with check (user_id = current_setting('app.current_user_id', true));

create policy "Users can update own cards"
  on cards for update
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can delete own cards"
  on cards for delete
  using (user_id = current_setting('app.current_user_id', true));

-- Политики для card_decks (через связь с cards)
create policy "Users can view own card_decks"
  on card_decks for select
  using (card_id in (select id from cards where user_id = current_setting('app.current_user_id', true)));

create policy "Users can insert own card_decks"
  on card_decks for insert
  with check (card_id in (select id from cards where user_id = current_setting('app.current_user_id', true)));

create policy "Users can delete own card_decks"
  on card_decks for delete
  using (card_id in (select id from cards where user_id = current_setting('app.current_user_id', true)));

-- Политики для history
create policy "Users can view own history"
  on history for select
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can insert own history"
  on history for insert
  with check (user_id = current_setting('app.current_user_id', true));

create policy "Users can delete own history"
  on history for delete
  using (user_id = current_setting('app.current_user_id', true));
