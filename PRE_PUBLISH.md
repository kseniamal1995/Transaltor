# Чеклист перед публикацией

## ✅ Уже готово

- **Сборка** — `npm run build` проходит успешно
- **Секреты** — API-ключ DeepL в переменных окружения, не в коде
- **.gitignore** — `.env.local` не попадёт в репозиторий
- **Базовая защита API** — лимит длины текста (5000 символов), проверка языков

---

## Что сделать перед публикацией

### 1. Ключи в Vercel

**Clerk** (обязательно) — авторизация:
1. Зарегистрируйтесь на [Clerk](https://dashboard.clerk.com) (бесплатно)
2. Создайте приложение → API Keys → скопируйте Publishable key и Secret key
3. В Vercel и в `.env.local` добавьте: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
4. Сборка не пройдёт без этих ключей

**DeepL** (обязательно) — без него перевод не работает:
1. Зарегистрируйтесь на [DeepL](https://www.deepl.com/pro-api) (бесплатно: 500 000 символов/месяц)
2. Создайте API-ключ
3. В Vercel: **Settings → Environment Variables** → `DEEPL_API_KEY`

**Upstash Redis** (для rate limiting — защита от ботов):
1. Зарегистрируйтесь на [Upstash](https://console.upstash.com/) (бесплатно: 10 000 запросов/день)
2. Создайте базу Redis → скопируйте `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`
3. В Vercel добавьте обе переменные

Без Upstash rate limiting отключён — боты смогут сжечь квоту DeepL.

### 2. Git-репозиторий

```bash
git init
git add .
git commit -m "Initial commit: базовая версия приложения"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/translator.git
git push -u origin main
```

### 3. Проверка перед push

- В репозитории не должно быть `.env.local` (он в `.gitignore`)
- Убедитесь, что в коде нет ключей и паролей

### 4. Деплой на Vercel

См. [DEPLOY.md](./DEPLOY.md)

---

## После публикации

1. Откройте приложение по ссылке Vercel
2. Сделайте тестовый перевод — проверьте, что DeepL отвечает
3. Сохраните карточку — проверьте, что localStorage работает

---

## Безопасность и защита от ботов

**Что уже есть:**
- **Rate limiting** — 20 запросов на перевод в минуту на IP (через Upstash Redis)
- Лимит длины текста (5000 символов)
- Проверка языков — только разрешённые коды
- API-ключ только на сервере

**Лимиты:** 20 переводов/мин на IP — достаточно для обычного использования, но ограничивает ботов.

---

## Кратко

| Шаг | Действие |
|-----|----------|
| 1 | Получить DeepL API ключ |
| 2 | Создать репозиторий на GitHub, запушить код |
| 3 | Импортировать проект в Vercel |
| 4 | Добавить `DEEPL_API_KEY` и Upstash-переменные в Vercel |
| 5 | Deploy |
