"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { t } from "@/lib/strings";
import { STORAGE_KEYS } from "@/lib/constants";

const tabs = [
  { href: "/translate", labelKey: "nav_translator" as const },
  { href: "/history", labelKey: "nav_history" as const },
  { href: "/decks", labelKey: "nav_my_dictionary" as const },
];

function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function handleLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.GUEST_USER_ID);
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthPage) return null;

  const isActive = (tab: (typeof tabs)[0]) =>
    pathname === tab.href ||
    pathname.startsWith(tab.href + "/") ||
    (tab.href === "/decks" && (pathname.startsWith("/deck/") || pathname.startsWith("/decks/")));

  function handleLogoutClick() {
    handleLogout();
    setMobileMenuOpen(false);
    router.push("/translate");
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-4">
        {/* Лого (placeholder) — скрыт на мобилке, вместо него бургер */}
        <div className="hidden md:block w-12 h-12 rounded-full bg-[var(--color-border)] shrink-0" aria-hidden />

        {/* Бургер — только на мобилке */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2 text-text hover:text-text-secondary transition-colors"
          aria-label={t("nav_translator")}
          aria-expanded={mobileMenuOpen}
        >
          <BurgerIcon className="w-6 h-6" />
        </button>

        {/* Навигация — только на десктопе */}
        <nav className="hidden md:flex flex-1 justify-center max-w-[600px]">
          <div className="flex gap-3 p-1 border border-border rounded-full">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-full no-underline transition-colors ${
                  isActive(tab) ? "bg-primary-muted text-text font-semibold" : "text-text-secondary hover:text-text"
                }`}
              >
                {t(tab.labelKey)}
              </Link>
            ))}
          </div>
        </nav>

        {/* Иконка аккаунта — только на десктопе */}
        <div className="hidden md:flex flex-col items-center justify-center text-center w-12 h-12 rounded-full bg-[var(--color-border)] shrink-0 text-text-muted" aria-hidden>
          <UserIcon className="w-6 h-6" />
        </div>
      </header>

      {/* Мобильное меню — подложка на верхней половине */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          {/* Затемнённый фон */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />

          {/* Панель меню — верхняя половина экрана */}
          <div className="absolute top-0 left-0 right-0 bg-surface border-b border-border rounded-b-2xl shadow-lg max-h-[50vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-medium text-text-secondary">{t("nav_close")}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-text-secondary hover:text-text transition-colors"
                aria-label={t("nav_close")}
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl no-underline transition-colors ${
                    isActive(tab) ? "bg-primary-muted text-text font-semibold" : "text-text hover:bg-[var(--color-border)]/30"
                  }`}
                >
                  {t(tab.labelKey)}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text hover:bg-[var(--color-border)]/30 transition-colors text-left mt-2"
              >
                <UserIcon className="w-5 h-5 shrink-0" />
                {t("nav_logout")}
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
