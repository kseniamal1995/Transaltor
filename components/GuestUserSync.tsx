"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Подставляет гостевой userId в localStorage, если его нет.
 * Экспортируется для ClerkUserSync — при выходе из Clerk нужно сразу восстановить гостя.
 */
export function ensureGuestUser() {
  if (typeof window === "undefined") return;
  try {
    const user = getCurrentUser();
    if (!user.id) {
      let guestId = localStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (!guestId) {
        guestId = `guest-${crypto.randomUUID()}`;
        localStorage.setItem(STORAGE_KEYS.GUEST_USER_ID, guestId);
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: guestId }));
    }
  } catch {
    // localStorage disabled (private mode, quota exceeded)
  }
}

export function GuestUserSync({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureGuestUser();
  }, []);

  return <>{children}</>;
}
