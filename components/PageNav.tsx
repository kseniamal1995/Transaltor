"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/strings";

const tabs = [
  { href: "/translate", labelKey: "nav_translator" as const },
  { href: "/history", labelKey: "nav_history" as const },
  { href: "/decks", labelKey: "nav_my_dictionary" as const },
];

export function PageNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-3 py-3 border-b border-border"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          pathname.startsWith(tab.href + "/") ||
          (tab.href === "/decks" && (pathname.startsWith("/deck/") || pathname.startsWith("/decks/")));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-full no-underline transition-colors ${
              isActive ? "bg-primary-muted text-text font-semibold" : "text-text-secondary hover:text-text"
            }`}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
