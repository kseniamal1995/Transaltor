# Функционал приложения «Карточки для изучения слов»

> **Этот файл — источник правды.** Перед любыми изменениями AI обязан свериться с ним.
> Нельзя удалять функционал без явного запроса. Нельзя добавлять новый без согласования.

---

## Страницы и маршруты

### `/` → Переводчик (главная)
- Выбор языка источника (с «Авто») и языка перевода
- Кнопка «Поменять языки местами»
- Поле ввода текста (автоперевод через 900ms после ввода, минимум 2 символа)
- Карточка результата: заголовок «Перевод», чекбокс «Свой перевод», поле ввода кастомного перевода
- Форма сохранения: выбор словаря (с возможностью создать новый), кнопка «Сохранить»
- Сообщение «Карточка сохранена!» после успешного сохранения
- Автосохранение в историю при каждом переводе

### `/history` → История
- Список всех переводов (от новых к старым)
- Каждый элемент: исходное слово + перевод
- Кнопка удаления (иконка корзины)
- Кнопка «Сохранить как карточку» → раскрывает форму сохранения
- Пустое состояние с иллюстрацией

### `/decks` → Мой словарь
- Список языков, по которым есть карточки
- Каждый язык: флаг + название, ссылка на `/decks/[lang]`
- Пустое состояние с иллюстрацией

### `/decks/[lang]` → Словари по языку
- Ссылка «Назад»
- Кнопка удаления языка (удаляет все карточки по языку)
- Секция «Все слова» — ссылка на режим изучения всех карточек
- Секция «Словари» — список пользовательских словарей с прогресс-барами
- Кнопка удаления словаря
- Пустое состояние для словарей

### `/deck/[id]` → Просмотр словаря
- Ссылка «Назад к словарям»
- Название словаря + прогресс-бар
- Кнопка «Режим изучения»
- Список карточек: слово + перевод + язык
- Пустое состояние

### `/deck/[id]/study` → Режим изучения
- Ссылка «Назад к словарю»
- Название словаря + прогресс-бар + счётчик «Карточка X из N»
- Карточка: нажатие = переворот (слово ↔ перевод)
- После переворота: кнопки «Ещё раз» / «Выучено» + свайп жестами
- Кнопка «Произнести» (Web Speech API)
- Клавиатурная навигация: ←/→
- Экран завершения раунда с кнопкой «Повторить»

### `/sign-in`, `/sign-up` → Авторизация (Clerk)
- Clerk компоненты для входа/регистрации

---

## Компоненты

### Layout
- **AppHeader** — верхний хедер с навигацией (PageNav)
- **PageNav** — табы навигации (Переводчик, История, Мой словарь)
- **BottomNav** — мобильная нижняя навигация
- **PageHeader** — заголовок страницы (title + optional subtitle)

### Переводчик
- **TranslatePageContent** — оркестратор страницы перевода
- **TranslateInput** — поле ввода текста
- **LanguagePairBlock** — блок выбора языков с кнопкой swap
- **LanguageSelector** — выпадающий список языков с поиском
- **TranslateResult** — карточка результата перевода (содержит TranslationCard)
- **TranslationCard** — заголовок «Перевод» + чекбокс «Свой перевод» + поле ввода
- **SaveCardForm** — выбор словаря + кнопка «Сохранить»

### Словари / Карточки
- **DeckSelectWithCreate** — выбор словаря с возможностью создания нового
- **DeckSelect** — простой выбор словаря
- **DeckProgressBar** — прогресс-бар (выучено / всего)
- **DecksPageContent** — страница списка языков
- **LanguageDeckPageContent** — страница словарей по языку
- **DeckViewContent** — просмотр словаря
- **DeckListItem** — элемент списка словарей

### Изучение
- **StudyPageContent** — оркестратор режима изучения
- **StudyCard** — flip-карточка (слово ↔ перевод)
- **SpeakButton** — кнопка озвучки (Web Speech API)

### История
- **HistoryPageContent** — страница истории
- **HistoryItem** — элемент истории с формой сохранения

### Общие
- **CustomTranslationInput** — поле «Свой перевод»
- **LanguageFilter** — фильтр по языку
- **EmptyStateIllustration** — SVG-иллюстрация пустого состояния

### Иконки
- **TrashIcon** — иконка корзины
- **PencilIcon** — иконка карандаша

### Авторизация
- **ClerkUserSync** — синхронизация Clerk userId в localStorage
- **GuestUserSync** — создание/восстановление гостевого userId

---

## Данные (localStorage)

### Структуры

```typescript
interface User { id: string }

interface Card {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  imageUrl?: string;
  examples?: string[];
  deckIds: string[];
  learned: boolean;
  createdAt: string;
}

interface Deck {
  id: string;
  name: string;
  createdAt: string;
}

interface TranslationHistoryItem {
  id: string;
  foreign: string;
  translation: string;
  customTranslation?: string;
  foreignLanguage?: string;
  createdAt: string;
}
```

### Ключи localStorage
- `translator-current-user` — текущий пользователь `{ id }`
- `translator-guest-user-id` — гостевой ID
- `translator-last-target-lang` — последний выбранный язык перевода
- `translator-{userId}-decks` — словари пользователя
- `translator-{userId}-history` — история переводов
- `translator-{userId}-cards` — карточки пользователя

### Функции хранилища (lib/storage.ts)
- `getCurrentUser()` — получить текущего пользователя
- `getDecksForUser(userId)` — словари (с автосозданием «All cards»)
- `createDeck(userId, name)` — создать словарь
- `getHistory(userId)` — история (сортировка по дате)
- `addToHistory(userId, item)` — добавить в историю
- `removeFromHistory(userId, itemId)` — удалить из истории
- `getCards(userId)` — все карточки
- `getCardsForDeck(userId, deckId, lang?)` — карточки словаря
- `getDeckProgress(userId, deckId, lang?)` — прогресс (total, learned)
- `getLanguagesInUse(userId)` — используемые языки
- `getDecksForLanguage(userId, lang)` — словари по языку
- `saveCard(userId, card)` — сохранить карточку
- `updateCard(userId, card)` — обновить карточку
- `setCardLearned(userId, cardId, learned)` — отметить выученной
- `deleteCard(userId, cardId)` — удалить карточку
- `deleteLanguage(userId, lang)` — удалить все карточки по языку
- `deleteDeck(userId, deckId)` — удалить словарь

---

## API

### `GET /api/translate`
- **Параметры:** `q` (текст), `langpair` (формат `en|ru`)
- **Сервис:** DeepL Free API
- **Rate limiting:** 20 запросов/мин на IP (Upstash Redis)
- **Лимит текста:** 5000 символов
- **Ответ:** `{ translatedText, sourceLanguage, targetLanguage }`

---

## Внешние сервисы

- **DeepL Free API** — перевод текста (через серверный прокси)
- **Upstash Redis** — rate limiting API запросов
- **Clerk** — авторизация (sign-in, sign-up, user sync)
- **tinyld** — определение языка на клиенте (для автодетекции)
- **Web Speech API** — озвучка слов (браузерный API)

---

## Поддерживаемые языки

Английский, арабский, испанский, итальянский, китайский, корейский, латышский, литовский, немецкий, нидерландский, норвежский, польский, португальский, русский, словацкий, словенский, сесото, турецкий, украинский, французский, шведский, эстонский, японский.

---

## Локализация

- Два языка интерфейса: русский (по умолчанию), английский
- Все UI-строки в `lib/strings.ts`
- Тип `Locale` в `lib/locale.ts`
