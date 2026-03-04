export const STORAGE_KEYS = {
  CURRENT_USER: "translator-current-user",
  GUEST_USER_ID: "translator-guest-user-id",
  LAST_TARGET_LANG: "translator-last-target-lang",
  decks: (userId: string) => `translator-${userId}-decks`,
  history: (userId: string) => `translator-${userId}-history`,
  cards: (userId: string) => `translator-${userId}-cards`,
} as const;

export const ALL_CARDS_DECK_ID = "all-cards";
