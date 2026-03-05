"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/strings";
import { NAV_TABS, isNavActive } from "@/lib/nav";

const TAB_ICONS: Record<(typeof NAV_TABS)[number]["href"], string> = {
  "/translate": "📝",
  "/history": "📋",
  "/decks": "🗂️",
};

export function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
      <div className="flex justify-center items-center gap-2 h-14 max-w-xl mx-auto px-6 md:px-8">
        {NAV_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isNavActive(pathname, tab.href)
                ? "bg-primary-muted text-text font-semibold"
                : "text-text-secondary hover:text-text hover:bg-primary-muted/50"
            }`}
          >
            <span>{TAB_ICONS[tab.href]}</span>
            <span>{t(tab.labelKey)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
