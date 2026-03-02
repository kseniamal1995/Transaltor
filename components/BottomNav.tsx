"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const tabs = [
  { href: "/translate", label: "Перевод", icon: "📝" },
  { href: "/history", label: "История", icon: "📋" },
  { href: "/decks", label: "Колоды", icon: "🗂️" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/") ||
            (tab.href === "/decks" && (pathname.startsWith("/deck/") || pathname.startsWith("/decks/")));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-colors min-w-0 ${
                isActive ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
        <div className="flex items-center justify-center flex-1 py-2 min-w-0">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
