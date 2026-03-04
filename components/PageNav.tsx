"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/translate", label: "Переводчик" },
  { href: "/history", label: "История" },
  { href: "/decks", label: "Изучение" },
];

export function PageNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px 0",
        marginBottom: "24px",
        borderBottom: "1px solid #dad9d5",
      }}
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
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: isActive ? "#e8f5ec" : "transparent",
              color: isActive ? "#1e2e26" : "#7a7c79",
              fontWeight: isActive ? 600 : 400,
              textDecoration: "none",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
