/**
 * UI-строки приложения (токены для i18n).
 *
 * Чтобы добавить новый язык:
 * 1. Добавьте код языка в тип Locale
 * 2. Скопируйте объект ru и переведите значения
 * 3. При необходимости добавьте определение locale (напр. из настроек/URL)
 */

import type { Locale } from "./locale";

const translations: Record<Locale, Record<string, string>> = {
  ru: {
    // Навигация
    nav_translator: "Переводчик",
    nav_history: "История",
    nav_my_dictionary: "Мой словарь",
    nav_close: "Закрыть",
    nav_sign_in: "Войти",
    nav_logout: "Выйти",
    nav_menu_aria: "Меню",

    // Главная (переводчик)
    translate_hero: "Переводи. Сохраняй. Изучай.",
    translate_subtitle: "Переводи слова с любого языка и сохраняй их в личный словарь",
    translate_placeholder: "Введите слово или фразу...",
    translate_input_label: "Текст для перевода",
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
    result_retry: "Повторить",

    // Сохранение карточки
    card_saved: "Карточка сохранена!",
    card_save: "Сохранить",
    card_saving: "Сохранение...",
    card_save_aria: "Сохранить как карточку",
    card_save_title: "Сохранить как карточку",
    card_default: "По умолчанию",
    card_cancel: "Отмена",
    card_translation_label: "Перевод",
    card_custom_placeholder: "Введите ваш перевод...",
    card_custom_label: "Свой перевод",
    card_custom_tooltip: "Напишите свой перевод",

    // Словари / Мой словарь
    decks_title: "Словари",
    decks_subtitle: "Ваши карточки по языкам",
    decks_empty: "Ваши сохранённые слова будут здесь",
    decks_lang_subtitle: "Ваши словари и карточки по этому языку",
    decks_aria: "Языки",
    decks_all_cards: "Все слова",
    decks_deck_label: "Словарь",
    decks_create_placeholder: "Название словаря",
    decks_create_new: "+ Создать новый словарь",
    decks_create: "Создать",

    // История
    history_title: "История",
    history_subtitle: "Все ваши переводы. Сохраните любой в карточку.",
    history_empty: "Здесь будет ваша история переводов",
    history_aria: "Список переводов",
    history_delete_aria: "Удалить из истории",

    // Изучение
    study_show_word: "Показать слово",
    study_show_translation: "Показать перевод",
    study_speak_aria: "Произнести",
    study_tap_to_flip: "Нажмите, чтобы перевернуть",
    study_swipe_hint: "Свайп вправо ✓ выучено · влево ✗ ещё раз",

    // Язык (селектор)
    lang_label: "Язык",

    // Прочее
    deck_delete_lang_aria: "Удалить язык",
    deck_delete_deck_aria: "Удалить словарь",
    deck_cards_aria: "Карточки словаря",
    deck_progress_aria: "карточек выучено",
    deck_not_found: "Словарь не найден",
    deck_back_to_list: "← Назад к словарям",
    deck_back_to_deck: "← Назад к словарю",
    deck_empty_cards: "В словаре нет карточек для изучения.",
    deck_no_cards_yet: "В словаре пока нет карточек",
    deck_section_title: "Словари",
    deck_no_custom_yet: "Вы ещё не добавили ни один словарь по этому языку",
    result_aria: "Результат перевода",
    result_error_aria: "Ошибка перевода",
  },
  en: {
    nav_translator: "Translator",
    nav_history: "History",
    nav_my_dictionary: "My dictionary",
    nav_close: "Close",
    nav_sign_in: "Sign in",
    nav_logout: "Log out",
    nav_menu_aria: "Menu",
    translate_hero: "Translate. Save. Learn.",
    translate_subtitle: "Translate words from any language and save them to your personal dictionary",
    translate_placeholder: "Enter word or phrase...",
    translate_input_label: "Text to translate",
    translate_error: "Translation error",
    translate_empty_input: "Enter text to translate",
    lang_source_label: "Source language",
    lang_target_label: "Target language",
    lang_search_placeholder: "Search",
    lang_search_empty: "No results",
    lang_swap_aria: "Swap languages",
    lang_auto: "Auto",
    result_loading: "Translating...",
    result_retry: "Retry",
    card_saved: "Card saved!",
    card_save: "Save",
    card_saving: "Saving...",
    card_save_aria: "Save as card",
    card_save_title: "Save as card",
    card_default: "Default",
    card_cancel: "Cancel",
    card_translation_label: "Translation",
    card_custom_placeholder: "Enter your translation...",
    card_custom_label: "Custom translation",
    card_custom_tooltip: "Write your own translation",
    decks_title: "Dictionaries",
    decks_subtitle: "Your cards by language",
    decks_empty: "Your saved words will be here",
    decks_lang_subtitle: "Your dictionaries and cards for this language",
    decks_aria: "Languages",
    decks_all_cards: "All words",
    decks_deck_label: "Dictionary",
    decks_create_placeholder: "Dictionary name",
    decks_create_new: "+ Create new dictionary",
    decks_create: "Create",
    history_title: "History",
    history_subtitle: "All your translations. Save any as a card.",
    history_empty: "Your translation history will be here",
    history_aria: "Translation list",
    history_delete_aria: "Remove from history",
    study_show_word: "Show word",
    study_show_translation: "Show translation",
    study_speak_aria: "Speak",
    study_tap_to_flip: "Tap to flip",
    study_swipe_hint: "Swipe right ✓ learned · left ✗ again",
    lang_label: "Language",
    deck_delete_lang_aria: "Delete language",
    deck_delete_deck_aria: "Delete dictionary",
    deck_cards_aria: "Dictionary cards",
    deck_not_found: "Dictionary not found",
    deck_back_to_list: "← Back to dictionaries",
    deck_back_to_deck: "← Back to dictionary",
    deck_empty_cards: "No cards in this dictionary to study.",
    deck_no_cards_yet: "No cards in this dictionary yet",
    deck_section_title: "Dictionaries",
    deck_no_custom_yet: "You haven't added any dictionary for this language yet",
    deck_progress_aria: "cards learned",
    result_aria: "Translation result",
    result_error_aria: "Translation error",
  },
};

// Текущий язык интерфейса (позже можно брать из настроек/URL)
const DEFAULT_LOCALE: Locale = "ru";

export function getLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return translations[locale][key] ?? translations.ru[key] ?? key;
}
