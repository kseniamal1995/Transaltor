"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/constants";

const DATA_KEYS = ["decks", "history", "cards"] as const;

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

function migrateGuestData(guestId: string, clerkId: string) {
  for (const key of DATA_KEYS) {
    const guestKey = STORAGE_KEYS[key](guestId);
    const clerkKey = STORAGE_KEYS[key](clerkId);
    const guestData = localStorage.getItem(guestKey);
    const clerkData = localStorage.getItem(clerkKey);
    if (guestData && !clerkData) {
      localStorage.setItem(clerkKey, guestData);
    }
    if (guestData) {
      localStorage.removeItem(guestKey);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.GUEST_USER_ID);
}

/** Синхронизирует Clerk userId в localStorage. Редиректит неавторизованных на sign-in. */
export function ClerkUserSync({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoaded) return;
    if (!user && !isPublic) {
      router.replace("/sign-in");
      return;
    }
    if (user) {
      const guestId = localStorage.getItem(STORAGE_KEYS.GUEST_USER_ID);
      if (guestId) {
        migrateGuestData(guestId, user.id);
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ id: user.id }));
    }
  }, [isLoaded, user?.id, isPublic, router]);

  if (!isLoaded) return null;
  if (!user && !isPublic) return null;

  return <>{children}</>;
}
