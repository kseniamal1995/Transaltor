"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/translate", label: "Переводчик", icon: "📝" },
  { href: "/history", label: "История", icon: "📋" },
  { href: "/decks", label: "Изучение", icon: "🗂️" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
      <div className="flex justify-center items-center gap-2 h-14 max-w-xl mx-auto px-4">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/") ||
            (tab.href === "/decks" && (pathname.startsWith("/deck/") || pathname.startsWith("/decks/")));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-muted text-text font-semibold"
                  : "text-text-secondary hover:text-text hover:bg-primary-muted/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
