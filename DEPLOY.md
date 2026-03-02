# Публикация на Vercel

## 1. Подготовка репозитория

```bash
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и привяжите
git remote add origin https://github.com/ВАШ_ЛОГИН/translator.git
git push -u origin main
```

> `.env.local` в `.gitignore` — ключи не попадут в репозиторий.

---

## 2. Деплой на Vercel

### Через веб-интерфейс

1. Зайдите на [vercel.com](https://vercel.com) и войдите (через GitHub).
2. **Add New** → **Project** → выберите репозиторий.
3. Настройки: **Framework Preset** = Next.js, остальное по умолчанию.
4. **Environment Variables** — добавьте переменные (см. ниже).
5. **Deploy**.

### Через CLI

```bash
npm i -g vercel
vercel
# При первом запуске — логин и подтверждение настроек
vercel --prod   # для production
```

---

## 3. Переменные окружения в Vercel

**Project** → **Settings** → **Environment Variables**

| Переменная | Секрет? | Где используется |
|------------|---------|------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Нет (публичный) | Клиент, Clerk |
| `CLERK_SECRET_KEY` | **Да** | Сервер, Clerk |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Нет | `/translate` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Нет | `/translate` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Нет | `/sign-in` |
| `DEEPL_API_KEY` | **Да** | API route `/api/translate` |
| `UPSTASH_REDIS_REST_URL` | **Да** | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | **Да** | Rate limiting |

> Переменные **без** `NEXT_PUBLIC_` доступны только на сервере и не попадают в клиентский бандл.

---

## 4. Настройка Clerk после деплоя

1. [Clerk Dashboard](https://dashboard.clerk.com) → ваше приложение.
2. **Configure** → **Paths** (или **Domains**):
   - Добавьте production-домен: `https://ваш-проект.vercel.app`
3. **Paths** → **Redirect URLs**:
   - `https://ваш-проект.vercel.app/translate`
   - `https://ваш-проект.vercel.app`
4. Если используете OAuth (Google и т.п.):
   - **User & Authentication** → **Social Connections** → настройте провайдера
   - В консоли провайдера добавьте redirect URI:  
     `https://ваш-проект.vercel.app/api/auth/callback/google` (или другой)

---

## 5. Проверка перед деплоем

```bash
npm run build
npm run start   # локально проверить production-сборку
```

---

## 6. Безопасность

### API-ключи

- `CLERK_SECRET_KEY`, `DEEPL_API_KEY`, `UPSTASH_*` — только на сервере, не в клиенте.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — публичный по дизайну Clerk.
- `.env.local` в `.gitignore` — не коммитится.

### Уже реализовано

- Rate limiting (20 запросов/мин на IP) через Upstash.
- Валидация API: макс. 5000 символов, только разрешённые языки.
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Защита маршрутов через Clerk middleware.
- `/api/auth` — публичный (нужен для OAuth callback).

### Рекомендации

- Используйте production-ключи Clerk (`pk_live_`, `sk_live_`) для продакшена.
- Включите Upstash Redis для rate limiting в production.
- Если ключи когда-либо утекли — смените их в Dashboard и в Vercel.

---

## 7. Автодеплой

- **Preview** — при каждом push в любую ветку.
- **Production** — при push в `main` (или выбранную ветку).
