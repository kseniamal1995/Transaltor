/**
 * Клиентский счётчик переводов для гостей.
 * Зарегистрированные пользователи — без ограничений.
 * Гости — DAILY_GUEST_LIMIT переводов в день, сброс в полночь.
 */

const STORAGE_KEY = "translator-guest-daily-usage";
export const DAILY_GUEST_LIMIT = 20;
export const WARN_THRESHOLD = 5; // показывать счётчик когда осталось ≤ N

interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function readUsageData(): UsageData {
  if (typeof window === "undefined") return { count: 0, date: getToday() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: getToday() };
    const data = JSON.parse(raw) as UsageData;
    if (data.date !== getToday()) return { count: 0, date: getToday() };
    return data;
  } catch {
    return { count: 0, date: getToday() };
  }
}

function writeUsageData(data: UsageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Можно ли делать перевод прямо сейчас */
export function canTranslate(_isLoggedIn: boolean): boolean {
  // Лимит временно отключён для локальной разработки
  return true;
}

/** Фиксировать один использованный перевод (только для гостей) */
export function incrementGuestUsage(): void {
  const data = readUsageData();
  writeUsageData({ count: data.count + 1, date: getToday() });
}

/** Сколько переводов осталось сегодня (Infinity для залогиненных) */
export function getRemainingTranslations(isLoggedIn: boolean): number {
  if (isLoggedIn) return Infinity;
  return Math.max(0, DAILY_GUEST_LIMIT - readUsageData().count);
}

/** Показывать ли предупреждение об остатке */
export function shouldShowWarning(isLoggedIn: boolean): boolean {
  if (isLoggedIn) return false;
  const remaining = getRemainingTranslations(false);
  return remaining > 0 && remaining <= WARN_THRESHOLD;
}
