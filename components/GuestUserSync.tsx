"use client";

import { getCurrentUser } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Когда Clerk отключён: подставляет гостевой userId в localStorage,
 * чтобы работали колоды, история и сохранение карточек.
 *
 * Когда Clerk вернётся: ClerkUserSync будет перезаписывать CURRENT_USER
 * при логине — тогда будет использоваться реальный userId.
 */
export function GuestUserSync({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined") {
    const user = getCurrentUser();
    if (!user.id) {
      let guestId = localStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (!guestId) {
        guestId = `guest-${crypto.randomUUID()}`;
        localStorage.setItem(STORAGE_KEYS.GUEST_USER_ID, guestId);
      }
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({ id: guestId })
      );
    }
  }

  return <>{children}</>;
}
