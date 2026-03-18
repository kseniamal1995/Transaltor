export interface User {
  id: string;
}

export interface Card {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  translationLanguage?: string;
  imageUrl?: string;
  examples?: string[];
  deckIds: string[];
  learned: boolean;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  createdAt: string;
}

export interface TranslationHistoryItem {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  translationLanguage?: string;
  createdAt: string;
}
