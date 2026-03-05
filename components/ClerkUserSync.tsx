"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { STORAGE_KEYS } from "@/lib/constants";
import { ensureGuestUser } from "./GuestUserSync";

/** Синхронизирует Clerk userId в localStorage. При выходе очищает и сразу подставляет гостя. */
export function ClerkUserSync({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: user.id }));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.GUEST_USER_ID);
      ensureGuestUser();
    }
  }, [isLoaded, user?.id]);

  return <>{children}</>;
}
