/**
 * UI-строки приложения (токены для i18n).
 *
 * Чтобы добавить новый язык:
 * 1. Добавьте код языка в тип Locale
 * 2. Скопируйте объект ru и переведите значения
 * 3. При необходимости добавьте определение locale (напр. из настроек/URL)
 */

export type Locale = "ru" | "en";

const translations: Record<Locale, Record<string, string>> = {
  ru: {
    // Навигация
    nav_translator: "Переводчик",
    nav_history: "История",
    nav_my_dictionary: "Мой словарь",
    nav_close: "Закрыть",
    nav_logout: "Выйти",

    // Главная (переводчик)
    translate_hero: "Переводи. Сохраняй. Изучай.",
    translate_subtitle: "Переводи слова с любого языка и сохраняй их в личный словарь",
    translate_placeholder: "Введите слово или фразу...",
    translate_error: "Ошибка при переводе",
    translate_empty_input: "Введите текст для перевода",

    // Выбор языка
    lang_source_label: "Язык исходного текста",
    lang_target_label: "Язык перевода",
    lang_search_placeholder: "Поиск",
    lang_search_empty: "Ничего не найдено",
    lang_swap_aria: "Поменять языки местами",
    lang_auto: "Авто",

    // Результат
    result_loading: "Перевожу...",

    // Сохранение карточки
    card_saved: "Карточка сохранена!",
    card_save: "Сохранить",
    card_saving: "Сохранение...",
    card_save_aria: "Сохранить как карточку",
    card_save_title: "Сохранить как карточку",
    card_default: "По умолчанию",
    card_cancel: "Отмена",
    card_custom_placeholder: "Свой перевод (необязательно)",
    card_custom_label: "Свой перевод",

    // Колоды / Мой словарь
    decks_title: "Колоды",
    decks_subtitle: "Ваши карточки по языкам",
    decks_empty: "Нет карточек. Сохраните слова из перевода — появятся языки.",
    decks_lang_subtitle: "Ваши колоды и карточки по этому языку",
    decks_aria: "Языки",
    decks_all_cards: "Все карточки",
    decks_deck_label: "Колода",
    decks_create_placeholder: "Название колоды",
    decks_create_new: "+ Создать новую колоду",
    decks_create: "Создать",

    // История
    history_title: "История",
    history_subtitle: "Все ваши переводы. Сохраните любой в карточку.",
    history_empty: "История пуста. Сделайте первый перевод.",
    history_aria: "Список переводов",
    history_delete_aria: "Удалить из истории",

    // Изучение
    study_show_word: "Показать слово",
    study_show_translation: "Показать перевод",
    study_speak_aria: "Произнести",

    // Язык (селектор)
    lang_label: "Язык",

    // Прочее
    deck_delete_lang_aria: "Удалить язык",
    deck_cards_aria: "Карточки колоды",
    result_aria: "Результат перевода",
    result_error_aria: "Ошибка перевода",
  },
  en: {
    nav_translator: "Translator",
    nav_history: "History",
    nav_my_dictionary: "My dictionary",
    nav_close: "Close",
    nav_logout: "Log out",
    translate_hero: "Translate. Save. Learn.",
    translate_subtitle: "Translate words from any language and save them to your personal dictionary",
    translate_placeholder: "Enter word or phrase...",
    translate_error: "Translation error",
    translate_empty_input: "Enter text to translate",
    lang_source_label: "Source language",
    lang_target_label: "Target language",
    lang_search_placeholder: "Search",
    lang_search_empty: "No results",
    lang_swap_aria: "Swap languages",
    lang_auto: "Auto",
    result_loading: "Translating...",
    card_saved: "Card saved!",
    card_save: "Save",
    card_saving: "Saving...",
    card_save_aria: "Save as card",
    card_save_title: "Save as card",
    card_default: "Default",
    card_cancel: "Cancel",
    card_custom_placeholder: "Custom translation (optional)",
    card_custom_label: "Custom translation",
    decks_title: "Decks",
    decks_subtitle: "Your cards by language",
    decks_empty: "No cards. Save words from translation — languages will appear.",
    decks_lang_subtitle: "Your decks and cards for this language",
    decks_aria: "Languages",
    decks_all_cards: "All cards",
    decks_deck_label: "Deck",
    decks_create_placeholder: "Deck name",
    decks_create_new: "+ Create new deck",
    decks_create: "Create",
    history_title: "History",
    history_subtitle: "All your translations. Save any as a card.",
    history_empty: "History is empty. Make your first translation.",
    history_aria: "Translation list",
    history_delete_aria: "Remove from history",
    study_show_word: "Show word",
    study_show_translation: "Show translation",
    study_speak_aria: "Speak",
    lang_label: "Language",
    deck_delete_lang_aria: "Delete language",
    deck_cards_aria: "Deck cards",
    result_aria: "Translation result",
    result_error_aria: "Translation error",
  },
};

// Текущий язык интерфейса (позже можно брать из настроек/URL)
const DEFAULT_LOCALE: Locale = "ru";

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return translations[locale][key] ?? translations.ru[key] ?? key;
}
