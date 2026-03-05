"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/strings";
import { NAV_TABS, isNavActive } from "@/lib/nav";

export function PageNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-3 py-3 border-b border-border">
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
    </nav>
  );
}
