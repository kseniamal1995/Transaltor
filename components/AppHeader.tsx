"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { t } from "@/lib/strings";
import { STORAGE_KEYS } from "@/lib/constants";
import { NAV_TABS, isNavActive } from "@/lib/nav";

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

function isGoogleUser(user: { externalAccounts?: { provider?: string }[] } | null): boolean {
  if (!user?.externalAccounts?.length) return false;
  return user.externalAccounts.some(
    (e) => e.provider === "oauth_google" || e.provider?.includes("google")
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthPage) return null;

  async function handleLogoutClick() {
    setMobileMenuOpen(false);
    if (isSignedIn) {
      await signOut({ redirectUrl: "/translate" });
      router.refresh();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.GUEST_USER_ID);
      }
      router.push("/translate");
      router.refresh();
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-6 pt-4 pb-4 md:px-8 md:pt-4 md:pb-8">
        {/* Слева: серый кружок (лого) 32px на мобилке, лого на десктопе */}
        <div className="flex items-center shrink-0">
          <div className="md:hidden w-8 h-8 rounded-full bg-[var(--color-border)] shrink-0" aria-hidden />
          <div className="hidden md:block w-12 h-12 rounded-full bg-[var(--color-border)] shrink-0" aria-hidden />
        </div>

        {/* Навигация — только на десктопе */}
        <nav className="hidden md:flex flex-1 justify-center max-w-[600px]">
          <div className="flex gap-3 p-1 border border-border rounded-full">
            {NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-full no-underline transition-colors ${
                  isNavActive(pathname, tab.href) ? "bg-primary-muted text-text font-semibold" : "text-text-secondary hover:text-text"
                }`}
              >
                {t(tab.labelKey)}
              </Link>
            ))}
          </div>
        </nav>

        {/* Справа: иконка меню на мобилке, аккаунт на десктопе */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -mr-2 text-text hover:text-text-secondary transition-colors"
            aria-label={t("nav_translator")}
            aria-expanded={mobileMenuOpen}
          >
            <BurgerIcon className="w-6 h-6" />
          </button>
          <div className="hidden md:flex items-center shrink-0">
            {isLoaded && isSignedIn ? (
              <div className="w-[48px] h-[48px] shrink-0">
                <UserButton
                  afterSignOutUrl="/translate"
                  appearance={{
                    elements: {
                      userButtonBox: "w-[48px] h-[48px]",
                      userButtonTrigger: "w-[48px] h-[48px] rounded-full",
                      userButtonAvatarBox: "w-[48px] h-[48px] rounded-full",
                    },
                  }}
                />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-[var(--color-border)] text-text-muted hover:text-text transition-colors shrink-0"
                aria-label={t("nav_sign_in")}
              >
                <UserIcon className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Мобильное меню — подложка на верхней половине */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav_menu_aria")}
        >
          {/* Затемнённый фон */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />

          {/* Панель меню — верхняя половина экрана */}
          <div className="absolute top-0 left-0 right-0 bg-surface border-b border-border rounded-b-2xl shadow-lg max-h-[50vh] overflow-auto">
            <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
              {isLoaded && isSignedIn && user ? (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isGoogleUser(user) && user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="w-10 h-10 rounded-full shrink-0 object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-muted)] shrink-0 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text truncate">
                      {user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || ""}
                    </p>
                    {user.primaryEmailAddress?.emailAddress &&
                      (user.fullName || user.firstName) && (
                        <p className="text-xs text-text-secondary truncate">
                          {user.primaryEmailAddress.emailAddress}
                        </p>
                      )}
                  </div>
                </div>
              ) : (
                <span className="text-sm font-medium text-text-secondary">{t("nav_close")}</span>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 shrink-0 text-text-secondary hover:text-text transition-colors"
                aria-label={t("nav_close")}
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-1">
              {NAV_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl no-underline transition-colors ${
                    isNavActive(pathname, tab.href) ? "bg-primary-muted text-text font-semibold" : "text-text hover:bg-[var(--color-border)]/30"
                  }`}
                >
                  {t(tab.labelKey)}
                </Link>
              ))}

              {isLoaded && isSignedIn ? (
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text hover:bg-[var(--color-border)]/30 transition-colors text-left mt-2"
                >
                  <UserIcon className="w-5 h-5 shrink-0" />
                  {t("nav_logout")}
                </button>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text hover:bg-[var(--color-border)]/30 transition-colors text-left mt-2 no-underline"
                >
                  <UserIcon className="w-5 h-5 shrink-0" />
                  {t("nav_sign_in")}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
