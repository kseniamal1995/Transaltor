export const NAV_TABS = [
  { href: "/translate", labelKey: "nav_translator" as const },
  { href: "/history", labelKey: "nav_history" as const },
  { href: "/decks", labelKey: "nav_my_dictionary" as const },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    pathname.startsWith(href + "/") ||
    (href === "/decks" && (pathname.startsWith("/deck/") || pathname.startsWith("/decks/")))
  );
}
